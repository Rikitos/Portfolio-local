/**
 * Designer — main canvas controller.
 *
 * Owns the RAF render loop, all mouse/keyboard interaction, history,
 * SAT collision detection, and sidebar-drag placement.  Pure canvas
 * logic; React state is updated exclusively through UICallbacks.
 *
 * Coordinate systems
 *   World space  — centimetres, origin at centre of the blank canvas
 *   Screen space — CSS pixels, origin at canvas top-left
 *   Conversion   — Viewport.worldToScreen / screenToWorld
 *
 * Interaction model
 *   • Click an item  → select it (no immediate drag)
 *   • Drag a selected item → move it (snap to SNAP_CM grid)
 *   • Drag empty canvas   → pan the viewport
 *   • Freeform mode       → click to place polygon vertices
 */

import { Viewport }          from './viewport'
import { Grid }              from './grid'
import { RoomsRenderer }     from './rooms-renderer'
import { FurnitureRenderer } from './furniture-renderer'
import { DesignerStorage }   from './storage'
import { FURNITURE_CATALOGUE } from './furniture-data'
import type {
  Vec2, RoomItem, PolygonItem, FurnitureItem,
  FurnitureDef, Selection, HistoryEntry, Layout,
  UICallbacks, NudgePos,
} from './types'

// ── SAT collision ─────────────────────────────────────────────────────────────

/**
 * Returns true when two convex polygons overlap (Separating Axis Theorem).
 * Used every frame to build the collision set for red-tint highlighting.
 */
function satOverlap(vertsA: Vec2[], vertsB: Vec2[]): boolean {
  const allPolys = [vertsA, vertsB]
  for (const poly of allPolys) {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]; const b = poly[(i + 1) % poly.length]
      const nx = -(b.y - a.y); const ny = b.x - a.x
      let minA = Infinity; let maxA = -Infinity
      for (const v of vertsA) { const p = v.x * nx + v.y * ny; minA = Math.min(minA, p); maxA = Math.max(maxA, p) }
      let minB = Infinity; let maxB = -Infinity
      for (const v of vertsB) { const p = v.x * nx + v.y * ny; minB = Math.min(minB, p); maxB = Math.max(maxB, p) }
      if (maxA <= minB || maxB <= minA) return false  // touching walls are not a collision
    }
  }
  return true
}

type Mode = 'pan' | 'freeform'

export class Designer {
  // ── Sub-systems ───────────────────────────────────────────────────────────
  viewport   = new Viewport()
  grid       = new Grid()
  roomsR     = new RoomsRenderer()
  furnitureR = new FurnitureRenderer()
  storage    = new DesignerStorage()

  canvas:    HTMLCanvasElement
  ctx:       CanvasRenderingContext2D
  workspace: HTMLElement
  cb:        UICallbacks

  // ── Data ──────────────────────────────────────────────────────────────────
  rooms:     RoomItem[]      = []
  polygons:  PolygonItem[]   = []
  furniture: FurnitureItem[] = []

  // ── Interaction state ─────────────────────────────────────────────────────
  selected:       Selection | null = null
  mode:           Mode             = 'pan'
  history:        HistoryEntry[]   = []
  freeformPts:    Vec2[]           = []    // vertices placed so far in freeform mode
  freeformCursor: Vec2 | null      = null  // live cursor world pos for preview line
  collisionSet    = new Set<number>()      // indices of furniture items that overlap
  dragPreview:    FurnitureItem | null = null  // ghost item while dragging from sidebar

  /** Snap drag movements to this grid (cm). Matches the minor grid line spacing. */
  readonly SNAP_CM = 10

  // Mouse drag / resize state
  _isPanning          = false
  _panStart           = { x: 0, y: 0 }
  _panOffset          = { x: 0, y: 0 }
  _isDraggingItem     = false
  _dragClickOffset    = { x: 0, y: 0 }  // world-space offset of click from item origin
  _isResizingVertex   = false
  _resizeVertIdx      = -1
  _isResizingEdge     = false
  _resizeEdgeIdx      = -1
  _hoverVertex: number | null = null
  _hoverEdge:   number | null = null

  // Sidebar drag ghost
  _ghostEl:    HTMLDivElement | null = null
  _ghostDef:   FurnitureDef | null   = null
  _isGhostDrag = false

  // Icon rendering
  showIcons   = true
  _iconCache  = new Map<string, HTMLImageElement>()

  // Canvas theme
  theme: 'dark' | 'light' = 'dark'

  // Render loop
  _rafId:  number | null = null
  _dirty   = true

  // ── Construction ──────────────────────────────────────────────────────────

