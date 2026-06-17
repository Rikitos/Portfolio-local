class Viewport {
  constructor() {
    // Current zoom level — 1 = 100%, 0.5 = 50%, 2 = 200%
    this.zoom = 1;

    // How far the canvas view has been panned in pixels
    // offsetX/Y is where the world origin (0,0) sits on screen
    this.offsetX = 0;
    this.offsetY = 0;

    // How many screen pixels represent 1cm in the real world at zoom=1
    // So at zoom=1: 1cm = 2px, 1m = 200px
    this.PIXELS_PER_CM = 2;

    // Zoom boundaries — can't go below 25% or above 400%
    this.MIN_ZOOM = 0.25;
    this.MAX_ZOOM = 4;

    // World boundary — the usable canvas area extends 50m (5000cm) in each direction from origin
    this.WORLD_LIMIT_CM = 1500;
  }

  // Converts a real-world position (in cm) to a screen pixel position
  // Used when drawing anything onto the canvas
  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.PIXELS_PER_CM * this.zoom + this.offsetX,
      y: worldY * this.PIXELS_PER_CM * this.zoom + this.offsetY,
    };
  }

  // Converts a screen pixel position back to real-world cm coordinates
  // Used when the user clicks or hovers — to know where in the room they are
  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.offsetX) / (this.PIXELS_PER_CM * this.zoom),
      y: (screenY - this.offsetY) / (this.PIXELS_PER_CM * this.zoom),
    };
  }

  // Zooms in or out centered on a specific screen point (e.g. mouse position)
  // delta > 0 means scroll down = zoom out, delta < 0 = zoom in
  // The offset is adjusted so the point under the mouse stays fixed on screen
  zoomAt(screenX, screenY, delta) {
    const factor = delta > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoom * factor));
    this.offsetX = screenX - (screenX - this.offsetX) * (newZoom / this.zoom);
    this.offsetY = screenY - (screenY - this.offsetY) * (newZoom / this.zoom);
    this.zoom = newZoom;
  }

  // Sets zoom to a specific value, centered on a screen point
  // Used by the toolbar zoom buttons (center of canvas as focal point)
  setZoom(zoom, centerX, centerY) {
    const newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, zoom));
    this.offsetX = centerX - (centerX - this.offsetX) * (newZoom / this.zoom);
    this.offsetY = centerY - (centerY - this.offsetY) * (newZoom / this.zoom);
    this.zoom = newZoom;
  }

  // Moves the view by dx/dy pixels — called on every mousemove while panning
  pan(dx, dy) {
    this.offsetX += dx;
    this.offsetY += dy;
  }

  // Clamps offsetX/Y so the user can't pan beyond the 50m world boundary
  // The screen center must stay within ±WORLD_LIMIT_CM of the world origin
  clampOffset(canvasW, canvasH) {
    const limitPx = this.WORLD_LIMIT_CM * this.PIXELS_PER_CM * this.zoom;
    // halving the outer background visible when panned to the extreme
    this.offsetX = Math.max(canvasW / 2 - limitPx + canvasW / 4, Math.min(canvasW / 2 + limitPx - canvasW / 4, this.offsetX));
    this.offsetY = Math.max(canvasH / 2 - limitPx + canvasH / 4, Math.min(canvasH / 2 + limitPx - canvasH / 4, this.offsetY));
  }

  // Returns zoom as a readable percentage string for the toolbar input
  getZoomPercent() {
    return `${Math.round(this.zoom * 100)}%`;
  }
}
