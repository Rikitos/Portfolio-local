/** IMPORTS **/
import { useTranslation } from 'react-i18next'
import { games, type Project } from '../data/projects'
import { useReveal } from '../hooks/useReveal'
import SectionHeading from './SectionHeading'

/** DATA **/
const font = 'font-body'

/** SUBCOMPONENTS **/
// One playable game: a large screenshot (links to the game) with the title,
// description, stack tags and a "Play now" button underneath.
function GameCard({ project, index }: { project: Project; index: number }) {
  const { t } = useTranslation()
  const reveal = useReveal(index * 150)
  const title = t(`projects.${project.key}.title`, { defaultValue: project.title })

  return (
    <article ref={reveal.ref} style={reveal.style} className={`${reveal.className} group flex flex-col`}>

      {/* Screenshot: the whole frame is the link, "Playable" marks it as a live demo */}
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${title} - ${t('gamesSection.cta')}`}
        className="relative block overflow-hidden rounded-lg border border-[rgba(201,168,76,0.25)] group-hover:border-[rgba(201,168,76,0.7)] transition-colors no-underline"
      >
        <div className="aspect-[16/10] bg-navy-800">
          <img
            src={project.img}
            alt={title}
            className="block w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
        <span className={`${font} absolute top-3 left-3 text-[0.6rem] tracking-[0.2em] uppercase px-2.5 py-1 rounded bg-[rgba(6,13,26,0.8)] text-[#C9A84C] border border-[rgba(201,168,76,0.5)]`}>
          {t('gamesSection.badge')}
        </span>
      </a>

      {/* Body */}
      <div className="flex flex-col gap-4 pt-6">
        <h3 className={`font-display text-4xl md:text-5xl font-normal tracking-tight text-[#e4e8f0] m-0`}>
          {title}
        </h3>

        <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className={`${font} text-[0.65rem] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.1)] text-[#c9a84c]`}
            >
              {tag}
            </li>
          ))}
        </ul>

        <p className={`${font} text-[0.95rem] leading-relaxed text-[#9fb0cc] m-0`}>
          {t(`projects.${project.key}.description`)}
        </p>

        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${font} self-start mt-2 text-[0.75rem] tracking-[0.2em] uppercase px-8 py-3 rounded border border-[rgba(201,168,76,0.6)] bg-[#C9A84C] text-[#14110a] no-underline hover:bg-[#e0c36e] transition-colors`}
        >
          ▶ {t('gamesSection.cta')}
        </a>
      </div>
    </article>
  )
}

/** COMPONENT **/
// Chapter 02 of the classic homepage: every project with category 'game'
// (data/projects.ts). Always dark, in both themes, so it contrasts with the
// lighter demo-sites chapter above it.
export default function Games() {
  const { t } = useTranslation()
  return (
    <section
      id="games"
      className="min-h-svh flex items-center bg-navy-900 py-24 px-5 lg:px-10"
    >
      <div className="w-full max-w-[1200px] mx-auto">

        <SectionHeading number="02" label={t('gamesSection.eyebrow')} note={t('gamesSection.intro')} tone="dark" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {games.map((p, i) => (
            <GameCard key={p.key} project={p} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
