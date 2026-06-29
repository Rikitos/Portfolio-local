# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # tsc -b && vite build (TypeScript check + bundle)
npm run lint      # oxlint (fast Rust-based linter, no config file)
npm run preview   # Serve the built dist/
```

No test runner is configured — testing is done visually in the browser via the preview server.

## Stack

React 19 · TypeScript 6 · Tailwind CSS v4 · Vite 8 · React Router v7

**Tailwind v4 specifics:**
- Configured entirely in `src/index.css` via `@import "tailwindcss"` and `@theme { … }` — no `tailwind.config.*` file.
- Dark mode is defined with `@custom-variant dark (&:where(.dark, .dark *))` — class-based, but this variant has been observed to apply even without a `.dark` ancestor in some browsers (OS dark mode + CSS nesting interaction). **Do not use `dark:` Tailwind variant classes for theme switching in this project.** Use React prop-driven inline `style` props for all background colors and JS conditionals for class names instead.

## Architecture

```
src/
  App.tsx                          — Router root; holds global `dark` boolean state
  components/Header.tsx            — Fixed nav bar; receives dark + onToggle
  pages/
    RoomDesignerPage.tsx           — Full-screen layout + all sidebar/toolbar UI
    room-designer/
      designer.ts                  — Main canvas controller (class)
      useDesigner.ts               — React hook wrapping Designer; bridges canvas ↔ React state
      viewport.ts                  — Camera: zoom, pan, world↔screen conversion
      grid.ts                      — Canvas grid renderer
      rooms-renderer.ts            — Draws RoomItem rects + PolygonItems + handles
      furniture-renderer.ts        — Draws FurnitureItems with OBB + icons
      storage.ts                   — localStorage slots + JSON export/import
      types.ts                     — All shared types (Vec2, RoomItem, FurnitureItem, …)
      furniture-data.ts            — FURNITURE_CATALOGUE: catalogue definitions + SVG icons
      default-layout.json          — Bundled starting layout (loaded on first mount)
```

### Coordinate systems

| Space | Unit | Origin |
|-------|------|--------|
| World | centimetres | Canvas centre |
| Screen | CSS pixels | Canvas top-left |

Convert via `Viewport.worldToScreen` / `Viewport.screenToWorld`.
`PIXELS_PER_CM = 2` — at 100% zoom a 100 cm wall is 200 px.
World boundary: ±1500 cm (15 m) each axis.
Snap grid: 10 cm (`SNAP_CM`), matches minor grid lines.

### Data model

Three arrays live on `Designer` and are serialised into `Layout`:

| Array | Type | Notes |
|-------|------|-------|
| `rooms` | `RoomItem[]` | Axis-aligned rectangles: `{x, y, width, height}` in world cm |
| `polygons` | `PolygonItem[]` | Freeform convex shapes: `{points: Vec2[]}` in world cm |
| `furniture` | `FurnitureItem[]` | Placed catalogue items; have `rotation`, `flipX`, optional `points` for polygon-shaped pieces |

`FurnitureDef` (in `furniture-data.ts`) is the catalogue definition — source of truth for default sizes and SVG icon. `FurnitureItem` is a placed instance.

### React ↔ Canvas bridge

`Designer` never touches React state directly. All UI updates go through `UICallbacks` (defined in `types.ts`) — callback props passed in at construction. `useDesigner.ts` wires those callbacks to `setState` via `patch()` and exposes an `api` object of imperative commands to the page component.

Theme changes from the header button flow: `App.dark` → `RoomDesignerPage dark` prop → `useDesigner(dark)` → `useLayoutEffect([dark])` syncs `designer.theme` → canvas re-renders in new theme.

### Collision detection

SAT (Separating Axis Theorem) in `designer.ts`. Runs after every drag/place to build `collisionSet: Set<number>`. Items in the set are drawn with a red tint by `FurnitureRenderer`. Items marked `noCollide` (chairs, doors) are excluded from all checks.

### Interaction model (mousedown priority order)

1. Freeform vertex placement (if mode === 'freeform')
2. Vertex / edge handle resize (if a room/polygon is selected)
3. Furniture hit-test → select on first click, drag on second
4. Room / polygon hit-test → same select-first logic
5. Miss → deselect + start viewport pan

### Render loop

Continuous `requestAnimationFrame` loop in `Designer`. Only calls `_render()` when `_dirty === true`, which is set by any interaction or data change.

### Layout persistence

`DesignerStorage` wraps `localStorage`:
- `room_designer_slot_a` / `room_designer_slot_b` — user save slots
- Default layout bundled as `default-layout.json` (loaded via static import, not localStorage)

---

## Theme colour palette

All values are used as inline `style` props or JS-conditional class strings — never `dark:` variant classes.

### Dark theme (blueprint)

| Role | Value |
|------|-------|
| Page / sidebar background | `#243D5C` |
| Page root background | `#060D1A` (`navy-900`) |
| Header background | `#060D1A` |
| Header dropdown background | `#0A1628` (`navy-800`) |
| Panel background | `rgba(17, 34, 64, 0.4)` |
| Input background | `#112240` |
| Divider | `rgba(201, 168, 76, 0.15)` |
| Label text | `#8896b0` |
| Body text / input text | `#c0c8d8` |
| Panel border | `rgba(201, 168, 76, 0.2)` |
| Input border | `rgba(201, 168, 76, 0.25)` |
| Accent / gold | `#C9A84C` |
| Canvas grid background | transparent (page bg shows through) |
| Canvas major grid | `rgba(168, 184, 200, 0.2)` |
| Canvas minor grid | `rgba(168, 184, 200, 0.08)` |
| Canvas boundary / crosshair | `rgba(201, 168, 76, 0.35–0.4)` |

