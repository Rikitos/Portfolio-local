/**
 * Language switch, variant 1: both flags sit side by side at all times: a
 * gold ring "spotlight" slides between them to mark which is active, and
 * the inactive flag dims — same slide-between-two-fixed-positions idea as
 * the day/night `.toggle` track, just built from the flag art instead of a
 * plain knob.
 */
import { useTranslation } from 'react-i18next'
import { housePabiszArt } from './assets'

export default function LanguageSwitchSlide({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const current = (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2) === 'pl' ? 'pl' : 'en'

  return (
    <div className={`lang-slide ${className}`} role="group" aria-label={t('header.lang')}>
      <span className={`lang-slide-indicator ${current === 'en' ? 'is-en' : ''}`} aria-hidden="true" />
      <button
        type="button"
        onClick={() => i18n.changeLanguage('pl')}
        aria-pressed={current === 'pl'}
        aria-label="Polski"
        className={`lang-slide-flag ${current === 'pl' ? 'is-active' : ''}`}
      >
        <img src={housePabiszArt.flags.pl} alt="" />
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage('en')}
        aria-pressed={current === 'en'}
        aria-label="English"
        className={`lang-slide-flag ${current === 'en' ? 'is-active' : ''}`}
      >
        <img src={housePabiszArt.flags.en} alt="" />
      </button>
    </div>
  )
}
