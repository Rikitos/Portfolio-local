/**
 * FurnitureRenderer — draws all furniture items on the canvas.
 *
 * Three item shapes are supported (branched on item.shape):
 *   rect    (default) — rotatable, flippable filled rectangle; rotation around bounding-box centre
 *   polygon           — L-shaped items (L-Sofa, L-Desk); drawn from stored local-space points
 *   door              — wall line + quarter-circle swing arc; pivots at hinge corner (item.x, item.y)
 *
 * Visual states (priority: collision > selected > normal):
 *   normal    — muted fill + light stroke
 *   selected  — gold stroke + outer ring
 *   collision — red fill + red stroke (only for items where noCollide is false)
 *   ghost     — semi-transparent (sidebar drag preview)
 *
 * Icon rendering: SVG icons are pre-rasterised into HTMLImageElements by Designer._preloadIcons()
 * and passed in as iconCache.  If an icon is ready and the item is large enough (>20 px),
 * the icon is drawn instead of the text label.
 *
 * Coordinate note: all item positions are world cm; pixel positions are computed on the fly
 * by multiplying by (PIXELS_PER_CM * zoom).
 */
import type { Viewport } from './viewport'
import type { FurnitureItem, Vec2, Selection } from './types'

export class FurnitureRenderer {
  // ── Dark-theme colour constants (light-theme values are inlined in draw()) ─
  readonly FONT      = '11px "Palatino Linotype", Palatino, serif'
  readonly FILL_NORM = 'rgba(100, 120, 145, 0.25)'   // idle fill
  readonly FILL_SEL  = 'rgba(201, 168, 76, 0.12)'    // selected fill
  readonly FILL_COLL = 'rgba(220, 60, 60, 0.18)'     // collision fill (same both themes)
  readonly STROKE_NORM = 'rgba(160, 180, 200, 0.8)'  // idle stroke
  readonly STROKE_SEL  = 'rgba(201, 168, 76, 0.9)'   // selected stroke
  readonly STROKE_COLL = 'rgba(220, 80, 80, 0.9)'    // collision stroke (same both themes)
  readonly LABEL_COL   = 'rgba(180, 195, 210, 0.85)' // text label colour

  /**
   * Draw all furniture items plus the optional sidebar drag ghost preview.
   * Ghost is drawn last so it renders on top of all placed items.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    viewport: Viewport,
    furniture: FurnitureItem[],
    selected: Selection | null,
    collisionSet: Set<number>,
    dragPreview: FurnitureItem | null,
    iconCache: Map<string, HTMLImageElement> | null = null,
    theme: 'dark' | 'light' = 'dark',
  ) {
    const dark = theme === 'dark'
    // Build a colour set for this frame based on the current theme
    const colors = {
      fillNorm:   dark ? this.FILL_NORM   : 'rgba(80, 70, 55, 0.12)',
      fillSel:    dark ? this.FILL_SEL    : 'rgba(160, 120, 30, 0.12)',
      fillColl:   this.FILL_COLL,   // collision red is the same in both themes
      strokeNorm: dark ? this.STROKE_NORM : 'rgba(50, 45, 35, 0.75)',
      strokeSel:  dark ? this.STROKE_SEL  : 'rgba(160, 120, 30, 0.9)',
      strokeColl: this.STROKE_COLL,
      label:      dark ? this.LABEL_COL   : 'rgba(50, 45, 35, 0.8)',
    }

    for (let i = 0; i < furniture.length; i++) {
      const item  = furniture[i]
      const isSel = selected?.type === 'furniture' && selected.index === i
      const isCol = collisionSet.has(i)
      this._drawItem(ctx, viewport, item, isSel, isCol, false, iconCache, colors)
    }

    // Ghost drag preview drawn last so it floats above all placed items
    if (dragPreview) {
      this._drawItem(ctx, viewport, dragPreview, false, false, true, iconCache, colors)
    }
  }

  /**
   * Draw a single furniture item in one of its visual states.
   * Branches on item.shape to delegate to the appropriate draw helper.
   */
  _drawItem(
    ctx: CanvasRenderingContext2D,
    viewport: Viewport,
    item: FurnitureItem,
    isSel: boolean,
    isCol: boolean,
    isGhost = false,
    iconCache: Map<string, HTMLImageElement> | null = null,
    colors = { fillNorm: this.FILL_NORM, fillSel: this.FILL_SEL, fillColl: this.FILL_COLL, strokeNorm: this.STROKE_NORM, strokeSel: this.STROKE_SEL, strokeColl: this.STROKE_COLL, label: this.LABEL_COL },
  ) {
    // Collision takes priority over selection in colour choice
    const fill   = isCol ? colors.fillColl   : isSel ? colors.fillSel   : colors.fillNorm
    const stroke = isCol ? colors.strokeColl : isSel ? colors.strokeSel : colors.strokeNorm
    ctx.save()
    ctx.globalAlpha = isGhost ? 0.55 : 1

    // Branch on shape: polygon items store their own point list; doors get special arc drawing
    if (item.shape === 'polygon' && item.points) {
      this._drawPolygonItem(ctx, viewport, item, fill, stroke, isSel, iconCache, colors.label)
    } else if (item.shape === 'door') {
      this._drawDoor(ctx, viewport, item, stroke)
    } else {
      this._drawRect(ctx, viewport, item, fill, stroke, isSel, iconCache, colors.label)
    }
    ctx.restore()
  }