  constructor(canvas: HTMLCanvasElement, workspace: HTMLElement, cb: UICallbacks) {
    this.canvas    = canvas
    this.ctx       = canvas.getContext('2d')!
    this.workspace = workspace
    this.cb        = cb
    this._resizeCanvas()
    this._bindEvents()
    this._preloadIcons()
    this._scheduleRender()
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Replace the entire layout; resets history and re-centres the view. */
  loadLayout(layout: Layout) {
    this.rooms     = (layout.rooms     ?? []).map(r => ({ ...r }))
    this.polygons  = (layout.polygons  ?? []).map(p => ({ points: p.points.map(v => ({ ...v })) }))
    this.furniture = (layout.furniture ?? []).map(f => ({ ...f }))
    this.selected  = null
    this.history   = []
    this._centerView()
    this._syncAll()
    this._dirty = true
  }

  getLayout(): Layout {
    return { version: 1, rooms: this.rooms, polygons: this.polygons, furniture: this.furniture }
  }

  /** Place a new rectangular room at the current viewport centre. */
  placeRoom(wCm: number, hCm: number) {
    const c = this.viewport.screenToWorld(this.canvas.width / 2, this.canvas.height / 2)
    const item: RoomItem = {
      x: this._snap(c.x - wCm / 2),
      y: this._snap(c.y - hCm / 2),
      width: wCm, height: hCm,
    }
    this.rooms.push(item)
    this._pushHistory({ action: 'place', type: 'room', item: { ...item } })
    this.selected = { type: 'room', index: this.rooms.length - 1 }
    this._syncAll(); this._dirty = true
  }

  setMode(m: Mode) {
    this.mode = m
    if (m !== 'freeform') { this.freeformPts = []; this.freeformCursor = null }
    this.cb.onModeChange(m); this._dirty = true
  }

  /** Zoom in (dir < 0) or out (dir > 0) centred on the canvas. */
  stepZoom(dir: number) {
    const cx  = this.canvas.width / 2; const cy = this.canvas.height / 2
    const cur = Math.round(this.viewport.zoom * 100)
    // Always snap to the nearest valid grid value first, then step.
    // Grid: multiples of 10% below 100, multiples of 25% at/above 100.
    // dir > 0 = zoom out (−), dir < 0 = zoom in (+).
    let next: number
    if (dir < 0) {  // zoom in
      next = cur < 100
        ? Math.ceil((cur + 1) / 10) * 10
        : Math.ceil((cur + 1) / 25) * 25
    } else {        // zoom out
      next = cur <= 100
        ? Math.floor((cur - 1) / 10) * 10
        : Math.floor((cur - 1) / 25) * 25
    }
    this.viewport.setZoom(Math.max(10, Math.min(400, next)) / 100, cx, cy)
    this._syncZoom(); this._dirty = true
  }

  applyInputZoom(s: string) {
    const val = parseFloat(s) / 100
    if (isNaN(val) || val <= 0) return
    const cx = this.canvas.width / 2; const cy = this.canvas.height / 2
    this.viewport.setZoom(val, cx, cy)
    this._syncZoom(); this._dirty = true
  }

  resetZoom() { this._centerView(); this._syncZoom(); this._dirty = true }

  // ── History / editing ─────────────────────────────────────────────────────

  undo() {
    const entry = this.history.pop()
    if (!entry) return
    if (entry.action === 'place') {
      // Remove the last-placed item of that type
      if (entry.type === 'room')      { this.rooms.pop();     this.selected = null }
      if (entry.type === 'polygon')   { this.polygons.pop();  this.selected = null }
      if (entry.type === 'furniture') { this.furniture.pop(); this.selected = null }
    } else {
      // Use the stored index — does not require the item to be currently selected
      const idx  = entry.index
      const from = entry.from!
      if (entry.type === 'furniture' && idx !== undefined) {
        const f = this.furniture[idx]
        if (f) {
          if ('x'        in from) { f.x = from.x!; f.y = from.y! }
          if ('width'    in from) { f.width = from.width!; f.height = from.height! }
          if ('rotation' in from) f.rotation = from.rotation
        }
      } else if (entry.type === 'room' && idx !== undefined) {
        const r = this.rooms[idx]
        if (r && 'x' in from) { r.x = from.x!; r.y = from.y! }
      } else if (entry.type === 'polygon' && idx !== undefined) {
        if ('points' in from) this.polygons[idx].points = from.points!.map(v => ({ ...v }))
      }
    }
    this._syncAll(); this._dirty = true
  }

  deleteSelected() {
    if (!this.selected) return
    const { type, index } = this.selected
    if (type === 'room')      this.rooms.splice(index, 1)
    if (type === 'polygon')   this.polygons.splice(index, 1)
    if (type === 'furniture') this.furniture.splice(index, 1)
    this.selected = null
    this._syncAll(); this._dirty = true
  }

  rotateSelected(delta: number) {
    if (this.selected?.type !== 'furniture') return
    const f = this.furniture[this.selected.index]
    const old = f.rotation ?? 0
    this._pushHistory({ action: 'rotate', type: 'furniture', index: this.selected.index, item: { ...f }, from: { rotation: old } })
    f.rotation = ((old + delta) % 360 + 360) % 360
    this._syncAll(); this._dirty = true
  }

  setRotation(deg: number) {
    if (this.selected?.type !== 'furniture') return
    const f = this.furniture[this.selected.index]
    this._pushHistory({ action: 'rotate', type: 'furniture', index: this.selected.index, item: { ...f }, from: { rotation: f.rotation ?? 0 } })
    f.rotation = ((deg % 360) + 360) % 360
    this._syncAll(); this._dirty = true
  }

  duplicateSelected() {
    if (!this.selected) return
    const { type, index } = this.selected
    if (type === 'furniture') {
      const copy = { ...this.furniture[index], x: this.furniture[index].x + this.SNAP_CM * 2, y: this.furniture[index].y + this.SNAP_CM * 2 }
      this.furniture.push(copy)
      this._pushHistory({ action: 'place', type: 'furniture', item: { ...copy } })
      this.selected = { type: 'furniture', index: this.furniture.length - 1 }
    } else if (type === 'room') {
      const copy = { ...this.rooms[index], x: this.rooms[index].x + this.SNAP_CM * 2, y: this.rooms[index].y + this.SNAP_CM * 2 }
      this.rooms.push(copy)
      this._pushHistory({ action: 'place', type: 'room', item: { ...copy } })
      this.selected = { type: 'room', index: this.rooms.length - 1 }
    }
    this._syncAll(); this._dirty = true
  }

  flipSelected() {
    if (this.selected?.type !== 'furniture') return
    this.furniture[this.selected.index].flipX = !this.furniture[this.selected.index].flipX
    this._syncAll(); this._dirty = true
  }

  toggleLabels() {
    if (!this.selected) return
    const { type, index } = this.selected
    let hidden = false
    if (type === 'room')      { this.rooms[index].hideLabel     = hidden = !this.rooms[index].hideLabel }
    if (type === 'polygon')   { this.polygons[index].hideLabel  = hidden = !this.polygons[index].hideLabel }
    if (type === 'furniture') { this.furniture[index].hideLabel = hidden = !this.furniture[index].hideLabel }
    this.cb.onLabelsChange(hidden); this._dirty = true
  }

  toggleIcons() {
    this.showIcons = !this.showIcons
    this.cb.onShowIconsChange(this.showIcons)
    this._dirty = true
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark'
    this.cb.onThemeChange(this.theme)
    this._dirty = true
  }

  exportImage() {
    const link = document.createElement('a')
    link.download = 'room-layout.png'
    link.href = this.canvas.toDataURL('image/png')
    link.click()
  }

  /** Move the selected item by (dx, dy) centimetres (keyboard arrow nudge). */
  nudge(dx: number, dy: number) {
    if (!this.selected) return
    const { type, index } = this.selected
    if (type === 'room')      { this.rooms[index].x += dx; this.rooms[index].y += dy }
    if (type === 'polygon')   this.polygons[index].points = this.polygons[index].points.map(p => ({ x: p.x + dx, y: p.y + dy }))
    if (type === 'furniture') { this.furniture[index].x += dx; this.furniture[index].y += dy }
    this._recalcCollisions(); this._updateNudgePos(); this._dirty = true
  }

  /** Pan the viewport by (dx, dy) screen pixels. */
  panView(dx: number, dy: number) { this.viewport.pan(dx, dy); this._dirty = true }

  // ── Layout persistence ────────────────────────────────────────────────────

  saveSlot(slot: 'a' | 'b') { this.storage.saveSlot(slot, this.getLayout()); this._syncSlots() }
  loadSlot(slot: 'a' | 'b') { const l = this.storage.loadSlot(slot); if (l) this.loadLayout(l) }
  exportLayout()  { this.storage.exportJSON(this.getLayout()) }
  importLayout()  { this.storage.importJSON().then(l => { if (l) this.loadLayout(l) }) }
  clearCanvas()   {
    this.rooms = []; this.polygons = []; this.furniture = []
    this.selected = null; this.history = []
    this._syncAll(); this._dirty = true
  }

  // ── Sidebar drag-and-drop ─────────────────────────────────────────────────

  /**
   * Called when the user starts dragging a furniture card from the sidebar.
   * Creates a floating ghost element that follows the cursor; the actual item
   * is committed on mouseup over the canvas.
   */
  startSidebarDrag(def: FurnitureDef, e: MouseEvent) {
    this._ghostDef    = def
    this._isGhostDrag = true
    const ghost = document.createElement('div')
    ghost.style.cssText = [
      'position:fixed;pointer-events:none;opacity:0.7;z-index:9999',
      'width:60px;height:60px;background:rgba(17,34,64,0.9)',
      'border:1px solid rgba(201,168,76,0.7);border-radius:4px',
      'display:flex;align-items:center;justify-content:center',
      'color:rgba(201,168,76,0.9);font:11px serif',
      'padding:4px;box-sizing:border-box;text-align:center',
    ].join(';')
    ghost.textContent = def.name
    document.body.appendChild(ghost)
    this._ghostEl = ghost
    this._moveGhost(e.clientX, e.clientY)
    this._dirty = true
  }

  /** Place furniture at the canvas centre (used by the config panel button). */
  placeFurnitureAtCenter(def: FurnitureDef, wCm: number, hCm: number) {
    const c    = this.viewport.screenToWorld(this.canvas.width / 2, this.canvas.height / 2)
    const item = this._makeFurnitureItem(def, this._snap(c.x - wCm / 2), this._snap(c.y - hCm / 2))
    item.width = wCm; item.height = hCm
    this.furniture.push(item)
    this._pushHistory({ action: 'place', type: 'furniture', item: { ...item } })
    this.selected = { type: 'furniture', index: this.furniture.length - 1 }
    this._syncAll(); this._dirty = true
  }

  /** Clean up event listeners and cancel the RAF loop. */
  destroy() {
    if (this._rafId !== null) cancelAnimationFrame(this._rafId)
    this.canvas.removeEventListener('mousedown',  this._handleMouseDown)
    this.canvas.removeEventListener('mousemove',  this._handleMouseMove)
    this.canvas.removeEventListener('mouseup',    this._handleMouseUp)
    this.canvas.removeEventListener('wheel',      this._handleWheel as EventListener)
    window.removeEventListener('keydown',         this._handleKeyDown)
    window.removeEventListener('mousemove',       this._handleWindowMouseMove)
    window.removeEventListener('mouseup',         this._handleWindowMouseUp)
  }

  // ── Event handlers (arrow props — auto-bound to instance) ─────────────────

  /**
   * Mousedown on the canvas.
   *
   * Priority order:
   *   1. Freeform vertex placement
   *   2. Vertex / edge handle resize (when room or polygon selected)
   *   3. Hit-test furniture → select (first click) or start drag (second click)
   *   4. Hit-test room / polygon → same select-first logic
   *   5. Miss → deselect + start viewport pan
   */
  private _handleMouseDown = (e: MouseEvent) => {
    const s = this._screenPt(e)
    const w = this.viewport.screenToWorld(s.x, s.y)

    // 1. Freeform polygon drawing
    if (this.mode === 'freeform') {
      const pts = this.freeformPts
      if (pts.length >= 3) {
        const first = this.viewport.worldToScreen(pts[0].x, pts[0].y)
        if (Math.hypot(s.x - first.x, s.y - first.y) <= this.roomsR.CLOSE_RADIUS) {
          this._closeFreeform(); return
        }
      }
      pts.push({ x: w.x, y: w.y }); this._dirty = true; return
    }

    // 2. Vertex / edge handles (room or polygon must be selected)
    if (this.selected && this.selected.type !== 'furniture') {
      const vIdx = this._hitVertex(s.x, s.y)
      if (vIdx >= 0) { this._isResizingVertex = true; this._resizeVertIdx = vIdx; return }
      const eIdx = this._hitEdge(s.x, s.y)
      if (eIdx >= 0) { this._isResizingEdge = true; this._resizeEdgeIdx = eIdx; return }
    }

    // 3. Furniture — select on first click, drag only if already selected
    const fIdx = this._hitFurniture(w.x, w.y)
    if (fIdx >= 0) {
      const alreadySel = this.selected?.type === 'furniture' && this.selected.index === fIdx
      if (alreadySel) {
        // Begin move
        this._isDraggingItem  = true
        this._dragClickOffset = { x: w.x - this.furniture[fIdx].x, y: w.y - this.furniture[fIdx].y }
        this._pushHistory({ action: 'move', type: 'furniture', index: fIdx, item: { ...this.furniture[fIdx] }, from: { x: this.furniture[fIdx].x, y: this.furniture[fIdx].y } })
      } else {
        this._setSelected({ type: 'furniture', index: fIdx })
      }
      this._dirty = true; return
    }

    // 4. Room — same select-first logic
    const rIdx = this._hitRoom(w.x, w.y)
    if (rIdx >= 0) {
      const alreadySel = this.selected?.type === 'room' && this.selected.index === rIdx
      if (alreadySel) {
        this._isDraggingItem  = true
        this._dragClickOffset = { x: w.x - this.rooms[rIdx].x, y: w.y - this.rooms[rIdx].y }
        this._pushHistory({ action: 'move', type: 'room', index: rIdx, item: { ...this.rooms[rIdx] }, from: { x: this.rooms[rIdx].x, y: this.rooms[rIdx].y } })
      } else {
        this._setSelected({ type: 'room', index: rIdx })
      }
      this._dirty = true; return
    }

    // 4b. Polygon
    const pIdx = this._hitPolygon(w.x, w.y)
    if (pIdx >= 0) {
      const alreadySel = this.selected?.type === 'polygon' && this.selected.index === pIdx
      if (alreadySel) {
        this._isDraggingItem  = true
        const c = this._polygonCentroid(this.polygons[pIdx].points)
        this._dragClickOffset = { x: w.x - c.x, y: w.y - c.y }
      } else {
        this._setSelected({ type: 'polygon', index: pIdx })
      }
      this._dirty = true; return
    }

    // 5. Miss — deselect + pan
    this._setSelected(null)
    this._isPanning = true
    this._panStart  = s
    this._panOffset = { x: this.viewport.offsetX, y: this.viewport.offsetY }
  }

  private _handleMouseMove = (e: MouseEvent) => {
    const s = this._screenPt(e)
    const w = this.viewport.screenToWorld(s.x, s.y)

    // Update freeform cursor preview
    if (this.mode === 'freeform') { this.freeformCursor = w; this._dirty = true; return }

    // Update sidebar drag ghost + canvas preview
    if (this._isGhostDrag) {
      this._moveGhost(e.clientX, e.clientY)
      if (this._ghostDef) {
        const def = this._ghostDef
        this.dragPreview = this._makeFurnitureItem(
          def,
          this._snap(w.x - def.defaultWidth  / 2),
          this._snap(w.y - def.defaultHeight / 2),
        )
      }
      this._dirty = true; return
    }

    // Viewport pan
    if (this._isPanning) {
      this.viewport.offsetX = this._panOffset.x + (s.x - this._panStart.x)
      this.viewport.offsetY = this._panOffset.y + (s.y - this._panStart.y)
      this._syncZoom(); this._dirty = true; return
    }

    // Item drag — snap to SNAP_CM grid
    if (this._isDraggingItem && this.selected) {
      const { type, index } = this.selected
      if (type === 'furniture') {
        this.furniture[index].x = this._snap(w.x - this._dragClickOffset.x)
        this.furniture[index].y = this._snap(w.y - this._dragClickOffset.y)
        this._recalcCollisions(); this._updateNudgePos()
      } else if (type === 'room') {
        this.rooms[index].x = this._snap(w.x - this._dragClickOffset.x)
        this.rooms[index].y = this._snap(w.y - this._dragClickOffset.y)
      } else if (type === 'polygon') {
        const c  = this._polygonCentroid(this.polygons[index].points)
        const dx = this._snap(w.x - this._dragClickOffset.x) - c.x
        const dy = this._snap(w.y - this._dragClickOffset.y) - c.y
        this.polygons[index].points = this.polygons[index].points.map(p => ({ x: p.x + dx, y: p.y + dy }))
      }
      this._dirty = true; return
    }

    // Vertex / edge resize
    if (this._isResizingVertex) { this._applyVertexDrag(w); this._dirty = true; return }
    if (this._isResizingEdge)   { this._applyEdgeDrag(w);   this._dirty = true; return }

    // Hover highlight for vertex / edge handles
    const prevV = this._hoverVertex; const prevE = this._hoverEdge
    if (this.selected && this.selected.type !== 'furniture') {
      this._hoverVertex = this._hitVertex(s.x, s.y)
      this._hoverEdge   = this._hoverVertex != null && this._hoverVertex >= 0 ? null : this._hitEdge(s.x, s.y)
    } else { this._hoverVertex = null; this._hoverEdge = null }
    if (this._hoverVertex !== prevV || this._hoverEdge !== prevE) this._dirty = true
  }

  private _handleMouseUp = (_e: MouseEvent) => {
    this._isDraggingItem   = false
    this._isPanning        = false
    this._isResizingVertex = false
    this._isResizingEdge   = false
    this._updateNudgePos()
  }

  private _handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const s = this._screenPt(e)
    this.viewport.zoomAt(s.x, s.y, e.deltaY)
    this._syncZoom(); this._dirty = true
  }

