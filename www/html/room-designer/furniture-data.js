// Static catalogue of every furniture item available in the designer.
// Each entry carries real-world default dimensions in centimetres and an SVG icon string.
// Icons use `currentColor` so FurnitureRenderer can swap in a tinted data-URL at canvas draw time.
// Items with shape:'polygon' define defaultPoints (cm, relative to bounding-box top-left) instead of
// a plain rect — FurnitureRenderer and the placement logic branch on the presence of `points`/`defaultPoints`.
const FURNITURE_CATALOGUE = [

  // ── SEATING ────────────────────────────────────────────────────────────────
  // shape:'polygon' entries use defaultPoints (cm, relative to top-left of bounding box)
  // instead of defaultWidth/defaultHeight. defaultWidth/Height = bounding box for centering.
  {
    id: 'sofa-l',
    name: 'L-Sofa',
    category: 'Seating',
    shape: 'polygon',
    defaultWidth:  220,
    defaultHeight: 180,
    // 6-corner L-shape: 220×90 main seat + 110×90 chaise extending down on the left side
    defaultPoints: [
      {x:0,   y:0},   {x:220, y:0},
      {x:220, y:90},  {x:110, y:90},
      {x:110, y:180}, {x:0,   y:180},
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1,1 L47,1 L47,22 L24,22 L24,47 L1,47 Z"/>
      <path d="M4,4 L44,4 L44,19 L21,19 L21,44 L4,44 Z" stroke-dasharray="2 2" stroke-opacity="0.45"/>
      <rect x="1"  y="1"  width="7" height="21" rx="1"/>
      <rect x="39" y="1"  width="8" height="7"  rx="1"/>
    </svg>`,
  },
  {
    id: 'sofa',
    name: 'Sofa',
    category: 'Seating',
    defaultWidth: 220,
    defaultHeight: 90,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 26" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8"  y="5"  width="32" height="6"  rx="1"/>
      <rect x="8"  y="11" width="32" height="13" rx="1"/>
      <rect x="1"  y="5"  width="7"  height="19" rx="1"/>
      <rect x="40" y="5"  width="7"  height="19" rx="1"/>
    </svg>`,
  },
  {
    id: 'armchair',
    name: 'Armchair',
    category: 'Seating',
    defaultWidth: 90,
    defaultHeight: 90,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5"  y="4"  width="22" height="8"  rx="1"/>
      <rect x="5"  y="12" width="22" height="14" rx="1"/>
      <rect x="1"  y="8"  width="4"  height="18" rx="1"/>
      <rect x="27" y="8"  width="4"  height="18" rx="1"/>
    </svg>`,
  },
  {
    id: 'chair',
    name: 'Chair',
    category: 'Seating',
    defaultWidth: 50,
    defaultHeight: 50,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="1"  width="24" height="8"  rx="1"/>
      <rect x="4" y="9"  width="20" height="18" rx="1"/>
      <line x1="5"  y1="27" x2="5"  y2="31"/>
      <line x1="23" y1="27" x2="23" y2="31"/>
    </svg>`,
  },

  // ── BEDROOM ────────────────────────────────────────────────────────────────
  {
    id: 'bed-single',
    name: 'Single Bed',
    category: 'Bedroom',
    defaultWidth: 90,
    defaultHeight: 200,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="1" width="26" height="46" rx="2"/>
      <rect x="4" y="4" width="20" height="12" rx="1"/>
      <line x1="1" y1="18" x2="27" y2="18"/>
    </svg>`,
  },
  {
    id: 'bed-double',
    name: 'Double Bed',
    category: 'Bedroom',
    defaultWidth: 160,
    defaultHeight: 200,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1"  y="1" width="44" height="46" rx="2"/>
      <rect x="4"  y="4" width="17" height="12" rx="1"/>
      <rect x="25" y="4" width="17" height="12" rx="1"/>
      <line x1="1" y1="18" x2="45" y2="18"/>
    </svg>`,
  },

  // ── TABLES ─────────────────────────────────────────────────────────────────
  {
    id: 'dining-table',
    name: 'Dining Table',
    category: 'Tables',
    defaultWidth: 120,
    defaultHeight: 80,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="44" height="28" rx="1"/>
      <circle cx="6"  cy="6"  r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="42" cy="6"  r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="6"  cy="26" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="42" cy="26" r="1.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  {
    id: 'coffee-table',
    name: 'Coffee Table',
    category: 'Tables',
    defaultWidth: 120,
    defaultHeight: 60,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="44" height="20" rx="1"/>
      <rect x="6" y="6" width="36" height="12" rx="1" stroke-opacity="0.45" stroke-dasharray="2 2"/>
    </svg>`,
  },
  {
    id: 'desk-l',
    name: 'L-Desk',
    category: 'Tables',
    shape: 'polygon',
    defaultWidth:  210,
    defaultHeight: 140,
    // L-desk: 210×70 main surface + 70×70 return on right side
    defaultPoints: [
      {x:0,   y:0},   {x:210, y:0},
      {x:210, y:140}, {x:140, y:140},
      {x:140, y:70},  {x:0,   y:70},
    ],
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1,1 L47,1 L47,47 L32,47 L32,18 L1,18 Z"/>
      <line x1="1" y1="8" x2="47" y2="8"/>
      <line x1="32" y1="8" x2="32" y2="47"/>
    </svg>`,
  },
  {
    id: 'desk',
    name: 'Desk',
    category: 'Tables',
    defaultWidth: 140,
    defaultHeight: 70,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1"  y="1"  width="46" height="30" rx="1"/>
      <line x1="1"  y1="9"  x2="47" y2="9"/>
      <rect x="32" y="11" width="13" height="17" rx="1"/>
    </svg>`,
  },

  // ── STORAGE ────────────────────────────────────────────────────────────────
  {
    id: 'wardrobe',
    name: 'Wardrobe',
    category: 'Storage',
    defaultWidth: 120,
    defaultHeight: 60,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="1" width="46" height="34" rx="1"/>
      <line x1="24" y1="1" x2="24" y2="35"/>
      <circle cx="19" cy="18" r="2" fill="currentColor" stroke="none"/>
      <circle cx="29" cy="18" r="2" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    category: 'Storage',
    defaultWidth: 80,
    defaultHeight: 30,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="1" width="46" height="22" rx="1"/>
      <line x1="1"  y1="9"  x2="47" y2="9"/>
      <line x1="1"  y1="16" x2="47" y2="16"/>
      <line x1="12" y1="1"  x2="12" y2="9"/>
      <line x1="23" y1="9"  x2="23" y2="16"/>
      <line x1="35" y1="16" x2="35" y2="23"/>
    </svg>`,
  },

  // ── BATHROOM ───────────────────────────────────────────────────────────────
  {
    id: 'bathtub',
    name: 'Bathtub',
    category: 'Bathroom',
    defaultWidth: 75,
    defaultHeight: 170,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="1" width="26" height="46" rx="5"/>
      <rect x="4" y="7" width="20" height="37" rx="4"/>
      <circle cx="14" cy="44" r="1.5" fill="currentColor" stroke="none"/>
    </svg>`,
  },
  {
    id: 'toilet',
    name: 'Toilet',
    category: 'Bathroom',
    defaultWidth: 40,
    defaultHeight: 70,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="1" width="22" height="10" rx="1"/>
      <rect x="2" y="11" width="24" height="26" rx="12"/>
      <circle cx="14" cy="26" r="4"/>
    </svg>`,
  },
  {
    id: 'sink',
    name: 'Sink',
    category: 'Bathroom',
    defaultWidth: 60,
    defaultHeight: 50,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 34" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="5"  width="38" height="28" rx="3"/>
      <rect x="5" y="9"  width="30" height="20" rx="3"/>
      <circle cx="20" cy="19" r="2" fill="currentColor" stroke="none"/>
      <rect x="16" y="1" width="8" height="5" rx="1"/>
    </svg>`,
  },
];
