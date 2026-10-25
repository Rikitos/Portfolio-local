/** IMPORTS **/
import DemoSites from './DemoSites'
import Games from './Games'
import Tools from './Tools'

/** COMPONENT **/
// The classic homepage's project chapters, in hiring-priority order:
// 01 demo websites, 02 games, 03 small tools. Each chapter reads its own
// category from data/projects.ts.
export default function Projects() {
  return (
    <>
      <DemoSites />
      <Games />
      <Tools />
    </>
  )
}
