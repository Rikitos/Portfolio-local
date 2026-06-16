// Value-object that represents a completed freeform room outline.
// Stored in the designer's `polygons` array alongside the rectangular `rooms` array.
// The points array is open (first and last points are NOT duplicated) — RoomsRenderer
// calls ctx.closePath() to close the visual outline when drawing.
class Polygon {
  // points: [{x, y}, ...] in world cm, wound in click order
  constructor(points) {
    this.points = points;
  }
}
