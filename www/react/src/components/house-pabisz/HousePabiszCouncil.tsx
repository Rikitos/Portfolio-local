/** IMPORTS **/
import { useTranslation } from 'react-i18next'
import { useReveal } from './hooks'
import WordReveal from './WordReveal'
import { housePabiszArt } from './assets'

/** DATA **/
const OFFICES = [
  { letter: 'C', titleKey: 'chancellorTitle', descKey: 'chancellorDesc' },
  { letter: 'S', titleKey: 'stewardTitle', descKey: 'stewardDesc' },
  { letter: 'Y', titleKey: 'spymasterTitle', descKey: 'spymasterDesc' },
  { letter: 'P', titleKey: 'physicianTitle', descKey: 'physicianDesc' },
] as const

/** SUBCOMPONENTS **/
function CouncilRow({ letter, titleKey, descKey, visible }: (typeof OFFICES)[number] & { visible: boolean }) {
  const { t } = useTranslation()
  return (
    <div className={`council-row reveal ${visible ? 'visible' : ''}`}>
      <div className="medallion-sm">{letter}</div>
      <div className="c-title">{t(`housePabisz.council.${titleKey}`)}</div>
      <WordReveal as="div" className="c-desc" text={t(`housePabisz.council.${descKey}`)} active={visible} baseDelayMs={300} />
    </div>
  )
}

/** COMPONENT **/
export default function HousePabiszCouncil() {
  const { t } = useTranslation()
  // one shared trigger for the whole list + bio, so everything animates
  // together off the first row crossing into view — not each row/paragraph
  // watching itself and firing separately as you scroll past it.
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section id="council" className="tex-linen linen-wash">
      <div className="wrap">
        <span className="chapter">{t('housePabisz.council.chapter')}</span>
        <div className="section-head"><h2>{t('housePabisz.council.title')}</h2><span className="eyebrow">{t('housePabisz.council.eyebrow')}</span></div>
        <div className="section-rule" />

        <div className="council-grid">
          <div>
            <div ref={ref} className="council-list">
              {OFFICES.map((office) => <CouncilRow key={office.letter} {...office} visible={visible} />)}
            </div>

            <div className={`bio reveal ${visible ? 'visible' : ''}`}>
              <WordReveal text={t('housePabisz.council.bio')} active={visible} baseDelayMs={300} />
            </div>
          </div>

          <div className="council-portrait">
            <img src={housePabiszArt.portrait} alt={t('housePabisz.council.portraitAria')} />
          </div>
        </div>
      </div>
    </section>
  )
}
