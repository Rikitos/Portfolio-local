import { useReducer } from 'react'

/** TYPES **/
type Player = 'X' | 'O'
type Cell = Player | ''  // empty string = unclaimed cell

interface GameState {
  board: Cell[]          // flat array of 9 cells, indexed 0–8 left-to-right, top-to-bottom
  current: Player        // whose turn it is
  winner: Player | 'draw' | null
  winLine: number[]      // indices of the three winning cells (used to highlight them)
}

type GameAction =
  | { type: 'CLICK'; index: number }
  | { type: 'RESTART' }

/** LOGIC **/
// All 8 possible winning combinations as cell index triplets
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
]

// Returns the winning player + their line, 'draw' if all cells filled, or null if game ongoing
function checkWinner(board: Cell[]): { winner: Player; line: number[] } | { winner: 'draw'; line: [] } | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: [a, b, c] }
    }
  }
  if (board.every(c => c !== '')) return { winner: 'draw', line: [] }
  return null
}

const initialState: GameState = {
  board: Array(9).fill(''),
  current: 'X',
  winner: null,
  winLine: [],
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CLICK': {
      const { index } = action
      // Ignore clicks on already-claimed cells or after the game is over
      if (state.winner || state.board[index]) return state

      // Spread into a new array — never mutate state directly in a reducer
      const board = [...state.board]
      board[index] = state.current

      const result = checkWinner(board)
      if (result) {
        // Keep current player in state so the status message reads "Player X wins"
        return { board, current: state.current, winner: result.winner, winLine: result.line }
      }

      // Alternate player and clear win data (no winner yet)
      return { board, current: state.current === 'X' ? 'O' : 'X', winner: null, winLine: [] }
    }
    case 'RESTART':
      return initialState
    default:
      return state
  }
}

/** STYLES **/
const font = "font-['Palatino_Linotype',Palatino,serif]"

/** COMPONENT **/
export default function TicTacToePage() {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Derive the status message from state — no separate status state needed
  const status = state.winner === 'draw'
    ? "It's a draw!"
    : state.winner
      ? `Player ${state.winner} wins!`
      : `Player ${state.current}'s turn`

  return (
    // min-h subtracts the fixed header height (64px) so the game fills the remaining viewport
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 bg-slate-200 dark:bg-navy-800 transition-colors duration-300">

      <h1 className={`${font} font-normal text-[1.8rem] sm:text-[2.4rem] text-[#1a2035] dark:text-[#c0c8d8] mb-5`}>
        Tic Tac Toe
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
        Restart
      </button>

    </main>
  )
}