### Light theme (paper)

| Role | Value |
|------|-------|
| Page / sidebar background | `#d0c9bc` |
| Page root background | `#d8dce8` (slate-200) |
| Header background | `#e4e8f0` |
| Header dropdown background | `#cdd2e0` |
| Panel background | `rgba(255, 255, 255, 0.45)` |
| Input background | `#e8e3d8` |
| Divider | `rgba(120, 90, 30, 0.2)` |
| Label text | `#6a5a3a` |
| Body text / input text | `#3a3020` |
| Panel border | `rgba(120, 90, 30, 0.3)` |
| Input border | `rgba(120, 90, 30, 0.35)` |
| Canvas grid background | `#f5f0e8` |
| Canvas major grid | `rgba(80, 70, 55, 0.25)` |
| Canvas minor grid | `rgba(100, 90, 70, 0.12)` |
| Canvas boundary / crosshair | `rgba(160, 120, 30, 0.35–0.4)` |
| Canvas room walls | `rgba(30, 45, 70, 0.85)` |
| Canvas room labels | `rgba(160, 120, 30, 0.9)` |

---

## JavaScript Comment Style

Write comments proactively and in detail

### Every file must have a header block explaining:
- What the class/module does
- Coordinate systems or units in use (e.g. world cm vs screen px)
- Data model shape (e.g. rect vs polygon items, what each property means)
- Any non-obvious design decisions (e.g. why object references instead of indices)

### Every method needs a one-line purpose comment unless the name is completely self-explanatory.

### Inline comments are required for:
- **Algorithms** — name the technique (e.g. "ray-casting even-odd rule", "closest-point-on-segment")
- **Priority/order logic** — explain why things happen in that order (e.g. hit-test priority, draw order)
- **Snapshot patterns** — explain why a copy is taken instead of reading the live value
- **Branching on type** — explain what each branch handles (e.g. rect vs polygon furniture)
- **Magic numbers** — explain the unit and why that value (e.g. `MIN = 30 // minimum side length in cm`)
- **Anchor/fixed-point math** — explain which corner/edge stays fixed and why

### State variable groups in constructors:
- Group related state with a `// ── Group name ───` section comment
- Add a one-line note on each non-obvious variable explaining its role and valid values