  private _handleKeyDown = (e: KeyboardEvent) => {
    // Ignore key events that originated in text fields
    const tag = (e.target as HTMLElement).tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return

    if (e.key === 'Delete' || e.key === 'Backspace') { this.deleteSelected(); return }
    if (e.key === 'z' && (e.ctrlKey || e.metaKey))   { this.undo(); return }
    if (e.key === 'Escape') {
      if (this.mode === 'freeform') { this.freeformPts = []; this.freeformCursor = null; this._dirty = true }
      else this._setSelected(null)
      return
    }
    // Arrow nudge — Shift for 10× step
    const STEP = e.shiftKey ? this.SNAP_CM * 10 : this.SNAP_CM
    if (e.key === 'ArrowUp')    { e.preventDefault(); this.nudge(0, -STEP) }
    if (e.key === 'ArrowDown')  { e.preventDefault(); this.nudge(0,  STEP) }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); this.nudge(-STEP, 0) }
    if (e.key === 'ArrowRight') { e.preventDefault(); this.nudge( STEP, 0) }
  }

  // Window-level handlers for sidebar ghost drag (fires even when cursor leaves canvas)
  private _handleWindowMouseMove = (e: MouseEvent) => {
    if (!this._isGhostDrag) return
    const rect = this.canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left; const sy = e.clientY - rect.top
    this._moveGhost(e.clientX, e.clientY)
    if (this._ghostDef) {
      const w = this.viewport.screenToWorld(sx, sy)
      const def = this._ghostDef
      this.dragPreview = this._makeFurnitureItem(
        def,
        this._snap(w.x - def.defaultWidth  / 2),
        this._snap(w.y - def.defaultHeight / 2),
      )
    }
    this._dirty = true
  }

  private _handleWindowMouseUp = (e: MouseEvent) => {
    if (!this._isGhostDrag) return
    const rect = this.canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left; const sy = e.clientY - rect.top
    const over = sx >= 0 && sy >= 0 && sx < rect.width && sy < rect.height
    if (over && this._ghostDef) {
      const w    = this.viewport.screenToWorld(sx, sy)
      const def  = this._ghostDef
      const item = this._makeFurnitureItem(
        def,
        this._snap(w.x - def.defaultWidth  / 2),
        this._snap(w.y - def.defaultHeight / 2),
      )
      this.furniture.push(item)
      this._pushHistory({ action: 'place', type: 'furniture', item: { ...item } })
      this.selected = { type: 'furniture', index: this.furniture.length - 1 }
      this._recalcCollisions(); this._syncAll()
    }
    this._clearGhost(); this._dirty = true
  }

  // ── Render loop ───────────────────────────────────────────────────────────

  /** Continuous RAF loop — only calls _render() when something changed. */
  private _scheduleRender() {
    this._rafId = requestAnimationFrame(() => {
      if (this._dirty) { this._render(); this._dirty = false }
      this._scheduleRender()
    })
  }

  private _render() {
    const { canvas, ctx, viewport, theme } = this
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    this.grid.draw(ctx, viewport, canvas.width, canvas.height, theme)
    this.roomsR.draw(ctx, viewport, this.rooms, this.polygons, this.selected, theme)
    this.roomsR.drawFreeformPreview(ctx, viewport, this.freeformPts, this.freeformCursor)
    this.roomsR.drawVertexHandles(ctx, viewport, this.rooms, this.polygons, this.selected, this._hoverVertex, this._hoverEdge)
    this.furnitureR.draw(ctx, viewport, this.furniture, this.selected, this.collisionSet, this.dragPreview, this.showIcons ? this._iconCache : null, theme)
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _bindEvents() {
    this.canvas.addEventListener('mousedown',  this._handleMouseDown)
    this.canvas.addEventListener('mousemove',  this._handleMouseMove)
    this.canvas.addEventListener('mouseup',    this._handleMouseUp)
    this.canvas.addEventListener('wheel',      this._handleWheel as EventListener, { passive: false })
    window.addEventListener('keydown',         this._handleKeyDown)
    window.addEventListener('mousemove',       this._handleWindowMouseMove)
    window.addEventListener('mouseup',         this._handleWindowMouseUp)
  }

  /** Return screen coordinates of a mouse event relative to the canvas. */
  private _screenPt(e: MouseEvent | WheelEvent) {
    const r = this.canvas.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  private _setSelected(sel: Selection | null) {
    this.selected = sel
    this._hoverVertex = null; this._hoverEdge = null
    this._syncSelected(); this._updateNudgePos(); this._dirty = true
  }

  /** Push UI state to React via callbacks. */
  private _syncSelected() {
    this.cb.onSelectedChange(this.selected)
    this.cb.onUndoChange(this.history.length > 0)
    if (this.selected?.type === 'furniture') {
      const f = this.furniture[this.selected.index]
      this.cb.onRotationChange(f.rotation ?? 0)
      this.cb.onFlipChange(f.flipX ?? false)
      this.cb.onLabelsChange(f.hideLabel ?? false)
    } else if (this.selected) {
      const item = this.selected.type === 'room'
        ? this.rooms[this.selected.index]
        : this.polygons[this.selected.index]
      this.cb.onLabelsChange(item.hideLabel ?? false)
      this.cb.onRotationChange(0)
      this.cb.onFlipChange(false)
    } else {
      this.cb.onLabelsChange(false); this.cb.onRotationChange(0); this.cb.onFlipChange(false)
    }
  }

  private _syncZoom()  { this.cb.onZoomChange(this.viewport.getZoomPercent()) }
  private _syncSlots() { this.cb.onSlotsChange(this.storage.hasSlot('a'), this.storage.hasSlot('b')) }

  private _syncAll() {
    this._syncSelected(); this._syncZoom(); this._syncSlots(); this._recalcCollisions()
  }

  /** Recalculate nudge-button positions after selection or drag changes. */
  private _updateNudgePos() {
    if (!this.selected || this.selected.type !== 'furniture') { this.cb.onNudgePosChange(null); return }
    const f  = this.furniture[this.selected.index]
    const bb = this.furnitureR.getScreenBBox(this.viewport, f)
    const W  = this.canvas.getBoundingClientRect()
    const G  = 28
    this.cb.onNudgePosChange({
      up:    { left: W.left + bb.x + bb.w / 2 - 14, top: W.top + bb.y - G },
      down:  { left: W.left + bb.x + bb.w / 2 - 14, top: W.top + bb.y + bb.h },
      left:  { left: W.left + bb.x - G,               top: W.top + bb.y + bb.h / 2 - 14 },
      right: { left: W.left + bb.x + bb.w,            top: W.top + bb.y + bb.h / 2 - 14 },
    } as NudgePos)
  }

  /** Reset zoom to 50% and pan so world origin is at canvas centre. */
  private _centerView() {
    this.viewport.zoom    = 0.3
    this.viewport.offsetX = this.canvas.width  / 2
    this.viewport.offsetY = this.canvas.height / 2
  }

  /** Set canvas pixel dimensions to match the container layout size. */
  _resizeCanvas() {
    this.canvas.width  = this.workspace.clientWidth  || 800
    this.canvas.height = this.workspace.clientHeight || 600
    if (this.viewport.offsetX === 0 && this.viewport.offsetY === 0) this._centerView()
    this._dirty = true
  }

  /** Pre-render each catalogue icon SVG into an HTMLImageElement for canvas drawImage. */
  private _preloadIcons() {
    for (const def of FURNITURE_CATALOGUE) {
      const svg = def.icon.replace(/currentColor/g, 'rgba(180,195,210,0.85)')
      const img = new Image()
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
      this._iconCache.set(def.id, img)
    }
  }

  /** Append an entry to the undo stack (capped at 50). */
  private _pushHistory(entry: HistoryEntry) {
    this.history.push(entry)
    if (this.history.length > 50) this.history.shift()
    this.cb.onUndoChange(true)
  }

  // ── Snap ─────────────────────────────────────────────────────────────────

  /** Snap a world-space value to the nearest SNAP_CM grid line. */
  private _snap(v: number) { return Math.round(v / this.SNAP_CM) * this.SNAP_CM }

  // ── Collision detection ───────────────────────────────────────────────────

  /**
   * Rebuild the set of furniture indices that are overlapping another item.
   * Items with noCollide (e.g. chairs, doors) are excluded from all checks.
   */
  private _recalcCollisions() {
    this.collisionSet.clear()
    for (let i = 0; i < this.furniture.length; i++) {
      if (this.furniture[i].noCollide) continue
      const va = this.furnitureR.getFurnitureVertices(this.furniture[i])
      for (let j = i + 1; j < this.furniture.length; j++) {
        if (this.furniture[j].noCollide) continue
        const vb = this.furnitureR.getFurnitureVertices(this.furniture[j])
        if (satOverlap(va, vb)) { this.collisionSet.add(i); this.collisionSet.add(j) }
      }
    }
    this._dirty = true
  }

  // ── Freeform polygon ──────────────────────────────────────────────────────

  /** Close and commit the in-progress freeform polygon. */
  private _closeFreeform() {
    if (this.freeformPts.length < 3) return
    const poly: PolygonItem = { points: [...this.freeformPts] }
    this.polygons.push(poly)
    this._pushHistory({ action: 'place', type: 'polygon', item: { ...poly } })
    this.selected = { type: 'polygon', index: this.polygons.length - 1 }
    this.freeformPts = []; this.freeformCursor = null
    this._syncAll(); this._dirty = true
  }

  // ── Hit testing ───────────────────────────────────────────────────────────

  /** Return the topmost furniture index whose OBB contains (wx, wy), or -1. */
  private _hitFurniture(wx: number, wy: number): number {
    const dot: Vec2[] = [
      { x: wx - 0.01, y: wy - 0.01 }, { x: wx + 0.01, y: wy - 0.01 },
      { x: wx + 0.01, y: wy + 0.01 }, { x: wx - 0.01, y: wy + 0.01 },
    ]
    for (let i = this.furniture.length - 1; i >= 0; i--) {
      if (satOverlap(this.furnitureR.getFurnitureVertices(this.furniture[i]), dot)) return i
    }
    return -1
  }

  private _hitRoom(wx: number, wy: number): number {
    for (let i = this.rooms.length - 1; i >= 0; i--) {
      const r = this.rooms[i]
      if (wx >= r.x && wx <= r.x + r.width && wy >= r.y && wy <= r.y + r.height) return i
    }
    return -1
  }

  private _hitPolygon(wx: number, wy: number): number {
    for (let i = this.polygons.length - 1; i >= 0; i--) {
      if (this._pointInPoly(wx, wy, this.polygons[i].points)) return i
    }
    return -1
  }

  private _pointInPoly(x: number, y: number, pts: Vec2[]): boolean {
    let inside = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i].x; const yi = pts[i].y; const xj = pts[j].x; const yj = pts[j].y
      if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside
    }
    return inside
  }

  /** Return the vertex index under screen point (sx, sy), or -1. */
  private _hitVertex(sx: number, sy: number): number {
    if (!this.selected || this.selected.type === 'furniture') return -1
    const verts = this.selected.type === 'room'
      ? this.roomsR.roomVertices(this.rooms[this.selected.index])
      : this.polygons[this.selected.index].points
    const R = this.roomsR.VERTEX_HIT_RADIUS
    for (let i = 0; i < verts.length; i++) {
      const s = this.viewport.worldToScreen(verts[i].x, verts[i].y)
      if (Math.hypot(sx - s.x, sy - s.y) <= R) return i
    }
    return -1
  }

  /** Return the edge midpoint index under screen point (sx, sy), or -1. */
  private _hitEdge(sx: number, sy: number): number {
    if (!this.selected || this.selected.type === 'furniture') return -1
    const verts = this.selected.type === 'room'
      ? this.roomsR.roomVertices(this.rooms[this.selected.index])
      : this.polygons[this.selected.index].points
    const n = verts.length; const R = this.roomsR.EDGE_HIT_RADIUS
    for (let i = 0; i < n; i++) {
      const a  = this.viewport.worldToScreen(verts[i].x, verts[i].y)
      const b  = this.viewport.worldToScreen(verts[(i + 1) % n].x, verts[(i + 1) % n].y)
      const mx = (a.x + b.x) / 2; const my = (a.y + b.y) / 2
      if (Math.hypot(sx - mx, sy - my) <= R) return i
    }
    return -1
  }

  // ── Vertex / edge drag ────────────────────────────────────────────────────

  private _applyVertexDrag(w: Vec2) {
    if (!this.selected) return
    const i = this._resizeVertIdx
    if (this.selected.type === 'room') {
      const r = this.rooms[this.selected.index]
      const verts = this.roomsR.roomVertices(r)
      const opp = verts[(i + 2) % 4]  // opposite corner stays fixed
      const nx = this._snap(w.x); const ny = this._snap(w.y)
      r.x = Math.min(nx, opp.x); r.y = Math.min(ny, opp.y)
      r.width  = Math.abs(nx - opp.x)
      r.height = Math.abs(ny - opp.y)
    } else if (this.selected.type === 'polygon') {
      this.polygons[this.selected.index].points[i] = { x: this._snap(w.x), y: this._snap(w.y) }
    }
  }

  private _applyEdgeDrag(w: Vec2) {
    if (!this.selected) return
    const i = this._resizeEdgeIdx
    if (this.selected.type === 'room') {
      const r = this.rooms[this.selected.index]
      const verts = this.roomsR.roomVertices(r); const n = verts.length
      const a = verts[i]; const b = verts[(i + 1) % n]
      const dx = b.x - a.x; const dy = b.y - a.y; const len = Math.hypot(dx, dy)
      const nx = -dy / len; const ny = dx / len
      const proj = this._snap((w.x - a.x) * nx + (w.y - a.y) * ny)
      verts[i]           = { x: a.x + nx * proj, y: a.y + ny * proj }
      verts[(i + 1) % n] = { x: b.x + nx * proj, y: b.y + ny * proj }
      const xs = verts.map(v => v.x); const ys = verts.map(v => v.y)
      r.x = Math.min(...xs); r.y = Math.min(...ys)
      r.width = Math.max(...xs) - r.x; r.height = Math.max(...ys) - r.y
    } else if (this.selected.type === 'polygon') {
      const pts = this.polygons[this.selected.index].points; const n = pts.length
      const a = pts[i]; const b = pts[(i + 1) % n]
      const dx = b.x - a.x; const dy = b.y - a.y; const len = Math.hypot(dx, dy)
      const nx = -dy / len; const ny = dx / len
      const proj = this._snap((w.x - a.x) * nx + (w.y - a.y) * ny)
      pts[i]           = { x: a.x + nx * proj, y: a.y + ny * proj }
      pts[(i + 1) % n] = { x: b.x + nx * proj, y: b.y + ny * proj }
    }
  }

  // ── Polygon helpers ───────────────────────────────────────────────────────

  private _polygonCentroid(pts: Vec2[]): Vec2 {
    return {
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
      y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    }
  }

  // ── Furniture factory ─────────────────────────────────────────────────────

  private _makeFurnitureItem(def: FurnitureDef, x: number, y: number): FurnitureItem {
    const item: FurnitureItem = {
      id: def.id, name: def.name, shape: def.shape, noCollide: def.noCollide,
      x, y, width: def.defaultWidth, height: def.defaultHeight, rotation: 0, flipX: false,
    }
    if (def.shape === 'polygon' && def.defaultPoints) {
      item.points = def.defaultPoints.map(p => ({ ...p }))
    }
    return item
  }

  // ── Sidebar ghost ─────────────────────────────────────────────────────────

  private _moveGhost(cx: number, cy: number) {
    if (!this._ghostEl) return
    this._ghostEl.style.left = `${cx - 30}px`
    this._ghostEl.style.top  = `${cy - 30}px`
  }

  private _clearGhost() {
    if (this._ghostEl) { this._ghostEl.remove(); this._ghostEl = null }
    this._ghostDef = null; this._isGhostDrag = false; this.dragPreview = null
  }
}
