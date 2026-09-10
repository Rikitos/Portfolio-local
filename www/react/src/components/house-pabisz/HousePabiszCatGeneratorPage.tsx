/**
 * Themed Cat Generator sub-page — same shell/header(sub-page mode)/footer
 * pattern as the Calculator and Tic Tac Toe sketches. Image-cycling logic
 * is shared with the classic page via useCatGenerator; the frame reuses the
 * same 6px-card-border + 1px-outline treatment as .duchy-shot, tying it to
 * the same "framed photograph" motif used for project screenshots.
 */
import { useTranslation } from 'react-i18next'
import HousePabiszShell from './HousePabiszShell'
import HousePabiszHeader from './HousePabiszHeader'
import HousePabiszFooter from './HousePabiszFooter'
import { housePabiszArt } from './assets'
import { CATS, useCatGenerator } from '../../pages/cat-generator/useCatGenerator'

const friezeBeforeFooter = housePabiszArt.friezeBands[3]

/** TYPES **/
interface HousePabiszCatGeneratorPageProps {
  dark: boolean
  onToggleDark: () => void
  onShowClassic: () => void
}

/** COMPONENT **/
export default function HousePabiszCatGeneratorPage({ dark, onToggleDark, onShowClassic }: HousePabiszCatGeneratorPageProps) {
  const { t } = useTranslation()
  const { current, fading, nextCat } = useCatGenerator()

  return (
    <HousePabiszShell>
      <HousePabiszHeader dark={dark} onToggleDark={onToggleDark} onShowClassic={onShowClassic} isHome={false} />

      <section className="menagerie-page tex-linen linen-wash">
        <div className="wrap">
          <h1>{t('housePabisz.catGenerator.title')}</h1>
          <p className="flavor" style={{ marginTop: 14 }}>{t('housePabisz.catGenerator.subtitle')}</p>

          <div className="menagerie-frame">
            <img src={CATS[current]} alt="" style={{ opacity: fading ? 0 : 1 }} />
          </div>

          <button type="button" className="btn" onClick={nextCat}>
            {t('housePabisz.catGenerator.next')}
          </button>
        </div>
      </section>

      <div className="frieze-band" style={{ backgroundImage: `url(${friezeBeforeFooter})` }} aria-hidden="true" />

      <HousePabiszFooter />
    </HousePabiszShell>
  )
}
