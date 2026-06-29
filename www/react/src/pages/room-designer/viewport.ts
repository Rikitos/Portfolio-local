/**
 * Viewport — manages the 2D camera (zoom + pan offset).
 *
 * All canvas rendering is done in screen space (CSS pixels), but the
 * designer stores objects in world space (centimetres).  Every draw call
 * converts via worldToScreen / screenToWorld.
 *
 * PIXELS_PER_CM defines the base scale at zoom=1: 2 px/cm means a 1 m
 * wall is 200 px tall at 100% zoom.  The drawable world is capped at
 * ±WORLD_LIMIT_CM in each axis.
 */
export class Viewport {
  zoom = 1
  offsetX = 0
  offsetY = 0
  readonly PIXELS_PER_CM  = 2
  readonly MIN_ZOOM       = 0.25
  readonly MAX_ZOOM       = 4
  readonly WORLD_LIMIT_CM = 1500   // 15 m in each direction from origin

  /** World → screen: applies scale then pan offset. */
  worldToScreen(worldX: number, worldY: number) {
    return {
      x: worldX * this.PIXELS_PER_CM * this.zoom + this.offsetX,
      y: worldY * this.PIXELS_PER_CM * this.zoom + this.offsetY,
    }
  }

  /** Screen → world: inverse of worldToScreen. */
  screenToWorld(screenX: number, screenY: number) {
    return {
      x: (screenX - this.offsetX) / (this.PIXELS_PER_CM * this.zoom),
      y: (screenY - this.offsetY) / (this.PIXELS_PER_CM * this.zoom),
    }
  }

  /**
   * Zoom in/out centred on a screen point.
   * delta > 0 = zoom out (0.9×), delta < 0 = zoom in (1.1×).
   * Adjusts offset so the world point under the cursor stays fixed.
   */
  zoomAt(screenX: number, screenY: number, delta: number) {
    const factor = delta > 0 ? 0.9 : 1.1
    const newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoom * factor))
    this.offsetX = screenX - (screenX - this.offsetX) * (newZoom / this.zoom)
    this.offsetY = screenY - (screenY - this.offsetY) * (newZoom / this.zoom)
    this.zoom = newZoom
  }

  /** Set an absolute zoom level, keeping the given screen point fixed. */
  setZoom(zoom: number, centerX: number, centerY: number) {
    const newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, zoom))
    this.offsetX = centerX - (centerX - this.offsetX) * (newZoom / this.zoom)
    this.offsetY = centerY - (centerY - this.offsetY) * (newZoom / this.zoom)
    this.zoom = newZoom
  }

  /** Translate the viewport by (dx, dy) screen pixels. */
  pan(dx: number, dy: number) {
    this.offsetX += dx
    this.offsetY += dy
  }

  /** Clamp offset so the world boundary stays visible inside the canvas. */
  clampOffset(canvasW: number, canvasH: number) {
    const limitPx = this.WORLD_LIMIT_CM * this.PIXELS_PER_CM * this.zoom
    this.offsetX = Math.max(canvasW / 2 - limitPx + canvasW / 4, Math.min(canvasW / 2 + limitPx - canvasW / 4, this.offsetX))
    this.offsetY = Math.max(canvasH / 2 - limitPx + canvasH / 4, Math.min(canvasH / 2 + limitPx - canvasH / 4, this.offsetY))
  }

  /** Return zoom as a human-readable percentage string e.g. "75%". */
  getZoomPercent() {
    return `${Math.round(this.zoom * 100)}%`
  }
}
