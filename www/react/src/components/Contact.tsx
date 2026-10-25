/** IMPORTS **/
import { useTranslation } from 'react-i18next'
import { useReveal } from '../hooks/useReveal'
import { CONTACT_EMAIL, CONTACT_MAILTO, GITHUB_URL, LINKEDIN_URL } from '../data/contact'
import { GitHubIcon, LinkedInIcon, MailIcon } from './icons'

/** DATA **/
const font = 'font-body'

/** SUBCOMPONENTS **/
// A loose, hand-drawn looking arrow for the scribbled note: it starts at the
// note (top right) and swoops down and to the left, ending in a head that points
// at the "Email me" button beside it. Decorative, so hidden from assistive tech;
// the note's words are real text next to it.
function ScribbleArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 44"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* the curved shaft, from the top right swooping down-left to the tip */}
      <path d="M60 8C42 0 20 6 8 28" />
      {/* the arrowhead: two short uneven strokes meeting at the tip (8, 28),
          angled back along the shaft's direction of travel */}
      <path d="M18.2 21.8L8 28L7.8 16" />
    </svg>
  )
}

/** COMPONENT **/
// Chapter 05: the closing call to action. Always dark (like the games chapter)
// so the page ends with a strong block above the footer. The hero's secondary
// button scrolls here via #contact. One bordered panel: the message and main
// button on the left, a vertical rule, then the other ways to reach me (icon
// tiles plus a scribbled note) on the right; stacked on phones.
export default function Contact() {
  const { t } = useTranslation()
  const mainReveal = useReveal()
  const sideReveal = useReveal(150)
  // icon-only tiles, so each carries its name as aria-label and a hover tooltip;
  // the profile links open in a new tab, the mail link hands off to the mail client
  const links = [
    { label: 'GitHub', href: GITHUB_URL, Icon: GitHubIcon, external: true },
    { label: 'LinkedIn', href: LINKEDIN_URL, Icon: LinkedInIcon, external: true },
    { label: t('contact.emailLabel'), href: CONTACT_MAILTO, Icon: MailIcon, external: false },
  ]
  return (
    <section
      id="contact"
      className="min-h-[80svh] flex items-center bg-navy-900 py-24 px-5 lg:px-10"
    >
      <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] rounded-xl border border-[rgba(201,168,76,0.25)] bg-[rgba(255,255,255,0.02)]">

        {/* Message */}
        <div ref={mainReveal.ref} style={mainReveal.style} className={`${mainReveal.className} p-8 md:p-12`}>
          <p className={`${font} text-[0.7rem] tracking-[0.25em] uppercase text-[#C9A84C] mb-3`}>
            05 · {t('contact.eyebrow')}
          </p>
          <h2 className="font-display font-normal text-5xl md:text-7xl leading-[1] tracking-tight text-[#e4e8f0] mb-6">
            {t('contact.title')}
          </h2>
          <span className="block w-16 h-px bg-[rgba(201,168,76,0.7)] mb-6" />
          <p className={`${font} max-w-[560px] text-base md:text-lg leading-relaxed text-[#9fb0cc] mb-10`}>
            {t('contact.text')}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
            <a
              href={CONTACT_MAILTO}
              className={`${font} inline-block text-[0.75rem] tracking-[0.2em] uppercase px-10 py-4 rounded border border-[rgba(201,168,76,0.6)] bg-[#C9A84C] text-[#14110a] no-underline hover:bg-[#e0c36e] transition-colors`}
            >
              {t('contact.cta')}
            </a>

            {/* Scribbled note: the arrow points back at the button. On phones the note
                wraps under the button, where a sideways arrow would point at nothing,
                so the arrow only shows from sm up. */}
            <div className="flex items-center gap-1 text-[#8896b0]">
              <ScribbleArrow className="hidden sm:block w-16 h-11 shrink-0 mt-3" />
              <p className="font-hand text-3xl leading-tight -rotate-3 m-0">
                {t('contact.scribble')}
              </p>
            </div>
          </div>

          {/* The address is shown as text too, so it can be copied without opening a mail client */}
          <p className={`${font} mt-8 text-[0.9rem] tracking-[0.05em] text-[#8896b0] m-0`}>
            {CONTACT_EMAIL}
          </p>
        </div>

        {/* Other ways to reach me. The outer cell has no left padding on wide screens
            so the inner block's border-left reads as the vertical divider, inset from
            the panel's top and bottom edges. */}
        <div
          ref={sideReveal.ref}
          style={sideReveal.style}
          className={`${sideReveal.className} p-8 md:p-12 lg:pl-0 border-t lg:border-t-0 border-[rgba(201,168,76,0.25)]`}
        >
          <div className="h-full lg:border-l lg:border-[rgba(201,168,76,0.25)] lg:pl-12 flex flex-col justify-center">
            <p className={`${font} text-[0.7rem] tracking-[0.25em] uppercase text-[#8896b0] m-0 mb-6`}>
              {t('contact.otherWays')}
            </p>

            <ul className="flex gap-4 list-none p-0 m-0">
              {links.map(({ label, href, Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    title={label}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex items-center justify-center w-14 h-14 rounded-lg border border-[rgba(201,168,76,0.4)] text-[#c0c8d8] hover:text-[#C9A84C] hover:border-[rgba(201,168,76,0.8)] transition-colors"
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  )
}
