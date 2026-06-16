class Designer {
  constructor() {
    // Core canvas elements
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');

    // Viewport manages zoom and pan state
    this.viewport = new Viewport();

    // Grid handles drawing the background grid
    this.grid = new Grid();

    // Tracks whether the user is currently dragging to pan
    this.isPanning = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.resizeCanvas();
    this.centerOrigin(); // place (0,0) in the middle of the screen on load
    this.bindEvents();
    this.render();
  }

  // Makes the canvas fill the workspace div exactly
  // Called on init and whenever the browser window resizes
  resizeCanvas() {
    const workspace = document.querySelector('.designer__workspace');
    this.canvas.width = workspace.clientWidth;
    this.canvas.height = workspace.clientHeight;
  }

  // Positions the world origin (0,0) at the center of the canvas
  // So the grid starts centered rather than from the top-left corner
  centerOrigin() {
    this.viewport.offsetX = this.canvas.width / 2;
    this.viewport.offsetY = this.canvas.height / 2;
  }

  // Steps zoom by a fixed amount — +25pp zooming in, -10pp zooming out
  // Snaps to the step grid first so repeated clicks land on clean numbers
  // direction: +1 to zoom in, -1 to zoom out
  stepZoom(direction) {
    const currentPct = Math.round(this.viewport.zoom * 100);
    const step = (direction > 0 ? currentPct >= 100 : currentPct > 100) ? 25 : 10;
    const snapped = direction > 0
      ? Math.floor(currentPct / step) * step
      : Math.ceil(currentPct / step) * step;
    const newPct  = snapped + direction * step;
    const newZoom = newPct / 100;
    this.viewport.setZoom(newZoom, this.canvas.width / 2, this.canvas.height / 2);
    this.viewport.clampOffset(this.canvas.width, this.canvas.height);
    this.updateZoomInput();
    this.render();
  }

  // Applies a zoom value from the input field (e.g. "150" or "150%")
  applyInputZoom(raw) {
    const pct = parseFloat(raw.replace('%', ''));
    if (isNaN(pct) || pct <= 0) {
      this.updateZoomInput(); // revert to current value
      return;
    }
    this.viewport.setZoom(pct / 100, this.canvas.width / 2, this.canvas.height / 2);
    this.viewport.clampOffset(this.canvas.width, this.canvas.height);
    this.updateZoomInput();
    this.render();
  }

  bindEvents() {
    // Resize canvas when browser window changes size
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.render();
    });

    // Mouse wheel — zoom in/out centered on the cursor position (smooth, multiplicative)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault(); // stops the page from scrolling
      const rect = this.canvas.getBoundingClientRect();
      this.viewport.zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY);
      this.viewport.clampOffset(this.canvas.width, this.canvas.height);
      this.updateZoomInput();
      this.render();
    }, { passive: false }); // passive:false required to allow preventDefault on wheel

    // Mouse down — start panning
    this.canvas.addEventListener('mousedown', (e) => {
      this.isPanning = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.canvas.style.cursor = 'grabbing';
    });

    // Mouse move — pan the viewport if dragging
    // Listening on window so pan continues even if cursor leaves the canvas
    window.addEventListener('mousemove', (e) => {
      if (!this.isPanning) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.viewport.pan(dx, dy);
      this.viewport.clampOffset(this.canvas.width, this.canvas.height);
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.render();
    });

    // Mouse up — stop panning (also on window so it always fires)
    window.addEventListener('mouseup', () => {
      this.isPanning = false;
      this.canvas.style.cursor = 'grab';
    });

    // Toolbar: zoom in by +25 percentage points
    document.getElementById('zoom-in').addEventListener('click', () => {
      this.stepZoom(+1);
    });

    // Toolbar: zoom out by -25 percentage points
    document.getElementById('zoom-out').addEventListener('click', () => {
      this.stepZoom(-1);
    });

    // Toolbar: reset zoom to 100% and re-center the origin
    document.getElementById('zoom-reset').addEventListener('click', () => {
      this.viewport.zoom = 1;
      this.centerOrigin();
      this.updateZoomInput();
      this.render();
    });

    // Zoom input — apply on Enter, revert on Escape
    const zoomInput = document.getElementById('zoom-input');
    zoomInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.applyInputZoom(zoomInput.value);
        zoomInput.blur();
      } else if (e.key === 'Escape') {
        this.updateZoomInput(); // revert to current
        zoomInput.blur();
      }
    });
    // Also apply on blur (clicking away)
    zoomInput.addEventListener('blur', () => {
      this.applyInputZoom(zoomInput.value);
    });
    // Select all text when focused so it's easy to type a new value
    zoomInput.addEventListener('focus', () => {
      zoomInput.select();
    });
  }

  // Syncs the zoom input field with the current viewport zoom percentage
  updateZoomInput() {
    document.getElementById('zoom-input').value = this.viewport.getZoomPercent();
  }

  // Main render function — clears the canvas and redraws everything
  // Called whenever zoom, pan, or any state changes
  render() {
    const { ctx, canvas } = this;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill background — $navy-canvas (#0E1F38), distinct from the header and toolbar
    ctx.fillStyle = '#0E1F38';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the grid (gridlines, labels, origin crosshair, world boundary)
    this.grid.draw(ctx, this.viewport, canvas.width, canvas.height);
  }
}

new Designer();
