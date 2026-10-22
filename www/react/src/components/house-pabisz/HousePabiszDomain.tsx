/** IMPORTS **/
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { duchies, baronies, type Project } from '../../data/projects'
import { useReveal } from './hooks'
import WordReveal from './WordReveal'

/** SUBCOMPONENTS **/
function DuchyLink({ project, children, className }: { project: Project; children: React.ReactNode; className?: string }) {
  return project.external
    ? <a href={project.href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
    : <Link to={project.href} className={className}>{children}</Link>
}

function Duchy({ project }: { project: Project }) {
  const { t } = useTranslation()
  const { ref, visible } = useReveal<HTMLDivElement>()
  // most titles are proper nouns and stay literal; a few (e.g. the Polish
  // business name "Salon Kosmetyczny") get an English override — falls back
  // to the literal title when no override exists
  const title = t(`projects.${project.key}.title`, { defaultValue: project.title })

  return (
    <div ref={ref} className={`duchy reveal ${visible ? 'visible' : ''}`}>
      <DuchyLink project={project} className="duchy-shot">
        <span className="corner-tag">{t('housePabisz.domain.duchyTag')}</span>
        <img src={project.img} alt={title} />
      </DuchyLink>
      <div className="duchy-copy">
        <span className="chapter">{t(project.personal ? 'housePabisz.domain.personalLabelSingular' : 'housePabisz.domain.vassalLabel')}</span>
        <h3>{title}</h3>
        <WordReveal as="p" text={t(`housePabisz.domain.${project.key}.description`)} active={visible} baseDelayMs={300} />
        <div className="levies">
          {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <DuchyLink project={project} className="duchy-link">{t('housePabisz.domain.visitDuchy')}</DuchyLink>
      </div>
    </div>
  )
}

function Barony({ project, index }: { project: Project; index: number }) {
  const { t } = useTranslation()
  const { ref, visible } = useReveal<HTMLAnchorElement>()
  const title = t(`projects.${project.key}.title`, { defaultValue: project.title })
  const inner = (
    <>
      <div className="barony-card">
        <div className="barony-bg transparent">
          <div className="mid" />
          <div className="cap top" />
          <div className="cap bottom" />
        </div>
        <div className="barony-inner">
          <img src={project.img} alt={title} />
        </div>
      </div>
      <div className="barony-body">
        <h4>{title}</h4>
        <span className="chapter">{project.tags[0]}</span>
      </div>
    </>
  )
  const className = `barony reveal ${visible ? 'visible' : ''}`
  return project.external ? (
    <a ref={ref} href={project.href} target="_blank" rel="noopener noreferrer" className={className} style={{ transitionDelay: `${index * 70}ms` }}>{inner}</a>
  ) : (
    <Link ref={ref} to={project.href} className={className} style={{ transitionDelay: `${index * 70}ms` }}>{inner}</Link>
  )
}

/** COMPONENT **/
export default function HousePabiszDomain() {
  const { t } = useTranslation()

  return (
    <section id="domain" className="tex-linen linen-wash">
      <div className="wrap">
        <span className="chapter">{t('housePabisz.domain.chapter')}</span>
        <div className="section-head centered">
          <h2>{t('housePabisz.domain.title')}</h2>
          <span className="coat-emblem" role="img" aria-label="Personal coat of arms" />
          <span className="eyebrow">{t('housePabisz.domain.eyebrow')}</span>
        </div>
        <div className="section-rule" />

        {duchies.map((p) => <Duchy key={p.key} project={p} />)}

        <div style={{ marginTop: 56 }}>
          <span className="chapter">{t('housePabisz.domain.personalLabelPlural')}</span>
          <h3 style={{ fontSize: '1.3rem', marginBottom: 6 }}>{t('housePabisz.domain.baroniesTitle')}</h3>
          <p style={{ color: 'var(--ink-muted)', fontSize: '.95rem' }}>{t('housePabisz.domain.baroniesSubtitle')}</p>
          <div className="baronies">
            {baronies.map((p, i) => <Barony key={p.key} project={p} index={i} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
