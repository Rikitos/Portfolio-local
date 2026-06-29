import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import CalculatorPage from './pages/CalculatorPage'
import TicTacToePage from './pages/TicTacToePage'
import CatGeneratorPage from './pages/CatGeneratorPage'
import RoomDesignerPage from './pages/RoomDesignerPage'

export default function App() {
  const [dark, setDark] = useState(true)

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen" style={{ backgroundColor: dark ? '#060D1A' : '#d8dce8' }}>
        <Header dark={dark} onToggle={() => setDark(!dark)} />

        <Routes>
          <Route path="/" element={<Home dark={dark} />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/tic-tac-toe" element={<TicTacToePage />} />
          <Route path="/cat-generator" element={<CatGeneratorPage />} />
          <Route path="/room-designer" element={<RoomDesignerPage dark={dark} onToggleTheme={() => setDark(!dark)} />} />
        </Routes>

        <Footer />
      </div>
    </div>
  )
}
