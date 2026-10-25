/**
 * useReveal - fade/slide an element in the first time it scrolls into view.
 *
 * Returns { ref, className, style } to spread onto the element:
 *   const reveal = useReveal(120)
 *   <div ref={reveal.ref} style={reveal.style} className={`... ${reveal.className}`}>
 *
 * The animation itself lives in index.css (.reveal / .is-visible). It is a CSS
 * animation rather than a transition on purpose, so it never fights the
 * `transition-colors` hover styles already on the cards. Under
 * prefers-reduced-motion the CSS shows the element immediately, and when
 * IntersectionObserver is missing we mark it visible straight away so content
 * is never left invisible.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react'

export function useReveal<T extends HTMLElement = HTMLDivElement>(delayMs = 0) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (visible || !el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        observer.disconnect() // reveal once; it stays visible when scrolled away
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  const style = { '--reveal-delay': `${delayMs}ms` } as CSSProperties
  return { ref, style, className: visible ? 'reveal is-visible' : 'reveal' }
}
