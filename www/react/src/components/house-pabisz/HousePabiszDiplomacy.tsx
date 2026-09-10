/** IMPORTS **/
import { useTranslation } from 'react-i18next'
import { useReveal } from './hooks'
import WordReveal from './WordReveal'

const EMAIL = 'krzysiek.pabisz@email.com'

/** COMPONENT **/
export default function HousePabiszDiplomacy() {
  const { t } = useTranslation()
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section id="diplomacy" className="tex-linen linen-wash">
      <div className="wrap">
        <span className="chapter">{t('housePabisz.diplomacy.chapter')}</span>
        <div className="section-head centered">
          <h2>{t('housePabisz.diplomacy.title')}</h2>
          <span className="coat-emblem" role="img" aria-label="Personal coat of arms" />
          <span className="eyebrow">{t('housePabisz.diplomacy.eyebrow')}</span>
        </div>
        <div className="section-rule" />

        <div ref={ref} className={`diplomacy-panel reveal ${visible ? 'visible' : ''}`}>
          <div className="diplomacy-bg">
            <div className="mid" />
            <div className="cap top" />
            <div className="cap bottom" />
          </div>
          <div className="diplomacy-inner">
            <span className="eyebrow">{t('housePabisz.diplomacy.openAlliance')}</span>
            <h2 style={{ marginTop: 16 }}>{t('housePabisz.diplomacy.question')}</h2>
            <WordReveal as="p" className="flavor" text={t('housePabisz.diplomacy.flavor')} active={visible} baseDelayMs={300} />
            <div className="diplomacy-actions">
              <a href={`mailto:${EMAIL}`} className="seal-btn" aria-label={t('housePabisz.diplomacy.emailAria')}>KP</a>
              <a href={`mailto:${EMAIL}`} className="diplomacy-email">{EMAIL}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
