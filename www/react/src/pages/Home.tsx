import Hero from '../components/Hero'
import Projects from '../components/Projects'

export default function Home({ dark }: { dark: boolean }) {
  return (
    <>
      <Hero dark={dark} />
      <Projects />
    </>
  )
}
