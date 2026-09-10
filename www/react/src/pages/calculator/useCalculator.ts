import { useReducer } from 'react'

/** TYPES **/
export type Operator = '+' | '-' | '*' | '/'

export interface CalcState {
  current: string        // value shown on the display
  previous: string       // left-hand operand stored when an operator is pressed
  operator: Operator | null
  // true after an operator is pressed — next digit starts a fresh number instead of appending
  waitingForOperand: boolean
}

// Discriminated union — each action type carries only the data it needs.
// This is safer than a generic { type, payload } shape because TypeScript
// narrows the payload type automatically inside each case.
export type CalcAction =
  | { type: 'DIGIT'; value: string }
  | { type: 'OPERATOR'; value: Operator }
  | { type: 'DECIMAL' }
  | { type: 'EQUALS' }
  | { type: 'CLEAR' }
  | { type: 'SIGN' }
  | { type: 'PERCENT' }

/** LOGIC **/
const initialState: CalcState = {
  current: '0',
  previous: '',
  operator: null,
  waitingForOperand: false,
}

// toFixed(10) then parseFloat strips trailing zeros from floating-point results
// e.g. 0.1 + 0.2 = 0.30000000000000004 → toFixed(10) → "0.3000000000" → parseFloat → 0.3
function compute(prev: string, curr: string, op: Operator): string {
  const a = parseFloat(prev)
  const b = parseFloat(curr)
  let result: number | 'Error'
  switch (op) {
    case '+': result = a + b; break
    case '-': result = a - b; break
    case '*': result = a * b; break
    case '/': result = b !== 0 ? a / b : 'Error'; break
  }
  if (result === 'Error') return 'Error'
  return String(parseFloat(result.toFixed(10)))
}

// useReducer keeps all state transitions in one place — easier to reason about
// than multiple useState calls that could get out of sync.
function reducer(state: CalcState, action: CalcAction): CalcState {
  switch (action.type) {
    case 'DIGIT': {
      // If waiting for a new operand, replace the display instead of appending
      if (state.waitingForOperand) {
        return { ...state, current: action.value, waitingForOperand: false }
      }
      // Prevent leading zeros (e.g. "007") — replace the lone "0" placeholder
      return {
        ...state,
        current: state.current === '0' ? action.value : state.current + action.value,
      }
    }
    case 'DECIMAL': {
      if (state.waitingForOperand) {
        return { ...state, current: '0.', waitingForOperand: false }
      }
      // Guard: only one decimal point allowed per number
      if (state.current.includes('.')) return state
      return { ...state, current: state.current + '.' }
    }
    case 'OPERATOR': {
      // Chaining operators — compute the pending result first (e.g. 2 + 3 × → shows 5)
      let next = state
      if (state.operator && !state.waitingForOperand) {
        next = { ...state, current: compute(state.previous, state.current, state.operator) }
      }
      return { ...next, previous: next.current, operator: action.value, waitingForOperand: true }
    }
    case 'EQUALS': {
      // Guard: nothing to compute if no operator was set or operand wasn't entered
      if (!state.operator || state.waitingForOperand) return state
      return {
        ...initialState, // reset everything — operator, previous, waitingForOperand
        current: compute(state.previous, state.current, state.operator),
      }
    }
    case 'CLEAR':   return initialState
    case 'SIGN':    return { ...state, current: String(parseFloat(state.current) * -1) }
    case 'PERCENT': return { ...state, current: String(parseFloat(state.current) / 100) }
    default:        return state
  }
}

// Display uses unicode math symbols; the operator stored internally is always ASCII (+, -, *, /)
export const opSymbols: Record<Operator, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' }

/** HOOK **/
// Shared calculator engine — both the classic and House Pabisz calculator
// pages use this so the math logic exists in exactly one place.
export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Expression row shows the previous value + operator while the user types the second operand
  const expression = state.operator
    ? `${state.previous} ${opSymbols[state.operator]}`
    : ''

  return { state, dispatch, expression }
}
