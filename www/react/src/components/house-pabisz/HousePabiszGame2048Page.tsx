/**
 * Themed 2048 sub-page — same shell/header(sub-page mode)/footer pattern as
 * the other sketches. Game rules, best-score persistence, and keyboard/
 * touch controls are shared with the classic page via useGame2048; tiles
 * keep the game's own classic colour identity (TILE_COLORS, also shared)
 * on purpose — only the surrounding chrome is reskinned.
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import HousePabiszShell from './HousePabiszShell'
import HousePabiszHeader from './HousePabiszHeader'
import HousePabiszFooter from './HousePabiszFooter'
import { housePabiszArt } from './assets'
import {
  useGame2048, SIZE, MAX_CHARGE, TILE_COLORS, HIGH_TILE, TILE_PCT, cellPct, fontSizeFor,
} from '../../pages/2048/useGame2048'

const friezeBeforeFooter = housePabiszArt.friezeBands[3]

/** TYPES **/
interface HousePabiszGame2048PageProps {
  dark: boolean
  onToggleDark: () => void
  onShowClassic: () => void
}

/** ICONS — same feather-style strokes as the classic page, sized to inherit color via currentColor **/
function UndoIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" /><path d="M3.51 13a9 9 0 1 0 2.13-9.36L3 7" />
    </svg>
  )
}
function SwapIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4L3 8l4 4" /><path d="M3 8h15" /><path d="M17 20l4-4-4-4" /><path d="M21 16H6" />
    </svg>
  )
}
function DeleteIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

/** SUBCOMPONENT — icon button for the special actions, gold-tinted tooltip on hover **/
function ChargeButton({ icon, hint, count, onClick, active = false }: {
  icon: React.ReactNode
  hint: string
  count: number
  onClick: () => void
  active?: boolean
}) {
  const [hover, setHover] = useState(false)
  const disabled = count <= 0
  return (
    <div className="g2048-charge">
      {/* No `disabled` attribute — disabled form elements don't fire mouse events in
          browsers, which would silently kill the hover tooltip. Click is guarded manually. */}
      <button
        type="button"
        onClick={() => { if (!disabled) onClick() }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-disabled={disabled}
        aria-label={`${hint} (${count} of ${MAX_CHARGE} left)`}
        className={`g2048-charge-btn ${active ? 'active' : ''} ${disabled ? 'is-disabled' : ''}`}
      >
        {icon}
        <span className="g2048-charge-count">{count}</span>
      </button>
      {hover && <div className="g2048-tooltip">{hint}</div>}
    </div>
  )
}

/** COMPONENT **/
export default function HousePabiszGame2048Page({ dark, onToggleDark, onShowClassic }: HousePabiszGame2048PageProps) {
  const { t } = useTranslation()
  const { state, dispatch, onTouchStart, onTouchEnd } = useGame2048()
  const clickable = state.pendingAction !== null

  return (
    <HousePabiszShell>
      <HousePabiszHeader dark={dark} onToggleDark={onToggleDark} onShowClassic={onShowClassic} isHome={false} />

      <section className="g2048-page tex-linen linen-wash">
        <div className="wrap">

          <div className="g2048-head">
            <h1>{t('housePabisz.game2048.title')}</h1>
            <div className="g2048-stats">
              <div className="g2048-stat">
                <div className="label">{t('housePabisz.game2048.score')}</div>
                <div className="value">{state.score}</div>
              </div>
              <div className="g2048-stat best">
                <div className="label">{t('housePabisz.game2048.best')}</div>
                <div className="value">{state.best}</div>
              </div>
            </div>
          </div>

          <div className="g2048-sub">
            <p>{t('housePabisz.game2048.subtitle')}</p>
            <button type="button" className="btn btn-outline" onClick={() => dispatch({ type: 'RESTART' })}>
              {t('housePabisz.game2048.newGame')}
            </button>
          </div>

          {/* Special actions — earned by first creating a 128 / 256 / 512 tile, max 2 uses each */}
          <div className="g2048-charges">
            <ChargeButton icon={<UndoIcon />} hint={t('housePabisz.game2048.undoHint')} count={state.charges.undo} onClick={() => dispatch({ type: 'UNDO' })} />
            <ChargeButton icon={<SwapIcon />} hint={t('housePabisz.game2048.swapHint')} count={state.charges.swap} active={state.pendingAction === 'swap'} onClick={() => dispatch({ type: 'START_SWAP' })} />
            <ChargeButton icon={<DeleteIcon />} hint={t('housePabisz.game2048.deleteHint')} count={state.charges.delete} active={state.pendingAction === 'delete'} onClick={() => dispatch({ type: 'START_DELETE' })} />
          </div>

          {state.pendingAction && (
            <div className="g2048-pending">
              <span>
                {state.pendingAction === 'swap'
                  ? (state.selectedTileId === null ? t('housePabisz.game2048.pickFirst') : t('housePabisz.game2048.pickSecond'))
                  : t('housePabisz.game2048.pickDelete')}
              </span>
              <button type="button" onClick={() => dispatch({ type: 'CANCEL_PENDING' })}>
                {t('housePabisz.game2048.cancel')}
              </button>
            </div>
          )}

          {/* Board — touch-action:none (via CSS) stops mobile Safari from scrolling the page while swiping */}
          <div className="g2048-board" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div className="relative w-full aspect-square">
              {Array.from({ length: SIZE * SIZE }).map((_, i) => {
                const r = Math.floor(i / SIZE), c = i % SIZE
                return (
                  <div
                    key={`bg-${i}`}
                    className="g2048-cell"
                    style={{ left: `${cellPct(c)}%`, top: `${cellPct(r)}%`, width: `${TILE_PCT}%`, height: `${TILE_PCT}%` }}
                  />
                )
              })}

              {state.tiles.map((tile) => {
                const colors = TILE_COLORS[tile.value] ?? HIGH_TILE
                const isSelected = tile.id === state.selectedTileId
                return (
                  <div
                    key={tile.id}
                    onClick={() => clickable && dispatch({ type: 'PICK_TILE', id: tile.id })}
                    className={[
                      'g2048-tile', fontSizeFor(tile.value),
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
                      boxShadow: clickable ? (isSelected ? '0 0 0 3px var(--gold)' : '0 0 0 2px color-mix(in srgb, var(--gold) 50%, transparent)') : 'none',
                    }}
                  >
                    {tile.value}
                  </div>
                )
              })}
            </div>

            {(state.status === 'won' || state.status === 'over') && (
              <div className="g2048-overlay">
                <p>{state.status === 'won' ? t('housePabisz.game2048.win') : t('housePabisz.game2048.gameOver')}</p>
                <div className="btn-row">
                  {state.status === 'won' && (
                    <button type="button" className="btn btn-outline" onClick={() => dispatch({ type: 'KEEP_PLAYING' })}>
                      {t('housePabisz.game2048.keepPlaying')}
                    </button>
                  )}
                  <button type="button" className="btn" onClick={() => dispatch({ type: 'RESTART' })}>
                    {t('housePabisz.game2048.tryAgain')}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      <div className="frieze-band" style={{ backgroundImage: `url(${friezeBeforeFooter})` }} aria-hidden="true" />

      <HousePabiszFooter />
    </HousePabiszShell>
  )
}
