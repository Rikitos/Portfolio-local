import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import pl from './locales/pl.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pl: { translation: pl },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'pl'],
    detection: {
      // no 'navigator' — a first-time visitor always lands in English
      // regardless of browser locale; a saved manual choice still wins.
      order: ['localStorage', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

export default i18n
