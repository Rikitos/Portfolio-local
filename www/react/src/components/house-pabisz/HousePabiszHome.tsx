/** IMPORTS **/
import HousePabiszShell from './HousePabiszShell'
import { housePabiszArt } from './assets'
import HousePabiszHeader from './HousePabiszHeader'
import HousePabiszHero from './HousePabiszHero'
import HousePabiszDomain from './HousePabiszDomain'
import HousePabiszCouncil from './HousePabiszCouncil'
import HousePabiszDiplomacy from './HousePabiszDiplomacy'
import HousePabiszFooter from './HousePabiszFooter'

/** TYPES **/
interface HousePabiszHomeProps {
  dark: boolean
  onToggleDark: () => void
  onShowClassic: () => void
}

/** COMPONENT **/
export default function HousePabiszHome({ dark, onToggleDark, onShowClassic }: HousePabiszHomeProps) {
  const [frieze1, frieze2, frieze3, frieze4] = housePabiszArt.friezeBands

  return (
    <HousePabiszShell>
      <HousePabiszHeader dark={dark} onToggleDark={onToggleDark} onShowClassic={onShowClassic} />
      <HousePabiszHero />
      <div className="frieze-band" style={{ backgroundImage: `url(${frieze1})` }} aria-hidden="true" />
      <HousePabiszDomain />
      <div className="frieze-band" style={{ backgroundImage: `url(${frieze2})` }} aria-hidden="true" />
      <HousePabiszCouncil />
      <div className="frieze-band" style={{ backgroundImage: `url(${frieze3})` }} aria-hidden="true" />
      <HousePabiszDiplomacy />
      <div className="frieze-band" style={{ backgroundImage: `url(${frieze4})` }} aria-hidden="true" />
      <HousePabiszFooter />
    </HousePabiszShell>
  )
}
