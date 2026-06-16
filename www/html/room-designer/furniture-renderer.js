// Draws placed furniture items and the drop-preview ghost onto the canvas.
// Handles both rectangular items { x, y, width, height } and polygon items { points, width, height }.
// Icons are pre-loaded once as HTMLImageElement (SVG data URL with currentColor replaced) so
// ctx.drawImage can stamp them synchronously on every frame without re-encoding.
class FurnitureRenderer {
  constructor() {
    // Fill and stroke colours for furniture bodies
    this.FILL         = 'rgba(88, 114, 137, 0.22)';
    this.STROKE       = 'rgba(200, 218, 232, 0.55)';
    // Gold tint applied to icons and dimension labels
    this.ICON_COLOR   = 'rgba(201, 168, 76, 0.8)';
    this.LABEL_COLOR  = 'rgba(201, 168, 76, 0.85)';
    this.LABEL_FONT   = '11px "Palatino Linotype", Palatino, serif';
    // px distance from the shape edge where the dimension label sits
    this.LABEL_OFFSET = 14;
    // id → HTMLImageElement, populated in _preload
    this.icons = new Map();
    this._preload();
  }

  // Converts each catalogue SVG to a data URL and starts loading it as an <img>
  // so it is ready for ctx.drawImage before the first frame renders
  _preload() {
    for (const def of FURNITURE_CATALOGUE) {
      // Substitute the literal string 'currentColor' with the gold rgba value
      const colored = def.icon.replace(/currentColor/g, this.ICON_COLOR);
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(colored);
      const img = new Image();
      img.src = url;
      this.icons.set(def.id, img);
    }
  }

  // Draws resize-handle circles at the four corners of the selected rectangular item.
  // Polygon furniture has no resize handles, so this is a no-op for those items.
  drawHandles(ctx, viewport, furniture, selected, hoverCorner) {
    if (!selected || selected.type !== 'furniture') return;
    const f = furniture[selected.index];
    if (!f || f.points) return; // polygon furniture has no resize handles
    // Convert all four corners from world cm to screen px
    const corners = [
      viewport.worldToScreen(f.x,           f.y),
      viewport.worldToScreen(f.x + f.width, f.y),
      viewport.worldToScreen(f.x + f.width, f.y + f.height),
      viewport.worldToScreen(f.x,           f.y + f.height),
    ];
    for (let i = 0; i < 4; i++) {
      // Hovered corner gets a slightly larger, fully-opaque circle for affordance
      const hot = i === hoverCorner;
      const r   = hot ? 7 : 5;
      ctx.beginPath();
      ctx.arc(corners[i].x, corners[i].y, r, 0, Math.PI * 2);
      ctx.fillStyle   = hot ? 'rgba(201, 168, 76, 1)'   : 'rgba(201, 168, 76, 0.75)';
      ctx.strokeStyle = hot ? 'rgba(255,255,255,0.6)'   : 'rgba(255,255,255,0.3)';
      ctx.lineWidth   = 1.5;
      ctx.fill();
      ctx.stroke();
    }
  }

  // Draws all placed furniture items; selected: { type: 'furniture', index } or null
  draw(ctx, viewport, items, selected) {
    for (let i = 0; i < items.length; i++) {
      const isSelected = selected?.type === 'furniture' && selected.index === i;
      this._draw(ctx, viewport, items[i], false, isSelected);
    }
  }

  // Draws a semi-transparent preview of a catalogue item while the user is dragging
  // from the sidebar. worldX/worldY is the snapped top-left in world cm.
  drawPreview(ctx, viewport, def, worldX, worldY) {
    if (def.shape === 'polygon') {
      // Translate defaultPoints (bounding-box-relative cm) to absolute world coords
      const pts = def.defaultPoints.map(p => ({ x: worldX + p.x, y: worldY + p.y }));
      this._drawPoly(ctx, viewport, { id: def.id, points: pts, width: def.defaultWidth, height: def.defaultHeight }, true, false);
    } else {
      this._drawRect(ctx, viewport, { id: def.id, x: worldX, y: worldY, width: def.defaultWidth, height: def.defaultHeight }, true, false);
    }
  }

  // Routes to the correct draw method based on whether the item has polygon points
  _draw(ctx, viewport, item, isPreview, isSelected) {
    if (item.points) {
      this._drawPoly(ctx, viewport, item, isPreview, isSelected);
    } else {
      this._drawRect(ctx, viewport, item, isPreview, isSelected);
    }
  }

