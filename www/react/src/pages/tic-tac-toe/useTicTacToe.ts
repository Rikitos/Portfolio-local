import { useReducer } from 'react'

/** TYPES **/
export type Player = 'X' | 'O'
export type Cell = Player | ''  // empty string = unclaimed cell

export interface GameState {
  board: Cell[]          // flat array of 9 cells, indexed 0–8 left-to-right, top-to-bottom
  current: Player        // whose turn it is
  winner: Player | 'draw' | null
  winLine: number[]      // indices of the three winning cells (used to highlight them)
}

export type GameAction =
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

/** HOOK **/
// Shared game engine — both the classic and House Pabisz tic-tac-toe pages
// use this so the rules/state logic exists in exactly one place. Status
// text is deliberately NOT built here — each page phrases it in its own
// voice (see TicTacToePage vs HousePabiszTicTacToePage).
export function useTicTacToe() {
  const [state, dispatch] = useReducer(reducer, initialState)
  return { state, dispatch }
}
