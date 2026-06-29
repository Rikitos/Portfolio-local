/**
 * RoomsRenderer — draws rooms, freeform polygons, and their editing handles.
 *
 * All geometry is in world-space centimetres and converted to screen pixels
 * via Viewport.worldToScreen before any canvas draw call.
 *
 * Responsibilities:
 *   draw()                — room rect outlines + polygon walls each frame
 *   drawFreeformPreview() — live dotted preview line while placing a polygon vertex
 *   drawVertexHandles()   — gold dots on corners + edge midpoints when a room/polygon is selected
 *
 * Hit-radius constants (VERTEX_HIT_RADIUS, EDGE_HIT_RADIUS) are read by
 * Designer for mouse picking — kept here so they stay visually in sync with
 * what the user can actually click.
 *
 * Draw order within draw(): rooms first, then polygons.
 * The selected item's gold highlight ring is drawn before the wall stroke so
 * the stroke sits on top and walls remain crisp.
 */
import type { Viewport } from './viewport'
import type { RoomItem, PolygonItem, Vec2, Selection } from './types'

export class RoomsRenderer {
  // ── Visual constants ───────────────────────────────────────────────────────
  readonly WALL_COLOR      = 'rgba(200, 218, 232, 0.85)'  // dark-theme wall stroke
  readonly LABEL_COLOR     = 'rgba(201, 168, 76, 0.9)'    // dark-theme dimension label
  readonly LABEL_FONT      = '12px "Palatino Linotype", Palatino, serif'
  readonly LABEL_OFFSET    = 18   // px from wall to centre of label text
  readonly WALL_WIDTH      = 2    // stroke width in screen pixels
  readonly DOT_RADIUS      = 4    // freeform vertex dot radius in screen px
  readonly CLOSE_RADIUS    = 12   // screen-px radius within which cursor snaps to close the polygon

  // Vertex handle: drawn on top of edge handles so vertex always wins in hover
  readonly VERTEX_RADIUS     = 5   // normal gold circle radius (screen px)
  readonly VERTEX_HIT_RADIUS = 9   // click hit zone radius (screen px)

  // Edge midpoint handle: smaller than vertex so the two are visually distinct
  readonly EDGE_RADIUS       = 3
  readonly EDGE_HIT_RADIUS   = 7

  /**
   * Draw all rooms and polygons for one frame.
   * wallColor and labelColor switch between dark-blueprint and light-paper palettes.
   */
  draw(ctx: CanvasRenderingContext2D, viewport: Viewport, rooms: RoomItem[], polygons: PolygonItem[], selected: Selection | null, theme: 'dark' | 'light' = 'dark') {
    const dark  = theme === 'dark'
    const wall  = dark ? this.WALL_COLOR  : 'rgba(30, 45, 70, 0.85)'
    const label = dark ? this.LABEL_COLOR : 'rgba(160, 120, 30, 0.9)'

    for (let i = 0; i < rooms.length; i++) {
      const isSelected = selected?.type === 'room' && selected.index === i
      this._drawRect(ctx, viewport, rooms[i], isSelected, wall)
      if (!rooms[i].hideLabel) this._drawRectLabels(ctx, viewport, rooms[i], label)
    }
    for (let i = 0; i < polygons.length; i++) {
      const isSelected = selected?.type === 'polygon' && selected.index === i
      this._drawPolygon(ctx, viewport, polygons[i].points, true, isSelected, wall)
      if (!polygons[i].hideLabel) this._drawPolygonLabels(ctx, viewport, polygons[i].points, label)
    }
  }

