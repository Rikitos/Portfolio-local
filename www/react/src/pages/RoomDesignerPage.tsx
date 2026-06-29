/**
 * RoomDesignerPage — the full-page UI shell for the Room Designer feature.
 *
 * Layout overview (top to bottom / left to right):
 *   pt-16 wrapper     — pushes content below the 64px fixed Header
 *   Toolbar           — room size inputs, freeform mode toggle, zoom controls
 *   Main row
 *     Canvas column   — workspace div + <canvas> + pan arrows + canvas controls overlay + nudge buttons
 *     Sidebar         — layouts panel, furniture config panel, furniture catalogue
 *
 * Architecture notes:
 *   All canvas state (selection, zoom, theme, undo …) lives in useDesigner; this component
 *   only owns UI-local state (toolbar inputs, config panel, rotate popup visibility).
 *
 *   Theme: `dark` prop is passed down from App. Background colours are applied as React inline
 *   `style` props (NOT Tailwind `dark:` variants) to prevent stale browser compositing.
 *   See CLAUDE.md §"Tailwind v4 dark mode" for why `dark:` classes are avoided here.
 *
 * Button components:
 *   TBtn — toolbar button (h-8, wider label text)
 *   CBtn — canvas overlay button (icon + optional text label, collapses to icon-only)
 *   SBtn — sidebar small button (extra small, optional danger variant)
 */
import { useState, useRef, useCallback } from 'react'
import { useDesigner } from './room-designer/useDesigner'
import { FURNITURE_CATALOGUE } from './room-designer/furniture-data'
import type { FurnitureDef } from './room-designer/types'

const font = "font-['Palatino_Linotype',Palatino,serif]"
const H    = 'h-8'

function TBtn({ label, active = false, disabled = false, title, className = '', onClick }: {
  label: string; active?: boolean; disabled?: boolean; title?: string; className?: string; onClick?: () => void
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={[
        font, H, 'px-3 text-[0.8rem] tracking-[0.1em] min-w-[32px] text-center',
        'border rounded-[2px] transition-colors duration-150 cursor-pointer',
        active
          ? 'bg-[rgba(6,13,26,0.7)] border-[rgba(201,168,76,0.6)] text-[#C9A84C]'
          : 'bg-[rgba(6,13,26,0.7)] border-[rgba(201,168,76,0.25)] text-[#c0c8d8] hover:bg-navy-900 hover:border-[rgba(201,168,76,0.5)] hover:text-[#C9A84C]',
        disabled ? 'opacity-35 !cursor-default pointer-events-none' : '', className,
      ].join(' ')}
    >{label}</button>
  )
}

function CBtn({ icon, label, active = false, disabled = false, collapsed, title, onClick }: {
  icon: string; label: string; active?: boolean; disabled?: boolean; collapsed: boolean; title?: string; onClick?: () => void
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={[
        font, 'text-[0.75rem] tracking-[0.08em] text-left whitespace-nowrap',
        collapsed ? 'px-[7px] py-[3px]' : 'px-[10px] py-[3px]',
        'border rounded-[2px] transition-colors duration-150 cursor-pointer',
        active
          ? 'bg-[#112240] border-[rgba(201,168,76,0.6)] text-[#C9A84C]'
          : 'bg-[rgba(17,34,64,0.85)] border-[rgba(201,168,76,0.35)] text-[rgba(192,200,216,0.9)] hover:bg-navy-900 hover:border-[rgba(201,168,76,0.5)] hover:text-[#C9A84C]',
        disabled ? 'opacity-35 !cursor-default pointer-events-none' : '',
      ].join(' ')}
    >{icon}{!collapsed && <span className="ml-1">{label}</span>}</button>
  )
}

