/** IMPORTS **/
import { Link } from 'react-router-dom'
import calculatorImg from '../assets/img/project-calculator.png'
import tictactoeImg from '../assets/img/project-tictactoe.png'
import catGeneratorImg from '../assets/img/project-cat-generator.png'
import roomDesignerImg from '../assets/img/project-room-designer.png'

/** TYPES **/
interface Project {
  title: string
  tags: string[]
  description: string
  href: string
  img: string
  url: string
  external?: boolean
}

/** DATA **/
const projects: Project[] = [
  {
    title: 'Calculator',
    tags: ['React', 'TypeScript', 'Tailwind'],
    description: 'A clean calculator covering the basics: add, subtract, multiply, divide, and percentage.',
    href: '/calculator',
    img: calculatorImg,
    url: 'krzysztofpabisz.pl/calculator',
  },
  {
    title: 'Tic Tac Toe',
    tags: ['React', 'TypeScript', 'Tailwind'],
    description: 'Classic two-player game — tracks turns, detects wins and draws, resets in one click.',
    href: '/tic-tac-toe',
    img: tictactoeImg,
    url: 'krzysztofpabisz.pl/tic-tac-toe',
    external: false,
  },
  {
    title: 'Cat Meme Generator',
    tags: ['React', 'TypeScript', 'Tailwind'],
    description: 'Fetches a random cat image from an API and overlays a customisable caption.',
    href: '/cat-generator',
    img: catGeneratorImg,
    url: 'krzysztofpabisz.pl/cat-generator',
    external: false,
  },
  {
    title: 'Room Designer',
    tags: ['HTML', 'Canvas', 'JavaScript'],
    description: 'Interactive floor planner — draw rooms on a scaled grid, place furniture, export to image.',
    href: '/room-designer',
    img: roomDesignerImg,
    url: 'krzysztofpabisz.pl/room-designer',
    external: false,
  },
]

/** SUBCOMPONENTS **/
const font = "font-['Palatino_Linotype',Palatino,serif]"

function CardLink({ href, external, className, children }: {
  href: string
  external?: boolean
  className?: string
  children: React.ReactNode
}) {
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
  }
  return <Link to={href} className={className}>{children}</Link>
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex flex-col rounded border border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.5)] hover:-translate-y-1 transition-[border-color,transform] duration-200 overflow-hidden group">

      {/* Screenshot frame */}
      <CardLink href={project.href} external={project.external} className="block shrink-0 no-underline">
        {/* Browser chrome */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#c8cdd8] dark:bg-navy-700 border-b border-[rgba(201,168,76,0.12)]">
          <div className="flex gap-[5px] shrink-0">
            <i className="block w-2 h-2 rounded-full bg-[rgba(90,100,128,0.3)] dark:bg-[rgba(136,153,170,0.25)]" />
            <i className="block w-2 h-2 rounded-full bg-[rgba(90,100,128,0.3)] dark:bg-[rgba(136,153,170,0.25)]" />
            <i className="block w-2 h-2 rounded-full bg-[rgba(90,100,128,0.3)] dark:bg-[rgba(136,153,170,0.25)]" />
          </div>
        </div>
        {/* Screenshot */}
        <div className="bg-[#bec4d0] dark:bg-navy-800">
          <img
            src={project.img}
            alt={project.title}
            className="block w-full h-[220px] lg:h-[320px] object-contain object-top"
          />
        </div>
      </CardLink>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-5 flex-1 bg-[#d8dce8] dark:bg-navy-800">
        <h3 className={`${font} text-base font-normal tracking-[0.05em] text-[#1a2035] dark:text-[#C8D8E8] m-0`}>
          {project.title}
        </h3>
        <p className={`${font} text-[0.65rem] tracking-[0.15em] uppercase text-[#C9A84C] opacity-80 m-0`}>
          {project.tags.join(' · ')}
        </p>
        <p className={`${font} text-[0.8rem] leading-relaxed text-[#5a6480] dark:text-[#8899AA] flex-1 mt-1 mb-0`}>
          {project.description}
        </p>
        <CardLink
          href={project.href}
          external={project.external}
          className={`${font} text-[0.7rem] tracking-[0.15em] uppercase text-[#C9A84C] opacity-70 hover:opacity-100 transition-opacity no-underline mt-2 self-start`}
        >
          Open Project →
        </CardLink>
      </div>

    </div>
  )
}

/** COMPONENT **/
export default function Projects() {
  return (
    <section id="projects" className="bg-[#cdd2e0] dark:bg-[#0d1525] py-20 px-5 lg:px-10 transition-colors">
      <div className="max-w-[1100px] mx-auto flex flex-col items-center">

        {/* Heading */}
        <h2 className={`${font} font-normal text-[1.4rem] md:text-[1.8rem] tracking-[0.1em] text-[#5a6480] dark:text-[#c0c8d8] m-0`}>
          Projects
        </h2>
        <span className="block w-[60px] h-px bg-[rgba(201,168,76,0.5)] mt-4 mb-12" />

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
          {projects.map((p) => (
            <ProjectCard key={p.href} project={p} />
          ))}
        </div>

      </div>
    </section>
  )
}
