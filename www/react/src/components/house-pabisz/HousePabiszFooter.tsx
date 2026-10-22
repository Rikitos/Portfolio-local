/** IMPORTS **/
import { useTranslation } from 'react-i18next'
import { duchies } from '../../data/projects'

const EMAIL = 'krzysiek.pabisz@email.com'

/** COMPONENT **/
export default function HousePabiszFooter() {
  const { t } = useTranslation()

  return (
    <footer className="tex-linen linen-wash">
      <div className="wrap">
        <div className="foot-row">
          <div className="foot-brand">
            <span className="brand-logo" role="img" aria-label="House Pabisz coat of arms" />
            <span className="brand" style={{ fontSize: '.95rem' }}>{t('housePabisz.header.brand')}</span>
          </div>

          <div className="foot-links">
            <div className="foot-col">
              <span className="h">{t('housePabisz.footer.domainHeading')}</span>
              {duchies.map((p) => (
                <a key={p.key} href={p.href} target="_blank" rel="noopener noreferrer">
                  {t(`projects.${p.key}.title`, { defaultValue: p.title })}
                </a>
              ))}
            </div>
            <div className="foot-col">
              <span className="h">{t('housePabisz.footer.diplomacyHeading')}</span>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <a href="https://github.com/Rikitos" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="foot-bottom">{t('housePabisz.footer.tagline', { year: new Date().getFullYear() })}</div>
      </div>
    </footer>
  )
}