  /**
   * Draw the in-progress polygon while freeform mode is active.
   * Renders committed vertices as dots and a dashed line from the last vertex to the cursor.
   * The first vertex gets a larger gold ring when the cursor is close enough to close the shape.
   */
  drawFreeformPreview(ctx: CanvasRenderingContext2D, viewport: Viewport, points: Vec2[], cursorWorld: Vec2 | null) {
    if (points.length === 0) return
    const screenPts    = points.map(p => viewport.worldToScreen(p.x, p.y))
    const cursorScreen = cursorWorld ? viewport.worldToScreen(cursorWorld.x, cursorWorld.y) : null

    // Draw solid lines between committed vertices (not closed yet)
    this._drawPolygon(ctx, viewport, points, false)

    // Draw dashed preview line from last committed vertex to live cursor
    if (cursorScreen) {
      const last = screenPts[screenPts.length - 1]
      ctx.save()
      ctx.strokeStyle = this.WALL_COLOR; ctx.lineWidth = this.WALL_WIDTH; ctx.setLineDash([5, 5])
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(cursorScreen.x, cursorScreen.y); ctx.stroke()
      ctx.setLineDash([]); ctx.restore()
    }

    // Draw dots for each committed vertex; first dot gets a close-hint ring
    for (let i = 0; i < screenPts.length; i++) {
      const pt       = screenPts[i]
      const isFirst  = i === 0
      const canClose = points.length >= 3   // minimum vertices to form a valid polygon

      // Snap-to-close highlight: cursor is within CLOSE_RADIUS of the first vertex
      const nearFirst = isFirst && cursorScreen && canClose &&
        Math.hypot(cursorScreen.x - pt.x, cursorScreen.y - pt.y) <= this.CLOSE_RADIUS

      ctx.beginPath()
      ctx.arc(pt.x, pt.y, nearFirst ? this.DOT_RADIUS + 3 : this.DOT_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = nearFirst ? 'rgba(201, 168, 76, 0.9)' : this.WALL_COLOR
      ctx.fill()

      // Faint close-radius ring around the first vertex when the polygon can be closed
      if (isFirst && canClose && !nearFirst) {
        ctx.beginPath(); ctx.arc(pt.x, pt.y, this.CLOSE_RADIUS, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(201, 168, 76, 0.4)'; ctx.lineWidth = 1; ctx.stroke()
      }
    }
  }

  /**
   * Draw vertex (corner) and edge (midpoint) handles for the selected room or polygon.
   * Edge handles are drawn first so vertex handles render on top — vertex wins on overlap.
   * Hovered handle is highlighted gold; idle handles are semi-transparent.
   */
  drawVertexHandles(ctx: CanvasRenderingContext2D, viewport: Viewport, rooms: RoomItem[], polygons: PolygonItem[], selected: Selection | null, hoverVertex: number | null, hoverEdge: number | null) {
    if (!selected || selected.type === 'furniture') return

    const verts = selected.type === 'room'
      ? this._roomVertices(rooms[selected.index])
      : polygons[selected.index].points
    const n = verts.length

    // Edge midpoint handles (drawn first, underneath vertex handles)
    for (let i = 0; i < n; i++) {
      const a   = viewport.worldToScreen(verts[i].x, verts[i].y)
      const b   = viewport.worldToScreen(verts[(i + 1) % n].x, verts[(i + 1) % n].y)
      const mx  = (a.x + b.x) / 2; const my = (a.y + b.y) / 2
      const hot = i === hoverEdge; const r = hot ? this.EDGE_RADIUS + 2 : this.EDGE_RADIUS
      ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2)
      ctx.fillStyle   = hot ? 'rgba(201, 168, 76, 0.9)' : 'rgba(201, 168, 76, 0.4)'
      ctx.strokeStyle = hot ? 'rgba(255,255,255,0.5)'   : 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 1; ctx.fill(); ctx.stroke()
    }

    // Corner vertex handles (drawn second, on top of edge handles)
    for (let i = 0; i < n; i++) {
      const s   = viewport.worldToScreen(verts[i].x, verts[i].y)
      const hot = i === hoverVertex; const r = hot ? this.VERTEX_RADIUS + 3 : this.VERTEX_RADIUS
      ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2)
      ctx.fillStyle   = hot ? 'rgba(201, 168, 76, 1)'   : 'rgba(201, 168, 76, 0.75)'
      ctx.strokeStyle = hot ? 'rgba(255,255,255,0.6)'   : 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke()
    }
  }

  /** Public alias used by Designer for hit-testing (avoids duplicating vertex logic). */
  roomVertices(r: RoomItem): Vec2[] { return this._roomVertices(r) }

  /** Return the four corners of a rect in world cm, clockwise from top-left. */
  _roomVertices(r: RoomItem): Vec2[] {
    return [
      { x: r.x,           y: r.y },
      { x: r.x + r.width, y: r.y },
      { x: r.x + r.width, y: r.y + r.height },
      { x: r.x,           y: r.y + r.height },
    ]
  }

  /** Draw a room rectangle outline; adds a gold padding rect when selected. */
  _drawRect(ctx: CanvasRenderingContext2D, viewport: Viewport, room: RoomItem, isSelected: boolean, wallColor = this.WALL_COLOR) {
    const { x1, y1, x2, y2 } = this._rectToScreen(viewport, room.x, room.y, room.width, room.height)
    ctx.strokeStyle = wallColor; ctx.lineWidth = this.WALL_WIDTH
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)

