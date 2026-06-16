// Draws room outlines (rectangular and freeform polygon) onto the canvas.
// Also renders the in-progress freeform preview, vertex/edge handles for editing,
// and dimension labels. All coordinates are world cm; viewport converts to screen px.
// selected: { type: 'room'|'polygon', index } or null — drives highlight rendering.
class RoomsRenderer {
  constructor() {
    // Visual constants — centralised so tweaks don't require hunting through draw calls
    this.WALL_COLOR      = 'rgba(200, 218, 232, 0.85)';
    this.LABEL_COLOR     = 'rgba(201, 168, 76, 0.9)';
    this.LABEL_FONT      = '12px "Palatino Linotype", Palatino, serif';
    // px distance from wall line where dimension labels sit
    this.LABEL_OFFSET    = 18;
    this.WALL_WIDTH      = 2;
    // Freeform drawing: dot radius on placed vertices
    this.DOT_RADIUS      = 4;
    // px radius within which cursor snaps to the first point to close a polygon
    this.CLOSE_RADIUS    = 12;
    // Edit-mode handle sizes — visual vs hit radii kept separate so handles are
    // easy to click without looking oversized at typical zoom levels
    this.VERTEX_RADIUS     = 5;  // corner handle visual radius px
    this.VERTEX_HIT_RADIUS = 9;  // corner handle hit radius px
    this.EDGE_RADIUS       = 3;  // edge midpoint visual radius px
    this.EDGE_HIT_RADIUS   = 7;  // edge midpoint hit radius px
  }

  // Draws all completed rectangular rooms and freeform polygons.
  // selected: { type: 'room'|'polygon', index } or null
  draw(ctx, viewport, rooms, polygons, selected) {
    for (let i = 0; i < rooms.length; i++) {
      const isSelected = selected?.type === 'room' && selected.index === i;
      this._drawRect(ctx, viewport, rooms[i], isSelected);
      this._drawRectLabels(ctx, viewport, rooms[i]);
    }
    for (let i = 0; i < polygons.length; i++) {
      const isSelected = selected?.type === 'polygon' && selected.index === i;
      this._drawPolygon(ctx, viewport, polygons[i].points, true, isSelected);
      this._drawPolygonLabels(ctx, viewport, polygons[i].points);
    }
  }