function SBtn({ label, danger = false, disabled = false, full = false, onClick }: {
  label: string; danger?: boolean; disabled?: boolean; full?: boolean; onClick?: () => void
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={[
        font, 'text-[0.58rem] tracking-[0.04em] rounded-[2px] px-1.5 py-1 text-center transition-colors duration-150 cursor-pointer',
        full ? 'w-full' : '',
        danger
          ? 'text-[rgba(238,136,136,0.8)] bg-[rgba(6,13,26,0.7)] border border-[rgba(238,136,136,0.2)] hover:bg-[rgba(238,136,136,0.12)] hover:border-[rgba(238,136,136,0.45)] hover:text-[#f99]'
          : 'text-[#c0c8d8] bg-[rgba(6,13,26,0.7)] border border-[rgba(201,168,76,0.2)] hover:bg-navy-900 hover:border-[rgba(201,168,76,0.5)] hover:text-[#C9A84C]',
        disabled ? 'opacity-35 !cursor-default pointer-events-none' : '',
      ].join(' ')}
    >{label}</button>
  )
}

// Groups FURNITURE_CATALOGUE by category
const catalogueByCategory = (() => {
  const map: Record<string, FurnitureDef[]> = {}
  for (const item of FURNITURE_CATALOGUE) {
    if (!map[item.category]) map[item.category] = []
    map[item.category].push(item)
  }
  return map
})()

function dimsLabel(def: FurnitureDef) {
  const fmt = (v: number) => { const m = v / 100; return m % 1 === 0 ? `${m}m` : `${parseFloat(m.toFixed(1))}m` }
  return `${fmt(def.defaultWidth)} × ${fmt(def.defaultHeight)}`
}