  /**
   * Draw a standard rectangular furniture item.
   * Rotation is applied around the bounding-box centre (cx, cy) in world space.
   * Icon is drawn scaled to 72% of the smaller dimension; falls back to text label.
   */
  _drawRect(
    ctx: CanvasRenderingContext2D,
    viewport: Viewport,
    item: FurnitureItem,
    fill: string, stroke: string, isSel: boolean,
    iconCache: Map<string, HTMLImageElement> | null = null,
    labelColor = this.LABEL_COL,
  ) {
    const rot = ((item.rotation ?? 0) * Math.PI) / 180
    // Rotation pivot is the bounding-box centre in world space
    const cx  = item.x + item.width  / 2
    const cy  = item.y + item.height / 2
    const sc  = viewport.worldToScreen(cx, cy)
    const pw  = item.width  * viewport.PIXELS_PER_CM * viewport.zoom  // pixel width
    const ph  = item.height * viewport.PIXELS_PER_CM * viewport.zoom  // pixel height

    ctx.save()
    ctx.translate(sc.x, sc.y)
    ctx.rotate(rot)
    if (item.flipX) ctx.scale(-1, 1)  // mirror around the vertical centre axis
    ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.5
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph)
    ctx.strokeRect(-pw / 2, -ph / 2, pw, ph)

