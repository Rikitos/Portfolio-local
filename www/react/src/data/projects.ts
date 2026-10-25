/**
 * Shared project catalogue.
 *
 * Single source of truth for every project shown on the homepage, in either
 * design ("classic" Projects grid or the House Pabisz Domain section).
 * Descriptions are NOT stored here — they're translated strings, looked up
 * at render time via `projects.<key>.description` in src/i18n/locales/*.json.
 * Everything else (titles, tags, tech stack, URLs) is literal — proper nouns
 * and tech names don't need translation.
 */
import kosmetologiaImg from '../assets/img/project-kosmetologia.jpg'
import kawiarniaImg from '../assets/img/project-kawiarnia.png'
import epochronosImg from '../assets/img/project-epochronos.png'
import haymakersImg from '../assets/img/project-haymakers.png'
import calculatorImg from '../assets/img/project-calculator.png'
import tictactoeImg from '../assets/img/project-tictactoe.png'
import catGeneratorImg from '../assets/img/project-cat-generator.png'
import roomDesignerImg from '../assets/img/project-room-designer.png'
import discordImg from '../assets/img/project-discord.png'
import game2048Img from '../assets/img/project-2048.png'

/** Which homepage section a project belongs to (classic design): hiring-focused demo
 * websites lead, then games, then small tools. */
export type ProjectCategory = 'demo' | 'game' | 'tool'

/** Rough build complexity, shown on the tools section (tools only). */
export type ProjectLevel = 'simple' | 'intermediate' | 'advanced'

export interface Project {
  key: string
  category: ProjectCategory
  level?: ProjectLevel
  title: string
  tags: string[]
  href: string
  img: string
  url: string
  external?: boolean
  /** Client work (false) vs personal project (true) — used by the House Pabisz
   * Domain section to label each Duchy "Held in Vassalage" vs "Held Directly". */
  personal: boolean
}

// external:true items are the "Duchies" (client/hosted-elsewhere work) in the
// House Pabisz design; the rest are the "Baronies" (in-app projects).
export const projects: Project[] = [
  {
    key: 'kosmetologia',
    category: 'demo',
    title: 'Salon Kosmetyczny',
    tags: ['Astro', 'Tailwind', 'TypeScript'],
    href: 'https://kosmetologia.krzysztofpabisz.pl',
    img: kosmetologiaImg,
    url: 'kosmetologia.krzysztofpabisz.pl',
    external: true,
    personal: false,
  },
  {
    key: 'kawiarnia',
    category: 'demo',
    title: 'Kawiarnia',
    tags: ['Astro', 'Tailwind', 'TypeScript'],
    href: 'https://kawiarnia.krzysztofpabisz.pl',
    img: kawiarniaImg,
    url: 'kawiarnia.krzysztofpabisz.pl',
    external: true,
    personal: false,
  },
  {
    key: 'epochronos',
    category: 'game',
    title: 'Epochronos',
    tags: ['React', 'JavaScript', 'Vite'],
    href: 'https://epochronos.krzysztofpabisz.pl',
    img: epochronosImg,
    url: 'epochronos.krzysztofpabisz.pl',
    external: true,
    personal: true,
  },
  {
    key: 'haymakers',
    category: 'game',
    title: 'Haymakers',
    tags: ['Godot', 'Fighting game', 'Web demo'],
    href: 'https://haymakers.krzysztofpabisz.pl',
    img: haymakersImg,
    url: 'haymakers.krzysztofpabisz.pl',
    external: true,
    personal: true,
  },
  {
    key: 'calculator',
    category: 'tool',
    level: 'simple',
    title: 'Calculator',
    tags: ['React', 'TypeScript', 'Tailwind'],
    href: '/calculator',
    img: calculatorImg,
    url: 'krzysztofpabisz.pl/calculator',
    personal: true,
  },
  {
    key: 'room-designer',
    category: 'tool',
    level: 'advanced',
    title: 'Room Designer',
    tags: ['HTML', 'Canvas', 'JavaScript'],
    href: '/room-designer',
    img: roomDesignerImg,
    url: 'krzysztofpabisz.pl/room-designer',
    external: false,
    personal: true,
  },
  {
    key: 'cat-generator',
    category: 'tool',
    level: 'simple',
    title: 'Cat Meme Generator',
    tags: ['React', 'TypeScript', 'Tailwind'],
    href: '/cat-generator',
    img: catGeneratorImg,
    url: 'krzysztofpabisz.pl/cat-generator',
    external: false,
    personal: true,
  },
  {
    key: 'discord-clone',
    category: 'tool',
    level: 'advanced',
    title: 'Discord Clone',
    tags: ['React', 'TypeScript', 'Tailwind'],
    href: '/discord-clone',
    img: discordImg,
    url: 'krzysztofpabisz.pl/discord-clone',
    external: false,
    personal: true,
  },
  {
    key: 'tic-tac-toe',
    category: 'tool',
    level: 'simple',
    title: 'Tic Tac Toe',
    tags: ['React', 'TypeScript', 'Tailwind'],
    href: '/tic-tac-toe',
    img: tictactoeImg,
    url: 'krzysztofpabisz.pl/tic-tac-toe',
    external: false,
    personal: true,
  },
  {
    key: 'game-2048',
    category: 'tool',
    level: 'intermediate',
    title: '2048',
    tags: ['React', 'TypeScript', 'Tailwind'],
    href: '/2048',
    img: game2048Img,
    url: 'krzysztofpabisz.pl/2048',
    external: false,
    personal: true,
  },
]

export const duchies = projects.filter((p) => p.external)
export const baronies = projects.filter((p) => !p.external)
export const demoSites = projects.filter((p) => p.category === 'demo')
export const otherProjects = projects.filter((p) => p.category !== 'demo')
export const games = projects.filter((p) => p.category === 'game')
export const tools = projects.filter((p) => p.category === 'tool')
