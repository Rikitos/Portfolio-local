// Main controller for the room designer canvas.
// Owns all mutable state (rooms, polygons, furniture, selection, drag, history) and
// coordinates the rendering pipeline, event handling, and sub-system classes.
//
// Coordinate systems:
//   World (cm)  — logical design space; origin at canvas centre on load.
//   Screen (px) — canvas pixel space; viewport.worldToScreen / screenToWorld converts.
//
// Data model:
//   rooms[]     — Room:    { x, y, width, height } in world cm (rectangular)
//   polygons[]  — Polygon: { points:[{x,y},...] } in world cm (freeform)
//   furniture[] — Rect:    { id, x, y, width, height }
//               — Polygon: { id, points:[{x,y},...], x, y, width, height }
//                 (polygon furniture keeps x/y/width/height as bbox for icon centering)
//
// History stack entries: { action:'place'|'move'|'resize', type, item, from? }
//   `item` is the live object reference — undo uses indexOf, so array mutations
//   (deletions, reorders) do not corrupt earlier entries.
class Designer {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx    = this.canvas.getContext('2d');

    this.viewport = new Viewport();
    this.grid     = new Grid();

    // ── Scene data ───────────────────────────────────────────────────────────
    this.rooms         = [];
    this.polygons      = [];
    this.furniture     = [];
    this.roomsRenderer     = new RoomsRenderer();
    this.furnitureRenderer = new FurnitureRenderer();

    // ── Pan state ────────────────────────────────────────────────────────────
    this.isPanning  = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // ── Drawing mode ─────────────────────────────────────────────────────────
    // 'pan' (default) | 'freeform' (click-to-place polygon vertices)
    this.mode           = 'pan';
    this.freeformPoints = []; // vertices placed so far in the current freeform polygon
    this.cursorWorld    = null; // snapped cursor position for the freeform dashed preview

    // ── Selection ────────────────────────────────────────────────────────────
    // { type: 'room'|'polygon'|'furniture', index } or null
    this.selected = null;

    // ── Drag-to-move (shape body drag) ───────────────────────────────────────
    // dragCandidate: mousedown on selected shape — promoted to isDragging on first move
    // wasDragging:   set on any drag; prevents the mouseup click from deselecting
    this.isDragging     = false;
    this.dragCandidate  = false;
    this.wasDragging    = false;
    this.dragStartWorld = null; // world position where drag began
    this.dragOriginal   = null; // snapshot of item position/points at drag start

    // ── Vertex drag (room/polygon corner editing) ─────────────────────────────
    this.isDraggingVertex = false;
    this.dragVertexIndex  = null;
    this.hoverVertex      = null; // vertex index under cursor (drives handle highlight)

    // ── Edge drag (room/polygon wall editing) ─────────────────────────────────
    this.isDraggingEdge   = false;
    this.dragEdgeIndex    = null;
    this.dragEdgeOriginal = null; // [{x,y},{x,y}] original positions of the two endpoints
    this.hoverEdge        = null; // edge index under cursor (drives midpoint handle highlight)

    // ── Drag hint ────────────────────────────────────────────────────────────
    // Fading "drag to move" label shown briefly after a new selection
    this.hintStartTime = null;
    this.HINT_DURATION = 2000; // ms before the hint fully fades out

    // ── Undo history ─────────────────────────────────────────────────────────
    this.history = [];


    // ── Furniture corner resize ───────────────────────────────────────────────
    // Only available for rectangular furniture; polygon furniture has a fixed shape
    this.isDraggingFurnitureCorner = false;
    this.dragCornerIndex           = null; // 0=TL 1=TR 2=BR 3=BL
    this.dragCornerOriginal        = null; // { x, y, width, height } snapshot at drag start
    this.hoverCorner               = null; // corner index under cursor

    // ── Furniture drag from sidebar ───────────────────────────────────────────
    // While true, mousemove is handled by the closure inside _startFurnitureDrag
    this.isDraggingFromSidebar = false;
    this.dragFurnitureDef      = null; // catalogue entry being dragged
    this.dragFurnitureWorld    = null; // { x, y } snapped drop position, null = off-canvas

    this.catalogue = new FurnitureCatalogue(document.querySelector('.designer__sidebar'));
    // Wire sidebar drag so dropping onto the canvas places the item
    this.catalogue.onDragStart = (def, e) => this._startFurnitureDrag(def, e);
    // Wire sidebar card click to open the size-and-place config panel
    this.catalogue.onCardClick = (def) => this._openFurnitureConfig(def);
    // Inject panels at the top of the sidebar after catalogue renders
    // (catalogue clears innerHTML on render so this must happen after)
    this._injectConfigPanel();
    this.storage = new DesignerStorage();
    this._injectSavePanel();
    this._injectWelcomeOverlay();

    this.resizeCanvas();
    this.viewport.zoom = 0.3; // default zoom — 5×4m room visible on load
    this.centerOrigin();
    this.bindEvents();
    this.render();
    this.updateZoomInput();
    window.__designer = this; // dev reference — makes instance inspectable from console

    // Load the admin default layout once everything is ready
    this._loadDefault();

