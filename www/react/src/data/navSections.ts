/**
 * The classic homepage's chapters, in page order, for the header navigation.
 * `id` is the section element's id (see DemoSites, Games, Tools, About,
 * Contact); `labelKey` is the translated link text under `nav.*`.
 */
export const NAV_SECTIONS = [
  { id: 'projects', labelKey: 'nav.demoSites' },
  { id: 'games', labelKey: 'nav.games' },
  { id: 'tools', labelKey: 'nav.tools' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'contact', labelKey: 'nav.contact' },
] as const

export const NAV_SECTION_IDS = NAV_SECTIONS.map((s) => s.id)
