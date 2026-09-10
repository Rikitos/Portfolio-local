/** IMPORTS **/
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { duchies, baronies, projects } from '../../data/projects'
import { useCountUp } from './hooks'
import WordReveal from './WordReveal'

/** COMPONENT **/
export default function HousePabiszHero() {
  const { t } = useTranslation()
  const [flavorActive, setFlavorActive] = useState(false)

  // let the hero's own fade-in (finishes ~950ms) settle before the tagline starts writing itself out
  useEffect(() => {
    const timer = setTimeout(() => setFlavorActive(true), 950)
    return () => clearTimeout(timer)
  }, [])

  const duchyCount = useCountUp(duchies.length)
  const baronyCount = useCountUp(baronies.length)
  const holdingCount = useCountUp(projects.length)

  return (
    <section className="hero" id="top">
      <div className="hero-bg tex-linen" />
      <div className="wrap">
        <div className="sheet">
          <div className="sheet-bg">
            <div className="mid" />
            <div className="cap top" />
            <div className="cap bottom" />
          </div>
          <div className="sheet-content">
            <svg className="flourish fl-tl" viewBox="0 0 46 46"><path d="M2,44 C2,20 20,2 44,2" /><circle cx="44" cy="2" r="2.4" /></svg>
            <svg className="flourish fl-tr" viewBox="0 0 46 46"><path d="M2,44 C2,20 20,2 44,2" /><circle cx="44" cy="2" r="2.4" /></svg>
            <svg className="flourish fl-bl" viewBox="0 0 46 46"><path d="M2,44 C2,20 20,2 44,2" /><circle cx="44" cy="2" r="2.4" /></svg>
            <svg className="flourish fl-br" viewBox="0 0 46 46"><path d="M2,44 C2,20 20,2 44,2" /><circle cx="44" cy="2" r="2.4" /></svg>

            {/* hero-anim-1 lives on this wrapper, not .seal-banner itself — the
                entrance animation holds transform:translateY(0) after it
                finishes (fill-mode:both), which would otherwise permanently
                out-rank .seal-banner:hover's own transform */}
            <div className="hero-anim-1">
              <div className="seal-banner">
                <div className="seal-img" role="img" aria-label={t('housePabisz.hero.sealAria')} />
              </div>
            </div>

            <div className="title-line hero-anim-2">
              <h1>Krzysztof Pabisz</h1>
              <div className="role">{t('housePabisz.hero.role')}</div>
              <WordReveal
                as="p"
                className="flavor"
                text={t('housePabisz.hero.flavor')}
                active={flavorActive}
              />
            </div>

            <div className="domain-stats hero-anim-3">
              <div className="stat-item"><div className="medallion">{duchyCount}</div><div className="label">{t('housePabisz.hero.statDuchies')}</div></div>
              <div className="stat-item"><div className="medallion">{baronyCount}</div><div className="label">{t('housePabisz.hero.statBaronies')}</div></div>
              <div className="stat-item"><div className="medallion">{holdingCount}</div><div className="label">{t('housePabisz.hero.statHoldings')}</div></div>
            </div>

            <div className="hero-actions hero-anim-4">
              <a href="#domain" className="btn">{t('housePabisz.hero.ctaSurvey')}</a>
              <a href="#diplomacy" className="btn btn-outline">{t('housePabisz.hero.ctaDiplomacy')}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