    // Pre-select Sofa in the config panel so the sidebar is ready to place on load
    const sofaDef = FURNITURE_CATALOGUE.find(f => f.id === 'sofa');
    if (sofaDef) this._openFurnitureConfig(sofaDef);
  }

  resizeCanvas() {
    const workspace = document.querySelector('.designer__workspace');
    this.canvas.width  = workspace.clientWidth;
    this.canvas.height = workspace.clientHeight;
  }

  centerOrigin() {
    this.viewport.offsetX = this.canvas.width  / 2;
    this.viewport.offsetY = this.canvas.height / 2;
  }

  // ── Mode ──────────────────────────────────────────────────────────────────

  setMode(mode) {
    this.mode = mode;
    if (mode === 'freeform') {
      this.canvas.style.cursor = 'crosshair';
      document.getElementById('mode-freeform').classList.add('designer__toolbar__btn--active');
    } else {
      this.freeformPoints = [];
      this.cursorWorld    = null;
      this.canvas.style.cursor = 'grab';
      document.getElementById('mode-freeform').classList.remove('designer__toolbar__btn--active');
    }
    this.syncUndoButton();
    this.render();
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  setSelected(sel) {
    const changed = sel?.type !== this.selected?.type || sel?.index !== this.selected?.index;
    this.selected    = sel;
    this.hoverVertex = null;
    this.hoverEdge   = null;
    document.getElementById('ctrl-delete').disabled   = sel === null;
    document.getElementById('ctrl-duplicate').disabled = sel === null;
    if (sel && changed) this.showDragHint();
    this.updateNudgeControls();
    this._updateRotateControls();
    this._updateLabelToggle();
    this._updateFlipButton();
    this.render();
  }

  // Creates the info panel DOM and prepends it to the sidebar.
  // Called once after FurnitureCatalogue renders (which wipes sidebar.innerHTML).
  // Creates the click-to-configure panel and prepends it to the sidebar.
  // Must run after FurnitureCatalogue renders because catalogue does sidebar.innerHTML = ''.
  _injectConfigPanel() {
    const panel = document.createElement('div');
    panel.id        = 'furniture-config';
    panel.className = 'designer__sidebar__config';
    panel.hidden    = false;
    panel.innerHTML = `
      <div class="designer__sidebar__config-header">
        <span class="designer__sidebar__config-name" id="config-name"></span>
        <button class="designer__sidebar__config-close" id="config-close" title="Close">✕</button>
      </div>
      <div class="designer__sidebar__config-fields">
        <label class="designer__sidebar__config-label">
          <span>W</span>
          <input class="designer__sidebar__config-input" id="config-width" type="number" step="0.1" min="0.3" max="20">
          <span>m</span>
        </label>
        <span class="designer__sidebar__config-sep">×</span>
        <label class="designer__sidebar__config-label">
          <span>H</span>
          <input class="designer__sidebar__config-input" id="config-height" type="number" step="0.1" min="0.3" max="20">
          <span>m</span>
        </label>
      </div>
      <button class="designer__sidebar__config-place" id="config-place">Place on canvas</button>
    `;
    document.querySelector('.designer__sidebar').prepend(panel);
    document.getElementById('config-close').addEventListener('click', () => { panel.hidden = true; });
    document.getElementById('config-place').addEventListener('click', () => { this._placeAtCenter(); });
  }

  // Opens the config panel for the clicked catalogue item, pre-filling W/H from its defaults.
  _openFurnitureConfig(def) {
    this._configDef = def;
    document.getElementById('config-name').textContent = def.name;
    document.getElementById('config-width').value      = parseFloat((def.defaultWidth  / 100).toFixed(2));
    document.getElementById('config-height').value     = parseFloat((def.defaultHeight / 100).toFixed(2));
    document.getElementById('furniture-config').hidden = false;
  }

  // Shows/hides and updates the rotation popup next to the Rotate canvas-controls button.
  // Also keeps the button's enabled state in sync with whether furniture is selected.
  _updateRotateControls() {
    const isFurniture = this.selected?.type === 'furniture';
    const btn         = document.getElementById('ctrl-rotate');
    const popup       = document.getElementById('rotate-popup');
    btn.disabled = !isFurniture;
    if (isFurniture) {
      const rot = this.furniture[this.selected.index].rotation || 0;
      document.getElementById('rot-val').textContent = `${rot}°`;
    } else {
      // Close popup when furniture is deselected
      popup.hidden = true;
    }
  }

  // Returns the live data object for the currently selected item (room, polygon, or furniture),
  // or null when nothing is selected. Used by the label toggle to read/write hideLabel.
  _getSelectedItem() {
    if (!this.selected) return null;
    if (this.selected.type === 'furniture') return this.furniture[this.selected.index];
    if (this.selected.type === 'room')      return this.rooms[this.selected.index];
    if (this.selected.type === 'polygon')   return this.polygons[this.selected.index];
    return null;
  }

  // Syncs the Labels toggle button state with the selected item's hideLabel flag.
  // Button is disabled when nothing is selected; active (gold) when labels are hidden.
  _updateLabelToggle() {
    const btn  = document.getElementById('ctrl-labels');
    const item = this._getSelectedItem();
    btn.disabled = item === null;
    btn.classList.toggle('designer__canvas-controls__btn--active', !!item?.hideLabel);
  }

  // Duplicates the selected item (room, polygon, or furniture), offset 20cm down-right.
  duplicateSelected() {
    if (!this.selected) return;
    const OFFSET = 20;
    if (this.selected.type === 'furniture') {
      const src = this.furniture[this.selected.index];
      const copy = JSON.parse(JSON.stringify(src));
      copy.x += OFFSET; copy.y += OFFSET;
      this.furniture.push(copy);
      this.setSelected({ type: 'furniture', index: this.furniture.length - 1 });
    } else if (this.selected.type === 'room') {
      const src = this.rooms[this.selected.index];
      const copy = JSON.parse(JSON.stringify(src));
      copy.x += OFFSET; copy.y += OFFSET;
      this.rooms.push(copy);
      this.setSelected({ type: 'room', index: this.rooms.length - 1 });
    } else if (this.selected.type === 'polygon') {
      const src = this.polygons[this.selected.index];
      const copy = JSON.parse(JSON.stringify(src));
      copy.points = copy.points.map(p => ({ x: p.x + OFFSET, y: p.y + OFFSET }));
      this.polygons.push(copy);
      this.setSelected({ type: 'polygon', index: this.polygons.length - 1 });
    }
    this.render();
  }

  // Flips the selected furniture item horizontally (mirrors its visual and collision shape).
  flipSelected() {
    if (this.selected?.type !== 'furniture') return;
    const f = this.furniture[this.selected.index];
    f.flipX = !f.flipX;
    document.getElementById('ctrl-flip').classList.toggle('designer__canvas-controls__btn--active', !!f.flipX);
    this.render();
  }

  // Keeps the Flip button enabled/active state in sync with the selected item.
  _updateFlipButton() {
    const btn         = document.getElementById('ctrl-flip');
    const isFurniture = this.selected?.type === 'furniture';
    btn.disabled = !isFurniture;
    const f = isFurniture ? this.furniture[this.selected.index] : null;
    btn.classList.toggle('designer__canvas-controls__btn--active', !!f?.flipX);
  }

  // Places the configured furniture item at the current canvas centre.
  // For polygon furniture, points are scaled to match the entered W/H.
  _placeAtCenter() {
    const def = this._configDef;
    if (!def) return;

    const wCm = Math.round(parseFloat(document.getElementById('config-width').value)  * 100);
    const hCm = Math.round(parseFloat(document.getElementById('config-height').value) * 100);
    if (!wCm || !hCm) return;

    const cx = Math.round((this.viewport.screenToWorld(this.canvas.width  / 2, 0).x) / 10) * 10;
    const cy = Math.round((this.viewport.screenToWorld(0, this.canvas.height / 2).y) / 10) * 10;
    const ox = cx - Math.round(wCm / 2 / 10) * 10;
    const oy = cy - Math.round(hCm / 2 / 10) * 10;

    let f;
    if (def.shape === 'polygon') {
      const scaleX = wCm / def.defaultWidth;
      const scaleY = hCm / def.defaultHeight;
      f = {
        id: def.id, name: def.name, shape: def.shape, noCollide: def.noCollide, rotation: 0,
        points: def.defaultPoints.map(p => ({ x: ox + p.x * scaleX, y: oy + p.y * scaleY })),
        x: ox, y: oy, width: wCm, height: hCm,
      };
    } else {
      f = { id: def.id, name: def.name, shape: def.shape, noCollide: def.noCollide, rotation: 0, x: ox, y: oy, width: wCm, height: hCm };
    }

    this.furniture.push(f);
    this.history.push({ action: 'place', type: 'furniture', item: f });
    this.syncUndoButton();
    this.setSelected({ type: 'furniture', index: this.furniture.length - 1 });
    document.getElementById('furniture-config').hidden = true;
  }

  // ── Vertex / edge helpers ─────────────────────────────────────────────────

  _getSelectedVertices() {
    if (!this.selected) return [];
    if (this.selected.type === 'room')
      return this.roomsRenderer._roomVertices(this.rooms[this.selected.index]);
    return this.polygons[this.selected.index].points;
  }

  // Convert selected Room to a Polygon so corners can move independently
  _convertRoomToPolygon() {
    if (!this.selected || this.selected.type !== 'room') return;
    const r = this.rooms[this.selected.index];
    this.rooms.splice(this.selected.index, 1);
    this.polygons.push(new Polygon([
      { x: r.x,          y: r.y },
      { x: r.x + r.width, y: r.y },
      { x: r.x + r.width, y: r.y + r.height },
      { x: r.x,          y: r.y + r.height },
    ]));
    this.selected = { type: 'polygon', index: this.polygons.length - 1 };
  }

  // Returns vertex index if (sx,sy) is within hit radius, else null
  _hitTestVertexScreen(sx, sy) {
    if (!this.selected || this.selected.type === 'furniture') return null;
    const R     = this.roomsRenderer.VERTEX_HIT_RADIUS;
    const verts = this._getSelectedVertices();
    for (let i = verts.length - 1; i >= 0; i--) {
      const s = this.viewport.worldToScreen(verts[i].x, verts[i].y);
      if (Math.hypot(sx - s.x, sy - s.y) <= R) return i;
    }
    return null;
  }

  // Returns edge index if (sx,sy) is within edge-midpoint hit radius, else null
  _hitTestEdgeScreen(sx, sy) {
    if (!this.selected || this.selected.type === 'furniture') return null;
    const R     = this.roomsRenderer.EDGE_HIT_RADIUS;
    const verts = this._getSelectedVertices();
    const n     = verts.length;
    for (let i = 0; i < n; i++) {
      const a  = this.viewport.worldToScreen(verts[i].x, verts[i].y);
      const b  = this.viewport.worldToScreen(verts[(i + 1) % n].x, verts[(i + 1) % n].y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      if (Math.hypot(sx - mx, sy - my) <= R) return i;
    }
    return null;
  }

  _vertexCursor(vertexIndex) {
    if (this.selected?.type !== 'room') return 'crosshair';
    return (vertexIndex === 0 || vertexIndex === 2) ? 'nwse-resize' : 'nesw-resize';
  }

  _applyVertexDrag(vi, worldPos) {
    // Auto-convert room → polygon so corners move independently
    if (this.selected.type === 'room') this._convertRoomToPolygon();
    const snapped = this.snapToGrid(worldPos.x, worldPos.y);
    this.polygons[this.selected.index].points[vi] = snapped;
  }

  _startEdgeDrag(edgeIndex, worldPos) {
    // Auto-convert room → polygon
    if (this.selected.type === 'room') this._convertRoomToPolygon();
    const pts = this.polygons[this.selected.index].points;
    const n   = pts.length;
    this.dragEdgeIndex    = edgeIndex;
    this.dragStartWorld   = worldPos;
    this.dragEdgeOriginal = [
      { ...pts[edgeIndex] },
      { ...pts[(edgeIndex + 1) % n] },
    ];
  }

  _applyEdgeDrag(worldPos) {
    const snap = this.grid.MINOR_CM;
    const sdx  = Math.round((worldPos.x - this.dragStartWorld.x) / snap) * snap;
    const sdy  = Math.round((worldPos.y - this.dragStartWorld.y) / snap) * snap;
    const pts  = this.polygons[this.selected.index].points;
    const n    = pts.length;
    pts[this.dragEdgeIndex]           = { x: this.dragEdgeOriginal[0].x + sdx, y: this.dragEdgeOriginal[0].y + sdy };
    pts[(this.dragEdgeIndex + 1) % n] = { x: this.dragEdgeOriginal[1].x + sdx, y: this.dragEdgeOriginal[1].y + sdy };
  }

  // ── Shape hit testing ─────────────────────────────────────────────────────

  _hitTestRoom(room, wx, wy) {
    return wx >= room.x && wx <= room.x + room.width &&
           wy >= room.y && wy <= room.y + room.height;
  }

  // Ray-casting point-in-polygon test (even-odd rule).
  // Casts a horizontal ray from (wx, wy) to +∞ and counts edge crossings.
  // An odd count means the point is inside the polygon.
  _hitTestPolygon(points, wx, wy) {
    let inside = false;
    const n = points.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;
      if (((yi > wy) !== (yj > wy)) && (wx < (xj - xi) * (wy - yi) / (yj - yi) + xi))
        inside = !inside;
    }
    return inside;
  }

  // Returns true if (wx, wy) is within `tol` world-cm of any polygon edge.
  // Uses the closest-point-on-segment formula so clicking anywhere along a wall works,
  // not just near vertices. Clamping t to [0,1] prevents extending segments beyond endpoints.
  _hitTestPolygonEdge(points, wx, wy, tol) {
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const a = points[i], b = points[(i + 1) % n];
      const dx = b.x - a.x, dy = b.y - a.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;
      const t = Math.max(0, Math.min(1, ((wx - a.x) * dx + (wy - a.y) * dy) / lenSq));
      if (Math.hypot(wx - (a.x + t * dx), wy - (a.y + t * dy)) <= tol) return true;
    }
    return false;
  }

  // Rotates a world point (wx, wy) by -angleDeg around centre (cx, cy).
  // Used to transform the cursor into item-local space for hit testing rotated furniture.
  _unrotatePoint(wx, wy, cx, cy, angleDeg) {
    const rad = -angleDeg * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const dx = wx - cx, dy = wy - cy;
    return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
  }

  // Rotates an array of points around furniture item's bbox centre.
  _applyRotation(pts, f) {
    if (!f.rotation) return pts;
    const cx = f.x + f.width / 2, cy = f.y + f.height / 2;
    const rad = f.rotation * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    return pts.map(p => {
      const dx = p.x - cx, dy = p.y - cy;
      return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
    });
  }

  // Splits a concave polygon into two convex sub-polygons by finding the one concave
  // vertex and cutting diagonally across to the opposite side.
  // Works for L-shapes (6 points) — the only concave furniture shape we have.
  // Returns [pts] unchanged if the polygon is already convex (no concave vertex found).
  _decomposePolygon(pts) {
    const n = pts.length;
    if (n <= 4) return [pts];
    // Cross product of edges meeting at each vertex: minority sign = concave vertex
    const crosses = pts.map((b, i) => {
      const a = pts[(i - 1 + n) % n], c = pts[(i + 1) % n];
      return (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    });
    const pos = crosses.filter(x => x > 0).length;
    const concaveSign = pos < n / 2 ? 1 : -1; // minority sign marks the concave vertex
    const ci = crosses.findIndex(x => Math.sign(x) === concaveSign);
    if (ci === -1) return [pts];
    // For a 6-point L-shape: cut from concave vertex (ci) to opposite vertex (ci+3),
    // yielding two 4-point convex quads.
    const half = Math.floor(n / 2);
    const poly1 = Array.from({ length: half + 1 }, (_, k) => pts[(ci + k) % n]);
    const poly2 = Array.from({ length: half + 1 }, (_, k) => pts[(ci + half + k) % n]);
    return [poly1, poly2];
  }

  // Returns an array of convex sub-polygons (with rotation and flip applied) for collision testing.
  // Rect items return one 4-point polygon; L-shaped polygon items return two quads.
  _getItemSubPolygons(f) {
    let pts = f.points
      ? f.points
      : [
          { x: f.x,           y: f.y           },
          { x: f.x + f.width, y: f.y           },
          { x: f.x + f.width, y: f.y + f.height },
          { x: f.x,           y: f.y + f.height },
        ];
    // Mirror polygon points around the bbox centre x when flipX is set.
    // Reversing preserves winding order so the concave-vertex finder still works.
    if (f.flipX && f.points) {
      const cx = f.x + f.width / 2;
      pts = [...pts].reverse().map(p => ({ x: 2 * cx - p.x, y: p.y }));
    }
    return this._decomposePolygon(pts).map(poly => this._applyRotation(poly, f));
  }

  // SAT (Separating Axis Theorem) overlap test between two convex polygons.
  // Projects both polygons onto each edge-normal of both shapes.
  // A single gap on any axis means no collision; if all axes overlap, shapes intersect.
  _satOverlap(a, b) {
    for (const poly of [a, b]) {
      const n = poly.length;
      for (let i = 0; i < n; i++) {
        const p = poly[i], q = poly[(i + 1) % n];
        // Outward-facing edge normal (not normalised — projection ratio is the same)
        const nx = -(q.y - p.y), ny = q.x - p.x;
        let minA = Infinity, maxA = -Infinity;
        let minB = Infinity, maxB = -Infinity;
        for (const v of a) { const d = v.x * nx + v.y * ny; if (d < minA) minA = d; if (d > maxA) maxA = d; }
        for (const v of b) { const d = v.x * nx + v.y * ny; if (d < minB) minB = d; if (d > maxB) maxB = d; }
        if (maxA <= minB || maxB <= minA) return false; // separating axis found (touching edges are not a collision)
      }
    }
    return true; // no separating axis — polygons overlap
  }

  // Returns a Set of furniture indices whose shapes overlap at least one other item.
  // L-shaped items are decomposed into 2 convex quads before SAT so concave shapes
  // don't produce false positives when another item sits in the empty corner.
  // Door items are always skipped — they live in walls and intentionally overlap.
  _findCollisions() {
    const colliding  = new Set();
    const subPolys   = this.furniture.map(f => this._getItemSubPolygons(f));
    for (let i = 0; i < this.furniture.length; i++) {
      if (this.furniture[i].shape === 'door' || this.furniture[i].noCollide) continue;
      for (let j = i + 1; j < this.furniture.length; j++) {
        if (this.furniture[j].shape === 'door' || this.furniture[j].noCollide) continue;
        // Collision if ANY sub-polygon of i overlaps ANY sub-polygon of j
        let hit = false;
        outer: for (const a of subPolys[i]) {
          for (const b of subPolys[j]) {
            if (this._satOverlap(a, b)) { hit = true; break outer; }
          }
        }
        if (hit) { colliding.add(i); colliding.add(j); }
      }
    }
    return colliding;
  }

  // Returns the topmost item at world position (wx, wy), or null.
  // Priority: furniture (topmost layer) → rooms → freeform polygons.
  // Iterates in reverse so the last-placed item (drawn on top) is hit-tested first.
  // tol: edge-click tolerance in world cm, scaled so it stays ~10px regardless of zoom.
  // For rotated furniture the test point is un-rotated into item-local space first.
  hitTest(wx, wy) {
    const tol = 10 / this.viewport.zoom;
    for (let i = this.furniture.length - 1; i >= 0; i--) {
      const f = this.furniture[i];
      let twx = wx, twy = wy;
      if (f.rotation) {
        // Un-rotate cursor into the item's local (axis-aligned) coordinate space
        const cx = f.x + f.width / 2, cy = f.y + f.height / 2;
        ({ x: twx, y: twy } = this._unrotatePoint(wx, wy, cx, cy, f.rotation));
      }
      const hit = f.points
        ? this._hitTestPolygon(f.points, twx, twy)
        : twx >= f.x && twx <= f.x + f.width && twy >= f.y && twy <= f.y + f.height;
      if (hit) return { type: 'furniture', index: i };
    }
    for (let i = this.rooms.length - 1; i >= 0; i--)
      if (this._hitTestRoom(this.rooms[i], wx, wy)) return { type: 'room', index: i };
    for (let i = this.polygons.length - 1; i >= 0; i--)
      // Edge tolerance allows clicking thin freeform walls, not just the filled interior
      if (this._hitTestPolygon(this.polygons[i].points, wx, wy) ||
          this._hitTestPolygonEdge(this.polygons[i].points, wx, wy, tol))
        return { type: 'polygon', index: i };
    return null;
  }

  _isSelectedHit(hit) {
    return hit && this.selected &&
      hit.type === this.selected.type && hit.index === this.selected.index;
  }

  // ── Delete / undo ─────────────────────────────────────────────────────────

  deleteSelected() {
    if (!this.selected) return;
    if      (this.selected.type === 'room')      this.rooms.splice(this.selected.index, 1);
    else if (this.selected.type === 'polygon')   this.polygons.splice(this.selected.index, 1);
    else if (this.selected.type === 'furniture') this.furniture.splice(this.selected.index, 1);
    this.setSelected(null);
  }

  // Undoes the last action in two tiers:
  //   1. If in freeform mode with uncommitted points, pops the last vertex (cheap, reversible).
  //   2. Otherwise pops from the history stack and applies the inverse operation:
  //      'place'  → remove the item from its array (splice by object reference, not index)
  //      'move'   → restore saved x/y (and points array for polygon furniture)
  //      'resize' → Object.assign restores all saved size/position properties at once
  undoLast() {
    if (this.mode === 'freeform' && this.freeformPoints.length > 0) {
      this.freeformPoints.pop();
      this.syncUndoButton();
      this.render();
      return;
    }
    if (this.history.length === 0) return;
    const last = this.history.pop();

    if (last.action === 'place') {
      // Find the item by reference so index-shifting from prior deletes doesn't matter
      if (last.type === 'room') {
        const i = this.rooms.indexOf(last.item);
        if (i !== -1) { this.rooms.splice(i, 1); if (this.selected?.type === 'room') this.selected = null; }
      } else if (last.type === 'furniture') {
        const i = this.furniture.indexOf(last.item);
        if (i !== -1) { this.furniture.splice(i, 1); if (this.selected?.type === 'furniture') this.selected = null; }
      } else if (last.type === 'polygon') {
        const i = this.polygons.indexOf(last.item);
        if (i !== -1) { this.polygons.splice(i, 1); if (this.selected?.type === 'polygon') this.selected = null; }
      }
    } else if (last.action === 'move') {
      if (last.type === 'room') { last.item.x = last.from.x; last.item.y = last.from.y; }
      if (last.type === 'furniture') {
        // Polygon furniture also needs its points array restored (moving translates all points)
        if (last.from.points) {
          last.item.points = last.from.points;
          last.item.x = last.from.x; last.item.y = last.from.y;
        } else {
          last.item.x = last.from.x; last.item.y = last.from.y;
        }
      }
    } else if (last.action === 'resize') {
      // from: { x, y, width, height } — restores all four in one call
      Object.assign(last.item, last.from);
    } else if (last.action === 'rotate') {
      last.item.rotation = last.from.rotation;
    }

    document.getElementById('ctrl-delete').disabled = this.selected === null;
    this.updateNudgeControls();
    this.syncUndoButton();
    this.render();
  }

  // Rotates the selected furniture item by `delta` degrees (positive = clockwise).
  // R = +15°, Shift+R = −15°. Resize handles are hidden while rotation != 0.
  rotateSelected(delta) {
    if (!this.selected || this.selected.type !== 'furniture') return;
    const f = this.furniture[this.selected.index];
    const oldRot = f.rotation || 0;
    const newRot = ((oldRot + delta) % 360 + 360) % 360;
    this.history.push({ action: 'rotate', type: 'furniture', item: f, from: { rotation: oldRot } });
    f.rotation = newRot;
    this.syncUndoButton();
    this._updateRotateControls();
    // Keep popup value live while it's open
    const popup = document.getElementById('rotate-popup');
    if (popup && !popup.hidden) document.getElementById('rot-val').textContent = `${newRot}°`;
    this.render();
  }

  syncUndoButton() {
    const canUndo = (this.mode === 'freeform' && this.freeformPoints.length > 0)
                  || this.history.length > 0;
    document.getElementById('ctrl-undo-point').disabled = !canUndo;
  }

  // ── Nudge ─────────────────────────────────────────────────────────────────

  nudgeSelected(dx, dy) {
    if (!this.selected) return;
    const snap = this.grid.MINOR_CM;
    if (this.selected.type === 'room') {
      const r = this.rooms[this.selected.index];
      const from = { x: r.x, y: r.y };
      r.x += dx * snap; r.y += dy * snap;
      this.history.push({ action: 'move', type: 'room', item: r, from });
    } else if (this.selected.type === 'polygon') {
      const poly = this.polygons[this.selected.index];
      poly.points = poly.points.map(p => ({ x: p.x + dx * snap, y: p.y + dy * snap }));
    } else if (this.selected.type === 'furniture') {
      const f = this.furniture[this.selected.index];
      if (f.points) {
        const from = { points: f.points.map(p => ({ ...p })), x: f.x, y: f.y };
        f.points = f.points.map(p => ({ x: p.x + dx * snap, y: p.y + dy * snap }));
        f.x += dx * snap; f.y += dy * snap;
        this.history.push({ action: 'move', type: 'furniture', item: f, from });
      } else {
        const from = { x: f.x, y: f.y };
        f.x += dx * snap; f.y += dy * snap;
        this.history.push({ action: 'move', type: 'furniture', item: f, from });
      }
    }
    this.syncUndoButton();
    this.updateNudgeControls();
    this.render();
  }

  // ── Drag-to-move ──────────────────────────────────────────────────────────

  // Snapshots the selected item's position (and points, if polygon) at drag-start.
  // All delta calculations in _applyDrag are relative to this snapshot, not the live item,
  // so snapping accumulates correctly and the item doesn't drift on repeated small moves.
  _startDrag(worldPos) {
    this.dragStartWorld = worldPos;
    if (this.selected.type === 'room') {
      const r = this.rooms[this.selected.index];
      this.dragOriginal = { x: r.x, y: r.y };
    } else if (this.selected.type === 'polygon') {
      this.dragOriginal = this.polygons[this.selected.index].points.map(p => ({ ...p }));
    } else if (this.selected.type === 'furniture') {
      const f = this.furniture[this.selected.index];
      // Polygon furniture: snapshot points array AND bbox origin so both move together
      this.dragOriginal = f.points
        ? { points: f.points.map(p => ({ ...p })), x: f.x, y: f.y }
        : { x: f.x, y: f.y };
    }
  }

  _applyDrag(worldPos) {
    const snap  = this.grid.MINOR_CM;
    const rawDx = worldPos.x - this.dragStartWorld.x;
    const rawDy = worldPos.y - this.dragStartWorld.y;
    if (this.selected.type === 'room') {
      const r = this.rooms[this.selected.index];
      r.x = Math.round((this.dragOriginal.x + rawDx) / snap) * snap;
      r.y = Math.round((this.dragOriginal.y + rawDy) / snap) * snap;
    } else if (this.selected.type === 'polygon') {
      const sdx = Math.round(rawDx / snap) * snap;
      const sdy = Math.round(rawDy / snap) * snap;
      this.polygons[this.selected.index].points =
        this.dragOriginal.map(p => ({ x: p.x + sdx, y: p.y + sdy }));
    } else if (this.selected.type === 'furniture') {
      const f   = this.furniture[this.selected.index];
      const sdx = Math.round(rawDx / snap) * snap;
      const sdy = Math.round(rawDy / snap) * snap;
      if (f.points) {
        f.points = this.dragOriginal.points.map(p => ({ x: p.x + sdx, y: p.y + sdy }));
        f.x = this.dragOriginal.x + sdx; f.y = this.dragOriginal.y + sdy;
      } else {
        f.x = Math.round((this.dragOriginal.x + rawDx) / snap) * snap;
        f.y = Math.round((this.dragOriginal.y + rawDy) / snap) * snap;
      }
    }
  }

  // ── Drag hint ─────────────────────────────────────────────────────────────

  showDragHint() {
    this.hintStartTime = Date.now();
    const fade = () => {
      if (!this.hintStartTime) return;
      if (Date.now() - this.hintStartTime < this.HINT_DURATION) {
        this.render(); requestAnimationFrame(fade);
      } else {
        this.hintStartTime = null; this.render();
      }
    };
    requestAnimationFrame(fade);
  }

  _drawDragHint(ctx) {
    if (!this.hintStartTime || !this.selected) return;
    const opacity = Math.max(0, 1 - (Date.now() - this.hintStartTime) / this.HINT_DURATION);
    if (opacity <= 0) return;
    const bbox = this._getSelectionScreenBBox();
    if (!bbox) return;
    ctx.save();
    ctx.globalAlpha  = opacity;
    ctx.font         = '16px "Palatino Linotype", Palatino, serif';
    ctx.fillStyle    = 'rgba(201, 168, 76, 0.95)';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('drag to move', (bbox.x1 + bbox.x2) / 2, bbox.y1 + 38);
    ctx.restore();
  }

  // ── Nudge overlay positioning ─────────────────────────────────────────────

  _getSelectionScreenBBox() {
    if (!this.selected) return null;
    if (this.selected.type === 'room') {
      const r  = this.rooms[this.selected.index];
      const tl = this.viewport.worldToScreen(r.x, r.y);
      const br = this.viewport.worldToScreen(r.x + r.width, r.y + r.height);
      return { x1: tl.x, y1: tl.y, x2: br.x, y2: br.y };
    }
    if (this.selected.type === 'furniture') {
      const f = this.furniture[this.selected.index];
      if (f.points) {
        const pts = f.points.map(p => this.viewport.worldToScreen(p.x, p.y));
        return {
          x1: Math.min(...pts.map(p => p.x)), y1: Math.min(...pts.map(p => p.y)),
          x2: Math.max(...pts.map(p => p.x)), y2: Math.max(...pts.map(p => p.y)),
        };
      }
      const tl = this.viewport.worldToScreen(f.x, f.y);
      const br = this.viewport.worldToScreen(f.x + f.width, f.y + f.height);
      return { x1: tl.x, y1: tl.y, x2: br.x, y2: br.y };
    }
    const pts = this.polygons[this.selected.index].points
      .map(p => this.viewport.worldToScreen(p.x, p.y));
    return {
      x1: Math.min(...pts.map(p => p.x)), y1: Math.min(...pts.map(p => p.y)),
      x2: Math.max(...pts.map(p => p.x)), y2: Math.max(...pts.map(p => p.y)),
    };
  }

  updateNudgeControls() {
    const panel = document.getElementById('nudge-controls');
    const bbox  = this._getSelectionScreenBBox();
    if (!bbox) { panel.classList.add('designer__nudge--hidden'); return; }
    panel.classList.remove('designer__nudge--hidden');
    const cx = (bbox.x1 + bbox.x2) / 2, cy = (bbox.y1 + bbox.y2) / 2;
    const GAP = 8, BTN = 20;
    const set = (id, l, t) => {
      document.getElementById(id).style.left = `${Math.round(l)}px`;
      document.getElementById(id).style.top  = `${Math.round(t)}px`;
    };
    set('nudge-up',    cx - BTN/2, bbox.y1 - GAP - BTN);
    set('nudge-down',  cx - BTN/2, bbox.y2 + GAP);
    set('nudge-left',  bbox.x1 - GAP - BTN, cy - BTN/2);
    set('nudge-right', bbox.x2 + GAP,       cy - BTN/2);
  }

  // ── Zoom / pan ────────────────────────────────────────────────────────────

  snapToGrid(worldX, worldY) {
    const snap = this.grid.MINOR_CM;
    return { x: Math.round(worldX / snap) * snap, y: Math.round(worldY / snap) * snap };
  }

  panBy(dx, dy) {
    this.viewport.pan(dx, dy);
    this.viewport.clampOffset(this.canvas.width, this.canvas.height);
    this.render();
  }

  stepZoom(direction) {
    const pct  = Math.round(this.viewport.zoom * 100);
    const step = (direction > 0 ? pct >= 100 : pct > 100) ? 25 : 10;
    const base = direction > 0 ? Math.floor(pct / step) * step : Math.ceil(pct / step) * step;
    this.viewport.setZoom((base + direction * step) / 100, this.canvas.width / 2, this.canvas.height / 2);
    this.viewport.clampOffset(this.canvas.width, this.canvas.height);
    this.updateZoomInput();
    this.render();
  }

  applyInputZoom(raw) {
    const pct = parseFloat(raw.replace('%', ''));
    if (isNaN(pct) || pct <= 0) { this.updateZoomInput(); return; }
    this.viewport.setZoom(pct / 100, this.canvas.width / 2, this.canvas.height / 2);
    this.viewport.clampOffset(this.canvas.width, this.canvas.height);
    this.updateZoomInput();
    this.render();
  }

  // ── Welcome overlay ───────────────────────────────────────────────────────

  // Injects a semi-transparent overlay over the canvas on first load.
  // Any click dismisses it; clicking "Clear canvas" also clears the scene first.
  _injectWelcomeOverlay() {
    const overlay = document.createElement('div');
    overlay.id        = 'welcome-overlay';
    overlay.className = 'designer__welcome';
    overlay.innerHTML = `
      <div class="designer__welcome__inner">
        <h2 class="designer__welcome__title">Design Your Own Household</h2>
        <p class="designer__welcome__sub">Explore the example layout below, or start with a blank canvas</p>
        <div class="designer__welcome__actions">
          <button class="designer__welcome__btn designer__welcome__btn--clear" id="welcome-clear">Clear &amp; Start Fresh</button>
          <button class="designer__welcome__btn designer__welcome__btn--use" id="welcome-use">Explore Layout</button>
        </div>
      </div>
    `;
    document.querySelector('.designer__workspace').appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'welcome-clear') this.clearCanvas();
      overlay.hidden = true;
    });
  }

  // ── Save / Load ───────────────────────────────────────────────────────────

  // Returns a serialisable snapshot of the current scene.
  getLayout() {
    return this.storage.pack(this.rooms, this.polygons, this.furniture);
  }

  // Replaces the scene with the given layout object, resets selection and history.
  loadLayout(layout) {
    this.rooms     = layout.rooms     ?? [];
    this.polygons  = layout.polygons  ?? [];
    this.furniture = layout.furniture ?? [];
    this.selected  = null;
    this.history   = [];
    this.syncUndoButton();
    this._updateRotateControls();
    this._updateFlipButton();
    this._updateLabelToggle();
    this.render();
  }

  // Empties all scene data — used by "Design Your Own" clear action.
  clearCanvas() {
    this.loadLayout({ rooms: [], polygons: [], furniture: [] });
  }

  // Fetches the admin default layout on first load.
  async _loadDefault() {
    const layout = await this.storage.fetchDefault('default-layout.json?v=2');
    if (layout) this.loadLayout(layout);
  }

  // Creates the save/load panel and prepends it above the config panel.
  _injectSavePanel() {
    const panel = document.createElement('div');
    panel.id        = 'save-panel';
    panel.className = 'designer__sidebar__saves';
    panel.innerHTML = `
      <span class="designer__sidebar__saves-title">Layouts</span>
      <div class="designer__sidebar__saves-slots">
        <button class="designer__sidebar__saves-slot" id="slot-default" title="Load the default example layout">Default</button>
        <button class="designer__sidebar__saves-slot" id="slot-a" title="Load Slot A"></button>
        <button class="designer__sidebar__saves-slot" id="slot-b" title="Load Slot B"></button>
      </div>
      <div class="designer__sidebar__saves-row">
        <button class="designer__sidebar__saves-btn" id="save-a" title="Overwrite Slot A with the current layout">Save → A</button>
        <button class="designer__sidebar__saves-btn" id="save-b" title="Overwrite Slot B with the current layout">Save → B</button>
      </div>
      <div class="designer__sidebar__saves-row">
        <button class="designer__sidebar__saves-btn" id="save-export" title="Download layout as a JSON file">Export</button>
        <button class="designer__sidebar__saves-btn" id="save-import" title="Load a previously exported JSON file">Import</button>
      </div>
      <button class="designer__sidebar__saves-btn designer__sidebar__saves-btn--clear" id="save-clear" title="Clear everything and start fresh">Clear canvas</button>
    `;
    // Prepend so it sits above the config panel
    document.querySelector('.designer__sidebar').prepend(panel);
    this._updateSavePanel();

    document.getElementById('slot-default').addEventListener('click', () => this._loadDefault());
    document.getElementById('slot-a').addEventListener('click', () => {
      const layout = this.storage.load('a');
      if (layout) this.loadLayout(layout);
    });
    document.getElementById('slot-b').addEventListener('click', () => {
      const layout = this.storage.load('b');
      if (layout) this.loadLayout(layout);
    });
    document.getElementById('save-a').addEventListener('click', () => {
      this.storage.save('a', this.getLayout());
      this._updateSavePanel();
    });
    document.getElementById('save-b').addEventListener('click', () => {
      this.storage.save('b', this.getLayout());
      this._updateSavePanel();
    });
    document.getElementById('save-export').addEventListener('click', () => {
      this.storage.exportJSON(this.getLayout());
    });
    document.getElementById('save-import').addEventListener('click', () => {
      this.storage.importJSON((layout) => {
        this.loadLayout(layout);
        this._updateSavePanel();
      });
    });
    document.getElementById('save-clear').addEventListener('click', () => {
      if (confirm('Clear the canvas? This cannot be undone.')) this.clearCanvas();
    });
  }

  // Refreshes slot button labels to show whether each slot has saved data.
  _updateSavePanel() {
    const labelA = this.storage.hasSave('a') ? 'Slot A ●' : 'Slot A';
    const labelB = this.storage.hasSave('b') ? 'Slot B ●' : 'Slot B';
    document.getElementById('slot-a').textContent = labelA;
    document.getElementById('slot-b').textContent = labelB;
    document.getElementById('slot-a').disabled = !this.storage.hasSave('a');
    document.getElementById('slot-b').disabled = !this.storage.hasSave('b');
  }

  // ── Events ────────────────────────────────────────────────────────────────

  bindEvents() {
    window.addEventListener('resize', () => { this.resizeCanvas(); this.render(); });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      this.viewport.zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY);
      this.viewport.clampOffset(this.canvas.width, this.canvas.height);
      this.updateZoomInput();
      this.render();
    }, { passive: false });

    // Mouse down — priority: vertex > edge > shape drag > pan
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.mode === 'freeform') return;
      this.wasDragging = false;

      const rect = this.canvas.getBoundingClientRect();
      const sx   = e.clientX - rect.left;
      const sy   = e.clientY - rect.top;

      // 1a. Furniture corner resize
      const ci = this._hitTestFurnitureCorner(sx, sy);
      if (ci !== null) {
        const f = this.furniture[this.selected.index];
        this.dragCornerOriginal        = { x: f.x, y: f.y, width: f.width, height: f.height };
        this.isDraggingFurnitureCorner = true;
        this.dragCornerIndex           = ci;
        this.wasDragging               = true;
        this.canvas.style.cursor       = this._cornerCursor(ci);
        return;
      }

      // 1b. Vertex drag
      const vi = this._hitTestVertexScreen(sx, sy);
      if (vi !== null) {
        this.isDraggingVertex = true;
        this.dragVertexIndex  = vi;
        this.wasDragging      = true;
        this.canvas.style.cursor = this._vertexCursor(vi);
        return;
      }

      // 2. Edge drag
      const ei = this._hitTestEdgeScreen(sx, sy);
      if (ei !== null) {
        const world = this.viewport.screenToWorld(sx, sy);
        this._startEdgeDrag(ei, world);
        this.isDraggingEdge = true;
        this.wasDragging    = true;
        this.canvas.style.cursor = 'move';
        return;
      }

      const world = this.viewport.screenToWorld(sx, sy);
      const hit   = this.hitTest(world.x, world.y);

      // 3. Shape drag
      if (this._isSelectedHit(hit)) {
        this.dragCandidate  = true;
        this.isDragging     = false;
        this._startDrag(world);
        return;
      }

      // 4. Pan
      this.dragCandidate = false;
      this.isPanning     = true;
      this.lastMouseX    = e.clientX;
      this.lastMouseY    = e.clientY;
      this.canvas.style.cursor = 'grabbing';
    });

    // Mouse move
    window.addEventListener('mousemove', (e) => {
      if (this.isDraggingFromSidebar) return;
      if (this.mode === 'freeform') {
        const rect = this.canvas.getBoundingClientRect();
        const w    = this.viewport.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
        this.cursorWorld = this.snapToGrid(w.x, w.y);
        this.render();
        return;
      }

      const rect = this.canvas.getBoundingClientRect();
      const sx   = e.clientX - rect.left;
      const sy   = e.clientY - rect.top;

      if (this.isDraggingFurnitureCorner) {
        const world   = this.viewport.screenToWorld(sx, sy);
        const snapped = this.snapToGrid(world.x, world.y);
        this._applyFurnitureCornerResize(this.dragCornerIndex, snapped);
        this.updateNudgeControls();
        this.render();
        return;
      }

      if (this.isDraggingVertex) {
        const world = this.viewport.screenToWorld(sx, sy);
        this._applyVertexDrag(this.dragVertexIndex, world);
        this.updateNudgeControls();
        this.render();
        return;
      }

      if (this.isDraggingEdge) {
        const world = this.viewport.screenToWorld(sx, sy);
        this._applyEdgeDrag(world);
        this.updateNudgeControls();
        this.render();
        return;
      }

      if (this.dragCandidate) {
        if (!this.isDragging) {
          this.isDragging  = true;
          this.wasDragging = true;
          this.canvas.style.cursor = 'move';
        }
        const world = this.viewport.screenToWorld(sx, sy);
        this._applyDrag(world);
        this.updateNudgeControls();
        this.render();
        return;
      }

      if (this.isPanning) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.viewport.pan(dx, dy);
        this.viewport.clampOffset(this.canvas.width, this.canvas.height);
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.render();
        return;
      }

      // Hover — update hoverCorner, hoverVertex, hoverEdge, cursor
      const ci = this._hitTestFurnitureCorner(sx, sy);
      const vi = ci === null ? this._hitTestVertexScreen(sx, sy) : null;
      const ei = ci === null && vi === null ? this._hitTestEdgeScreen(sx, sy) : null;
      if (ci !== this.hoverCorner || vi !== this.hoverVertex || ei !== this.hoverEdge) {
        this.hoverCorner = ci;
        this.hoverVertex = vi;
        this.hoverEdge   = ei;
        this.render();
      }
      if (ci !== null) {
        this.canvas.style.cursor = this._cornerCursor(ci);
      } else if (vi !== null) {
        this.canvas.style.cursor = this._vertexCursor(vi);
      } else if (ei !== null) {
        this.canvas.style.cursor = 'move';
      } else if (this.selected) {
        const world = this.viewport.screenToWorld(sx, sy);
        this.canvas.style.cursor = this._isSelectedHit(this.hitTest(world.x, world.y)) ? 'move' : 'grab';
      } else {
        this.canvas.style.cursor = 'grab';
      }
    });

    // Mouse up — record move/resize history BEFORE clearing drag state, then reset everything
    window.addEventListener('mouseup', () => {
      // Only push to history if the item actually moved (avoids polluting history with no-op drags)
      if (this.isDragging && this.selected && this.dragOriginal) {
        if (this.selected.type === 'room') {
          const r = this.rooms[this.selected.index];
          if (r && (r.x !== this.dragOriginal.x || r.y !== this.dragOriginal.y)) {
            this.history.push({ action: 'move', type: 'room', item: r, from: { ...this.dragOriginal } });
            this.syncUndoButton();
          }
        } else if (this.selected.type === 'furniture') {
          const f = this.furniture[this.selected.index];
          if (f && (f.x !== this.dragOriginal.x || f.y !== this.dragOriginal.y)) {
            this.history.push({ action: 'move', type: 'furniture', item: f, from: { ...this.dragOriginal } });
            this.syncUndoButton();
          }
        }
      }
      if (this.isDraggingFurnitureCorner && this.selected?.type === 'furniture' && this.dragCornerOriginal) {
        const f = this.furniture[this.selected.index];
        const o = this.dragCornerOriginal;
        if (f && (f.x !== o.x || f.y !== o.y || f.width !== o.width || f.height !== o.height)) {
          this.history.push({ action: 'resize', type: 'furniture', item: f, from: { ...o } });
          this.syncUndoButton();
        }
      }

      this.isDraggingVertex          = false;
      this.dragVertexIndex           = null;
      this.isDraggingEdge            = false;
      this.dragEdgeIndex             = null;
      this.dragEdgeOriginal          = null;
      this.isDraggingFurnitureCorner = false;
      this.dragCornerIndex           = null;
      this.dragCornerOriginal        = null;
      this.isDragging                = false;
      this.dragCandidate             = false;
      this.isPanning                 = false;
      if (this.mode === 'pan') this.canvas.style.cursor = 'grab';
    });

    // Click
    this.canvas.addEventListener('click', (e) => {
      if (this.mode === 'pan') {
        if (this.wasDragging) return;
        const rect  = this.canvas.getBoundingClientRect();
        const world = this.viewport.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
        this.setSelected(this.hitTest(world.x, world.y));
        return;
      }
      if (this.mode !== 'freeform') return;

      const rect    = this.canvas.getBoundingClientRect();
      const world   = this.viewport.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const snapped = this.snapToGrid(world.x, world.y);

      // If 3+ points placed and click is within CLOSE_RADIUS px of the first point → close polygon
      if (this.freeformPoints.length >= 3) {
        const first = this.freeformPoints[0];
        const fs    = this.viewport.worldToScreen(first.x, first.y);
        if (Math.hypot(e.clientX - rect.left - fs.x, e.clientY - rect.top - fs.y) <= this.roomsRenderer.CLOSE_RADIUS) {
          const p = new Polygon([...this.freeformPoints]);
          this.polygons.push(p);
          this.history.push({ action: 'place', type: 'polygon', item: p });
          this.freeformPoints = [];
          this.cursorWorld    = null;
          this.syncUndoButton();
          this.render();
          return;
        }
      }
      this.freeformPoints.push(snapped);
      this.syncUndoButton();
      this.render();
    });

    this.canvas.addEventListener('dblclick', () => {
      if (this.mode !== 'freeform' || this.freeformPoints.length < 3) return;
      const p = new Polygon([...this.freeformPoints]);
      this.polygons.push(p);
      this.history.push({ action: 'place', type: 'polygon', item: p });
      this.freeformPoints = [];
      this.cursorWorld    = null;
      this.syncUndoButton();
      this.render();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mode === 'freeform') {
        this.freeformPoints = [];
        this.cursorWorld    = null;
        this.syncUndoButton();
        this.render();
      }
      if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); this.undoLast(); return; }

      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        if (e.shiftKey && this.selected) {
          const dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
          const dy = e.key === 'ArrowUp'   ? -1 : e.key === 'ArrowDown'  ? 1 : 0;
          this.nudgeSelected(dx, dy);
        } else {
          const step = Math.round(this.canvas.width * 0.12);
          const dx = e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0;
          const dy = e.key === 'ArrowUp'   ? step : e.key === 'ArrowDown'  ? -step : 0;
          this.panBy(dx, dy);
        }
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') this.deleteSelected();
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); this.rotateSelected(e.shiftKey ? -15 : 15); }
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); this.flipSelected(); }
      if (e.key === 'd' || e.key === 'D') { e.preventDefault(); this.duplicateSelected(); }
    });

    ['nav-up','nav-down','nav-left','nav-right'].forEach(id => {
      document.getElementById(id).addEventListener('click', () => {
        const btn  = document.getElementById(id);
        const step = Math.round(this.canvas.width * 0.12);
        this.panBy(parseInt(btn.dataset.dx) * step, parseInt(btn.dataset.dy) * step);
      });
    });

    document.getElementById('nudge-up').addEventListener('click',    () => this.nudgeSelected( 0, -1));
    document.getElementById('nudge-down').addEventListener('click',  () => this.nudgeSelected( 0,  1));
    document.getElementById('nudge-left').addEventListener('click',  () => this.nudgeSelected(-1,  0));
    document.getElementById('nudge-right').addEventListener('click', () => this.nudgeSelected( 1,  0));

    document.getElementById('ctrl-undo-point').addEventListener('click', () => this.undoLast());
    document.getElementById('ctrl-delete').addEventListener('click', () => this.deleteSelected());

    // Rotate button toggles the popup; popup buttons call rotateSelected
    const rotateBtn = document.getElementById('ctrl-rotate');
    const rotatePopup = document.getElementById('rotate-popup');
    rotateBtn.addEventListener('click', () => {
      if (this.selected?.type !== 'furniture') return;
      rotatePopup.hidden = !rotatePopup.hidden;
    });
    document.getElementById('rot-left').addEventListener('click',  () => this.rotateSelected(-15));
    document.getElementById('rot-right').addEventListener('click', () => this.rotateSelected(15));
    // Close popup when clicking anywhere on the canvas
    this.canvas.addEventListener('mousedown', () => { rotatePopup.hidden = true; });

    // Duplicate — copies the selected item offset 20cm down-right
    document.getElementById('ctrl-duplicate').addEventListener('click', () => this.duplicateSelected());

    // Flip — mirrors the selected furniture item horizontally
    document.getElementById('ctrl-flip').addEventListener('click', () => this.flipSelected());

    // Labels toggle — hides/shows the W×H label on the currently selected item only
    document.getElementById('ctrl-labels').addEventListener('click', () => {
      const item = this._getSelectedItem();
      if (!item) return;
      item.hideLabel = !item.hideLabel;
      this._updateLabelToggle();
      this.render();
    });
    const ctrlWrap   = document.getElementById('canvas-controls');
    const ctrlToggle = document.getElementById('ctrl-toggle');
    const ctrlArrow  = document.getElementById('ctrl-arrow');
    ctrlToggle.addEventListener('click', () => {
      const collapsed = ctrlWrap.classList.toggle('designer__canvas-controls--collapsed');
      ctrlArrow.textContent = collapsed ? '›' : '‹';
    });

    document.getElementById('draw-room').addEventListener('click', () => {
      const w = Math.round(parseFloat(document.getElementById('room-width').value)  * 100);
      const h = Math.round(parseFloat(document.getElementById('room-height').value) * 100);
      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;
      const r = new Room(-w / 2, -h / 2, w, h);
      this.rooms.push(r);
      this.history.push({ action: 'place', type: 'room', item: r });
      this.syncUndoButton();
      this.render();
    });

    document.getElementById('mode-freeform').addEventListener('click', () => {
      this.setMode(this.mode === 'freeform' ? 'pan' : 'freeform');
    });

    document.getElementById('zoom-in').addEventListener('click',    () => this.stepZoom(+1));
    document.getElementById('zoom-out').addEventListener('click',   () => this.stepZoom(-1));
    document.getElementById('zoom-reset').addEventListener('click', () => {
      this.viewport.zoom = 1; this.centerOrigin(); this.updateZoomInput(); this.render();
    });

    const zoomInput = document.getElementById('zoom-input');
    zoomInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')       { this.applyInputZoom(zoomInput.value); zoomInput.blur(); }
      else if (e.key === 'Escape') { this.updateZoomInput(); zoomInput.blur(); }
    });
    zoomInput.addEventListener('blur',  () => this.applyInputZoom(zoomInput.value));
    zoomInput.addEventListener('focus', () => zoomInput.select());
  }

  // ── Furniture corner resize ───────────────────────────────────────────────

  _hitTestFurnitureCorner(sx, sy) {
    if (!this.selected || this.selected.type !== 'furniture') return null;
    const f = this.furniture[this.selected.index];
    if (!f || f.points || f.rotation) return null; // no resize handles for polygon or rotated items
    const corners = [
      this.viewport.worldToScreen(f.x,           f.y),
      this.viewport.worldToScreen(f.x + f.width, f.y),
      this.viewport.worldToScreen(f.x + f.width, f.y + f.height),
      this.viewport.worldToScreen(f.x,           f.y + f.height),
    ];
    const R = 9;
    for (let i = corners.length - 1; i >= 0; i--)
      if (Math.hypot(sx - corners[i].x, sy - corners[i].y) <= R) return i;
    return null;
  }

  _cornerCursor(ci) {
    return (ci === 0 || ci === 2) ? 'nwse-resize' : 'nesw-resize';
  }

  // Resizes rectangular furniture by moving corner ci to `snapped` while anchoring the opposite corner.
  // ci: 0=TL, 1=TR, 2=BR, 3=BL (matches the corner array in _hitTestFurnitureCorner).
  // Uses dragCornerOriginal (snapshot from mousedown) so the opposite corner never drifts.
  // MIN=30cm prevents collapsing the item to zero/negative size.
  _applyFurnitureCornerResize(ci, snapped) {
    const f   = this.furniture[this.selected.index];
    const o   = this.dragCornerOriginal;
    const MIN = 30; // minimum side length in cm
    // Compute the fixed edges from the original snapshot, not the live item (avoids drift)
    const right  = o.x + o.width;
    const bottom = o.y + o.height;
    if (ci === 0) {        // TL moves → BR anchor: right and bottom stay fixed
      f.x = Math.min(snapped.x, right  - MIN); f.width  = right  - f.x;
      f.y = Math.min(snapped.y, bottom - MIN); f.height = bottom - f.y;
    } else if (ci === 1) { // TR moves → BL anchor: left (o.x) and bottom stay fixed
      f.x = o.x; f.width  = Math.max(snapped.x - o.x, MIN);
      f.y = Math.min(snapped.y, bottom - MIN); f.height = bottom - f.y;
    } else if (ci === 2) { // BR moves → TL anchor: left (o.x) and top (o.y) stay fixed
      f.x = o.x; f.y = o.y;
      f.width  = Math.max(snapped.x - o.x, MIN);
      f.height = Math.max(snapped.y - o.y, MIN);
    } else {               // BL moves → TR anchor: right and top (o.y) stay fixed
      f.x = Math.min(snapped.x, right - MIN); f.width = right - f.x;
      f.y = o.y; f.height = Math.max(snapped.y - o.y, MIN);
    }
  }

  // ── Furniture drag from sidebar ───────────────────────────────────────────

  // Handles the full drag-from-sidebar → drop-on-canvas flow.
  // A ghost <div> (fixed-position SVG icon) follows the cursor visually.
  // While the cursor is over the canvas, dragFurnitureWorld holds the snapped
  // top-left drop position so render() can draw a preview.  Off-canvas = null (no preview).
  // On mouseup: if over the canvas, the item is placed and pushed to history.
  // The item's top-left is offset so the cursor lands on the item's centre.
  _startFurnitureDrag(def, startEvent) {
    this.isDraggingFromSidebar = true;
    this.dragFurnitureDef      = def;
    this.dragFurnitureWorld    = null;

    // Ghost follows the cursor as visual feedback outside the canvas
    const ghost = document.createElement('div');
    ghost.className = 'designer__furniture-ghost';
    ghost.innerHTML = def.icon;
    ghost.style.left = startEvent.clientX + 'px';
    ghost.style.top  = startEvent.clientY + 'px';
    document.body.appendChild(ghost);

    const canvasRect = this.canvas.getBoundingClientRect();

    const onMove = (e) => {
      ghost.style.left = e.clientX + 'px';
      ghost.style.top  = e.clientY + 'px';

      const sx = e.clientX - canvasRect.left;
      const sy = e.clientY - canvasRect.top;
      if (sx >= 0 && sy >= 0 && sx <= canvasRect.width && sy <= canvasRect.height) {
        const world = this.viewport.screenToWorld(sx, sy);
        const snap  = this.grid.MINOR_CM;
        // Subtract half the bounding box so the cursor points to the item's centre, not TL
        this.dragFurnitureWorld = {
          x: Math.round((world.x - def.defaultWidth  / 2) / snap) * snap,
          y: Math.round((world.y - def.defaultHeight / 2) / snap) * snap,
        };
      } else {
        this.dragFurnitureWorld = null; // hides the canvas preview when off-canvas
      }
      this.render();
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      ghost.remove();

      if (this.dragFurnitureWorld) {
        const ox = this.dragFurnitureWorld.x;
        const oy = this.dragFurnitureWorld.y;
        let f;
        if (def.shape === 'polygon') {
          // defaultPoints are bbox-relative cm — translate to absolute world coords
          f = {
            id:     def.id,
            name:   def.name,
            shape:  def.shape,
            noCollide: def.noCollide,
            points: def.defaultPoints.map(p => ({ x: ox + p.x, y: oy + p.y })),
            x:      ox, y: oy,
            width:  def.defaultWidth, height: def.defaultHeight,
          };
        } else {
          f = { id: def.id, name: def.name, shape: def.shape, noCollide: def.noCollide, x: ox, y: oy, width: def.defaultWidth, height: def.defaultHeight };
        }
        this.furniture.push(f);
        this.history.push({ action: 'place', type: 'furniture', item: f });
        this.syncUndoButton();
      }

      this.isDraggingFromSidebar = false;
      this.dragFurnitureDef      = null;
      this.dragFurnitureWorld    = null;
      this.render();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  updateZoomInput() {
    document.getElementById('zoom-input').value = this.viewport.getZoomPercent();
  }

  // Full canvas redraw — called every time any state changes.
  // Draw order (back to front):
  //   grid → rooms/polygons → furniture → sidebar-drag preview → furniture handles
  //   → room/polygon vertex/edge handles → freeform drawing preview → drag hint overlay
  // updateNudgeControls is called here so the arrow buttons always track the selection.
  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0E1F38';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.grid.draw(ctx, this.viewport, canvas.width, canvas.height);
    this.roomsRenderer.draw(ctx, this.viewport, this.rooms, this.polygons, this.selected);
    this.furnitureRenderer.draw(ctx, this.viewport, this.furniture, this.selected, this._findCollisions());
    // Preview ghost — only shown when the cursor is over the canvas while dragging from sidebar
    if (this.isDraggingFromSidebar && this.dragFurnitureWorld)
      this.furnitureRenderer.drawPreview(ctx, this.viewport, this.dragFurnitureDef, this.dragFurnitureWorld.x, this.dragFurnitureWorld.y);
    this.furnitureRenderer.drawHandles(ctx, this.viewport, this.furniture, this.selected, this.hoverCorner);
    this.furnitureRenderer.drawRotationLabel(ctx, this.viewport, this.furniture, this.selected);
    this.roomsRenderer.drawVertexHandles(
      ctx, this.viewport, this.rooms, this.polygons,
      this.selected, this.hoverVertex, this.hoverEdge
    );

    if (this.mode === 'freeform')
      this.roomsRenderer.drawFreeformPreview(ctx, this.viewport, this.freeformPoints, this.cursorWorld);

    this._drawDragHint(ctx);
    this.updateNudgeControls();
  }
}

new Designer();
