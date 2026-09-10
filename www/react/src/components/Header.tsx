/** IMPORTS **/
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/img/logo.svg'
import LanguageSwitch from './LanguageSwitch'
import { THEMED_ROUTES } from '../data/themedRoutes'

/** TYPES **/
interface HeaderProps {
  dark: boolean
  onToggle: () => void
  onShowHousePabisz: () => void
}

/** DATA **/
const projects = [
  { label: 'Calculator', href: '/calculator', external: false },
  { label: 'Tic Tac Toe', href: '/tic-tac-toe', external: false },
  { label: 'Cat Generator', href: '/cat-generator', external: false },
  { label: 'Room Designer', href: '/room-designer', external: false },
  { label: 'Discord Clone', href: '/discord-clone', external: false },
  { label: '2048', href: '/2048', external: false },
]

const font = "font-['Palatino_Linotype',Palatino,serif]"

/** COMPONENT **/
export default function Header({ dark, onToggle, onShowHousePabisz }: HeaderProps) {
  const { t } = useTranslation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  // switch the current page's theme in place if it has a House Pabisz
  // version (e.g. /calculator); otherwise there's nothing themed to show
  // here, so fall back to sending the visitor to the House Pabisz homepage
  const housePabiszTarget = THEMED_ROUTES.includes(pathname) ? pathname : '/'

  const text      = dark ? 'text-[#A8B8C8]' : 'text-[#1a2035]'
  const textHover = 'hover:text-[#C9A84C]'
  const hdrBorder = dark ? 'border-[rgba(201,168,76,0.3)]' : 'border-[rgba(201,168,76,0.25)]'
  const ddBg      = dark ? 'border border-[rgba(201,168,76,0.2)]' : 'border-2 border-[rgba(201,168,76,0.5)]'
  const ddItem    = dark
    ? `hover:text-[#C9A84C] hover:bg-[rgba(201,168,76,0.06)] border-b border-[rgba(201,168,76,0.2)]`
    : `hover:text-[#8B6810] hover:bg-[rgba(201,168,76,0.1)] border-b-2 border-[rgba(201,168,76,0.35)]`
  const hamBg     = dark ? 'bg-[#A8B8C8]' : 'bg-[#1a2035]'
  const mobLabel  = dark ? 'text-[#8899AA]' : 'text-[#5a6480]'
  const hdrBgStyle = { backgroundColor: dark ? '#060D1A' : '#e4e8f0' }
  const ddBgStyle  = { backgroundColor: dark ? '#0A1628' : '#cdd2e0' }

  return (
    <header className={`fixed top-0 left-0 w-full z-50 border-b ${hdrBorder}`}
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
            <span className={`text-[0.8rem] md:text-[0.95rem] tracking-[0.1em] leading-none ${font} ${text}`}>
              {t('header.brandName')}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center ml-auto mr-12">
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className={`flex items-center gap-1.5 ${font} text-[0.85rem] tracking-[0.12em] ${text} ${textHover} transition-colors bg-transparent border-0 px-3 py-1.5 cursor-pointer`}>
              {t('header.projectsLabel')}
              <span className={`text-[0.6rem] transition-transform duration-200 inline-block ${dropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {dropdownOpen && (
              <div className={`absolute top-full left-0 min-w-[200px] ${ddBg} rounded overflow-hidden shadow-lg`}
                style={ddBgStyle}>
                {projects.map((p) => {
                  const cls = `block px-4 py-2.5 ${font} text-[0.85rem] tracking-[0.1em] ${text} ${ddItem} last:border-0 no-underline transition-colors`
                  return p.external
                    ? <a key={p.href} href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>{p.label}</a>
                    : <Link key={p.href} to={p.href} onClick={() => setDropdownOpen(false)} className={cls}>{p.label}</Link>
                })}
              </div>
            )}
          </div>
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
        >
          <span className={`block h-px w-full ${hamBg}`} />
          <span className={`block h-px w-full ${hamBg}`} />
          <span className={`block h-px w-full ${hamBg}`} />
        </button>

      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="flex lg:hidden flex-col border-t border-[rgba(201,168,76,0.15)] py-3">
          <span className={`${font} text-[0.65rem] tracking-[0.2em] uppercase ${mobLabel} px-5 py-2 opacity-70`}>
            {t('header.projectsLabel')}
          </span>
          {projects.map((p) => {
            const cls = `${font} text-[0.9rem] tracking-[0.1em] ${text} ${textHover} px-5 py-3 no-underline border-b border-[rgba(201,168,76,0.08)] last:border-0 transition-colors`
            return p.external
              ? <a key={p.href} href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>{p.label}</a>
              : <Link key={p.href} to={p.href} onClick={() => setMobileOpen(false)} className={cls}>{p.label}</Link>
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
