import { useCalculator } from './calculator/useCalculator'

/** STYLES **/
const font = 'font-body'

/** COMPONENT **/
export default function CalculatorPage() {
  const { state, dispatch, expression } = useCalculator()

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
  const font = 'font-body'
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
