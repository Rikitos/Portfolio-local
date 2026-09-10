import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGame2048, SIZE, MAX_CHARGE, TILE_COLORS, HIGH_TILE, TILE_PCT, cellPct, fontSizeFor } from './2048/useGame2048'

/** STYLES **/
const font = "font-['Palatino_Linotype',Palatino,serif]"

/** BUTTON SUBCOMPONENTS **/
// Both buttons manage their own hover state in JS rather than a Tailwind `hover:` class,
// because their background is an inline style (driven by the dark/light prop) which always
// wins the cascade over a plain hover class — see CLAUDE.md's note on avoiding dark: variants.
function GhostButton({ label, onClick, dark, disabled = false }: { label: string; onClick: () => void; dark: boolean; disabled?: boolean }) {
  const [hover, setHover] = useState(false)
  const bg = disabled ? (dark ? '#182739' : '#c4c9d8') : hover ? (dark ? '#2f4d73' : '#c0c6d4') : (dark ? '#243D5C' : '#cdd2e0')
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`${font} text-[0.7rem] tracking-[0.15em] uppercase px-4 py-2 rounded-sm border transition-colors duration-150 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      style={{ color: dark ? '#c0c8d8' : '#1a2035', borderColor: 'rgba(201,168,76,0.35)', backgroundColor: bg }}
    >
      {label}
    </button>
  )
}

function AccentButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`${font} text-[0.75rem] tracking-[0.15em] uppercase px-5 py-2.5 rounded-sm cursor-pointer transition-colors duration-150`}
      style={{ color: '#f9f6f2', backgroundColor: hover ? '#dab958' : '#C9A84C' }}
    >
      {label}
    </button>
  )
}

// Feather-style stroke icons — sized to inherit color from the button via currentColor
function UndoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M3.51 13a9 9 0 1 0 2.13-9.36L3 7" />
    </svg>
  )
}
function SwapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4L3 8l4 4" />
      <path d="M3 8h15" />
      <path d="M17 20l4-4-4-4" />
      <path d="M21 16H6" />
    </svg>
  )
}
function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

// Icon button for the special actions — a hover tooltip explains what it does since the
// icon alone doesn't convey the milestone that unlocks it or the remaining use count.
function ChargeButton({ icon, hint, count, onClick, dark, active = false }: {
  icon: React.ReactNode
  hint: string
  count: number
  onClick: () => void
  dark: boolean
  active?: boolean
}) {
  const [hover, setHover] = useState(false)
  const disabled = count <= 0
  const bg = disabled
    ? (dark ? '#182739' : '#c4c9d8')
    : active
      ? '#C9A84C'
      : hover
        ? (dark ? '#2f4d73' : '#c0c6d4')
        : (dark ? '#243D5C' : '#cdd2e0')

  return (
    <div className="relative">
      {/* No `disabled` attribute — disabled form elements don't fire mouse events in browsers,
          which would silently kill the hover tooltip. Click is guarded manually instead. */}
      <button
        onClick={() => { if (!disabled) onClick() }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-disabled={disabled}
        aria-label={`${hint} (${count} of ${MAX_CHARGE} left)`}
        className={`relative w-9 h-9 flex items-center justify-center rounded-sm border transition-colors duration-150 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        style={{ color: active ? '#1a2035' : (dark ? '#c0c8d8' : '#1a2035'), borderColor: 'rgba(201,168,76,0.35)', backgroundColor: bg }}
      >
        <span className="scale-[0.8]">{icon}</span>
        <span
          className={`${font} absolute -top-1.5 -right-1.5 flex items-center justify-center w-3.5 h-3.5 rounded-full text-[0.5rem] font-bold`}
          style={{ backgroundColor: '#C9A84C', color: '#1a2035' }}
        >
          {count}
        </span>
      </button>

      {/* Hover tooltip — explains the action and what unlocked it, shown regardless of charge count */}
      {hover && (
        <div
          className={`${font} absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-max max-w-[160px] text-center px-2.5 py-1.5 rounded text-[0.7rem] leading-snug pointer-events-none`}
          style={{ backgroundColor: dark ? '#0A1628' : '#1a2035', color: '#e4e8f0' }}
        >
          {hint}
        </div>
      )}
    </div>
  )
}

