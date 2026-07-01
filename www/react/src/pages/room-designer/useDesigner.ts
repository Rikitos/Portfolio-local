/**
 * useDesigner — React hook that owns the Designer instance lifecycle.
 *
 * This is the sole bridge between the canvas engine (Designer class) and React state.
 * It creates one Designer on mount, tears it down on unmount, and exposes:
 *   state — a snapshot of canvas state for the UI to render (zoom, selection, theme, …)
 *   api   — imperative commands forwarded to the Designer instance
 *
 * Why a hook instead of putting this logic in the page component:
 *   Keeps RoomDesignerPage focused on JSX layout; all canvas wiring lives here.
 *
 * Theme sync:
 *   The `dark` prop is watched via useLayoutEffect so the canvas theme updates
 *   synchronously before the browser paints — avoiding a one-frame flash of the old theme.
 */
import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import { Designer } from './designer'
import type { Selection, NudgePos, FurnitureDef } from './types'

/** Mirror of all canvas state that the UI needs to react to. */
export interface DesignerState {
  zoomDisplay:  string           // e.g. "75%" — shown in the zoom input
  selected:     Selection | null // currently selected item, or null
  canUndo:      boolean          // whether the undo stack is non-empty
  rotation:     number           // degrees — only meaningful when a furniture item is selected
  flipActive:   boolean          // whether the selected furniture item is horizontally flipped
  labelsHidden: boolean          // whether the selected item's label is hidden
  showIcons:    boolean          // global toggle: icons vs. text labels on furniture
  theme:        'dark' | 'light' // current canvas theme (kept in sync with the `dark` prop)
  slotA:        boolean          // whether save slot A has saved data in localStorage
  slotB:        boolean          // whether save slot B has saved data in localStorage
  nudgePos:     NudgePos | null  // screen positions for the four arrow nudge buttons, or null
  mode:         'pan' | 'freeform'
}

export function useDesigner(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  workspaceRef: React.RefObject<HTMLDivElement | null>,
  dark = true,
) {
  const designerRef = useRef<Designer | null>(null)
  const [state, setState] = useState<DesignerState>({
    zoomDisplay: '50%', selected: null, canUndo: false,
    rotation: 0, flipActive: false, labelsHidden: false, showIcons: true, theme: 'dark',
    slotA: false, slotB: false, nudgePos: null, mode: 'pan',
  })

  /** Merge a partial state update — avoids full-object replacement on every callback. */
  const patch = useCallback((p: Partial<DesignerState>) => setState(prev => ({ ...prev, ...p })), [])

  // ── Designer lifecycle ─────────────────────────────────────────────────────

  useEffect(() => {
    const canvas    = canvasRef.current
    const workspace = workspaceRef.current
    if (!canvas || !workspace) return

    // Wire each UICallback to the corresponding patch call so Designer never imports React
    const d = new Designer(canvas, workspace, {
      onZoomChange:     z      => patch({ zoomDisplay: z }),
      onSelectedChange: sel    => patch({ selected: sel, canUndo: d.history.length > 0 }),
      onUndoChange:     can    => patch({ canUndo: can }),
      onRotationChange: deg    => patch({ rotation: deg }),
      onFlipChange:     f      => patch({ flipActive: f }),
      onLabelsChange:   h      => patch({ labelsHidden: h }),
      onSlotsChange:    (a, b) => patch({ slotA: a, slotB: b }),
      onNudgePosChange: pos    => patch({ nudgePos: pos }),
      onModeChange:     m      => patch({ mode: m }),
      onShowIconsChange: v     => patch({ showIcons: v }),
      onThemeChange:    t      => patch({ theme: t }),
      onConfigOpen:     (_def) => { /* handled via openConfig in RoomDesignerPage */ },
    })
    designerRef.current = d

    // Apply the initial theme now — the useLayoutEffect below fires before this useEffect
    // on first mount (designerRef is still null then), so we must seed the theme here.
    d.theme = dark ? 'dark' : 'light'
    patch({ theme: dark ? 'dark' : 'light' })

    // Load the bundled default layout on first mount
    d.loadLayout(d.storage.getDefault())
    patch({
      zoomDisplay: d.viewport.getZoomPercent(),
      slotA: d.storage.hasSlot('a'),
      slotB: d.storage.hasSlot('b'),
    })

    // Resize the canvas pixel buffer whenever the workspace container changes size
    const ro = new ResizeObserver(() => {
      canvas.width  = workspace.clientWidth
      canvas.height = workspace.clientHeight
      d['_dirty'] = true
    })
    ro.observe(workspace)

    return () => { d.destroy(); ro.disconnect(); designerRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])   // intentionally empty: Designer is created once and lives for the component lifetime

  // ── Theme sync ─────────────────────────────────────────────────────────────

  /**
   * Sync the `dark` prop into the canvas engine whenever it changes.
   * useLayoutEffect runs synchronously after DOM mutations so the canvas repaints
   * in the correct theme before the browser composites the frame.
   */
  useLayoutEffect(() => {
    const d = designerRef.current
    if (!d) return
    d.theme    = dark ? 'dark' : 'light'
    d['_dirty'] = true
    patch({ theme: dark ? 'dark' : 'light' })
  }, [dark])

  // ── Imperative API exposed to RoomDesignerPage ─────────────────────────────

  const api = {
    placeRoom:          (w: number, h: number) => designerRef.current?.placeRoom(w, h),
    setMode:            (m: 'pan' | 'freeform') => designerRef.current?.setMode(m),
    stepZoom:           (dir: number) => designerRef.current?.stepZoom(dir),
    applyInputZoom:     (s: string) => designerRef.current?.applyInputZoom(s),
    resetZoom:          () => designerRef.current?.resetZoom(),
    undo:               () => designerRef.current?.undo(),
    deleteSelected:     () => designerRef.current?.deleteSelected(),
    rotateSelected:     (d: number) => designerRef.current?.rotateSelected(d),
    setRotation:        (d: number) => designerRef.current?.setRotation(d),
    duplicateSelected:  () => designerRef.current?.duplicateSelected(),
    flipSelected:       () => designerRef.current?.flipSelected(),
    toggleLabels:       () => designerRef.current?.toggleLabels(),
    toggleIcons:        () => designerRef.current?.toggleIcons(),
    toggleTheme:        () => designerRef.current?.toggleTheme(),
    exportImage:        () => designerRef.current?.exportImage(),
    nudge:              (dx: number, dy: number) => designerRef.current?.nudge(dx, dy),
    saveSlot:           (slot: 'a' | 'b') => designerRef.current?.saveSlot(slot),
    loadSlot:           (slot: 'a' | 'b') => designerRef.current?.loadSlot(slot),
    /** Load the bundled default layout (different from slot A). */
    loadDefault:        () => { const d = designerRef.current; if (d) d.loadLayout(d.storage.getDefault()) },
    exportLayout:       () => designerRef.current?.exportLayout(),
    importLayout:       () => designerRef.current?.importLayout(),
    clearCanvas:        () => designerRef.current?.clearCanvas(),
    placeFurnitureAtCenter: (def: FurnitureDef, w: number, h: number) =>
      designerRef.current?.placeFurnitureAtCenter(def, w, h),
    startSidebarDrag:   (def: FurnitureDef, e: MouseEvent) =>
      designerRef.current?.startSidebarDrag(def, e),
    panView:            (dx: number, dy: number) => designerRef.current?.panView(dx, dy),
  }

  return { state, api }
}