export default function RoomDesignerPage({ dark = true }: { dark?: boolean; onToggleTheme?: () => void }) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const { state, api } = useDesigner(canvasRef, workspaceRef, dark)

  // Toolbar local state
  const [roomW, setRoomW] = useState(5)
  const [roomH, setRoomH] = useState(4)


  // Canvas controls
  const [ctrlCollapsed,   setCtrlCollapsed]   = useState(false)
  const [showRotatePopup, setShowRotatePopup] = useState(false)

  // Furniture config panel
  const [configDef, setConfigDef] = useState<FurnitureDef | null>(null)
  const [configW,   setConfigW]   = useState(1)
  const [configH,   setConfigH]   = useState(1)

  const isFurnitureSelected = state.selected?.type === 'furniture'
  const hasSelection        = state.selected !== null

  // Theme — backgrounds as inline styles (forces immediate repaint, avoids stale compositing)
  const bgStyle    = { backgroundColor: dark ? '#243D5C'              : '#d0c9bc' }
  const panelStyle = { backgroundColor: dark ? 'rgba(17,34,64,0.4)'   : 'rgba(255,255,255,0.45)' }
  const divStyle   = { backgroundColor: dark ? 'rgba(201,168,76,0.15)' : 'rgba(120,90,30,0.2)' }
  const inputStyle = { backgroundColor: dark ? '#112240'              : '#e8e3d8' }

  // Theme — borders and text stay as classes (no compositing issue)
  const thPanelBorder = dark ? 'border-[rgba(201,168,76,0.2)]' : 'border-[rgba(120,90,30,0.3)]'
  const thLabel       = dark ? 'text-[#8896b0]'               : 'text-[#6a5a3a]'
  const thInputText   = dark ? 'text-[#c0c8d8]'               : 'text-[#3a3020]'
  const thInputBorder = dark ? 'border-[rgba(201,168,76,0.25)]' : 'border-[rgba(120,90,30,0.35)]'

  const inputCls = [
    font, H, `w-14 text-center text-[0.8rem] ${thInputText}`,
    `border ${thInputBorder} rounded-[2px] px-2`,
    'focus:outline-none focus:border-[rgba(201,168,76,0.6)] focus:text-[#C9A84C]',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  ].join(' ')

  const openConfig = useCallback((def: FurnitureDef) => {
    setConfigDef(def)
    setConfigW(def.defaultWidth / 100)
    setConfigH(def.defaultHeight / 100)
  }, [])

  // Keep zoom input in sync when engine updates it
  const displayedZoom = state.zoomDisplay

  return (
    <div className="pt-16" style={bgStyle}>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)', ...bgStyle }}>

        {/* ── Toolbar ── */}
        <div className="flex-shrink-0 flex items-end justify-center gap-6 px-5 py-2 mt-4 mx-5 rounded-[4px]" style={bgStyle}>

          {/* Room dimensions */}
          <div className="flex items-end gap-2">
            <div className="flex flex-col items-center gap-[3px]">
              <span className={`${font} text-[0.6rem] tracking-[0.12em] uppercase ${thLabel} leading-none`}>Width</span>
              <div className="relative flex items-center">
                <input type="number" value={roomW} min={1} max={30} onChange={e => setRoomW(Number(e.target.value))}
                  className={inputCls + ' pr-5 text-left'} style={inputStyle} />
                <span className={`${font} absolute right-1.5 text-[0.7rem] ${thLabel} pointer-events-none leading-none`}>m</span>
              </div>
            </div>
            <span className={`${font} text-[0.8rem] ${thLabel} leading-none mb-[5px]`}>×</span>
            <div className="flex flex-col items-center gap-[3px]">
              <span className={`${font} text-[0.6rem] tracking-[0.12em] uppercase ${thLabel} leading-none`}>Height</span>
              <div className="relative flex items-center">
                <input type="number" value={roomH} min={1} max={30} onChange={e => setRoomH(Number(e.target.value))}
                  className={inputCls + ' pr-5 text-left'} style={inputStyle} />
                <span className={`${font} absolute right-1.5 text-[0.7rem] ${thLabel} pointer-events-none leading-none`}>m</span>
              </div>
            </div>
            <TBtn label="Place Room" className=""
              title="Place a room at the canvas centre"
              onClick={() => api.placeRoom(roomW * 100, roomH * 100)} />
          </div>

          <div className="w-px h-6" style={divStyle} />

          {/* Mode — label stacked above button */}
          <div className="flex flex-col items-center gap-[3px]">
            <span className={`${font} text-[0.6rem] tracking-[0.12em] uppercase ${thLabel} leading-none`}>Mode</span>
            <TBtn label="Free Draw" active={state.mode === 'freeform'}
              title="Click to place polygon vertices; click first point to close"
              onClick={() => api.setMode(state.mode === 'freeform' ? 'pan' : 'freeform')} />
          </div>

          <div className="w-px h-6" style={divStyle} />

          {/* Zoom — label stacked above the % input */}
          <div className="flex items-end gap-2">
            <TBtn label="−" title="Zoom out" onClick={() => api.stepZoom(1)} />
            <div className="flex flex-col items-center gap-[3px]">
              <span className={`${font} text-[0.6rem] tracking-[0.12em] uppercase ${thLabel} leading-none`}>Zoom</span>
              <input
                value={displayedZoom}
                onChange={_e => {}}
                onKeyDown={e => { if (e.key === 'Enter') api.applyInputZoom((e.target as HTMLInputElement).value) }}
                onBlur={e => api.applyInputZoom(e.target.value)}
                title="Type a zoom % and press Enter"
                className={inputCls}
                style={inputStyle}
                readOnly={false}
              />
            </div>
            <TBtn label="+" title="Zoom in" onClick={() => api.stepZoom(-1)} />
            <TBtn label="Reset Zoom" title="Re-centre view" onClick={() => api.resetZoom()} />
          </div>
        </div>

        {/* ── Main row ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Canvas column */}
          <div className="flex-1 flex flex-col overflow-hidden pl-5 pb-5">
            <div ref={workspaceRef} className="flex-1 relative overflow-hidden border border-[rgba(201,168,76,0.35)]">

              <canvas ref={canvasRef} className="block w-full h-full"
                style={{ cursor: state.mode === 'freeform' ? 'crosshair' : 'default' }} />

              {/* Pan arrows */}
              {([
                { id: 'up',    label: '↑', pos: 'top-2 left-1/2 -translate-x-1/2', dx: 0,   dy: -50 },
                { id: 'down',  label: '↓', pos: 'bottom-2 left-1/2 -translate-x-1/2', dx: 0, dy: 50 },
                { id: 'left',  label: '←', pos: 'left-2 top-1/2 -translate-y-1/2',  dx: -50, dy: 0 },
                { id: 'right', label: '→', pos: 'right-2 top-1/2 -translate-y-1/2', dx: 50,  dy: 0 },
              ] as const).map(({ id, label, pos, dx, dy }) => (
                <button key={id} title={`Pan ${id}`} onClick={() => api.panView(dx, dy)}
                  className={[
                    font, 'absolute text-[0.7rem] leading-none z-[5]',
                    'w-6 h-6 p-0 flex items-center justify-center cursor-pointer',
                    'text-[rgba(192,200,216,0.55)] bg-[rgba(17,34,64,0.55)]',
                    'border border-[rgba(201,168,76,0.2)] rounded-[2px]',
                    'hover:bg-[rgba(6,13,26,0.85)] hover:border-[rgba(201,168,76,0.45)] hover:text-[#C9A84C]',
                    'transition-colors duration-150', pos,
                  ].join(' ')}
                >{label}</button>
              ))}

              {/* Canvas controls */}
              <div className="absolute top-9 left-12 flex flex-col items-start gap-[5px] z-10">
                <button onClick={() => { setCtrlCollapsed(c => !c); setShowRotatePopup(false) }}
                  className={[
                    font, 'text-[0.75rem] tracking-[0.08em] flex items-center gap-1.5 whitespace-nowrap',
                    ctrlCollapsed ? 'px-[7px] py-[3px]' : 'px-[10px] py-[3px]',
                    'rounded-[2px] cursor-pointer text-[rgba(192,200,216,0.9)] bg-[rgba(17,34,64,0.85)]',
                    'border border-[rgba(201,168,76,0.35)] hover:bg-navy-900 hover:border-[rgba(201,168,76,0.5)] hover:text-[#C9A84C]',
                    'transition-colors duration-150',
                  ].join(' ')}
                >
                  {ctrlCollapsed ? '›' : '‹'}{!ctrlCollapsed && <span> Hide</span>}
                </button>

                <CBtn icon="↩" label="Undo"      collapsed={ctrlCollapsed} disabled={!state.canUndo}          title="Undo (Ctrl+Z)"           onClick={() => api.undo()} />
                <CBtn icon="✕" label="Delete"     collapsed={ctrlCollapsed} disabled={!hasSelection}           title="Delete selected (Del)"   onClick={() => api.deleteSelected()} />

                <div className="relative">
                  <CBtn icon="↻" label="Rotate" collapsed={ctrlCollapsed} disabled={!isFurnitureSelected}
                    title="Rotate furniture" onClick={() => setShowRotatePopup(p => !p)} />
                  {showRotatePopup && isFurnitureSelected && (
                    <div className="absolute left-[calc(100%+8px)] top-0 flex items-center gap-1 z-[11] bg-[rgba(17,34,64,0.92)] border border-[rgba(201,168,76,0.4)] rounded-[3px] px-1.5 py-1 whitespace-nowrap">
                      <button title="Rotate left" onClick={() => api.rotateSelected(-15)}
                        className="text-[#8896b0] text-[1.1rem] leading-none px-1 py-0.5 rounded bg-transparent border-none cursor-pointer hover:text-[#C9A84C] hover:bg-[rgba(201,168,76,0.1)] transition-colors">↺</button>
                      <span className={`${font} text-[0.75rem] text-[#C9A84C] min-w-[32px] text-center tracking-[0.04em]`}>{state.rotation}°</span>
                      <button title="Rotate right" onClick={() => api.rotateSelected(15)}
                        className="text-[#8896b0] text-[1.1rem] leading-none px-1 py-0.5 rounded bg-transparent border-none cursor-pointer hover:text-[#C9A84C] hover:bg-[rgba(201,168,76,0.1)] transition-colors">↻</button>
                    </div>
                  )}
                </div>

                <CBtn icon="⧉" label="Duplicate"  collapsed={ctrlCollapsed} disabled={!hasSelection}           title="Duplicate (D)"           onClick={() => api.duplicateSelected()} />
                <CBtn icon="⇄" label="Flip"        collapsed={ctrlCollapsed} disabled={!isFurnitureSelected}    title="Flip horizontally (F)"   active={state.flipActive}   onClick={() => api.flipSelected()} />
                <CBtn icon="⊞" label="Labels"      collapsed={ctrlCollapsed} disabled={!hasSelection}           title="Toggle labels"           active={state.labelsHidden} onClick={() => api.toggleLabels()} />
                <CBtn icon="⊡" label="Icons"       collapsed={ctrlCollapsed}                                      title="Toggle furniture icons"  active={state.showIcons}    onClick={() => api.toggleIcons()} />
              </div>

              {/* Nudge buttons — fixed position when furniture selected */}
              {state.nudgePos && (
                <>
                  {(['up', 'down', 'left', 'right'] as const).map(dir => {
                    const { left, top } = state.nudgePos![dir]
                    const labels = { up: '↑', down: '↓', left: '←', right: '→' }
                    const nudges = { up: [0, -5], down: [0, 5], left: [-5, 0], right: [5, 0] }
                    return (
                      <button key={dir}
                        style={{ position: 'fixed', left, top, zIndex: 20 }}
                        onClick={() => api.nudge(nudges[dir][0], nudges[dir][1])}
                        className={[
                          font, 'w-6 h-6 text-[0.75rem] flex items-center justify-center',
                          'bg-[rgba(17,34,64,0.85)] border border-[rgba(201,168,76,0.4)] rounded-[2px]',
                          'text-[rgba(192,200,216,0.8)] cursor-pointer hover:text-[#C9A84C] hover:border-[rgba(201,168,76,0.7)]',
                          'transition-colors duration-100',
                        ].join(' ')}
                      >{labels[dir]}</button>
                    )
                  })}
                </>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="flex-shrink-0 w-[220px] border-l border-b border-[rgba(201,168,76,0.15)] overflow-y-auto p-2 pt-[30px] pb-5"
            style={bgStyle}>

            {/* Layouts panel */}
            <div className={`mb-2.5 p-2 border ${thPanelBorder} rounded-[3px] flex flex-col gap-1.5`}
              style={panelStyle}>
              <span className={`${font} text-[0.52rem] tracking-[0.15em] uppercase ${thLabel}`}>Layouts</span>
              <div className="grid grid-cols-3 gap-1">
                <SBtn label="Default"  onClick={() => api.loadDefault()} />
                <SBtn label="Slot A"   disabled={!state.slotA} onClick={() => api.loadSlot('a')} />
                <SBtn label="Slot B"   disabled={!state.slotB} onClick={() => api.loadSlot('b')} />
              </div>
              <div className="grid grid-cols-2 gap-1">
                <SBtn label="Save → A" onClick={() => api.saveSlot('a')} />
                <SBtn label="Save → B" onClick={() => api.saveSlot('b')} />
              </div>
              <div className="grid grid-cols-2 gap-1">
                <SBtn label="Export"  onClick={() => api.exportLayout()} />
                <SBtn label="Import"  onClick={() => api.importLayout()} />
              </div>
              <SBtn label="Export PNG" onClick={() => api.exportImage()} />
              <SBtn label="Clear canvas" danger full onClick={() => { if (confirm('Clear the canvas?')) api.clearCanvas() }} />
            </div>

            {/* Furniture config panel */}
            {configDef && (
              <div className="mb-3.5 p-2.5 border border-[rgba(201,168,76,0.4)] rounded-[3px] flex flex-col gap-2"
                style={panelStyle}>
                <div className="flex justify-between items-center">
                  <span className={`${font} text-[0.65rem] font-semibold tracking-[0.06em] ${thInputText}`}>{configDef.name}</span>
                  <button onClick={() => setConfigDef(null)}
                    className={`${font} text-[0.65rem] ${thLabel} hover:text-[#c0c8d8] bg-transparent border-none cursor-pointer p-0 leading-none transition-colors`}>✕</button>
                </div>
                <div className="flex items-center gap-1.5">
                  {(['W', 'H'] as const).map(dim => (
                    <label key={dim} className={`${font} text-[0.58rem] ${thLabel} flex items-center gap-1 flex-1`}>
                      {dim}
                      <input type="number" value={dim === 'W' ? configW : configH} step={0.1} min={0.3} max={20}
                        onChange={e => dim === 'W' ? setConfigW(Number(e.target.value)) : setConfigH(Number(e.target.value))}
                        className={`${font} flex-1 min-w-0 border ${thInputBorder} rounded-[2px] text-[#C9A84C] text-[0.7rem] px-1 py-0.5 text-center focus:outline-none focus:border-[rgba(201,168,76,0.6)]`}
                        style={inputStyle}
                      />
                      m
                    </label>
                  ))}
                </div>
                <button onClick={() => api.placeFurnitureAtCenter(configDef, configW * 100, configH * 100)}
                  className={`${font} w-full text-[0.6rem] tracking-[0.06em] text-[#C9A84C] bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.4)] rounded-[2px] py-1.5 cursor-pointer hover:bg-[rgba(201,168,76,0.25)] hover:border-[rgba(201,168,76,0.65)] transition-colors`}>
                  Place on canvas
                </button>
              </div>
            )}

            {/* Furniture catalogue */}
            <div className="flex flex-col gap-3">
              {Object.entries(catalogueByCategory).map(([cat, items]) => (
                <div key={cat}>
                  <span className={`${font} block text-[0.58rem] tracking-[0.15em] uppercase ${thLabel} pb-1.5 border-b ${thPanelBorder} mb-1.5`}>{cat}</span>
                  <div className="grid grid-cols-2 gap-1">
                    {items.map(def => (
                      <button
                        key={`${def.id}-${def.name}`}
                        title={`${def.name} — ${dimsLabel(def)}`}
                        onClick={() => openConfig(def)}
                        onMouseDown={(e) => { if (e.button === 0) { openConfig(def); api.startSidebarDrag(def, e.nativeEvent) } }}
                        style={{ backgroundColor: dark ? 'rgba(17,34,64,0.4)' : 'rgba(255,255,255,0.5)' }}
                        className={[
                          font,
                          'flex flex-col items-center gap-1 p-1.5 text-center rounded-[2px] cursor-grab',
                          'border',
                          dark ? 'border-[rgba(201,168,76,0.15)]' : 'border-[rgba(120,90,30,0.2)]',
                          dark ? 'hover:bg-[rgba(17,34,64,0.8)]' : 'hover:bg-[rgba(255,255,255,0.8)]',
                          dark ? 'hover:border-[rgba(201,168,76,0.4)]' : 'hover:border-[rgba(120,90,30,0.4)]',
                          dark ? 'text-[rgba(192,200,216,0.8)]' : 'text-[rgba(60,50,30,0.85)]',
                          'hover:text-[#C9A84C] transition-colors duration-100',
                        ].join(' ')}
                      >
                        <span
                          className="w-7 h-7 flex items-center justify-center text-[rgba(201,168,76,0.75)] overflow-hidden [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: def.icon }}
                        />
                        <span className="text-[0.55rem] leading-tight">{def.name}</span>
                        <span className="text-[0.5rem] text-[rgba(136,150,176,0.6)]">{dimsLabel(def)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
