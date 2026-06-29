/**
 * types.ts — shared TypeScript interfaces for the Room Designer.
 *
 * All spatial values are in world-space centimetres unless noted otherwise.
 *
 * Data model overview
 *   Vec2          — a 2-D point {x, y} used for polygon vertices and world positions
 *   RoomItem      — an axis-aligned rectangle (wall outline), stored as top-left origin + size
 *   PolygonItem   — a freeform closed polygon stored as an ordered list of world-space vertices
 *   FurnitureItem — a placed catalogue piece; rect by default, polygon for L-shapes, special for doors
 *   FurnitureDef  — the catalogue entry (definition); FurnitureItem is a placed instance of one
 *   Layout        — the full serialisable state: three arrays + version tag
 *   UICallbacks   — the interface through which Designer pushes state changes back to React
 *   NudgePos      — four {left, top} screen-pixel positions for the floating arrow buttons
 */

export interface Vec2 { x: number; y: number }

/** Axis-aligned room rectangle. x/y = top-left corner in world cm. */
export interface RoomItem {
  x: number; y: number; width: number; height: number
  hideLabel?: boolean   // when true the dimension labels are not drawn
}

/** Freeform polygon drawn by the user in freeform mode. Points are in world cm, ordered CCW or CW. */
export interface PolygonItem {
  points: Vec2[]
  hideLabel?: boolean   // when true the per-edge dimension labels are not drawn
}

/**
 * A placed furniture item.
 *
 * shape: undefined → draw as a rotatable/flippable rectangle (default)
 *        'polygon'  → draw from `points` (L-shapes etc.)
 *        'door'     → draw as a wall line + quarter-circle arc, pivots at (x, y)
 *
 * x/y = top-left of bounding box in world cm (also the hinge for doors).
 * rotation is in degrees, applied around the bounding-box centre (or hinge for doors).
 * points are relative to the item's own origin (x, y), in cm.
 * noCollide = true → excluded from SAT collision detection (chairs, doors).
 */
export interface FurnitureItem {
  id: string; name: string; shape?: string; noCollide?: boolean
  x: number; y: number; width: number; height: number
  rotation?: number; flipX?: boolean; hideLabel?: boolean
  points?: Vec2[]
}

/** What type of canvas item is currently selected. */
export type SelectionType = 'room' | 'polygon' | 'furniture'

/** Identifies a single selected item by type + index into the corresponding array. */
export interface Selection { type: SelectionType; index: number }

/**
 * One entry on the undo stack.
 *
 * action 'place'  — item was newly added; undo removes the last element of its array
 * action 'move'   — item was dragged; `from` holds the previous {x, y}
 * action 'resize' — item was resized; `from` holds the previous {x, y, width, height} or points
 * action 'rotate' — furniture was rotated; `from` holds the previous {rotation}
 *
 * `index` is captured at action time so undo does not require the item to still be selected.
 */
export interface HistoryEntry {
  action: 'place' | 'move' | 'resize' | 'rotate'
  type: SelectionType
  index?: number
  item: RoomItem | PolygonItem | FurnitureItem
  from?: Partial<RoomItem & FurnitureItem & { points: Vec2[] }>
}

/** Full serialisable canvas state. All three arrays are optional so partial JSON files load cleanly. */
export interface Layout {
  version?: number
  rooms?: RoomItem[]
  polygons?: PolygonItem[]
  furniture?: FurnitureItem[]
}

/**
 * Catalogue entry — the static definition for a piece of furniture.
 *
 * defaultPoints are in local space relative to the item's (x, y) origin, in cm.
 * icon is a raw SVG string with `currentColor` for stroke so the renderer can tint it.
 */
export interface FurnitureDef {
  id: string; name: string; category: string
  shape?: 'polygon' | 'door'
  defaultWidth: number; defaultHeight: number
  defaultPoints?: Vec2[]
  noCollide?: boolean
  icon: string
}

/**
 * Screen-space pixel positions for the four nudge arrow buttons.
 * Each position is the top-left of a 24×24 px button, in fixed viewport coordinates.
 */
export interface NudgePos {
  up:    { left: number; top: number }
  down:  { left: number; top: number }
  left:  { left: number; top: number }
  right: { left: number; top: number }
}

/**
 * Callbacks through which Designer pushes state into React without importing React itself.
 * Every callback corresponds to one piece of React state in useDesigner.
 */
export interface UICallbacks {
  onZoomChange(z: string): void
  onSelectedChange(sel: Selection | null): void
  onUndoChange(can: boolean): void
  onRotationChange(deg: number): void
  onFlipChange(flipped: boolean): void
  onLabelsChange(hidden: boolean): void
  onSlotsChange(hasA: boolean, hasB: boolean): void
  onNudgePosChange(pos: NudgePos | null): void
  onModeChange(mode: 'pan' | 'freeform'): void
  onConfigOpen(def: FurnitureDef): void
  onShowIconsChange(v: boolean): void
  onThemeChange(t: 'dark' | 'light'): void
}

export type CanvasTheme = 'dark' | 'light'
