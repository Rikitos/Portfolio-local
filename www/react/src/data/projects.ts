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

export interface Project {
  key: string
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
    title: 'Salon Kosmetyczny',
    tags: ['Astro', 'Tailwind', 'Typescript'],
    href: 'https://kosmetologia.krzysztofpabisz.pl',
    img: kosmetologiaImg,
    url: 'kosmetologia.krzysztofpabisz.pl',
    external: true,
    personal: false,
  },
  {
    key: 'kawiarnia',
    title: 'Kawiarnia',
    tags: ['Astro', 'Tailwind', 'Typescript'],
    href: 'https://kawiarnia.krzysztofpabisz.pl',
    img: kawiarniaImg,
    url: 'kawiarnia.krzysztofpabisz.pl',
    external: true,
    personal: false,
  },
  {
    key: 'epochronos',
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
    title: 'Haymakers',
    tags: ['Game', 'Demo'],
    href: 'https://haymakers.krzysztofpabisz.pl',
    img: haymakersImg,
    url: 'haymakers.krzysztofpabisz.pl',
    external: true,
    personal: true,
  },
  {
    key: 'calculator',
    title: 'Calculator',
    tags: ['React', 'TypeScript', 'Tailwind'],
    href: '/calculator',
    img: calculatorImg,
    url: 'krzysztofpabisz.pl/calculator',
    personal: true,
  },
  {
    key: 'room-designer',
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
