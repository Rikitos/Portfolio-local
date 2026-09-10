/**
 * Small behavior hooks for the House Pabisz design, ported from the
 * concept mockup's vanilla-JS scroll-reveal / word-stagger / count-up
 * effects into React-idiomatic state (rather than direct DOM mutation,
 * which would fight React's own reconciliation on re-render — e.g. a
 * language switch re-rendering translated text).
 */
import { useEffect, useRef, useState } from 'react'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/**
 * Fades an element in once it crosses 40% down the viewport. `visible` is
 * React state, not a classList mutation, so it survives re-renders (e.g.
 * the element re-rendering with new translated text).
 *
 * Observe a *group* of elements together by attaching `ref` to their
 * shared container instead of calling this once per element — see
 * HousePabiszCouncil, which reveals every row + the bio paragraph off of
 * one shared trigger instead of each row watching itself independently.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reducedMotion) { setVisible(true); return }
    const el = ref.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            io.unobserve(entry.target)
            // small pause after crossing the trigger line so the reveal
            // actually registers as "entering", not firing at the first pixel
            timer = setTimeout(() => setVisible(true), 300)
          }
        })
      },
      // region spans the top 60% of the viewport — an element scrolling up
      // from below first intersects the moment it reaches the 60% line.
      // A smaller (less negative) bottom margin here means an EARLIER
      // trigger: it reaches further down the viewport, so elements catch
      // it sooner as they scroll up from below.
      { threshold: 0, rootMargin: '0px 0px -40% 0px' },
    )
    io.observe(el)
    return () => { io.disconnect(); if (timer) clearTimeout(timer) }
  }, [reducedMotion])

  return { ref, visible }
}

/** Animates a number counting up from 0 to `target` once mounted. */
export function useCountUp(target: number) {
  const [value, setValue] = useState(0)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reducedMotion) { setValue(target); return }
    let raf: number
    const duration = 900
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reducedMotion])

  return value
}
