/**
 * Themed Tic Tac Toe sub-page — same shell/header(sub-page mode)/footer
 * pattern as the Calculator sketch. Game rules are shared with the classic
 * page via useTicTacToe; only the presentation (parchment board, status
 * phrasing) differs.
 */
import { useTranslation } from 'react-i18next'
import HousePabiszShell from './HousePabiszShell'
import HousePabiszHeader from './HousePabiszHeader'
import HousePabiszFooter from './HousePabiszFooter'
import { housePabiszArt } from './assets'
import { useTicTacToe } from '../../pages/tic-tac-toe/useTicTacToe'

const friezeBeforeFooter = housePabiszArt.friezeBands[3]

/** TYPES **/
interface HousePabiszTicTacToePageProps {
  dark: boolean
  onToggleDark: () => void
  onShowClassic: () => void
}

/** COMPONENT **/
export default function HousePabiszTicTacToePage({ dark, onToggleDark, onShowClassic }: HousePabiszTicTacToePageProps) {
  const { t } = useTranslation()
  const { state, dispatch } = useTicTacToe()

  const status = state.winner === 'draw'
    ? t('housePabisz.ticTacToe.draw')
    : state.winner
      ? t('housePabisz.ticTacToe.win', { player: state.winner })
      : t('housePabisz.ticTacToe.turn', { player: state.current })

  return (
    <HousePabiszShell>
      <HousePabiszHeader dark={dark} onToggleDark={onToggleDark} onShowClassic={onShowClassic} isHome={false} />

      <section className="board-page tex-linen linen-wash">
        <div className="wrap">
          <h1>{t('housePabisz.ticTacToe.title')}</h1>
          <p className="ttt-status">{status}</p>

          <div className="ttt-board">
            {state.board.map((cell, i) => {
              const isWinner = state.winLine.includes(i)
              const isDisabled = !!state.winner
              return (
                <button
                  key={i}
                  onClick={() => dispatch({ type: 'CLICK', index: i })}
                  disabled={isDisabled || !!cell}
                  className={`ttt-cell ${cell === 'X' ? 'x' : ''} ${isWinner ? 'win' : ''}`}
                >
                  {cell}
                </button>
              )
            })}
          </div>

          <button type="button" className="btn" onClick={() => dispatch({ type: 'RESTART' })}>
            {t('housePabisz.ticTacToe.restart')}
          </button>
        </div>
      </section>

      <div className="frieze-band" style={{ backgroundImage: `url(${friezeBeforeFooter})` }} aria-hidden="true" />

      <HousePabiszFooter />
    </HousePabiszShell>
  )
}
