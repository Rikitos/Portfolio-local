/**
 * useActiveSection - which page section is currently under the middle of the
 * viewport, for highlighting the matching header link.
 *
 * Watches the elements with the given ids using an IntersectionObserver whose
 * root is shrunk to a thin band across the vertical middle of the screen
 * (rootMargin -45% / -50%), so exactly one tall section is "intersecting" at a
 * time and the highlight flips when a section crosses the middle, not the edge.
 * Returns the id of the last matching section in `ids` order, or null when none
 * is in the band (e.g. the hero) or the hook is disabled (not on the home page).
 */
import { useEffect, useState } from 'react'

export function useActiveSection(ids: readonly string[], enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return

    const inBand = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id)
          else inBand.delete(entry.target.id)
        }
        // later sections win if two ever overlap the band at once
        setActive([...ids].reverse().find((id) => inBand.has(id)) ?? null)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids, enabled])

  // derived on read, so turning the hook off never leaves a stale highlight
  return enabled ? active : null
}
