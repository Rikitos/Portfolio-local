class Grid {
  constructor() {
    // Minor gridlines every 10cm — subtle guide lines
    this.MINOR_CM = 10;
    // Major gridlines every 100cm (1m) — bolder, labeled
    this.MAJOR_CM = 100;
  }

  // Main draw method — called every render frame
  // ctx: canvas 2D context to draw on
  // viewport: current zoom/pan state
  // canvasW/H: current canvas dimensions in pixels
  draw(ctx, viewport, canvasW, canvasH) {
    const { zoom, offsetX, offsetY, PIXELS_PER_CM, WORLD_LIMIT_CM } = viewport;

    // How many screen pixels = 1cm at current zoom
    const pxPerCm = PIXELS_PER_CM * zoom;

    // How many pixels between each minor/major gridline at current zoom
    const pxPerMinor = this.MINOR_CM * pxPerCm;
    const pxPerMajor = this.MAJOR_CM * pxPerCm;

    // Find which world coordinates are visible on screen right now
    // so we only draw gridlines in the visible area (performance)
    const worldTopLeft = viewport.screenToWorld(0, 0);
    const worldBottomRight = viewport.screenToWorld(canvasW, canvasH);

    // Clamp iteration range to world boundaries so gridlines stop at the edge
    const limitCm = WORLD_LIMIT_CM;
    const drawLeft   = Math.max(worldTopLeft.x,     -limitCm);
    const drawRight  = Math.min(worldBottomRight.x,  limitCm);
    const drawTop    = Math.max(worldTopLeft.y,     -limitCm);
    const drawBottom = Math.min(worldBottomRight.y,  limitCm);

    ctx.save();

    // --- MINOR GRIDLINES (every 10cm) ---
    // Skip drawing if lines would be closer than 6px apart — too dense to see
    if (pxPerMinor >= 6) {
      ctx.strokeStyle = 'rgba(168, 184, 200, 0.08)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();

      // Snap start position to nearest minor grid unit so lines stay aligned while panning
      const startX = Math.floor(drawLeft / this.MINOR_CM) * this.MINOR_CM;
      const startY = Math.floor(drawTop  / this.MINOR_CM) * this.MINOR_CM;

      // Draw vertical lines across the visible area
      for (let x = startX; x <= drawRight + this.MINOR_CM; x += this.MINOR_CM) {
        // +0.5 keeps lines sharp — without it canvas draws blurry 2px lines on integer coords
        const sx = Math.round(x * pxPerCm + offsetX) + 0.5;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, canvasH);
      }
      // Draw horizontal lines
      for (let y = startY; y <= drawBottom + this.MINOR_CM; y += this.MINOR_CM) {
        const sy = Math.round(y * pxPerCm + offsetY) + 0.5;
        ctx.moveTo(0, sy);
        ctx.lineTo(canvasW, sy);
      }
      ctx.stroke();
    }

    // --- MAJOR GRIDLINES (every 1m) ---
    ctx.strokeStyle = 'rgba(168, 184, 200, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const startMajorX = Math.floor(drawLeft / this.MAJOR_CM) * this.MAJOR_CM;
    const startMajorY = Math.floor(drawTop  / this.MAJOR_CM) * this.MAJOR_CM;

    for (let x = startMajorX; x <= drawRight + this.MAJOR_CM; x += this.MAJOR_CM) {
      const sx = Math.round(x * pxPerCm + offsetX) + 0.5;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, canvasH);
    }
    for (let y = startMajorY; y <= drawBottom + this.MAJOR_CM; y += this.MAJOR_CM) {
      const sy = Math.round(y * pxPerCm + offsetY) + 0.5;
      ctx.moveTo(0, sy);
      ctx.lineTo(canvasW, sy);
    }
    ctx.stroke();

    // --- WORLD BOUNDARY ---
    // Gold rectangle marking the 50m x 50m usable area
    const bTop    = viewport.worldToScreen(-limitCm, -limitCm);
    const bBottom = viewport.worldToScreen( limitCm,  limitCm);
    ctx.strokeStyle = 'rgba(201, 168, 76, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      bTop.x,
      bTop.y,
      bBottom.x - bTop.x,
      bBottom.y - bTop.y
    );

    // --- ORIGIN CROSSHAIR ---
    // Gold lines marking the (0,0) world origin point
    const origin = viewport.worldToScreen(0, 0);
    ctx.strokeStyle = 'rgba(201, 168, 76, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, canvasH);
    ctx.moveTo(0, origin.y);
    ctx.lineTo(canvasW, origin.y);
    ctx.stroke();

    // --- METER LABELS ---
    // Show "1m", "2m" etc at each major gridline along the top and left edges
    ctx.fillStyle = 'rgba(136, 153, 170, 0.7)';
    ctx.font = '11px "Palatino Linotype", Palatino, serif';

    // Labels along the top edge (for vertical gridlines)
    for (let x = startMajorX; x <= drawRight + this.MAJOR_CM; x += this.MAJOR_CM) {
      const sx = x * pxPerCm + offsetX;
      if (sx > 24 && sx < canvasW - 10) {
        ctx.textAlign = 'left';
        ctx.fillText(`${x / 100}m`, sx + 3, 14);
      }
    }

    // Labels along the left edge (for horizontal gridlines)
    for (let y = startMajorY; y <= drawBottom + this.MAJOR_CM; y += this.MAJOR_CM) {
      const sy = y * pxPerCm + offsetY;
      if (sy > 20 && sy < canvasH - 10) {
        ctx.textAlign = 'left';
        ctx.fillText(`${y / 100}m`, 4, sy - 3);
      }
    }

    ctx.restore();
  }
}
