/** IMPORTS **/
import { useReveal } from '../hooks/useReveal'

/** TYPES **/
interface SectionHeadingProps {
  /** chapter number shown before the label, e.g. "01" */
  number: string
  /** section name; rendered as the section's h2, just styled small */
  label: string
  /** short note pushed to the right edge */
  note?: string
  /** 'dark' for sections that are always dark in both themes (games); 'adaptive' follows light/dark */
  tone?: 'adaptive' | 'dark'
}

/** DATA **/
const font = 'font-body'

// colour classes per tone: [number, label, note]
const TONES = {
  adaptive: [
    'text-[#8B6810] dark:text-[#C9A84C]',
    'text-[#1a2035] dark:text-[#e4e8f0]',
    'text-[#5a6480] dark:text-[#8899AA]',
  ],
  dark: ['text-[#C9A84C]', 'text-[#e4e8f0]', 'text-[#8899AA]'],
} as const

/** COMPONENT **/
// The shared chapter heading: "01  SECTION NAME ————        short note".
// A small uppercase label with a hairline rule after it, in place of a big
// display title, so the projects themselves carry the page.
export default function SectionHeading({ number, label, note, tone = 'adaptive' }: SectionHeadingProps) {
  const reveal = useReveal()
  const [numberClass, labelClass, noteClass] = TONES[tone]

  return (
    <div
      ref={reveal.ref}
      style={reveal.style}
      className={`${reveal.className} flex flex-wrap items-center gap-x-5 gap-y-2 mb-10`}
    >
      <span className={`${font} text-[0.75rem] tracking-[0.25em] ${numberClass}`}>{number}</span>
      <h2 className={`${font} text-[0.8rem] md:text-[0.9rem] font-medium tracking-[0.25em] uppercase ${labelClass} m-0`}>
        {label}
      </h2>
      <span className="hidden sm:block h-px w-24 md:w-40 bg-[rgba(201,168,76,0.6)]" aria-hidden="true" />
      {note && <p className={`${font} md:ml-auto text-[0.9rem] ${noteClass} m-0`}>{note}</p>}
    </div>
  )
}
