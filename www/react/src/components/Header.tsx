/** IMPORTS **/
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/img/logo.svg'
import LanguageSwitch from './LanguageSwitch'
import { THEMED_ROUTES } from '../data/themedRoutes'
import { NAV_SECTIONS, NAV_SECTION_IDS } from '../data/navSections'
import { useActiveSection } from '../hooks/useActiveSection'

/** TYPES **/
interface HeaderProps {
  dark: boolean
  onToggle: () => void
  onShowHousePabisz: () => void
}

/** DATA **/
const font = 'font-body'

/** COMPONENT **/
export default function Header({ dark, onToggle, onShowHousePabisz }: HeaderProps) {
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const { pathname } = useLocation()

  // track whether the page is scrolled to the very top (24px of slack so a tiny
  // scroll doesn't flash the solid bar); passive listener, read once on mount
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  // the section links point at "/#id" so they work from any page; the scroll
  // itself is done by ScrollToHash. The highlight only makes sense on the home
  // page, where those sections exist.
  const activeSection = useActiveSection(NAV_SECTION_IDS, pathname === '/')
  // switch the current page's theme in place if it has a House Pabisz
  // version (e.g. /calculator); otherwise there's nothing themed to show
  // here, so fall back to sending the visitor to the House Pabisz homepage
  const housePabiszTarget = THEMED_ROUTES.includes(pathname) ? pathname : '/'

  // On the home page, at the top of the page, the bar goes transparent so it
  // blends into the hero illustration; it is solid on every other page, after
  // any scroll, and whenever the mobile menu is open (that menu needs a backdrop).
  // Over the (always dark) hero the links switch to light text in both themes.
  const overHero = pathname === '/' && atTop && !mobileOpen

  const text      = overHero ? 'text-[#e4e8f0]' : dark ? 'text-[#A8B8C8]' : 'text-[#1a2035]'
  const textHover = 'hover:text-[#C9A84C]'
  const activeText = overHero || dark ? 'text-[#C9A84C]' : 'text-[#8B6810]'
  const hdrBorder = overHero
    ? 'border-transparent'
    : dark ? 'border-[rgba(201,168,76,0.3)]' : 'border-[rgba(201,168,76,0.25)]'
  const hamBg     = overHero ? 'bg-[#e4e8f0]' : dark ? 'bg-[#A8B8C8]' : 'bg-[#1a2035]'
  const hdrBgStyle = {
    backgroundColor: overHero ? 'rgba(6,13,26,0)' : dark ? '#060D1A' : '#e4e8f0',
  }

  return (
    <header className={`fixed top-0 left-0 w-full z-50 border-b transition-[background-color,border-color] duration-300 ${hdrBorder}`}
      style={hdrBgStyle}>
      <div className="flex items-center max-w-[1200px] mx-auto px-5 py-3 lg:px-10 lg:py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 no-underline">
          <img src={logo} alt="KP logo" className="h-8 w-auto md:h-10" />
          <div className="hidden sm:flex flex-col pl-3 border-l border-[rgba(201,168,76,0.4)] gap-[3px]">
            <span className={`text-[0.65rem] md:text-[0.7rem] tracking-[0.2em] uppercase leading-none ${font} ${text}`}>
              {t('header.brandLine1')}
            </span>
            <span className="block w-full h-px bg-[rgba(201,168,76,0.5)]" />
            <span className={`text-[1rem] md:text-[1.2rem] tracking-[0.04em] leading-none font-display ${text}`}>
              {t('header.brandName')}
            </span>
          </div>
        </Link>

        {/* Desktop nav: one link per homepage chapter */}
        <nav className="hidden lg:flex items-center gap-1 ml-auto mr-6" aria-label={t('header.sections')}>
          {NAV_SECTIONS.map((s) => {
            const isActive = activeSection === s.id
            return (
              <Link
                key={s.id}
                to={`/#${s.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={`${font} text-[0.85rem] tracking-[0.1em] no-underline px-3 py-1.5 border-b border-transparent transition-colors ${textHover} ${isActive ? `${activeText} !border-[rgba(201,168,76,0.6)]` : text}`}
              >
                {t(s.labelKey)}
              </Link>
            )
          })}
        </nav>

        {/* House Pabisz + language switch */}
        <div className="hidden lg:flex items-center gap-4 ml-4 mr-4">
          <Link
            to={housePabiszTarget}
            onClick={onShowHousePabisz}
            className={`${font} text-[0.7rem] tracking-[0.12em] uppercase ${text} ${textHover} no-underline transition-colors border-b border-[rgba(201,168,76,0.4)] pb-0.5`}
          >
            {t('header.housePabiszLink')}
          </Link>
          <LanguageSwitch
            className="flex items-center gap-1.5"
            buttonClassName={`${font} text-[0.7rem] tracking-[0.05em] ${text} bg-transparent border-0 p-0 cursor-pointer transition-opacity`}
            activeClassName="opacity-100 text-[#C9A84C]"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggle}
          aria-label={dark ? t('header.toggleToLight') : t('header.toggleToDark')}
          className={`ml-auto lg:ml-0 mr-3 lg:mr-0 shrink-0 w-8 h-8 flex items-center justify-center rounded bg-transparent border-0 ${text} hover:text-[#C9A84C] transition-colors cursor-pointer`}
        >
          {dark ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Hamburger */}
        <button
          className="flex lg:hidden flex-col gap-[5px] w-6 bg-transparent border-0 p-0 cursor-pointer shrink-0"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={t('header.toggleMenu')}
          aria-expanded={mobileOpen}
        >
          <span className={`block h-px w-full ${hamBg}`} />
          <span className={`block h-px w-full ${hamBg}`} />
          <span className={`block h-px w-full ${hamBg}`} />
        </button>

      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="flex lg:hidden flex-col border-t border-[rgba(201,168,76,0.15)] py-3" aria-label={t('header.sections')}>
          {NAV_SECTIONS.map((s) => {
            const isActive = activeSection === s.id
            return (
              <Link
                key={s.id}
                to={`/#${s.id}`}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive ? 'location' : undefined}
                className={`${font} text-[0.9rem] tracking-[0.1em] ${isActive ? activeText : text} ${textHover} px-5 py-3 no-underline border-b border-[rgba(201,168,76,0.08)] transition-colors`}
              >
                {t(s.labelKey)}
              </Link>
            )
          })}
          <div className="flex items-center justify-between px-5 pt-4 mt-2 border-t border-[rgba(201,168,76,0.15)]">
            <Link
              to={housePabiszTarget}
              onClick={() => { onShowHousePabisz(); setMobileOpen(false) }}
              className={`${font} text-[0.8rem] tracking-[0.1em] uppercase ${text} ${textHover} no-underline transition-colors`}
            >
              {t('header.housePabiszLink')}
            </Link>
            <LanguageSwitch
              className="flex items-center gap-2"
              buttonClassName={`${font} text-[0.75rem] tracking-[0.05em] ${text} bg-transparent border-0 p-0 cursor-pointer transition-opacity`}
              activeClassName="opacity-100 text-[#C9A84C]"
            />
          </div>
        </nav>
      )}
    </header>
  )
}
