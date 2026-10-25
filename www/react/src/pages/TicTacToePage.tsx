import { useTranslation } from 'react-i18next'
import { useTicTacToe } from './tic-tac-toe/useTicTacToe'

/** STYLES **/
const font = 'font-body'

/** COMPONENT **/
export default function TicTacToePage() {
  const { t } = useTranslation()
  const { state, dispatch } = useTicTacToe()

  // Derive the status message from state — no separate status state needed
  const status = state.winner === 'draw'
    ? t('games.ticTacToe.draw')
    : state.winner
      ? t('games.ticTacToe.win', { player: state.winner })
      : t('games.ticTacToe.turn', { player: state.current })

  return (
    // min-h subtracts the fixed header height (64px) so the game fills the remaining viewport
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 bg-slate-200 dark:bg-navy-800 transition-colors duration-300">

      <h1 className={`font-display font-normal text-[2.4rem] sm:text-[3rem] text-[#1a2035] dark:text-[#c0c8d8] mb-5`}>
        {t('games.ticTacToe.title')}
      </h1>

      {/* min-h keeps the layout stable — prevents the board from jumping when text changes */}
      <p className={`${font} text-[1rem] sm:text-[1.2rem] text-[#5a6480] dark:text-[#8896b0] mb-4 min-h-[1.4em]`}>
        {status}
      </p>

      {/* Board — 3×3 grid rendered from the flat board array */}
      <div className="grid grid-cols-3 gap-1.5 mb-6">
        {state.board.map((cell, i) => {
          const isWinner = state.winLine.includes(i)
          const isDisabled = !!state.winner  // lock the whole board once game ends

          return (
            <button
              key={i}
              onClick={() => dispatch({ type: 'CLICK', index: i })}
              // HTML disabled prevents clicks on claimed cells; reducer also guards this
              disabled={isDisabled || !!cell}
              className={[
                'w-[90px] h-[90px] sm:w-[120px] sm:h-[120px]',
                font,
                'text-[2.2rem] sm:text-[3rem]',
                'border border-[rgba(201,168,76,0.25)]',
                'bg-[#cdd2e0] dark:bg-navy-700 transition-colors duration-150',
                // Only show hover effect on empty, active cells
                !cell && !isDisabled ? 'hover:bg-[#c4c9d8] dark:hover:bg-navy-600 cursor-pointer' : 'cursor-default',
                // Gold tint highlights the winning three cells
                isWinner ? '!bg-[rgba(201,168,76,0.15)]' : '',
                // X is gold, O is charcoal in light / silver in dark
                cell === 'X' ? 'text-[#C9A84C]' : 'text-[#1a2035] dark:text-[#c0c8d8]',
              ].join(' ')}
            >
              {cell}
            </button>
          )
        })}
      </div>

      {/* Restart */}
      <button
        onClick={() => dispatch({ type: 'RESTART' })}
        className={`${font} text-[0.75rem] tracking-[0.2em] uppercase text-[#1a2035] dark:text-[#C9A84C] bg-[#cdd2e0] dark:bg-navy-700 border border-[rgba(201,168,76,0.35)] hover:text-[#C9A84C] hover:bg-[#e4e8f0] dark:hover:text-[#C9A84C] dark:hover:bg-navy-900 hover:border-[rgba(201,168,76,0.5)] px-7 py-2.5 rounded-sm transition-colors cursor-pointer`}
      >
        {t('games.ticTacToe.restart')}
      </button>

    </main>
  )
}
