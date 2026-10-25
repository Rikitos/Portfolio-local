/** IMPORTS **/
import type { CSSProperties, ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import devicesLight from '../assets/img/about-devices-light.webp'
import devicesDark from '../assets/img/about-devices-dark.webp'
import { TECH_ICONS } from '../data/techIcons'
import { useReveal } from '../hooks/useReveal'
import { BrandIcon, GamepadIcon, LaptopIcon, MapPinIcon } from './icons'

/** DATA **/
const font = 'font-body'

// Skill names are proper nouns, so they stay literal. Everything listed here is
// something used in the projects above, and each name has a logo in data/techIcons.ts.
const SKILLS = ['Astro', 'React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Vite', 'Godot']

// The three quick facts under the bio, each an icon plus a short translated line
const FACTS: { icon: ComponentType<{ className?: string }>; labelKey: string }[] = [
  { icon: MapPinIcon, labelKey: 'about.factLocation' },
  { icon: LaptopIcon, labelKey: 'about.factOpen' },
  { icon: GamepadIcon, labelKey: 'about.factGames' },
]

// the handwritten motto over the desk photo, in reading order
const MOTTO_KEYS = ['about.mottoBuild', 'about.mottoPlay', 'about.mottoDebug', 'about.mottoRepeat']

// both desk photos are 1122x1402 (4:5); the dimensions on the <img> reserve the
// space before the file loads so the section doesn't jump
const IMG_WIDTH = 1122
const IMG_HEIGHT = 1402

/** SUBCOMPONENTS **/
// A skill tile: the technology's logo on top in its brand colour (a deeper shade
// on light backgrounds where the brand colour is too pale), its name underneath.
// The colours are passed as CSS variables because Tailwind can't build class
// names at runtime.
function SkillTile({ name }: { name: string }) {
  const icon = TECH_ICONS[name]
  const colors = icon ? ({ '--tech-light': icon.light, '--tech-dark': icon.dark } as CSSProperties) : undefined

  return (
    <li
      className={`${font} flex flex-col items-center justify-center gap-3 px-2 py-5 rounded-lg border border-[rgba(201,168,76,0.3)] bg-white/60 dark:bg-navy-800 text-[#1a2035] dark:text-[#e4e8f0]`}
    >
      {icon && (
        <span style={colors} className="flex text-[color:var(--tech-light)] dark:text-[color:var(--tech-dark)]">
          <BrandIcon path={icon.path} className="w-8 h-8" />
        </span>
      )}
      <span className="text-[0.85rem] text-center leading-tight">{name}</span>
    </li>
  )
}

/** COMPONENT **/
// Chapter 04. Top row: the desk photo (a light and a dark variant, swapped by the
// theme) beside the bio and three quick facts. Bottom row: skills with logos in a
// single row on wide screens, then the short description.
export default function About() {
  const { t } = useTranslation()
  const imageReveal = useReveal<HTMLElement>()
  const bioReveal = useReveal()
  const skillsReveal = useReveal()
  return (
    <section
      id="about"
      className="min-h-svh flex items-center bg-slate-100 dark:bg-navy-700 py-24 px-5 lg:px-10 transition-colors"
    >
      <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-16 lg:gap-20">

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-20 items-center">

          {/* Photo: after the bio on phones (order), left of it on wide screens */}
          <figure
            ref={imageReveal.ref}
            style={imageReveal.style}
            className={`${imageReveal.className} relative order-2 lg:order-1 m-0 overflow-hidden rounded-lg border border-[rgba(201,168,76,0.25)]`}
          >
            <img
              src={devicesLight}
              alt={t('about.imageAlt')}
              width={IMG_WIDTH}
              height={IMG_HEIGHT}
              loading="lazy"
              decoding="async"
              className="block dark:hidden w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] object-cover object-[50%_45%]"
            />
            <img
              src={devicesDark}
              alt={t('about.imageAlt')}
              width={IMG_WIDTH}
              height={IMG_HEIGHT}
              loading="lazy"
              decoding="async"
              className="hidden dark:block w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] object-cover object-[50%_45%]"
            />

            {/* Motto in handwriting. From lg up the photo shows in full (4:5), so the
                words are scribbled over the lower middle-right of it, stacked and
                tilted, starting about level with the laptop's touchpad. Positioned in
                percentages of the figure so they stay put as it scales. They are warm
                white with a soft shadow because that area mixes pale desk, grey laptop
                and dark wood, where a single dark colour would vanish. On smaller
                screens the photo is cropped to a wide band that hides that area, so
                the words sit under it as one line. */}
            <figcaption
              className="flex flex-wrap justify-center items-baseline gap-x-3 px-4 py-3 font-hand text-2xl sm:text-3xl leading-none text-[#3a4566] dark:text-[#b6c2d8] lg:absolute lg:bottom-[25%] lg:right-[32%] lg:flex-col lg:items-end lg:gap-x-0 lg:p-0 lg:text-4xl lg:-rotate-6 lg:text-[#fff4e0] lg:[text-shadow:0_1px_5px_rgba(20,10,0,0.65)] lg:pointer-events-none lg:select-none"
            >
              {MOTTO_KEYS.map((key, i) => (
                <span key={key} className="contents">
                  {i > 0 && <span aria-hidden="true" className="lg:hidden">·</span>}
                  <span>{t(key)}</span>
                </span>
              ))}
              {/* wavy underline under the last word, wide screens only */}
              <svg
                viewBox="0 0 120 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="hidden lg:block w-28 h-3 mt-1 drop-shadow-[0_1px_3px_rgba(20,10,0,0.55)]"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M3 8C20 1 38 13 58 6S98 2 117 8" />
              </svg>
            </figcaption>
          </figure>

          {/* Bio */}
          <div ref={bioReveal.ref} style={bioReveal.style} className={`${bioReveal.className} order-1 lg:order-2`}>
            <p className={`${font} text-[0.7rem] tracking-[0.25em] uppercase text-[#8B6810] dark:text-[#C9A84C] mb-3`}>
              04 · {t('about.eyebrow')}
            </p>
            <h2 className="font-display font-normal text-4xl md:text-6xl leading-[1.05] tracking-tight text-[#1a2035] dark:text-[#e4e8f0] mb-8">
              {t('about.title')}
            </h2>
            <div className={`${font} flex flex-col gap-5 text-base md:text-lg leading-relaxed text-[#3a4566] dark:text-[#b6c2d8] max-w-[560px]`}>
              <p className="m-0">{t('about.paragraph1')}</p>
              <p className="m-0">{t('about.paragraph2')}</p>
            </div>

            {/* Quick facts */}
            <ul className="flex flex-wrap gap-x-10 gap-y-5 list-none p-0 mt-10 mb-0">
              {FACTS.map(({ icon: Icon, labelKey }) => (
                <li key={labelKey} className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-11 h-11 rounded-full border border-[rgba(201,168,76,0.5)] text-[#8B6810] dark:text-[#C9A84C]">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className={`${font} text-[0.9rem] leading-snug text-[#3a4566] dark:text-[#b6c2d8] max-w-[9rem]`}>
                    {t(labelKey)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Skills */}
        <div ref={skillsReveal.ref} style={skillsReveal.style} className={`${skillsReveal.className} flex flex-col gap-6`}>
          <p className={`${font} text-[0.7rem] tracking-[0.25em] uppercase text-[#5a6480] dark:text-[#8896b0] m-0`}>
            {t('about.skillsHeading')}
          </p>
          {/* 3 columns on phones, 4 from sm, all seven in one row from lg */}
          <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 list-none p-0 m-0">
            {SKILLS.map((skill) => (
              <SkillTile key={skill} name={skill} />
            ))}
          </ul>
          <p className={`${font} text-[0.95rem] leading-relaxed text-[#3a4566] dark:text-[#b6c2d8] max-w-[620px] m-0`}>
            {t('about.skillsText')}
          </p>
        </div>

      </div>
    </section>
  )
}
