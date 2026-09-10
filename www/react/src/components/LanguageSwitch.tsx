/**
 * PL | EN toggle. Unstyled beyond layout — callers pass `className` /
 * `activeClassName` so it can match either the classic header or the
 * House Pabisz header's own type treatment.
 */
import { useTranslation } from 'react-i18next'

interface LanguageSwitchProps {
  className?: string
  buttonClassName?: string
  activeClassName?: string
}

const LANGS = ['pl', 'en'] as const

export default function LanguageSwitch({ className = '', buttonClassName = '', activeClassName = '' }: LanguageSwitchProps) {
  const { i18n, t } = useTranslation()
  const current = (i18n.resolvedLanguage ?? i18n.language ?? 'pl').slice(0, 2)

  return (
    <div className={className} role="group" aria-label={t('header.lang')}>
      {LANGS.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          className={`${buttonClassName} ${current === lng ? activeClassName : 'opacity-50 hover:opacity-100'}`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
