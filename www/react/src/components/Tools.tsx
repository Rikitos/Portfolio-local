/** IMPORTS **/
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { tools, type Project, type ProjectLevel } from '../data/projects'
import { useReveal } from '../hooks/useReveal'
import SectionHeading from './SectionHeading'

/** DATA **/
const font = 'font-body'

// number of filled dots per level in the little 3-dot complexity meter
const LEVEL_DOTS: Record<ProjectLevel, number> = { simple: 1, intermediate: 2, advanced: 3 }

// the advanced builds get big cards on their own row; the rest sit in a compact grid
const featured = tools.filter((p) => p.level === 'advanced')
const compact = tools.filter((p) => p.level !== 'advanced')

/** SUBCOMPONENTS **/
// Three dots filled up to the project's level, plus the word, e.g. "●●○ Intermediate".
// The word is visible text, so the dots themselves are decorative.
function LevelMeter({ level }: { level: ProjectLevel }) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex gap-[3px]" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <i
            key={n}
            className={`block w-1.5 h-1.5 rounded-full ${n <= LEVEL_DOTS[level] ? 'bg-[#C9A84C]' : 'bg-[rgba(201,168,76,0.25)]'}`}
          />
        ))}
      </span>
      <span className={`${font} text-[0.65rem] tracking-[0.15em] uppercase text-[#5a6480] dark:text-[#8899AA]`}>
        {t(`toolsSection.levels.${level}`)}
      </span>
    </span>
  )
}

// One tool. `large` shows a wider screenshot and a bigger title; both variants
// are a single link to the in-app route (tools are internal pages, not external sites).
function ToolCard({ project, index, large }: { project: Project; index: number; large?: boolean }) {
  const { t } = useTranslation()
  const reveal = useReveal<HTMLAnchorElement>(index * 100)
  const title = t(`projects.${project.key}.title`, { defaultValue: project.title })

  return (
    <Link
      to={project.href}
      ref={reveal.ref}
      style={reveal.style}
      className={`${reveal.className} group flex flex-col rounded-lg overflow-hidden no-underline border border-[rgba(201,168,76,0.25)] hover:border-[rgba(201,168,76,0.7)] bg-white/70 dark:bg-navy-700 transition-colors duration-200`}
    >
      <div className={`overflow-hidden bg-[#bec4d0] dark:bg-navy-800 ${large ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
        <img
          src={project.img}
          alt=""
          className="block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className={`flex flex-col gap-2 flex-1 ${large ? 'p-6' : 'p-4'}`}>
        <h3 className={`font-display font-normal tracking-tight text-[#1a2035] dark:text-[#e4e8f0] m-0 ${large ? 'text-3xl' : 'text-2xl'}`}>
          {title}
        </h3>
        {project.level && <LevelMeter level={project.level} />}
        <p className={`${font} leading-relaxed text-[#5a6480] dark:text-[#8899AA] flex-1 m-0 ${large ? 'text-[0.9rem]' : 'text-[0.8rem]'}`}>
          {t(`projects.${project.key}.description`)}
        </p>
        <span className={`${font} mt-1 text-[0.7rem] tracking-[0.18em] uppercase text-[#8B6810] dark:text-[#C9A84C]`}>
          {t('toolsSection.cta')} →
        </span>
      </div>
    </Link>
  )
}

/** COMPONENT **/
// Chapter 03 of the classic homepage: every project with category 'tool'
// (data/projects.ts). Advanced builds (Room Designer, Discord Clone) are
// featured on top; simpler ones follow in a four-column grid.
export default function Tools() {
  const { t } = useTranslation()
  return (
    <section
      id="tools"
      className="min-h-svh flex items-center bg-slate-200 dark:bg-navy-800 py-24 px-5 lg:px-10 transition-colors"
    >
      <div className="w-full max-w-[1200px] mx-auto">

        <SectionHeading number="03" label={t('toolsSection.eyebrow')} note={t('toolsSection.intro')} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {featured.map((p, i) => (
            <ToolCard key={p.key} project={p} index={i} large />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {compact.map((p, i) => (
            <ToolCard key={p.key} project={p} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
