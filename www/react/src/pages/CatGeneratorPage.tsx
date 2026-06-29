import { useState, useCallback } from 'react'

// Vite requires static import paths — can't build them dynamically at runtime.
// Import all 15 images up front and pick randomly from the array.
import cat1  from '../assets/img/cat-generator/cat1.jpg'
import cat2  from '../assets/img/cat-generator/cat2.jpg'
import cat3  from '../assets/img/cat-generator/cat3.jpg'
import cat4  from '../assets/img/cat-generator/cat4.jpg'
import cat5  from '../assets/img/cat-generator/cat5.jpg'
import cat6  from '../assets/img/cat-generator/cat6.jpg'
import cat7  from '../assets/img/cat-generator/cat7.jpg'
import cat8  from '../assets/img/cat-generator/cat8.jpg'
import cat9  from '../assets/img/cat-generator/cat9.jpg'
import cat10 from '../assets/img/cat-generator/cat10.jpg'
import cat11 from '../assets/img/cat-generator/cat11.jpg'
import cat12 from '../assets/img/cat-generator/cat12.jpg'
import cat13 from '../assets/img/cat-generator/cat13.jpg'
import cat14 from '../assets/img/cat-generator/cat14.jpg'
import cat15 from '../assets/img/cat-generator/cat15.jpg'

const CATS = [cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat9, cat10, cat11, cat12, cat13, cat14, cat15]

/** STYLES **/
const font = "font-['Palatino_Linotype',Palatino,serif]"

/** COMPONENT **/
export default function CatGeneratorPage() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  // Pick a random index that's different from the current one,
  // then trigger a fade-out → swap image → fade-in cycle
  const nextCat = useCallback(() => {
    if (fading) return
    setFading(true)
    setTimeout(() => {
      setCurrent(prev => {
        let next
        do { next = Math.floor(Math.random() * CATS.length) }
        while (next === prev)
        return next
      })
      setFading(false)
    }, 400)
  }, [fading])

  return (
    // min-h subtracts the fixed header height (64px) so the page fills the remaining viewport
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-5 py-10 bg-slate-200 dark:bg-navy-900 transition-colors duration-300">

      <h1 className={`${font} font-normal text-[1.8rem] sm:text-[2.2rem] tracking-[0.1em] text-[#1a2035] dark:text-[#A8B8C8] mb-2`}>
        Cat Meme Generator
      </h1>

      <p className={`${font} text-[0.85rem] tracking-[0.15em] uppercase text-[#5a6480] dark:text-[#8896b0] mb-8`}>
        Click the button for a random cat
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
        Next Cat
      </button>

    </main>
  )
}