  // Draws a rectangular furniture item in screen space
  _drawRect(ctx, viewport, item, isPreview, isSelected) {
    // Convert world-cm corners to screen-px so everything scales with zoom/pan
    const tl = viewport.worldToScreen(item.x, item.y);
    const br = viewport.worldToScreen(item.x + item.width, item.y + item.height);
    const w  = br.x - tl.x;
    const h  = br.y - tl.y;

    ctx.save();
    // Preview ghost is drawn at reduced opacity so the room plan shows through
    if (isPreview) ctx.globalAlpha = 0.6;

    ctx.fillStyle = this.FILL;
    ctx.fillRect(tl.x, tl.y, w, h);

    // Selection ring drawn outside the item border so it doesn't obscure the outline
    if (isSelected) {
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.8)';
      ctx.lineWidth   = 2.5;
      const pad = 3;
      ctx.strokeRect(tl.x - pad, tl.y - pad, w + pad * 2, h + pad * 2);
    }

    // Preview uses a dashed gold border; placed items use the quieter default stroke
    ctx.strokeStyle = isPreview ? 'rgba(201, 168, 76, 0.75)' : this.STROKE;
    ctx.lineWidth   = 1.5;
    if (isPreview) ctx.setLineDash([5, 3]);
    ctx.strokeRect(tl.x, tl.y, w, h);
    ctx.setLineDash([]);

    this._drawIcon(ctx, tl.x, tl.y, w, h, item.id);
    // Only draw dimension labels when the item is large enough on screen to be readable
    if (!isPreview && w > 50 && h > 36) this._drawLabels(ctx, tl.x, tl.y, w, h, item.width, item.height);

    ctx.restore();
  }

  // Draws a polygon furniture item (e.g. L-sofa, L-desk) in screen space
  _drawPoly(ctx, viewport, item, isPreview, isSelected) {
    // All points are in world cm — convert the whole array to screen px at once
    const pts = item.points.map(p => viewport.worldToScreen(p.x, p.y));
    // Derive the screen-space bounding box so icon and labels can be centred
    const xs  = pts.map(p => p.x), ys = pts.map(p => p.y);
    const bx  = Math.min(...xs), by = Math.min(...ys);
    const bw  = Math.max(...xs) - bx, bh = Math.max(...ys) - by;

    ctx.save();
    if (isPreview) ctx.globalAlpha = 0.6;

    // Filled polygon
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = this.FILL;
    ctx.fill();

    // Selection highlight drawn as a bounding-box rect (simpler than offsetting the polygon)
    if (isSelected) {
      const pad = 3;
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.8)';
      ctx.lineWidth   = 2.5;
      ctx.strokeRect(bx - pad, by - pad, bw + pad * 2, bh + pad * 2);
    }

    // Outline — path must be re-built because fill consumed the current path
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.strokeStyle = isPreview ? 'rgba(201, 168, 76, 0.75)' : this.STROKE;
    ctx.lineWidth   = 1.5;
    if (isPreview) ctx.setLineDash([5, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Icon and labels use the bounding box, same as the rect path
    this._drawIcon(ctx, bx, by, bw, bh, item.id);
    if (!isPreview && bw > 50 && bh > 36) this._drawLabels(ctx, bx, by, bw, bh, item.width, item.height);

    ctx.restore();
  }

  // Draws the pre-loaded SVG icon centred inside the bounding box at 50% of the shorter side
  _drawIcon(ctx, bx, by, bw, bh, id) {
    const img = this.icons.get(id);
    // Guard: img may still be loading on the very first frame; naturalWidth===0 means not yet ready
    if (img && img.complete && img.naturalWidth > 0) {
      const size = Math.min(bw, bh) * 0.5;
      if (size > 4) ctx.drawImage(img, bx + (bw - size) / 2, by + (bh - size) / 2, size, size);
    }
  }

  // Draws width label along the top edge and height label along the left edge (rotated)
  _drawLabels(ctx, bx, by, bw, bh, widthCm, heightCm) {
    const d = this.LABEL_OFFSET;
    ctx.fillStyle    = this.LABEL_COLOR;
    ctx.font         = this.LABEL_FONT;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    // Horizontal label near top edge
    ctx.fillText(this._label(widthCm), bx + bw / 2, by + d);
    // Only draw vertical label when the item is tall enough to avoid overlap with the top label
    if (bh > 60) {
      ctx.save();
      ctx.translate(bx + d, by + bh / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(this._label(heightCm), 0, 0);
      ctx.restore();
    }
  }

  // Converts centimetres to a compact metre string, e.g. 220 → "2.2m", 200 → "2m"
  _label(cm) {
    const m = cm / 100;
    return m % 1 === 0 ? `${m}m` : `${parseFloat(m.toFixed(1))}m`;
  }
}
