/** IMPORTS **/
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import dayImg from '../assets/img/hero-desk-day.webp'
import nightImg from '../assets/img/hero-desk-night.webp'
import { CAT_ORIGIN, CAT_TORSO, LAMP, SCENE_H, SCENE_W, STARS } from '../data/heroScene'

/** TYPES **/
interface Box {
  left: number
  top: number
  width: number
  height: number
}

interface HeroSceneProps {
  dark: boolean
  /** description of the illustration for screen readers */
  alt: string
}

/** DATA **/
const MD_QUERY = '(min-width: 768px)'
const FADE = 'opacity 700ms'
const CAT_CLIP_ID = 'hero-cat-torso'

// where a cropped picture is anchored horizontally: centred on wide screens, but
// shifted towards the laptop and cat (right of centre) on phones, otherwise a
// portrait viewport would show mostly the chair
const ANCHOR_WIDE = 0.5
const ANCHOR_NARROW = 0.68

// cat torso polygon as an SVG points string
const CAT_POINTS = CAT_TORSO.map(([x, y]) => `${x},${y}`).join(' ')

/** HELPERS **/
// Where the 1672x941 scene lands inside a w x h area when scaled to cover it
// (the same maths as object-fit: cover) and anchored per breakpoint. All layers
// share this one box, so the animated overlays line up with the picture exactly.
function coverBox(w: number, h: number): Box {
  const scale = Math.max(w / SCENE_W, h / SCENE_H)
  const width = SCENE_W * scale
  const height = SCENE_H * scale
  const anchorX = window.matchMedia(MD_QUERY).matches ? ANCHOR_WIDE : ANCHOR_NARROW
  return { left: (w - width) * anchorX, top: (h - height) / 2, width, height }
}

/** COMPONENT **/
// The hero background: the day and night illustrations (cross-fading with the
// theme) plus a thin animated SVG on top of them in the pictures' own
// coordinates: twinkling stars (night only), a breathing lamp glow, and the cat's
// back rising and falling. The motion is a clipped duplicate of the picture
// scaled a hair, so the cat needs no separate cut-out. Fills its positioned parent.
export default function HeroScene({ dark, alt }: HeroSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  // null until measured; the images fall back to object-cover meanwhile
  const [box, setBox] = useState<Box | null>(null)

  // measure before first paint (layout effect) so there's no jump, then keep in
  // sync with resizes and with crossing the md breakpoint
  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    const update = () => setBox(coverBox(host.clientWidth, host.clientHeight))
    update()
    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(host)
    const query = window.matchMedia(MD_QUERY)
    query.addEventListener('change', update)
    return () => {
      resizeObserver.disconnect()
      query.removeEventListener('change', update)
    }
  }, [])

  // freeze the animations while the hero is scrolled out of view (see index.css)
  useEffect(() => {
    const host = hostRef.current
    if (!host || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      host.dataset.offscreen = entry.isIntersecting ? 'false' : 'true'
    })
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  const boxStyle = box ?? { left: 0, top: 0, width: '100%', height: '100%' }

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden">
      <div className="absolute" style={boxStyle}>

        {/* Base pictures: both stay mounted so the theme switch cross-fades */}
        <img
          src={dayImg}
          alt={alt}
          className="absolute inset-0 block w-full h-full object-cover"
          style={{ opacity: dark ? 0 : 1, transition: FADE }}
        />
        <img
          src={nightImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 block w-full h-full object-cover"
          style={{ opacity: dark ? 1 : 0, transition: FADE }}
        />

        {/* Animated layer, in the pictures' pixel space */}
        <svg
          viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <clipPath id={CAT_CLIP_ID}>
              <polygon points={CAT_POINTS} />
            </clipPath>
            <radialGradient id="hero-lamp-glow">
              <stop offset="0%" stopColor="#ffc864" stopOpacity="0.6" />
              <stop offset="35%" stopColor="#ffa03c" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ff8c28" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hero-star-glow">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#dfe9ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#cfe0ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Cat breathing: a copy of the picture, cut to the torso and scaled up a
              touch and back, from the bottom-left of the torso. One copy per theme,
              cross-faded like the base pictures. */}
          {[
            { src: dayImg, visible: !dark },
            { src: nightImg, visible: dark },
          ].map(({ src, visible }) => (
            <image
              key={src}
              href={src}
              width={SCENE_W}
              height={SCENE_H}
              clipPath={`url(#${CAT_CLIP_ID})`}
              className="hero-anim hero-cat"
              style={{
                transformOrigin: `${CAT_ORIGIN.x}px ${CAT_ORIGIN.y}px`,
                opacity: visible ? 1 : 0,
                transition: FADE,
              }}
            />
          ))}

          {/* Lamp glow: warm light that swells and eases, added on top ("screen"
              blend) so it brightens the picture rather than covering it */}
          <circle
            cx={LAMP.x}
            cy={LAMP.y}
            r={LAMP.r}
            fill="url(#hero-lamp-glow)"
            className="hero-anim hero-lamp"
            style={{ mixBlendMode: 'screen', transformOrigin: `${LAMP.x}px ${LAMP.y}px` }}
          />

          {/* Stars: night only. Each is a soft glow that pulses on its own timing
              over the star already painted in the picture, so it reads as twinkling. */}
          <g style={{ opacity: dark ? 1 : 0, transition: FADE }}>
            {STARS.map(([x, y, bright], i) => (
              <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
                <g
                  className="hero-anim hero-star"
                  style={{
                    // spread durations (2.6-5.5s) and start times so stars never pulse in unison
                    animationDuration: `${2.6 + ((i * 37) % 30) / 10}s`,
                    animationDelay: `${((i * 53) % 50) / 10}s`,
                  }}
                >
                  <circle r={bright ? 5 : 3.5} fill="url(#hero-star-glow)" />
                  {bright && (
                    <path d="M-4.5 0H4.5M0-4.5V4.5" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />
                  )}
                </g>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
