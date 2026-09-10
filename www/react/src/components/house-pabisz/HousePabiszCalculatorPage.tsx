/**
 * Sketch: extending the House Pabisz theme past the homepage. Same shell,
 * header (in "sub-page" mode — see HousePabiszHeader's isHome prop) and
 * footer as the homepage; the calculator itself is reskinned into a small
 * parchment "ledger" using the same CSS variables as everything else.
 * Math logic is shared with the classic /calculator page via useCalculator.
 */
import HousePabiszShell from './HousePabiszShell'
import HousePabiszHeader from './HousePabiszHeader'
import HousePabiszFooter from './HousePabiszFooter'
import { housePabiszArt } from './assets'
import { useCalculator } from '../../pages/calculator/useCalculator'

// same 4th frieze strip used as the last divider (right before the footer)
// on the homepage — reused here for the same "before footer" spot.
const friezeBeforeFooter = housePabiszArt.friezeBands[3]

/** TYPES **/
interface HousePabiszCalculatorPageProps {
  dark: boolean
  onToggleDark: () => void
  onShowClassic: () => void
}

/** SUBCOMPONENT **/
function LedgerBtn({ label, onClick, className = '' }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button type="button" className={`ledger-btn ${className}`} onClick={onClick}>
      {label}
    </button>
  )
}

/** COMPONENT **/
export default function HousePabiszCalculatorPage({ dark, onToggleDark, onShowClassic }: HousePabiszCalculatorPageProps) {
  const { state, dispatch, expression } = useCalculator()

  return (
    <HousePabiszShell>
      <HousePabiszHeader dark={dark} onToggleDark={onToggleDark} onShowClassic={onShowClassic} isHome={false} />

      <section className="ledger-page tex-linen linen-wash">
        <div className="wrap">
          <div className="ledger">
            <div className="ledger-display">
              <div className="ledger-expression">{expression}</div>
              <div className="ledger-current">{state.current}</div>
            </div>

            <div className="ledger-grid">
              <LedgerBtn label="AC" className="clear" onClick={() => dispatch({ type: 'CLEAR' })} />
              <LedgerBtn label="+/−" className="op" onClick={() => dispatch({ type: 'SIGN' })} />
              <LedgerBtn label="%" className="op" onClick={() => dispatch({ type: 'PERCENT' })} />
              <LedgerBtn label="÷" className="op" onClick={() => dispatch({ type: 'OPERATOR', value: '/' })} />

              <LedgerBtn label="7" onClick={() => dispatch({ type: 'DIGIT', value: '7' })} />
              <LedgerBtn label="8" onClick={() => dispatch({ type: 'DIGIT', value: '8' })} />
              <LedgerBtn label="9" onClick={() => dispatch({ type: 'DIGIT', value: '9' })} />
              <LedgerBtn label="×" className="op" onClick={() => dispatch({ type: 'OPERATOR', value: '*' })} />

              <LedgerBtn label="4" onClick={() => dispatch({ type: 'DIGIT', value: '4' })} />
              <LedgerBtn label="5" onClick={() => dispatch({ type: 'DIGIT', value: '5' })} />
              <LedgerBtn label="6" onClick={() => dispatch({ type: 'DIGIT', value: '6' })} />
              <LedgerBtn label="−" className="op" onClick={() => dispatch({ type: 'OPERATOR', value: '-' })} />

              <LedgerBtn label="1" onClick={() => dispatch({ type: 'DIGIT', value: '1' })} />
              <LedgerBtn label="2" onClick={() => dispatch({ type: 'DIGIT', value: '2' })} />
              <LedgerBtn label="3" onClick={() => dispatch({ type: 'DIGIT', value: '3' })} />
              <LedgerBtn label="+" className="op" onClick={() => dispatch({ type: 'OPERATOR', value: '+' })} />

              <LedgerBtn label="0" className="span2" onClick={() => dispatch({ type: 'DIGIT', value: '0' })} />
              <LedgerBtn label="." onClick={() => dispatch({ type: 'DECIMAL' })} />
              <LedgerBtn label="=" className="equals" onClick={() => dispatch({ type: 'EQUALS' })} />
            </div>
          </div>
        </div>
      </section>

      <div className="frieze-band" style={{ backgroundImage: `url(${friezeBeforeFooter})` }} aria-hidden="true" />

      <HousePabiszFooter />
    </HousePabiszShell>
  )
}
