/**
 * Shared House Pabisz page shell: the `.house-pabisz` scope wrapper, the
 * parchment backdrop, and the CSS custom properties the ported stylesheet
 * expects for its illustrated art (`--linen-img`, `--seal-img`, etc.).
 *
 * Any page that wants the House Pabisz theme — the homepage, or a themed
 * sub-page like the Calculator — renders its content inside this instead of
 * duplicating the art-vars wiring. Import './house-pabisz.css' lives here
 * too, so a consumer only needs to import the shell.
 */
import type { CSSProperties, ReactNode } from 'react'
import './house-pabisz.css'
import { housePabiszArt } from './assets'

const artVars = {
  '--linen-img': `url(${housePabiszArt.linen})`,
  '--seal-img': `url(${housePabiszArt.ceremony})`,
  '--coat1-img': `url(${housePabiszArt.brandMark})`,
  '--coat2-img': `url(${housePabiszArt.sectionEmblem})`,
  '--letter-top-img': `url(${housePabiszArt.letterTop})`,
  '--letter-bottom-img': `url(${housePabiszArt.letterBottom})`,
  '--letter-middle-img': `url(${housePabiszArt.letterMiddle})`,
  '--barony-trans-top-img': `url(${housePabiszArt.baronyTrans.top})`,
  '--barony-trans-mid-img': `url(${housePabiszArt.baronyTrans.mid})`,
  '--barony-trans-bottom-img': `url(${housePabiszArt.baronyTrans.bottom})`,
  '--barony-filled-top-img': `url(${housePabiszArt.baronyFilled.top})`,
  '--barony-filled-mid-img': `url(${housePabiszArt.baronyFilled.mid})`,
  '--barony-filled-bottom-img': `url(${housePabiszArt.baronyFilled.bottom})`,
} as CSSProperties

export default function HousePabiszShell({ children }: { children: ReactNode }) {
  return (
    <div className="house-pabisz" style={artVars}>
      <div className="parchment-bg" />
      {children}
    </div>
  )
}
