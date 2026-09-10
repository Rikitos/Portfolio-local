/**
 * Themed Discord Clone sub-page — lighter touch than the other sketches:
 * the Discord UI's own structure/layout/components are kept as-is, only
 * its colors are reskinned via HousePabiszDiscordProvider (every subcomponent
 * reads `useDiscordHousePabisz()` and swaps its hex colors for the House
 * Pabisz CSS variables). No frieze-band/footer here, matching the classic
 * page: DiscordClonePage fills the viewport below the header with its own
 * internal scroll, so trailing content would sit off-screen.
 */
import HousePabiszShell from './HousePabiszShell'
import HousePabiszHeader from './HousePabiszHeader'
import DiscordClonePage from '../../pages/DiscordClonePage'
import { HousePabiszDiscordProvider } from '../../pages/discord-clone/HousePabiszDiscordContext'

interface HousePabiszDiscordClonePageProps {
  dark: boolean
  onToggleDark: () => void
  onShowClassic: () => void
}

export default function HousePabiszDiscordClonePage({ dark, onToggleDark, onShowClassic }: HousePabiszDiscordClonePageProps) {
  return (
    <HousePabiszShell>
      <HousePabiszHeader dark={dark} onToggleDark={onToggleDark} onShowClassic={onShowClassic} isHome={false} />

      <HousePabiszDiscordProvider value={true}>
        <DiscordClonePage dark={dark} />
      </HousePabiszDiscordProvider>
    </HousePabiszShell>
  )
}
