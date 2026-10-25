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

React 19 · TypeScript 6 · Tailwind CSS v4 · Vite 8 · React Router v7 · react-i18next

**Tailwind v4 specifics:**
- Configured entirely in `src/index.css` via `@import "tailwindcss"` and `@theme { … }` — no `tailwind.config.*` file.
- Dark mode is toggled by adding/removing the `.dark` class on the root div in `App.tsx` (`dark ? 'dark' : ''`). The custom variant `@custom-variant dark (&:where(.dark, .dark *))` makes `dark:` utility classes work throughout the codebase — use them freely for standard UI theming. For the canvas renderer (Room Designer) where colors are passed as strings to a 2D drawing API, use inline `style` props or the `dark` boolean prop instead.

**Typography (classic design):**
- Two self-hosted fonts (`@fontsource/instrument-serif`, `@fontsource-variable/dm-sans`), imported in `main.tsx`; no Google Fonts requests. Tokens live in `src/index.css` `@theme`: `font-display` (Instrument Serif) for headings and the brand name, `font-body` (DM Sans) for everything else.
- Deliberately not `--font-sans`, so pages that rely on the default sans and the House Pabisz theme (its own fonts) are unaffected.
- Instrument Serif only has weight 400 (plus italic), so headings stay `font-normal`, and it runs small, so headings are sized a step up from the old Palatino ones.
- Classic components declare `const font = 'font-body'` and put `font-display` directly on `h1`-`h3`. The Room Designer canvas labels still use Palatino (canvas strings, not Tailwind).

**i18n (react-i18next):**
- Setup lives in `src/i18n/index.ts`: `LanguageDetector` + `initReactI18next`, `fallbackLng: 'en'`, `supportedLngs: ['en', 'pl']`.
- Detection order is `['localStorage', 'htmlTag']` — deliberately excludes `navigator`, so a first-time visitor always lands in English regardless of browser locale; a saved manual choice (`localStorage`) still wins on return visits.
- One `translation` namespace per language (`src/i18n/locales/en.json` / `pl.json`), holding both the classic-design strings (`header`, `footer`, `hero`, `projects`, `games`) and the House Pabisz strings (nested under `housePabisz`) side by side in the same file — not split into separate namespaces.
- A missing key in one locale falls back to the **English resource bundle**, not to a JS-level `defaultValue` — always add a key to both locale files together, even a literal duplicate, or the other language silently shows English.

## Architecture

