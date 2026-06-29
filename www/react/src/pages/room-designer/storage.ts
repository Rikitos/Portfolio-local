/**
 * DesignerStorage — handles all Layout persistence for the Room Designer.
 *
 * Two save slots (a, b) are kept in localStorage so the user can store and
 * recall layouts across sessions.  The default layout is bundled as a static
 * JSON import so it is always available without any localStorage state.
 *
 * localStorage keys:
 *   room_designer_slot_a
 *   room_designer_slot_b
 */
import type { Layout } from './types'
import defaultLayoutData from './default-layout.json'

/** Derive the localStorage key for a given slot letter. */
const SLOT_KEY = (slot: 'a' | 'b') => `room_designer_slot_${slot}`

export class DesignerStorage {
  /** Serialise and persist a layout to the given slot. Silently swallows quota errors. */
  saveSlot(slot: 'a' | 'b', layout: Layout) {
    try { localStorage.setItem(SLOT_KEY(slot), JSON.stringify(layout)) } catch { /* quota */ }
  }

  /** Deserialise and return the layout stored in a slot, or null if the slot is empty/corrupt. */
  loadSlot(slot: 'a' | 'b'): Layout | null {
    try {
      const raw = localStorage.getItem(SLOT_KEY(slot))
      return raw ? (JSON.parse(raw) as Layout) : null
    } catch { return null }
  }

  /** Return true when the slot key exists in localStorage (used to enable/disable load buttons). */
  hasSlot(slot: 'a' | 'b'): boolean {
    return !!localStorage.getItem(SLOT_KEY(slot))
  }

  /** Trigger a browser download of the current layout as a pretty-printed JSON file. */
  exportJSON(layout: Layout) {
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'room-layout.json'; a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Open a file picker, read the chosen JSON file, and resolve with the parsed Layout.
   * Resolves with null if the user cancels or the file is not valid JSON.
   */
  importJSON(): Promise<Layout | null> {
    return new Promise(resolve => {
      const input = document.createElement('input')
      input.type = 'file'; input.accept = '.json'
      input.onchange = () => {
        const file = input.files?.[0]
        if (!file) { resolve(null); return }
        const reader = new FileReader()
        reader.onload = (e) => {
          try { resolve(JSON.parse(e.target!.result as string) as Layout) }
          catch { resolve(null) }
        }
        reader.readAsText(file)
      }
      input.click()
    })
  }

  /**
   * Return the bundled default layout.
   * Loaded via a static import so it is always available regardless of localStorage state.
   */
  getDefault(): Layout {
    return defaultLayoutData as Layout
  }
}