    // Gold selection ring drawn 4 px outside the wall so it doesn't obscure it
    if (isSelected) {
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.75)'; ctx.lineWidth = 2
      const pad = 4; ctx.strokeRect(x1 - pad, y1 - pad, x2 - x1 + pad * 2, y2 - y1 + pad * 2)
    }
  }

  /**
   * Draw dimension labels on all four sides of a room rect.
   * Width labels go on top and bottom edges; height labels are rotated 90° on left and right.
   */
  _drawRectLabels(ctx: CanvasRenderingContext2D, viewport: Viewport, room: RoomItem, labelColor = this.LABEL_COLOR) {
    const o = this._rectToScreen(viewport, room.x, room.y, room.width, room.height)
    const d = this.LABEL_OFFSET
    ctx.fillStyle = labelColor; ctx.font = this.LABEL_FONT
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'

    // Top and bottom — horizontal labels showing width
    ctx.fillText(this._mLabel(room.width),  (o.x1 + o.x2) / 2, o.y1 + d)
    ctx.fillText(this._mLabel(room.width),  (o.x1 + o.x2) / 2, o.y2 - d)

    // Left side — rotate -90° so text reads bottom-to-top
    ctx.save(); ctx.translate(o.x1 + d, (o.y1 + o.y2) / 2); ctx.rotate(-Math.PI / 2)
    ctx.fillText(this._mLabel(room.height), 0, 0); ctx.restore()

    // Right side — rotate +90° so text reads top-to-bottom
    ctx.save(); ctx.translate(o.x2 - d, (o.y1 + o.y2) / 2); ctx.rotate(Math.PI / 2)
    ctx.fillText(this._mLabel(room.height), 0, 0); ctx.restore()
  }

  /**
   * Draw a polygon as a connected path.
   * If close=true the path is explicitly closed (committed polygon).
   * If isSelected, a wider gold stroke is drawn first as a highlight ring, then the wall stroke on top.
   */
  _drawPolygon(ctx: CanvasRenderingContext2D, viewport: Viewport, points: Vec2[], close: boolean, isSelected = false, wallColor = this.WALL_COLOR) {
    if (points.length < 2) return
    const pts = points.map(p => viewport.worldToScreen(p.x, p.y))

    // Draw gold selection highlight underneath the wall stroke
    if (isSelected) {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
      if (close) ctx.closePath()
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.75)'; ctx.lineWidth = 6; ctx.stroke()
    }

    // Wall stroke on top
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
    if (close) ctx.closePath()
    ctx.strokeStyle = wallColor; ctx.lineWidth = this.WALL_WIDTH; ctx.stroke()
  }

  /** Draw a dimension label centred over each edge of a polygon. */
  _drawPolygonLabels(ctx: CanvasRenderingContext2D, viewport: Viewport, points: Vec2[], labelColor = this.LABEL_COLOR) {
    const n = points.length
    ctx.fillStyle = labelColor; ctx.font = this.LABEL_FONT
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (let i = 0; i < n; i++) {
      const a      = viewport.worldToScreen(points[i].x, points[i].y)
      const b      = viewport.worldToScreen(points[(i + 1) % n].x, points[(i + 1) % n].y)
      const lenCm  = Math.hypot(points[(i+1)%n].x - points[i].x, points[(i+1)%n].y - points[i].y)
      this._segmentLabel(ctx, a, b, lenCm)
    }
  }

  /**
   * Draw a dimension label centred over a line segment (screen coords).
   * The label is rotated to follow the edge, and flipped if the edge runs right-to-left
   * so text always reads left-to-right from the viewer's perspective.
   */
  _segmentLabel(ctx: CanvasRenderingContext2D, a: Vec2, b: Vec2, lenCm: number) {
    const mx    = (a.x + b.x) / 2; const my = (a.y + b.y) / 2
    const angle = Math.atan2(b.y - a.y, b.x - a.x)
    ctx.save(); ctx.translate(mx, my)
    // Flip 180° when edge runs right-to-left so text is never upside-down
    const rot = (angle > Math.PI / 2 || angle < -Math.PI / 2) ? angle + Math.PI : angle
    ctx.rotate(rot); ctx.fillText(this._mLabel(lenCm), 0, -this.LABEL_OFFSET / 2); ctx.restore()
  }

  /** Convert a world-space rect to four screen-pixel coordinates. */
  _rectToScreen(viewport: Viewport, x: number, y: number, w: number, h: number) {
    const tl = viewport.worldToScreen(x, y); const br = viewport.worldToScreen(x + w, y + h)
    return { x1: tl.x, y1: tl.y, x2: br.x, y2: br.y }
  }

  /** Format a centimetre value as a concise metre string, e.g. 350 → "3.5m", 200 → "2m". */
  _mLabel(cm: number) {
    const m = cm / 100
    return m % 1 === 0 ? `${m}m` : `${parseFloat(m.toFixed(2))}m`
  }
}