The app has **two visual designs that coexist in one codebase**, switched live at runtime — see [House Pabisz theme](#house-pabisz-theme) below before touching either. "Classic" is the original design; "House Pabisz" is a heraldry/medieval-parchment reskin.

```
src/
  App.tsx                          — Router root; holds global `dark` + `design` state, all routes
  main.tsx                         — React entry point; wraps App in BrowserRouter
  data/
    projects.ts                    — Shared project catalogue: `projects[]`, plus `duchies`/`baronies`
                                      (filtered by `external`) — single source of truth for both designs
    themedRoutes.ts                — THEMED_ROUTES: paths that have a House Pabisz variant
    navSections.ts                 — NAV_SECTIONS: classic homepage chapter ids + nav label keys (page order)
    contact.ts                     — Email / GitHub / LinkedIn, shared by hero, Contact section and footer
    techIcons.ts                   — Technology logo paths + brand colours (Simple Icons, CC0), keyed by the
                                      skill names in About.tsx; add a skill there and an entry here together
  hooks/
    useReveal.ts                   — Fade/slide-in on first scroll into view (CSS in index.css; honours reduced motion)
    useActiveSection.ts            — Which section is under the viewport middle, for the header highlight
  i18n/
    index.ts                       — react-i18next setup (see Stack above)
    locales/en.json, pl.json       — all copy for both designs, one namespace per language
  components/
    Header.tsx                     — Classic fixed nav bar; section links ("/#games" etc., from data/navSections.ts)
                                      with an active-section highlight on "/"; receives dark + onToggle
    Hero.tsx                       — Classic full-screen hero: day/night desk illustration cross-fading on `dark`
    Projects.tsx                   — Composes the three project chapters: DemoSites, Games, Tools
    DemoSites.tsx / Games.tsx / Tools.tsx — Chapters 01-03; each renders one `category` from data/projects.ts
                                      (tools show a 3-dot `level` meter; advanced tools are featured)
    SectionHeading.tsx             — Ruled "01  LABEL ———  note" heading shared by chapters 01-03
    About.tsx / Contact.tsx        — Chapters 04-05 (About: quick-fact icons + skill chips with tech logos;
                                      Contact: GitHub / LinkedIn / email icon tiles)
    icons.tsx                      — Inline SVG icons: Lucide (ISC) for map-pin/laptop/gamepad/mail,
                                      Bootstrap Icons (MIT) for GitHub/LinkedIn; licences noted in the file
    ScrollToHash.tsx               — Mounted once in App; scrolls to the URL hash (or top) after each navigation
    Footer.tsx                     — Classic site footer with project links and contact info
    Button.tsx                     — Reusable button/link; supports 5 visual variants
    LanguageSwitch.tsx             — Classic PL/EN text toggle
    house-pabisz/                  — Everything for the House Pabisz design (see below)
  pages/
    Home.tsx                       — Landing page; renders classic Hero+Projects or HousePabiszHome
                                      depending on `design`; exports the `HomeDesign` type
    CalculatorPage.tsx             — Classic calculator; logic from calculator/useCalculator
    TicTacToePage.tsx              — Classic tic-tac-toe; logic from tic-tac-toe/useTicTacToe
    CatGeneratorPage.tsx           — Classic random cat image; logic from cat-generator/useCatGenerator
    DiscordClonePage.tsx           — Discord-inspired chat UI; receives dark prop (shared by both designs,
                                      see House Pabisz theme below)
    Game2048Page.tsx               — Classic sliding tile puzzle; logic from 2048/useGame2048
    RoomDesignerPage.tsx           — Full-screen layout + all sidebar/toolbar UI (shared by both designs)
    calculator/useCalculator.ts    — Calculator engine (useReducer), shared by classic + themed pages
    tic-tac-toe/useTicTacToe.ts    — Game logic (useReducer), shared by classic + themed pages
    cat-generator/useCatGenerator.ts — CATS array + fade/cycle hook, shared by classic + themed pages
    2048/useGame2048.ts            — Full game engine + shared presentation constants (TILE_COLORS, etc.),
                                      shared by classic + themed pages
    discord-clone/
      ChannelSidebar.tsx           — Server channel list sidebar
      ChatHeader.tsx               — Channel name + action bar
      EmojiPicker.tsx              — Emoji selection popup
      GifPicker.tsx                — GIF search popup
      MemberList.tsx               — Online members panel
      Message.tsx                  — Single message bubble
      MessageInput.tsx             — Compose bar with emoji/GIF buttons
      MessageList.tsx              — Scrollable message feed
      ServerRail.tsx               — Left server icons rail
      UserAvatar.tsx               — Avatar with status indicator
      UserStatusPanel.tsx          — Bottom-left user identity bar
      HousePabiszDiscordContext.tsx — `useDiscordHousePabisz()` flag read by every file above (see below)
      seed-data.ts                 — Initial channels, messages, and members
      types.ts                     — Shared Discord clone types
      useBotReply.ts               — Auto-reply bot hook
      useChatEngine.ts             — Message send/receive state
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

### Routes

Every route currently has a House Pabisz variant — `App.tsx` branches all seven on `design`, matching `THEMED_ROUTES` exactly:

| Path | Classic component | House Pabisz component |
|------|--------------------|-------------------------|
| `/` | `Home` (branches internally) | — |
| `/calculator` | `CalculatorPage` | `HousePabiszCalculatorPage` |
| `/tic-tac-toe` | `TicTacToePage` | `HousePabiszTicTacToePage` |
| `/cat-generator` | `CatGeneratorPage` | `HousePabiszCatGeneratorPage` |
| `/room-designer` | `RoomDesignerPage` | `HousePabiszRoomDesignerPage` (header/nav reskin only — canvas untouched) |
| `/discord-clone` | `DiscordClonePage` | `HousePabiszDiscordClonePage` (colors only — same layout, see below) |
| `/2048` | `Game2048Page` | `HousePabiszGame2048Page` |

All House Pabisz page components share the same 3-prop signature: `dark`, `onToggleDark`, `onShowClassic`.

## House Pabisz theme

A full alternate visual design (heraldry / medieval-parchment), switchable live alongside "classic" without a page reload. Read this before adding a page to either design or extending the theme further.

**Global state (`App.tsx`):**
- `dark: boolean` — light/dark, independent of which design is active, threaded into both classic and House Pabisz pages.
- `design: 'house-pabisz' | 'current'` (`HomeDesign` type, exported from `pages/Home.tsx`) — the design switch. Defaults to `'house-pabisz'`.
- `showAppChrome = !(design === 'house-pabisz' && THEMED_ROUTES.includes(pathname))` — hides the classic `Header`/`Footer` only when House Pabisz is active on a themed route, since those pages render their own header/footer. `THEMED_ROUTES` (`src/data/themedRoutes.ts`) is the single list both `App.tsx` and the classic `Header`'s "House Pabisz" link read from.

**Adding a new themed page** — the established low-diff pattern:
1. Extract the page's logic into a `useX` hook under `src/pages/<name>/`, consumed by both the classic and themed page (see `calculator/useCalculator.ts`, `tic-tac-toe/useTicTacToe.ts`, `cat-generator/useCatGenerator.ts`, `2048/useGame2048.ts` for the pattern — including any presentation constants the two versions must keep in sync, e.g. `useGame2048`'s `TILE_COLORS`).
2. Build `HousePabisz<Name>Page.tsx` in `src/components/house-pabisz/`: `HousePabiszShell` → `HousePabiszHeader dark={dark} onToggleDark={onToggleDark} onShowClassic={onShowClassic} isHome={false}` → page content → (optional) `.frieze-band` → `HousePabiszFooter`.
3. Add the path to `THEMED_ROUTES`.
4. Wire the route in `App.tsx`: `design === 'house-pabisz' ? <HousePabisz...Page .../> : <ClassicPage .../>`.
5. Not every page needs the full treatment — `HousePabiszRoomDesignerPage` and `HousePabiszDiscordClonePage` deliberately reskin only the header/colors and reuse the classic page's body untouched (see below); match the scope the task actually calls for.

**Recoloring an existing component in place (Discord Clone pattern):** rather than prop-drill a `housePabisz` boolean through a deep component tree, `src/pages/discord-clone/HousePabiszDiscordContext.tsx` exposes it via `useDiscordHousePabisz()` (default `false`), set to `true` by wrapping the tree in `HousePabiszDiscordProvider`. Every subcomponent that has locally-computed colors reads the flag once and swaps in House Pabisz CSS variables:
```ts
const bg = housePabisz ? 'var(--card)' : dark ? '#2b2d31' : '#ffffff'
```
Convention: background tiers `var(--parchment)` → `var(--card)` → `var(--parchment-deep)` (lightest→darkest); text `var(--ink)`/`var(--ink-muted)`; primary accent (replacing Discord's blurple) `var(--maroon)`; hover/selected tints `color-mix(in srgb, var(--gold) N%, transparent)`; borders `var(--line)`/`var(--line-soft)`. Status-dot colors and each server's own branding `iconColor` are semantic/data-driven and deliberately left unchanged, same as 2048's `TILE_COLORS` and Tic-Tac-Toe's X/O colors.

**Header-height gotcha:** the House Pabisz header is `position: sticky` (occupies flow space); the classic header is `fixed` (doesn't). A page like `RoomDesignerPage`/`DiscordClonePage` that's shared by both designs and needs to fill the viewport below the header must measure the actual header and check `getComputedStyle(headerEl).position === 'fixed'` before deciding whether to add a compensating `marginTop`/`paddingTop` — hardcoding one header height for both breaks one design's layout.

**CSS:** all House Pabisz styling lives in `src/components/house-pabisz/house-pabisz.css` (single stylesheet, imported once by `HousePabiszShell`), scoped under a `.house-pabisz` root class with `.dark .house-pabisz` overrides for night mode. Theme colors are CSS custom properties (`--parchment`, `--card`, `--ink`, `--maroon`, `--gold`, `--line`, …) defined on `.house-pabisz` and redefined under `.dark .house-pabisz` — reference them directly in inline styles (`style={{ backgroundColor: 'var(--card)' }}`) without JS-level dark/light branching for anything House-Pabisz-specific. `src/components/house-pabisz/assets.ts` is the single import hub for the theme's illustration assets (`housePabiszArt`).

## Room Designer

The sections below (through Layout persistence) are all about the canvas-based Room Designer — shared unchanged by both designs.

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

Canvas renderer values (Room Designer) are passed as strings to the 2D drawing API — use inline `style` props or the `dark` boolean prop there. Standard UI components use `dark:` Tailwind classes.

### Dark theme (blueprint)

| Role | Value |
|------|-------|
| Page / sidebar background | `#243D5C` |
| Page root background | `#112240` (`navy-700`) |
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
