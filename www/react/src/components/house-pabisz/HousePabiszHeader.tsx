/** IMPORTS **/
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitchSlide from './LanguageSwitchSlide'
import { baronies } from '../../data/projects'

/** TYPES **/
interface HousePabiszHeaderProps {
  dark: boolean
  onToggleDark: () => void
  onShowClassic: () => void
  // true on the House Pabisz homepage itself (shows the Domain/Diplomacy
  // section-anchor nav); false on a themed sub-page like the Calculator,
  // where those anchors don't exist — shows a single "return home" link
  // instead. Defaults to true so the homepage's own call site is unaffected.
  isHome?: boolean
}

/** SUBCOMPONENT **/
// Mirrors the classic Header's hover "Projects" dropdown — same 6 in-app
// sub-pages (the Baronies), just under the site's own "Holdings" wording.
// The dropdown sits flush against the trigger (no gap) so the mouse never
// crosses un-hovered space on its way down — a gap there would fire
// mouseleave on the wrapper before the pointer reaches the menu.
function HoldingsDropdown() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div className="holdings-nav" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="holdings-trigger">
        {t('housePabisz.header.holdings')}
        <span className="caret">▼</span>
      </button>
      {open && (
        <div className="holdings-menu">
          {baronies.map((p) => (
            <Link key={p.key} to={p.href}>
              {t(`projects.${p.key}.title`, { defaultValue: p.title })}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/** COMPONENT **/
export default function HousePabiszHeader({ dark, onToggleDark, onShowClassic, isHome = true }: HousePabiszHeaderProps) {
  const { t } = useTranslation()

  return (
    <header>
      <div className="hdr-row">
        <Link to="/" className="brand">
          <span className="brand-logo" role="img" aria-label="House Pabisz coat of arms" />
          {t('housePabisz.header.brand')}
        </Link>

        <nav className="primary">
          {isHome ? (
            <>
              <a href="#domain">{t('housePabisz.header.navDomain')}</a>
              <HoldingsDropdown />
              <a href="#diplomacy">{t('housePabisz.header.navDiplomacy')}</a>
            </>
          ) : (
            <>
              <Link to="/">{t('housePabisz.header.returnToDomain')}</Link>
              <HoldingsDropdown />
            </>
          )}
        </nav>

        {/* a plain button, not a Link — switching to Classic never needs to
            navigate, since both pages branch on the same `design` state and
            re-render in place (see App.tsx) */}
        <button type="button" onClick={onShowClassic} className="classic-link">
          {t('housePabisz.header.classicLink')}
        </button>

        <LanguageSwitchSlide />

        <button className="toggle" onClick={onToggleDark} aria-label={t('housePabisz.header.toggleAria')}>
          <span className="track"><span className="knob" /></span>
          <span>{dark ? t('housePabisz.header.night') : t('housePabisz.header.day')}</span>
        </button>
      </div>
    </header>
  )
}
