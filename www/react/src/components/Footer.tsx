/** IMPORTS **/
import { Link } from 'react-router-dom'
import logo from '../assets/img/logo.svg'

/** DATA **/
const font = "font-['Palatino_Linotype',Palatino,serif]"

const projects = [
  { label: 'Calculator', href: '/calculator/' },
  { label: 'Tic Tac Toe', href: '/tic-tac-toe/' },
  { label: 'Cat Generator', href: '/cat-generator/' },
  { label: 'Room Designer', href: '/room-designer/' },
]

const contact = [
  { label: 'krzysiek.pabisz@email.com', href: 'mailto:krzysiek.pabisz@email.com' },
  { label: 'GitHub', href: 'https://github.com/', external: true },
  { label: 'LinkedIn', href: 'https://linkedin.com/', external: true },
]

/** SUBCOMPONENTS **/
function LinkGroup({ heading, links }: { heading: string; links: { label: string; href: string; external?: boolean }[] }) {
  return (
    <div className="flex flex-col items-center min-[800px]:items-start gap-2">
      <span className={`${font} text-[0.65rem] tracking-[0.2em] uppercase text-[#8896b0] opacity-70`}>
        {heading}
      </span>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={`${font} text-[0.85rem] tracking-[0.05em] text-[#1a2035] dark:text-[#A8B8C8] hover:text-[#C9A84C] dark:hover:text-[#C9A84C] transition-colors no-underline`}
        >
          {l.label}
        </a>
      ))}
    </div>
  )
}

/** COMPONENT **/
export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-navy-900 border-t border-[rgba(201,168,76,0.25)] dark:border-[rgba(201,168,76,0.3)]">

      <div className="max-w-[1200px] mx-auto px-5 lg:px-10 py-12">

        {/*
          Layout:
          mobile  — all stacked, centered
          800px+  — brand left | projects center-left | contact right (one row)
        */}
        <div className="flex flex-col items-center gap-10 min-[800px]:flex-row min-[800px]:items-start">

          {/* Brand */}
          <div className="flex flex-col items-center min-[800px]:items-start gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-3 no-underline">
              <img src={logo} alt="KP logo" className="h-8 w-auto" />
              <span className={`${font} text-[0.95rem] tracking-[0.1em] text-[#1a2035] dark:text-[#A8B8C8]`}>
                Krzysztof Pabisz
              </span>
            </Link>
            <p className={`${font} text-[0.8rem] tracking-[0.1em] text-[#5a6480] dark:text-[#8896b0] min-[800px]:pl-[44px] m-0`}>
              Web developer
            </p>
          </div>

          {/* Projects — center-left on desktop */}
          <div className="min-[800px]:ml-16">
            <LinkGroup heading="Projects" links={projects} />
          </div>

          {/* Contact — pushed to the right on desktop */}
          <div className="min-[800px]:ml-auto">
            <LinkGroup heading="Contact" links={contact} />
          </div>

        </div>
      </div>

      {/* Bottom bar — always centered */}
      <div className="border-t border-[rgba(201,168,76,0.15)] px-5 py-4 text-center">
        <span className={`${font} text-[0.75rem] tracking-[0.05em] text-[#5a6480] dark:text-[#8896b0]`}>
          &copy; {new Date().getFullYear()} Krzysztof Pabisz. All rights reserved.
        </span>
      </div>

    </footer>
  )
}