interface Game2048PageProps {
  dark: boolean
}

/** COMPONENT **/
export default function Game2048Page({ dark }: Game2048PageProps) {
  const { t } = useTranslation()
  const { state, dispatch, onTouchStart, onTouchEnd } = useGame2048()

  const pageBg  = dark ? '#112240' : '#d8dce8'
  const boardBg = dark ? '#243D5C' : '#bbada0'
  const cellBg  = dark ? 'rgba(17,34,64,0.4)' : 'rgba(238,228,218,0.35)'
  const text    = dark ? '#c0c8d8' : '#1a2035'
  const label   = dark ? '#8896b0' : '#5a6480'
  const accent  = '#C9A84C'
  // Score and best boxes share a family but use distinct backgrounds so they read as separate stats at a glance
  const scoreBg = boardBg
  const bestBg  = dark ? '#4a3a1f' : '#c9ab6b'
  const bestValueColor = dark ? '#f9f6f2' : '#2a1f0a'

  const clickable = state.pendingAction !== null

  return (
    // pt clears the fixed header (which otherwise overlaps this page's top content); min-h subtracts its height from the viewport
    <main
      className="flex flex-col items-center min-h-[calc(100vh-64px)] px-4 pt-24 pb-12 transition-colors duration-300"
      style={{ backgroundColor: pageBg }}
    >
      <div className="w-full max-w-[420px]">

        <div className="flex items-center justify-between mb-4">
          <h1 className={`${font} font-normal text-[2rem] sm:text-[2.6rem]`} style={{ color: text }}>{t('games.game2048.title')}</h1>

          <div className="flex gap-2">
            <div className="rounded px-4 py-2 text-center min-w-[68px]" style={{ backgroundColor: scoreBg }}>
              <div className={`${font} text-[0.6rem] tracking-[0.15em] uppercase`} style={{ color: '#eee4da' }}>{t('games.game2048.score')}</div>
              <div className={`${font} text-[1.1rem] font-bold`} style={{ color: '#f9f6f2' }}>{state.score}</div>
            </div>
            <div className="rounded px-4 py-2 text-center min-w-[68px]" style={{ backgroundColor: bestBg }}>
              <div className={`${font} text-[0.6rem] tracking-[0.15em] uppercase`} style={{ color: '#f3e6c9' }}>{t('games.game2048.best')}</div>
              <div className={`${font} text-[1.1rem] font-bold`} style={{ color: bestValueColor }}>{state.best}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className={`${font} text-[0.85rem]`} style={{ color: label }}>
            {t('games.game2048.tagline')}
          </p>
          <GhostButton label={t('games.game2048.newGame')} dark={dark} onClick={() => dispatch({ type: 'RESTART' })} />
        </div>

        {/* Special actions — earned by first creating a 128 / 256 / 512 tile, max 2 uses each */}
        <div className="flex justify-center gap-2 mb-3">
          <ChargeButton
            icon={<UndoIcon />}
            hint={t('games.game2048.undoHint')}
            count={state.charges.undo}
            dark={dark}
            onClick={() => dispatch({ type: 'UNDO' })}
          />
          <ChargeButton
            icon={<SwapIcon />}
            hint={t('games.game2048.swapHint')}
            count={state.charges.swap}
            dark={dark}
            active={state.pendingAction === 'swap'}
            onClick={() => dispatch({ type: 'START_SWAP' })}
          />
          <ChargeButton
            icon={<DeleteIcon />}
            hint={t('games.game2048.deleteHint')}
            count={state.charges.delete}
            dark={dark}
            active={state.pendingAction === 'delete'}
            onClick={() => dispatch({ type: 'START_DELETE' })}
          />
        </div>

        {state.pendingAction && (
          <div className="flex items-center justify-between mb-3 rounded px-3 py-2" style={{ backgroundColor: dark ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.15)' }}>
            <span className={`${font} text-[0.8rem]`} style={{ color: text }}>
              {state.pendingAction === 'swap'
                ? (state.selectedTileId === null ? t('games.game2048.pickFirst') : t('games.game2048.pickSecond'))
                : t('games.game2048.pickDelete')}
            </span>
            <button
              onClick={() => dispatch({ type: 'CANCEL_PENDING' })}
              className={`${font} text-[0.7rem] uppercase tracking-wider cursor-pointer`}
              style={{ color: accent }}
            >
              {t('games.game2048.cancel')}
            </button>
          </div>
        )}

        {/* Board — touch-none stops mobile Safari from scrolling the page while swiping */}
        <div
          className="relative rounded-md p-2 select-none touch-none"
          style={{ backgroundColor: boardBg }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative w-full aspect-square">
            {/* Static background cells — never move, so no animation classes needed */}
            {Array.from({ length: SIZE * SIZE }).map((_, i) => {
              const r = Math.floor(i / SIZE), c = i % SIZE
              return (
                <div
                  key={`bg-${i}`}
                  className="absolute rounded"
                  style={{ left: `${cellPct(c)}%`, top: `${cellPct(r)}%`, width: `${TILE_PCT}%`, height: `${TILE_PCT}%`, backgroundColor: cellBg }}
                />
              )
            })}

            {/* Animated tile layer — each tile keeps its id across moves so React reuses the DOM node
                and the left/top transition actually plays instead of the tile just teleporting */}
            {state.tiles.map(tile => {
              const colors = TILE_COLORS[tile.value] ?? HIGH_TILE
              const isSelected = tile.id === state.selectedTileId
              return (
                <div
                  key={tile.id}
                  onClick={() => clickable && dispatch({ type: 'PICK_TILE', id: tile.id })}
                  className={[
                    'absolute rounded flex items-center justify-center font-bold',
                    font, fontSizeFor(tile.value),
                    'transition-all duration-200 ease-in-out',
                    tile.isNew ? 'animate-[tile-pop_180ms_ease-out]' : '',
                    tile.isMerged ? 'animate-[tile-merge_280ms_ease-in-out]' : '',
                    clickable ? 'cursor-pointer' : '',
                  ].join(' ')}
                  style={{
                    left: `${cellPct(tile.c)}%`,
                    top: `${cellPct(tile.r)}%`,
                    width: `${TILE_PCT}%`,
                    height: `${TILE_PCT}%`,
                    backgroundColor: colors.bg,
                    color: colors.text,
                    boxShadow: clickable ? (isSelected ? '0 0 0 3px #C9A84C' : '0 0 0 2px rgba(201,168,76,0.5)') : 'none',
                  }}
                >
                  {tile.value}
                </div>
              )
            })}
          </div>

          {/* Win / game-over overlay */}
          {(state.status === 'won' || state.status === 'over') && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md"
              style={{ backgroundColor: dark ? 'rgba(17,34,64,0.75)' : 'rgba(238,228,218,0.75)' }}
            >
              <p className={`${font} text-[1.6rem] font-bold`} style={{ color: text }}>
                {state.status === 'won' ? t('games.game2048.win') : t('games.game2048.gameOver')}
              </p>
              <div className="flex gap-3">
                {state.status === 'won' && (
                  <GhostButton label={t('games.game2048.keepPlaying')} dark={dark} onClick={() => dispatch({ type: 'KEEP_PLAYING' })} />
                )}
                <AccentButton label={t('games.game2048.tryAgain')} onClick={() => dispatch({ type: 'RESTART' })} />
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
