/**
 * Splits `text` into words and stagger-fades them in ("being written out")
 * once `active` flips true. Words are computed fresh from `text` on every
 * render, so a language switch replays the stagger on the new copy instead
 * of leaving stale DOM behind.
 */
import type { ElementType } from 'react'
import { usePrefersReducedMotion } from './hooks'

interface WordRevealProps {
  text: string
  active: boolean
  baseDelayMs?: number
  as?: ElementType
  className?: string
}

const MS_PER_WORD = 70

export default function WordReveal({ text, active, baseDelayMs = 0, as: Tag = 'p', className }: WordRevealProps) {
  const reducedMotion = usePrefersReducedMotion()
  if (reducedMotion) return <Tag className={className}>{text}</Tag>

  let wordIndex = 0
  return (
    <Tag className={className}>
      {text.split(/(\s+)/).map((chunk, i) => {
        if (chunk.trim() === '') return chunk
        const idx = wordIndex++
        return active ? (
          <span key={i} className="word-reveal" style={{ animationDelay: `${baseDelayMs + idx * MS_PER_WORD}ms` }}>
            {chunk}
          </span>
        ) : (
          <span key={i} style={{ opacity: 0, display: 'inline-block' }}>{chunk}</span>
        )
      })}
    </Tag>
  )
}
