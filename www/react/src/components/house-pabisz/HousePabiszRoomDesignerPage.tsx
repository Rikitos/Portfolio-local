/**
 * Themed Room Designer sub-page — header/nav only, for now. RoomDesignerPage
 * has its own established blueprint/paper dual-theme for the canvas, toolbar,
 * and sidebar (see CLAUDE.md), so reskinning that to House Pabisz colors is
 * left as a separate, larger effort. RoomDesignerPage measures the actual
 * header itself and adapts its own top offset accordingly — it works the
 * same whether wrapped by this `sticky` header or the classic `fixed` one,
 * same as the Discord Clone wrapper.
 */
import HousePabiszShell from './HousePabiszShell'
import HousePabiszHeader from './HousePabiszHeader'
import RoomDesignerPage from '../../pages/RoomDesignerPage'

interface HousePabiszRoomDesignerPageProps {
  dark: boolean
  onToggleDark: () => void
  onShowClassic: () => void
}

export default function HousePabiszRoomDesignerPage({ dark, onToggleDark, onShowClassic }: HousePabiszRoomDesignerPageProps) {
  return (
    <HousePabiszShell>
      <HousePabiszHeader dark={dark} onToggleDark={onToggleDark} onShowClassic={onShowClassic} isHome={false} />
      <RoomDesignerPage dark={dark} />
    </HousePabiszShell>
  )
}
