// Handles all persistence for the room designer.
// Three storage targets:
//   localStorage slots 'a' and 'b' — user-editable saves, keyed by KEYS
//   JSON file export              — triggers a browser download
//   JSON file import              — opens a file picker, calls back with parsed layout
//
// Layout object shape (version 1):
//   { version: 1, rooms: [...], polygons: [...], furniture: [...] }
//   rooms[]    — { x, y, width, height } in world cm
//   polygons[] — { points: [{x,y},...] } in world cm
//   furniture[]— { id, x, y, width, height, rotation?, points? } in world cm
class DesignerStorage {
  constructor() {
    this.VERSION = 1;
    this.KEYS    = { a: 'designer_save_a', b: 'designer_save_b' };
  }

  // Packs live scene arrays into a versioned layout object ready for storage.
  pack(rooms, polygons, furniture) {
    // Deep-clone so stored data is not affected by future mutations of live arrays
    return {
      version:   this.VERSION,
      rooms:     JSON.parse(JSON.stringify(rooms)),
      polygons:  JSON.parse(JSON.stringify(polygons)),
      furniture: JSON.parse(JSON.stringify(furniture)),
    };
  }

  // Writes a packed layout to localStorage slot 'a' or 'b'. Returns success bool.
  save(slot, layout) {
    try {
      localStorage.setItem(this.KEYS[slot], JSON.stringify(layout));
      return true;
    } catch { return false; }
  }

  // Reads and parses slot 'a' or 'b'. Returns null when nothing is saved there.
  load(slot) {
    try {
      const raw = localStorage.getItem(this.KEYS[slot]);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  // True when the slot has saved data (used to show the filled-slot indicator).
  hasSave(slot) {
    return localStorage.getItem(this.KEYS[slot]) !== null;
  }

  // Triggers a browser download of the layout as a .json file.
  exportJSON(layout, filename = 'room-design.json') {
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Opens a file picker and calls callback(layout) once the file is parsed.
  // Shows an alert if the file is not a valid layout.
  importJSON(callback) {
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = '.json,application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader     = new FileReader();
      reader.onload    = (ev) => {
        try {
          const layout = JSON.parse(ev.target.result);
          // Minimal validation — must have version field and furniture array
          if (layout.version && Array.isArray(layout.furniture)) {
            callback(layout);
          } else {
            alert('Not a valid room design file.');
          }
        } catch { alert('Could not read the file — make sure it is a JSON export from this designer.'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // Fetches the admin-defined default layout from a static JSON file.
  // Returns null on network error so callers can handle gracefully.
  async fetchDefault(url = 'default-layout.json') {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }
}
