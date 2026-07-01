/**
 * GifPicker.tsx — popup gif browser showing GIF_POOL images.
 *
 * Tag filter chips across the top let the user narrow by category.
 * Clicking a gif calls onPick with the gif object so the parent can
 * send it as a 'gif' type message.
 */

import { useState } from 'react'
import { GIF_POOL } from './seed-data'

interface GifPickerProps {
  onPick: (gif: { url: string; alt: string }) => void
  onClose: () => void
  dark: boolean
}

// Collect unique tags from the pool
const ALL_TAGS = ['all', ...Array.from(new Set(
  GIF_POOL.flatMap((g) => g.tag.split(',').map((t) => t.trim()))
))]

export default function GifPicker({ onPick, onClose, dark }: GifPickerProps) {
  const [activeTag, setActiveTag] = useState('all')

  const bg       = dark ? '#2b2d31' : '#ffffff'
  const border   = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const chipBg   = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const chipActive = '#5865F2'
  const textMute = dark ? '#949ba4' : '#6d6f78'

  const filtered = activeTag === 'all'
    ? GIF_POOL
    : GIF_POOL.filter((g) => g.tag.split(',').map((t) => t.trim()).includes(activeTag))

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      <div
        className="absolute bottom-full mb-2 right-0 rounded-lg overflow-hidden z-40 flex flex-col"
        style={{
          width: 340,
          height: 380,
          backgroundColor: bg,
          border: `1px solid ${border}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="text-[0.75rem] font-semibold mb-2" style={{ color: textMute }}>
            GIFs
          </div>

          {/* Tag filter chips */}
          <div className="flex flex-wrap gap-1">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className="px-2 py-[3px] rounded-full text-[0.72rem] font-medium border-0 cursor-pointer transition-colors capitalize"
                style={{
                  backgroundColor: activeTag === tag ? chipActive : chipBg,
                  color: activeTag === tag ? '#ffffff' : textMute,
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Gif grid — 2 columns */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((gif) => (
              <button
                key={gif.url}
                onClick={() => { onPick(gif); onClose() }}
                className="relative rounded-md overflow-hidden border-0 cursor-pointer p-0 transition-opacity hover:opacity-80"
                style={{ aspectRatio: '16/9', backgroundColor: dark ? '#1e1f22' : '#f2f3f5' }}
                title={gif.alt}
              >
                <img
                  src={gif.url}
                  alt={gif.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
