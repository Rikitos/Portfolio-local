import { useTranslation } from 'react-i18next'
import { CATS, useCatGenerator } from './cat-generator/useCatGenerator'

/** STYLES **/
const font = "font-['Palatino_Linotype',Palatino,serif]"

/** COMPONENT **/
export default function CatGeneratorPage() {
  const { t } = useTranslation()
  const { current, fading, nextCat } = useCatGenerator()

  return (
    // min-h subtracts the fixed header height (64px) so the page fills the remaining viewport
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-5 py-10 bg-slate-200 dark:bg-navy-700 transition-colors duration-300">

      <h1 className={`${font} font-normal text-[1.8rem] sm:text-[2.2rem] tracking-[0.1em] text-[#1a2035] dark:text-[#A8B8C8] mb-2`}>
        {t('games.catGenerator.title')}
      </h1>

      <p className={`${font} text-[0.85rem] tracking-[0.15em] uppercase text-[#5a6480] dark:text-[#8896b0] mb-8`}>
        {t('games.catGenerator.subtitle')}
      </p>

      {/* Image frame — rounded rectangle with gold border, fixed size so layout never shifts */}
      <div className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] border-2 border-[rgba(201,168,76,0.4)] rounded-[50px] overflow-hidden mb-6 bg-[#bec4d0] dark:bg-navy-800 shrink-0">
        <img
          src={CATS[current]}
          alt="Random cat"
          className={`w-full h-full object-cover transition-opacity duration-[400ms] ${fading ? 'opacity-0' : 'opacity-100'}`}
        />
      </div>

      {/* Button */}
      <button
        onClick={nextCat}
        className={`${font} text-[0.75rem] tracking-[0.2em] uppercase text-[#1a2035] dark:text-[#C9A84C] bg-[#cdd2e0] dark:bg-navy-700 border border-[rgba(201,168,76,0.35)] hover:text-[#C9A84C] hover:bg-[#e4e8f0] dark:hover:text-[#C9A84C] dark:hover:bg-navy-900 hover:border-[rgba(201,168,76,0.5)] px-7 py-2.5 rounded-[15px] transition-colors cursor-pointer`}
      >
        {t('games.catGenerator.next')}
      </button>

    </main>
  )
}
