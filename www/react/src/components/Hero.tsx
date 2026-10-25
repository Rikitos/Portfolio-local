/** IMPORTS **/
import { useTranslation } from 'react-i18next'
import Button from './Button'
import HeroScene from './HeroScene'

/** DATA **/
const font = 'font-body'

/** COMPONENT **/
// Full-screen hero: the animated desk illustration (HeroScene) fills the section
// and its day/night variants cross-fade when the theme toggle flips. Text is
// always light because the left third of both illustrations is dark (chair +
// shelf), and a left-side scrim keeps it readable over the brighter window area
// on wide screens.
export default function Hero({ dark }: { dark: boolean }) {
  const { t } = useTranslation()
  return (
    <section className="relative min-h-svh flex items-center overflow-hidden bg-navy-900">

      {/* Background: the illustration with its animated layer */}
      <HeroScene dark={dark} alt={t('hero.imageAlt')} />

      {/* Scrim: darkens the text side only, so the window and cat stay vivid */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(6,13,26,0.85)] via-[rgba(6,13,26,0.45)] to-transparent md:via-[rgba(6,13,26,0.3)]" />

      {/* Top scrim: keeps the transparent header's links readable over the bright sky */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[rgba(6,13,26,0.6)] to-transparent" />

      {/* Copy */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-5 lg:px-10 pt-28 pb-20">
        <div className="max-w-[560px]">

          <p className={`${font} text-[0.7rem] tracking-[0.25em] uppercase text-[#e0c36e] mb-6`}>
            {t('hero.role')}
          </p>

          <h1 className={`font-display font-normal text-5xl md:text-7xl leading-[1.02] tracking-tight text-white mb-6`}>
            {t('hero.headline')}
          </h1>

          <span className="block w-16 h-px bg-[rgba(201,168,76,0.7)] mb-6" />

          <p className={`${font} text-base md:text-lg leading-relaxed text-[#d6dcea] mb-10`}>
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              href="#projects"
              variant="primary"
              className={`${font} text-[0.7rem] tracking-[0.2em] uppercase px-10 py-4`}
            >
              {t('hero.cta')}
            </Button>
            <Button
              href="#contact"
              variant="glass"
              className={`${font} text-[0.7rem] tracking-[0.2em] uppercase px-10 py-4`}
            >
              {t('hero.ctaSecondary')}
            </Button>
          </div>

        </div>
      </div>

    </section>
  )
}
