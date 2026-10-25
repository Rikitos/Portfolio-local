import Hero from '../components/Hero'
import Projects from '../components/Projects'
import About from '../components/About'
import Contact from '../components/Contact'
import HousePabiszHome from '../components/house-pabisz/HousePabiszHome'

export type HomeDesign = 'house-pabisz' | 'current'

interface HomeProps {
  dark: boolean
  design: HomeDesign
  onToggleDark: () => void
  onShowClassic: () => void
}

export default function Home({ dark, design, onToggleDark, onShowClassic }: HomeProps) {
  if (design === 'house-pabisz') {
    return <HousePabiszHome dark={dark} onToggleDark={onToggleDark} onShowClassic={onShowClassic} />
  }

  return (
    <>
      <Hero dark={dark} />
      <Projects />
      <About />
      <Contact />
    </>
  )
}
