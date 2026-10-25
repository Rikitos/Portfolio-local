/** IMPORTS **/
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** COMPONENT **/
// Renders nothing. React Router changes the URL for "/#games" links but does
// not scroll, so after every navigation this scrolls to the element named by
// the hash (smoothly, via the global scroll-behavior), or back to the top when
// there is no hash (otherwise opening a page from the bottom of the home page
// would keep the old scroll offset).
// `location.key` is a dependency so clicking the same hash link twice still scrolls.
export default function ScrollToHash() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    // instant on purpose: a smooth scroll to the top would drag the visitor
    // through the whole page after they open a tool from the bottom of it
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash, key])

  return null
}
