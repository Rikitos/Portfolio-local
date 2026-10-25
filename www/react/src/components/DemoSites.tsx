/** IMPORTS **/
import { useTranslation } from 'react-i18next'
import { demoSites, type Project } from '../data/projects'
import { useReveal } from '../hooks/useReveal'
import SectionHeading from './SectionHeading'

/** DATA **/
const font = 'font-body'

/** SUBCOMPONENTS **/
// One demo site, borderless like the games: the screenshot (a link to the live
// site) on top, then the title with "Visit demo" on its right, the description,
// and the category + stack pills underneath the text.
function DemoCard({ project, index }: { project: Project; index: number }) {
  const { t } = useTranslation()
  const reveal = useReveal(index * 120)
  // same pattern as the rest of the site: proper-noun titles stay literal and a
  // few get an English override from the locale files
  const title = t(`projects.${project.key}.title`, { defaultValue: project.title })

  return (
    <article ref={reveal.ref} style={reveal.style} className={`${reveal.className} group flex flex-col`}>

      {/* Screenshot: the whole image is a link to the live site */}
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${title} - ${t('demoSites.cta')}`}
        className="block overflow-hidden rounded-lg border border-[rgba(201,168,76,0.25)] group-hover:border-[rgba(201,168,76,0.7)] transition-colors no-underline"
      >
        <div className="aspect-[16/10] bg-[#bec4d0] dark:bg-navy-800">
          <img
            src={project.img}
            alt={title}
            className="block w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
      </a>

      {/* Body */}
      <div className="flex flex-col gap-3 pt-6 flex-1">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-3xl md:text-4xl font-normal tracking-tight text-[#1a2035] dark:text-[#e4e8f0] m-0">
            {title}
          </h3>
          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${font} shrink-0 whitespace-nowrap text-[0.75rem] tracking-[0.18em] uppercase text-[#8B6810] dark:text-[#C9A84C] no-underline border-b border-[rgba(201,168,76,0.5)] pb-0.5 hover:border-[#C9A84C] transition-colors`}
          >
            {t('demoSites.cta')} →
          </a>
        </div>

        <p className={`${font} text-[0.95rem] leading-relaxed text-[#5a6480] dark:text-[#8899AA] flex-1 m-0`}>
          {t(`projects.${project.key}.description`)}
        </p>

        {/* Category first (outlined), then the tech stack */}
        <ul className="flex flex-wrap gap-2 list-none p-0 mt-1 mb-0">
          <li className={`${font} text-[0.65rem] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full border border-[rgba(201,168,76,0.6)] text-[#8B6810] dark:text-[#C9A84C]`}>
            {t('demoSites.badge')}
          </li>
          {project.tags.map((tag) => (
            <li
              key={tag}
              className={`${font} text-[0.65rem] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full bg-[rgba(36,61,92,0.1)] dark:bg-[rgba(201,168,76,0.1)] text-[#3a4566] dark:text-[#c9a84c]`}
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

/** COMPONENT **/
// Chapter 01 of the classic homepage and the lead section for the job hunt:
// every project with category 'demo' (data/projects.ts) renders here, so adding
// a demo site is one data entry. The grid is two columns from md up and simply
// wraps to extra rows as sites are added.
export default function DemoSites() {
  const { t } = useTranslation()
  return (
    <section
      id="projects"
      className="min-h-svh flex items-center bg-slate-100 dark:bg-navy-800 py-24 px-5 lg:px-10 transition-colors"
    >
      <div className="w-full max-w-[1200px] mx-auto">

        <SectionHeading number="01" label={t('demoSites.eyebrow')} note={t('demoSites.intro')} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {demoSites.map((p, i) => (
            <DemoCard key={p.key} project={p} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
