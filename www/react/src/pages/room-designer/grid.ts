/**
 * Grid — draws the background grid on the canvas.
 *
 * Renders three layers (back to front):
 *   1. Minor lines every MINOR_CM (10 cm) — very faint, hidden when zoomed out
 *   2. Major lines every MAJOR_CM (100 cm = 1 m) — subtle, always visible
 *   3. Gold boundary rect (±WORLD_LIMIT_CM) + origin crosshair
 *   4. Metre labels along top and left edges
 *
 * All geometry is clipped to the visible world area to avoid drawing
 * thousands of off-screen lines.
 */
import type { Viewport } from './viewport'

export class Grid {
  readonly MINOR_CM = 10    // 10 cm grid (matches SNAP_CM in Designer)
  readonly MAJOR_CM = 100   // 1 m grid

  draw(ctx: CanvasRenderingContext2D, viewport: Viewport, canvasW: number, canvasH: number, theme: 'dark' | 'light' = 'dark') {
    const dark = theme === 'dark'
    const { zoom, offsetX, offsetY, PIXELS_PER_CM, WORLD_LIMIT_CM } = viewport
    const pxPerCm    = PIXELS_PER_CM * zoom
    const pxPerMinor = this.MINOR_CM * pxPerCm

    // Fill background for light theme (dark theme relies on the page background)
    if (!dark) {
      ctx.fillStyle = '#f5f0e8'
      ctx.fillRect(0, 0, canvasW, canvasH)
    }

    // Compute the world-space rectangle currently visible on screen,
    // clamped to the drawable world boundary so we don't iterate forever.
    const worldTopLeft     = viewport.screenToWorld(0, 0)
    const worldBottomRight = viewport.screenToWorld(canvasW, canvasH)
    const lim = WORLD_LIMIT_CM

    const drawLeft   = Math.max(worldTopLeft.x,     -lim)
    const drawRight  = Math.min(worldBottomRight.x,  lim)
    const drawTop    = Math.max(worldTopLeft.y,     -lim)
    const drawBottom = Math.min(worldBottomRight.y,  lim)

    ctx.save()

    // 1. Minor grid lines — only drawn when they're at least 6 px apart
    //    to avoid a solid smear at low zoom levels.
    if (pxPerMinor >= 6) {
      ctx.strokeStyle = dark ? 'rgba(168, 184, 200, 0.08)' : 'rgba(100, 90, 70, 0.12)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      const startX = Math.floor(drawLeft / this.MINOR_CM) * this.MINOR_CM
      const startY = Math.floor(drawTop  / this.MINOR_CM) * this.MINOR_CM
      for (let x = startX; x <= drawRight + this.MINOR_CM; x += this.MINOR_CM) {
        const sx = Math.round(x * pxPerCm + offsetX) + 0.5   // +0.5 for crisp 1-px lines
        ctx.moveTo(sx, 0); ctx.lineTo(sx, canvasH)
      }
      for (let y = startY; y <= drawBottom + this.MINOR_CM; y += this.MINOR_CM) {
        const sy = Math.round(y * pxPerCm + offsetY) + 0.5
        ctx.moveTo(0, sy); ctx.lineTo(canvasW, sy)
      }
      ctx.stroke()
    }

    // 2. Major grid lines (1 m)
    ctx.strokeStyle = dark ? 'rgba(168, 184, 200, 0.2)' : 'rgba(80, 70, 55, 0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    const startMajorX = Math.floor(drawLeft / this.MAJOR_CM) * this.MAJOR_CM
    const startMajorY = Math.floor(drawTop  / this.MAJOR_CM) * this.MAJOR_CM
    for (let x = startMajorX; x <= drawRight + this.MAJOR_CM; x += this.MAJOR_CM) {
      const sx = Math.round(x * pxPerCm + offsetX) + 0.5
      ctx.moveTo(sx, 0); ctx.lineTo(sx, canvasH)
    }
    for (let y = startMajorY; y <= drawBottom + this.MAJOR_CM; y += this.MAJOR_CM) {
      const sy = Math.round(y * pxPerCm + offsetY) + 0.5
      ctx.moveTo(0, sy); ctx.lineTo(canvasW, sy)
    }
    ctx.stroke()

    // 3a. Gold boundary rect — marks the edge of the drawable canvas
    const bTop    = viewport.worldToScreen(-lim, -lim)
    const bBottom = viewport.worldToScreen( lim,  lim)
    ctx.strokeStyle = dark ? 'rgba(201, 168, 76, 0.35)' : 'rgba(160, 120, 30, 0.4)'
    ctx.lineWidth = 2
    ctx.strokeRect(bTop.x, bTop.y, bBottom.x - bTop.x, bBottom.y - bTop.y)

    // 3b. Origin crosshair
    const origin = viewport.worldToScreen(0, 0)
    ctx.strokeStyle = dark ? 'rgba(201, 168, 76, 0.4)' : 'rgba(160, 120, 30, 0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, canvasH)
    ctx.moveTo(0, origin.y); ctx.lineTo(canvasW, origin.y)
    ctx.stroke()

    // 4. Metre labels — top edge (x axis) and left edge (y axis)
    ctx.fillStyle = dark ? 'rgba(136, 153, 170, 0.7)' : 'rgba(100, 90, 70, 0.65)'
    ctx.font = '11px "Palatino Linotype", Palatino, serif'
    for (let x = startMajorX; x <= drawRight + this.MAJOR_CM; x += this.MAJOR_CM) {
      const sx = x * pxPerCm + offsetX
      if (sx > 24 && sx < canvasW - 10) { ctx.textAlign = 'left'; ctx.fillText(`${x / 100}m`, sx + 3, 14) }
    }
    for (let y = startMajorY; y <= drawBottom + this.MAJOR_CM; y += this.MAJOR_CM) {
      const sy = y * pxPerCm + offsetY
      if (sy > 20 && sy < canvasH - 10) { ctx.textAlign = 'left'; ctx.fillText(`${y / 100}m`, 4, sy - 3) }
    }

    ctx.restore()
  }
}