    // Gold selection ring drawn 5 px outside the item rect
    if (isSel) {
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.8)'; ctx.lineWidth = 2
      const pad = 5
      ctx.strokeRect(-pw / 2 - pad, -ph / 2 - pad, pw + pad * 2, ph + pad * 2)
    }

    // Icon takes priority over text label when the item is large enough to see it
    const img = iconCache?.get(item.id)
    if (iconCache && img?.complete && (pw > 20 || ph > 20)) {
      const s = Math.min(pw, ph) * 0.72   // scale icon to 72% of the shorter side
      ctx.drawImage(img, -s / 2, -s / 2, s, s)
    } else if (!item.hideLabel && (pw > 40 || ph > 40)) {
      ctx.fillStyle = labelColor; ctx.font = this.FONT
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(item.name, 0, 0)
    }
    ctx.restore()
  }

  /**
   * Draw an L-shaped (or other polygon) furniture item.
   * Points are stored in local space relative to item.x/y, in cm.
   * Rotation is applied around the local polygon centroid.
   * Icon is positioned at the centroid of the local points.
   */
  _drawPolygonItem(
    ctx: CanvasRenderingContext2D,
    viewport: Viewport,
    item: FurnitureItem,
    fill: string, stroke: string, isSel: boolean,
    iconCache: Map<string, HTMLImageElement> | null = null,
    labelColor = this.LABEL_COL,
  ) {
    const rot    = ((item.rotation ?? 0) * Math.PI) / 180
    const px     = viewport.PIXELS_PER_CM * viewport.zoom   // pixels per cm
    const origin = viewport.worldToScreen(item.x, item.y)

    // Convert local-space points (cm) to pixel offsets from origin
    const pts = (item.points!).map(p => ({
      x: p.x * px, y: p.y * px,
    }))

    // Centroid of local pixel points — used as icon/label anchor
    const centerX = pts.reduce((s, p) => s + p.x, 0) / pts.length
    const centerY = pts.reduce((s, p) => s + p.y, 0) / pts.length

    ctx.save()
    ctx.translate(origin.x, origin.y)
    ctx.rotate(rot)
    if (item.flipX) ctx.scale(-1, 1)

    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
    ctx.closePath()
    ctx.fillStyle = fill; ctx.fill()
    ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke()

    // Gold selection outline redrawn with wider stroke after the fill
    if (isSel) {
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
      ctx.closePath()
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.8)'; ctx.lineWidth = 3; ctx.stroke()
    }

    const img = iconCache?.get(item.id)
    const bw  = item.width * px; const bh = item.height * px
    if (iconCache && img?.complete && (bw > 20 || bh > 20)) {
      const s = Math.min(bw, bh) * 0.72
      ctx.drawImage(img, centerX - s / 2, centerY - s / 2, s, s)
    } else if (!item.hideLabel) {
      ctx.fillStyle = labelColor; ctx.font = this.FONT
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(item.name, centerX, centerY)
    }
    ctx.restore()
  }

  /**
   * Draw a door as a thick wall line + dashed quarter-circle swing arc.
   * The pivot point is the hinge corner at (item.x, item.y) in world space — not the centre.
   * item.width is used as both the door width and the swing radius (square bounding box).
   */
  _drawDoor(
    ctx: CanvasRenderingContext2D,
    viewport: Viewport,
    item: FurnitureItem,
    stroke: string,
  ) {
    const rot    = ((item.rotation ?? 0) * Math.PI) / 180
    const px     = viewport.PIXELS_PER_CM * viewport.zoom
    const origin = viewport.worldToScreen(item.x, item.y)  // hinge corner in screen px
    const pw     = item.width  * px   // door panel length in screen px

    ctx.save()
    ctx.translate(origin.x, origin.y)
    ctx.rotate(rot)
    if (item.flipX) ctx.scale(-1, 1)

    // Thick line = door panel in closed position (along the wall)
    ctx.strokeStyle = stroke; ctx.lineWidth = 4; ctx.setLineDash([])
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(pw, 0); ctx.stroke()

    // Dashed arc = 90° swing path showing the door's clearance zone
    ctx.lineWidth = 1; ctx.setLineDash([4, 3])
    ctx.beginPath(); ctx.arc(0, 0, pw, 0, Math.PI / 2); ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  /**
   * Compute the screen-space axis-aligned bounding box of a furniture item.
   * Used by Designer to position the four nudge arrow buttons around the selected item.
   * For rotated rects: projects all four OBB corners and takes the AABB.
   * For doors: derives corners from the hinge pivot (item.x, item.y) not the centre.
   */
  getScreenBBox(viewport: Viewport, item: FurnitureItem): { x: number; y: number; w: number; h: number } {
    const px  = viewport.PIXELS_PER_CM * viewport.zoom
    const rot = ((item.rotation ?? 0) * Math.PI) / 180
    const cos = Math.cos(rot); const sin = Math.sin(rot)

    if (item.shape === 'door') {
      // Door pivots at hinge corner — derive bbox from the four corners of the square swing area
      const hs = viewport.worldToScreen(item.x, item.y)
      const pw = item.width * px
      const corners = [{ x: 0, y: 0 }, { x: pw, y: 0 }, { x: pw, y: pw }, { x: 0, y: pw }]
        .map(v => {
          const lx = item.flipX ? pw - v.x : v.x   // apply flipX before rotation
          return { x: hs.x + lx * cos - v.y * sin, y: hs.y + lx * sin + v.y * cos }
        })
      const xs = corners.map(c => c.x); const ys = corners.map(c => c.y)
      const minX = Math.min(...xs); const maxX = Math.max(...xs)
      const minY = Math.min(...ys); const maxY = Math.max(...ys)
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
    }

    // Standard rect: rotate half-extents and project to get AABB half-widths
    const cx  = item.x + item.width  / 2
    const cy  = item.y + item.height / 2
    const sc  = viewport.worldToScreen(cx, cy)
    const pw  = item.width  * px / 2   // half pixel-width
    const ph  = item.height * px / 2   // half pixel-height
    const ac  = Math.abs(cos); const as_ = Math.abs(sin)
    // AABB half-extents of a rotated rect: hw = pw·|cos| + ph·|sin|
    const hw  = pw * ac + ph * as_; const hh = pw * as_ + ph * ac
    return { x: sc.x - hw, y: sc.y - hh, w: hw * 2, h: hh * 2 }
  }

  /**
   * Return world-space polygon vertices for a furniture item (used by SAT collision and hit testing).
   * Polygon items use their stored points transformed by position + rotation + flipX.
   * Rect items generate four OBB corners rotated around the bounding-box centre.
   * Door items generate four corners of the square swing area rotated around the hinge.
   */
  getFurnitureVertices(item: FurnitureItem): Vec2[] {
    if (item.shape === 'polygon' && item.points) {
      return this._transformPoints(item.points, item)
    }
    const rot = ((item.rotation ?? 0) * Math.PI) / 180
    const cos = Math.cos(rot); const sin = Math.sin(rot)

    if (item.shape === 'door') {
      // Door pivots at hinge corner (item.x, item.y) — matches draw code
      const w      = item.width
      const local: Vec2[] = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: w }, { x: 0, y: w }]
      return local.map(v => {
        const lx = item.flipX ? w - v.x : v.x   // apply flipX in local space before rotation
        return { x: item.x + lx * cos - v.y * sin, y: item.y + lx * sin + v.y * cos }
      })
    }

    // Standard rect: four corners relative to bounding-box centre, then rotated
    const hw = item.width / 2; const hh = item.height / 2
    const corners: Vec2[] = [
      { x: -hw, y: -hh }, { x: hw, y: -hh },
      { x:  hw, y:  hh }, { x: -hw, y: hh },
    ]
    const cx = item.x + hw; const cy = item.y + hh  // bounding-box centre in world cm
    return corners.map(v => ({
      x: cx + v.x * cos - v.y * sin,
      y: cy + v.x * sin + v.y * cos,
    }))
  }

  /**
   * Apply position, rotation, and flipX to a set of local-space points.
   * Local points are in cm relative to (item.x, item.y).
   * flipX mirrors around the item's local vertical centre axis (x = item.width / 2).
   */
  _transformPoints(pts: Vec2[], item: FurnitureItem): Vec2[] {
    const rot = ((item.rotation ?? 0) * Math.PI) / 180
    const cos = Math.cos(rot); const sin = Math.sin(rot)
    return pts.map(p => {
      const lx = item.flipX ? item.width - p.x : p.x   // mirror x before rotating
      const ly = p.y
      return {
        x: item.x + lx * cos - ly * sin,
        y: item.y + lx * sin + ly * cos,
      }
    })
  }
}