  // Draws the live freeform-drawing state: committed segments, dashed look-ahead to cursor,
  // and dot handles on each placed point with a close-ring on the first point once closable.
  drawFreeformPreview(ctx, viewport, points, cursorWorld) {
    if (points.length === 0) return;

    const screenPts = points.map(p => viewport.worldToScreen(p.x, p.y));
    const cursorScreen = cursorWorld ? viewport.worldToScreen(cursorWorld.x, cursorWorld.y) : null;

    // Placed segments so far (open path, not yet closed)
    this._drawPolygon(ctx, viewport, points, false);

    // Dashed preview line from last placed point to the current cursor position
    if (cursorScreen) {
      const last = screenPts[screenPts.length - 1];
      ctx.save();
      ctx.strokeStyle = this.WALL_COLOR;
      ctx.lineWidth = this.WALL_WIDTH;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(cursorScreen.x, cursorScreen.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Dot handles at each placed point
    for (let i = 0; i < screenPts.length; i++) {
      const pt = screenPts[i];
      const isFirst = i === 0;
      const canClose = points.length >= 3;

      // Highlight first point when cursor is close enough to snap-close
      const nearFirst = isFirst && cursorScreen && canClose &&
        Math.hypot(cursorScreen.x - pt.x, cursorScreen.y - pt.y) <= this.CLOSE_RADIUS;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, nearFirst ? this.DOT_RADIUS + 3 : this.DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = nearFirst ? 'rgba(201, 168, 76, 0.9)' : this.WALL_COLOR;
      ctx.fill();

      // Draw close-ring on first point once 3+ points placed, but only when not yet snapping
      if (isFirst && canClose && !nearFirst) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, this.CLOSE_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(201, 168, 76, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // Draws vertex circles and edge-midpoint circles for the selected room or polygon.
  // Edge midpoints are drawn first so vertex circles always appear on top of them.
  // hoverVertex: vertex index under cursor, or null
  // hoverEdge:   edge index under cursor, or null
  drawVertexHandles(ctx, viewport, rooms, polygons, selected, hoverVertex, hoverEdge) {
    if (!selected) return;
    // Normalise rooms (4 derived corners) and freeform polygons (stored points) to the same array
    const verts = selected.type === 'room'
      ? this._roomVertices(rooms[selected.index])
      : polygons[selected.index].points;
    const n = verts.length;

    // Edge midpoint circles — drawn first so vertex circles render on top
    for (let i = 0; i < n; i++) {
      const a   = viewport.worldToScreen(verts[i].x, verts[i].y);
      const b   = viewport.worldToScreen(verts[(i + 1) % n].x, verts[(i + 1) % n].y);
      const mx  = (a.x + b.x) / 2;
      const my  = (a.y + b.y) / 2;
      const hot = i === hoverEdge;
      const r   = hot ? this.EDGE_RADIUS + 2 : this.EDGE_RADIUS;

      ctx.beginPath();
      ctx.arc(mx, my, r, 0, Math.PI * 2);
      ctx.fillStyle   = hot ? 'rgba(201, 168, 76, 0.9)' : 'rgba(201, 168, 76, 0.4)';
      ctx.strokeStyle = hot ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth   = 1;
      ctx.fill();
      ctx.stroke();
    }

    // Corner vertex circles
    for (let i = 0; i < n; i++) {
      const s   = viewport.worldToScreen(verts[i].x, verts[i].y);
      const hot = i === hoverVertex;
      // Hovered vertex gets a larger, fully-opaque circle for clear affordance
      const r   = hot ? this.VERTEX_RADIUS + 3 : this.VERTEX_RADIUS;

      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fillStyle   = hot ? 'rgba(201, 168, 76, 1)'   : 'rgba(201, 168, 76, 0.75)';
      ctx.strokeStyle = hot ? 'rgba(255,255,255,0.6)'   : 'rgba(255,255,255,0.3)';
      ctx.lineWidth   = 1.5;
      ctx.fill();
      ctx.stroke();
    }
  }

  // Derives the 4 corner vertices of a rectangular room in TL→TR→BR→BL order
  // so it can be passed to the same handle-drawing logic used for freeform polygons
  _roomVertices(r) {
    return [
      { x: r.x,           y: r.y },
      { x: r.x + r.width, y: r.y },
      { x: r.x + r.width, y: r.y + r.height },
      { x: r.x,           y: r.y + r.height },
    ];
  }

  // --- private ---

  // Draws a rectangular room wall outline, plus a gold selection ring when selected
  _drawRect(ctx, viewport, room, isSelected) {
    const { x1, y1, x2, y2 } = this._rectToScreen(viewport, room.x, room.y, room.width, room.height);
    ctx.strokeStyle = this.WALL_COLOR;
    ctx.lineWidth   = this.WALL_WIDTH;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    // Selection ring sits outside the wall line so the wall itself stays visible
    if (isSelected) {
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.75)';
      ctx.lineWidth   = 2;
      const pad = 4;
      ctx.strokeRect(x1 - pad, y1 - pad, x2 - x1 + pad * 2, y2 - y1 + pad * 2);
    }
  }

  // Draws width labels on top/bottom walls and height labels on left/right walls (rotated)
  _drawRectLabels(ctx, viewport, room) {
    const o = this._rectToScreen(viewport, room.x, room.y, room.width, room.height);
    const d = this.LABEL_OFFSET;
    ctx.fillStyle    = this.LABEL_COLOR;
    ctx.font         = this.LABEL_FONT;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // Top and bottom width labels
    ctx.fillText(this._mLabel(room.width),  (o.x1 + o.x2) / 2, o.y1 + d);
    ctx.fillText(this._mLabel(room.width),  (o.x1 + o.x2) / 2, o.y2 - d);

    // Left height label — rotate canvas so text reads bottom-to-top
    ctx.save();
    ctx.translate(o.x1 + d, (o.y1 + o.y2) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(this._mLabel(room.height), 0, 0);
    ctx.restore();

    // Right height label — rotate canvas so text reads top-to-bottom
    ctx.save();
    ctx.translate(o.x2 - d, (o.y1 + o.y2) / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(this._mLabel(room.height), 0, 0);
    ctx.restore();
  }

  // Draws a polygon wall outline; closed when `close` is true.
  // When selected, a wider gold stroke is drawn first as a highlight underlay.
  _drawPolygon(ctx, viewport, points, close, isSelected) {
    if (points.length < 2) return;
    const pts = points.map(p => viewport.worldToScreen(p.x, p.y));

    // Selection underlay drawn before the wall line so it sits beneath it visually
    if (isSelected) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      if (close) ctx.closePath();
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.75)';
      ctx.lineWidth   = 6;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    if (close) ctx.closePath();
    ctx.strokeStyle = this.WALL_COLOR;
    ctx.lineWidth   = this.WALL_WIDTH;
    ctx.stroke();
  }

  // Draws a segment-length label centred along each edge of a closed polygon
  _drawPolygonLabels(ctx, viewport, points) {
    const n = points.length;
    ctx.fillStyle    = this.LABEL_COLOR;
    ctx.font         = this.LABEL_FONT;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < n; i++) {
      const a = viewport.worldToScreen(points[i].x, points[i].y);
      const b = viewport.worldToScreen(points[(i + 1) % n].x, points[(i + 1) % n].y);
      // Length is calculated in world cm so it stays accurate at any zoom level
      const lenCm = Math.hypot(points[(i+1)%n].x - points[i].x, points[(i+1)%n].y - points[i].y);
      this._segmentLabel(ctx, a, b, lenCm);
    }
  }

  // Draws a single segment-length label at the edge midpoint, rotated to follow the edge
  _segmentLabel(ctx, a, b, lenCm) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.save();
    ctx.translate(mx, my);
    // Flip text 180° when the segment runs right-to-left so it always reads left-to-right
    const rot = (angle > Math.PI / 2 || angle < -Math.PI / 2) ? angle + Math.PI : angle;
    ctx.rotate(rot);
    ctx.fillText(this._mLabel(lenCm), 0, -this.LABEL_OFFSET / 2);
    ctx.restore();
  }

  // Converts a world-cm rect into four screen-px coordinates for canvas draw calls
  _rectToScreen(viewport, x, y, w, h) {
    const tl = viewport.worldToScreen(x, y);
    const br = viewport.worldToScreen(x + w, y + h);
    return { x1: tl.x, y1: tl.y, x2: br.x, y2: br.y };
  }

  // Converts centimetres to a compact metre string, e.g. 350 → "3.5m", 300 → "3m"
  _mLabel(cm) {
    const m = cm / 100;
    return m % 1 === 0 ? `${m}m` : `${parseFloat(m.toFixed(2))}m`;
  }
}
