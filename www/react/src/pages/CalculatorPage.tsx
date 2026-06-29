import { useReducer } from 'react'

/** TYPES **/
type Operator = '+' | '-' | '*' | '/'

interface CalcState {
  current: string        // value shown on the display
  previous: string       // left-hand operand stored when an operator is pressed
  operator: Operator | null
  // true after an operator is pressed — next digit starts a fresh number instead of appending
  waitingForOperand: boolean
}

// Discriminated union — each action type carries only the data it needs.
// This is safer than a generic { type, payload } shape because TypeScript
// narrows the payload type automatically inside each case.
type CalcAction =
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

/** STYLES **/
const font = "font-['Palatino_Linotype',Palatino,serif]"

// Display uses unicode math symbols; the operator stored internally is always ASCII (+, -, *, /)
const opSymbols: Record<Operator, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' }

/** COMPONENT **/
export default function CalculatorPage() {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Expression row shows the previous value + operator while the user types the second operand
  const expression = state.operator
    ? `${state.previous} ${opSymbols[state.operator]}`
    : ''

  return (
    // min-h subtracts the fixed header height (64px) so the calculator fills the remaining viewport
    <main className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 bg-slate-200 dark:bg-navy-700 transition-colors duration-300">
      <div className="w-[280px] sm:w-[320px] border-2 border-[rgba(201,168,76,0.5)] rounded-lg overflow-hidden bg-[#cdd2e0] dark:bg-navy-800">

        {/* Display — fixed height so the box doesn't resize when the expression row appears */}
        <div className="bg-[#c8cdd8] dark:bg-navy-600 px-4 text-right h-[88px] sm:h-[96px] flex flex-col justify-end pb-3">
          {/* Expression row: shows e.g. "12 ×" while entering the second operand */}
          <div className={`${font} text-[0.85rem] text-[rgba(201,168,76,0.6)] dark:text-[rgba(201,168,76,0.5)] h-[1.2em] mb-1 truncate`}>
            {expression}
          </div>
          <div className={`${font} text-[2.2rem] sm:text-[2.6rem] text-[#1a2035] dark:text-[#c0c8d8] truncate leading-none`}>
            {state.current}
          </div>
        </div>

        {/* Button grid — 4 columns, rows map to the classic calculator layout */}
        <div className="grid grid-cols-4">
          {/* Row 1 — functions */}
          <Btn label="AC"  className="text-[#e05c4a]" onClick={() => dispatch({ type: 'CLEAR' })} />
          <Btn label="+/−" className="text-[#C9A84C]" onClick={() => dispatch({ type: 'SIGN' })} />
          <Btn label="%"   className="text-[#C9A84C]" onClick={() => dispatch({ type: 'PERCENT' })} />
          <Btn label="÷"   className="text-[#C9A84C]" onClick={() => dispatch({ type: 'OPERATOR', value: '/' })} />
          {/* Row 2 */}
          <Btn label="7" onClick={() => dispatch({ type: 'DIGIT', value: '7' })} />
          <Btn label="8" onClick={() => dispatch({ type: 'DIGIT', value: '8' })} />
          <Btn label="9" onClick={() => dispatch({ type: 'DIGIT', value: '9' })} />
          <Btn label="×" className="text-[#C9A84C]" onClick={() => dispatch({ type: 'OPERATOR', value: '*' })} />
          {/* Row 3 */}
          <Btn label="4" onClick={() => dispatch({ type: 'DIGIT', value: '4' })} />
          <Btn label="5" onClick={() => dispatch({ type: 'DIGIT', value: '5' })} />
          <Btn label="6" onClick={() => dispatch({ type: 'DIGIT', value: '6' })} />
          <Btn label="−" className="text-[#C9A84C]" onClick={() => dispatch({ type: 'OPERATOR', value: '-' })} />
          {/* Row 4 */}
          <Btn label="1" onClick={() => dispatch({ type: 'DIGIT', value: '1' })} />
          <Btn label="2" onClick={() => dispatch({ type: 'DIGIT', value: '2' })} />
          <Btn label="3" onClick={() => dispatch({ type: 'DIGIT', value: '3' })} />
          <Btn label="+" className="text-[#C9A84C]" onClick={() => dispatch({ type: 'OPERATOR', value: '+' })} />
          {/* Row 5 — 0 spans two columns via CSS grid col-span-2 */}
          <Btn label="0" span2 onClick={() => dispatch({ type: 'DIGIT', value: '0' })} />
          <Btn label="." onClick={() => dispatch({ type: 'DECIMAL' })} />
          <Btn label="=" equals onClick={() => dispatch({ type: 'EQUALS' })} />
        </div>

      </div>
    </main>
  )
}

/** BTN SUBCOMPONENT **/
// Extracted so the grid above stays readable — each Btn is one line instead of 5.
// span2 and equals are boolean flags rather than a variant string to keep the props minimal.
function Btn({ label, onClick, className = '', span2 = false, equals = false }: {
  label: string
  onClick: () => void
  className?: string
  span2?: boolean   // makes the button span 2 grid columns (used for "0")
  equals?: boolean  // applies the "=" accent styling
}) {
  const font = "font-['Palatino_Linotype',Palatino,serif]"
  const base = `${font} text-[1.1rem] sm:text-[1.2rem] py-[18px] sm:py-5 cursor-pointer border border-[rgba(201,168,76,0.15)] transition-colors duration-100 text-[#5a6480] dark:text-[#A8B8C8]`
  const bg = equals
    ? 'bg-[#bec4d0] dark:bg-navy-700 hover:bg-[#b4bac8] dark:hover:bg-navy-600 text-[#C9A84C]'
    : 'bg-[#cdd2e0] dark:bg-navy-800 hover:bg-[#c4c9d8] dark:hover:bg-navy-900'

  return (
    <button
      onClick={onClick}
      className={`${base} ${bg} ${span2 ? 'col-span-2' : ''} ${className}`}
    >
      {label}
    </button>
  )
}
