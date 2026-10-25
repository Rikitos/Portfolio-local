/**
 * Inline SVG icons for the classic design (About + Contact sections).
 *
 * Inline rather than <img> so they inherit `currentColor` and follow the
 * light/dark theme. All are decorative: the visible text (or an aria-label on
 * the wrapping link) carries the meaning, hence aria-hidden.
 *
 * Sources and licences:
 *  - MapPin, Laptop, Gamepad, Mail: Lucide (https://lucide.dev), ISC licence.
 *    24x24 stroke icons, drawn with a 2px round stroke.
 *  - GitHub, LinkedIn: Bootstrap Icons (https://icons.getbootstrap.com), MIT
 *    licence. 16x16 filled glyphs. (Simple Icons dropped the LinkedIn logo.)
 *  - Technology logos live in data/techIcons.ts (Simple Icons, CC0).
 * Brand logos are trademarks of their owners and are used only to identify the
 * technologies themselves.
 */
import type { ReactNode } from 'react'

interface IconProps {
  className?: string
}

/** Shared wrapper for the Lucide stroke icons (24x24 grid, 2px round stroke). */
function StrokeIcon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

/** Filled single-path brand glyph; `viewBox` differs per source set (16 or 24). */
export function BrandIcon({ path, viewBox = '0 0 24 24', className }: IconProps & { path: string; viewBox?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} />
    </svg>
  )
}

/** Location marker (Lucide "map-pin"). */
export function MapPinIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </StrokeIcon>
  )
}

/** Laptop (Lucide "laptop"). */
export function LaptopIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z" />
      <path d="M20.054 15.987H3.946" />
    </StrokeIcon>
  )
}

/** Game controller (Lucide "gamepad-2"). */
export function GamepadIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <line x1="6" x2="10" y1="11" y2="11" />
      <line x1="8" x2="8" y1="9" y2="13" />
      <line x1="15" x2="15.01" y1="12" y2="12" />
      <line x1="18" x2="18.01" y1="10" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
    </StrokeIcon>
  )
}

/** Envelope (Lucide "mail"). */
export function MailIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
      <rect x="2" y="4" width="20" height="16" rx="2" />
    </StrokeIcon>
  )
}

/** GitHub mark (Bootstrap Icons "github", 16x16). */
export function GitHubIcon({ className }: IconProps) {
  return <BrandIcon className={className} viewBox="0 0 16 16" path='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8' />
}

/** LinkedIn "in" tile (Bootstrap Icons "linkedin", 16x16). */
export function LinkedInIcon({ className }: IconProps) {
  return <BrandIcon className={className} viewBox="0 0 16 16" path='M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z' />
}
