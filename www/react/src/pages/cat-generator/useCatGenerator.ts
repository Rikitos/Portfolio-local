import { useState, useCallback } from 'react'

// Vite requires static import paths — can't build them dynamically at runtime.
// Import all 15 images up front and pick randomly from the array.
import cat1  from '../../assets/img/cat-generator/cat1.jpg'
import cat2  from '../../assets/img/cat-generator/cat2.jpg'
import cat3  from '../../assets/img/cat-generator/cat3.jpg'
import cat4  from '../../assets/img/cat-generator/cat4.jpg'
import cat5  from '../../assets/img/cat-generator/cat5.jpg'
import cat6  from '../../assets/img/cat-generator/cat6.jpg'
import cat7  from '../../assets/img/cat-generator/cat7.jpg'
import cat8  from '../../assets/img/cat-generator/cat8.jpg'
import cat9  from '../../assets/img/cat-generator/cat9.jpg'
import cat10 from '../../assets/img/cat-generator/cat10.jpg'
import cat11 from '../../assets/img/cat-generator/cat11.jpg'
import cat12 from '../../assets/img/cat-generator/cat12.jpg'
import cat13 from '../../assets/img/cat-generator/cat13.jpg'
import cat14 from '../../assets/img/cat-generator/cat14.jpg'
import cat15 from '../../assets/img/cat-generator/cat15.jpg'

export const CATS = [cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat9, cat10, cat11, cat12, cat13, cat14, cat15]

/** HOOK **/
// Shared image-cycling engine — both the classic and House Pabisz cat
// generator pages use this so the random-pick + fade timing exists in
// exactly one place.
export function useCatGenerator() {
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

  return { current, fading, nextCat }
}
