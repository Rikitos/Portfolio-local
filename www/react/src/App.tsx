import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import CalculatorPage from './pages/CalculatorPage'
import TicTacToePage from './pages/TicTacToePage'
import CatGeneratorPage from './pages/CatGeneratorPage'
import RoomDesignerPage from './pages/RoomDesignerPage'
import DiscordClonePage from './pages/DiscordClonePage'
import Game2048Page from './pages/Game2048Page'
import HousePabiszCalculatorPage from './components/house-pabisz/HousePabiszCalculatorPage'
import HousePabiszTicTacToePage from './components/house-pabisz/HousePabiszTicTacToePage'
import HousePabiszCatGeneratorPage from './components/house-pabisz/HousePabiszCatGeneratorPage'
import HousePabiszGame2048Page from './components/house-pabisz/HousePabiszGame2048Page'
import HousePabiszDiscordClonePage from './components/house-pabisz/HousePabiszDiscordClonePage'
import HousePabiszRoomDesignerPage from './components/house-pabisz/HousePabiszRoomDesignerPage'
import { THEMED_ROUTES } from './data/themedRoutes'
import type { HomeDesign } from './pages/Home'

export default function App() {
  const [dark, setDark] = useState(false)
  const [design, setDesign] = useState<HomeDesign>('house-pabisz')
  const { pathname } = useLocation()

  // House Pabisz pages are fully self-contained (own header + footer, same
  // as the original concept) — the app chrome only shows everywhere else.
  const showAppChrome = !(design === 'house-pabisz' && THEMED_ROUTES.includes(pathname))

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen" style={{ backgroundColor: dark ? '#060D1A' : '#d8dce8' }}>
        {showAppChrome && (
          <Header dark={dark} onToggle={() => setDark(!dark)} onShowHousePabisz={() => setDesign('house-pabisz')} />
        )}

        <Routes>
          <Route path="/" element={<Home dark={dark} design={design} onToggleDark={() => setDark(!dark)} onShowClassic={() => setDesign('current')} />} />
          <Route path="/calculator" element={
            design === 'house-pabisz'
              ? <HousePabiszCalculatorPage dark={dark} onToggleDark={() => setDark(!dark)} onShowClassic={() => setDesign('current')} />
              : <CalculatorPage />
          } />
          <Route path="/tic-tac-toe" element={
            design === 'house-pabisz'
              ? <HousePabiszTicTacToePage dark={dark} onToggleDark={() => setDark(!dark)} onShowClassic={() => setDesign('current')} />
              : <TicTacToePage />
          } />
          <Route path="/cat-generator" element={
            design === 'house-pabisz'
              ? <HousePabiszCatGeneratorPage dark={dark} onToggleDark={() => setDark(!dark)} onShowClassic={() => setDesign('current')} />
              : <CatGeneratorPage />
          } />
          <Route path="/room-designer" element={
            design === 'house-pabisz'
              ? <HousePabiszRoomDesignerPage dark={dark} onToggleDark={() => setDark(!dark)} onShowClassic={() => setDesign('current')} />
              : <RoomDesignerPage dark={dark} onToggleTheme={() => setDark(!dark)} />
          } />
          <Route path="/discord-clone" element={
            design === 'house-pabisz'
              ? <HousePabiszDiscordClonePage dark={dark} onToggleDark={() => setDark(!dark)} onShowClassic={() => setDesign('current')} />
              : <DiscordClonePage dark={dark} />
          } />
          <Route path="/2048" element={
            design === 'house-pabisz'
              ? <HousePabiszGame2048Page dark={dark} onToggleDark={() => setDark(!dark)} onShowClassic={() => setDesign('current')} />
              : <Game2048Page dark={dark} />
          } />
        </Routes>

        {showAppChrome && <Footer />}
      </div>
    </div>
  )
}
