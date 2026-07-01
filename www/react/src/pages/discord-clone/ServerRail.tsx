/**
 * ServerRail.tsx — the far-left vertical strip of server icons.
 *
 * Renders one button per server as a coloured circle with the server's iconLabel.
 * The selected server gets a white pill indicator on the left edge (Discord's classic pill).
 * A separator line sits above a "+" button placeholder for visual completeness.
 */

import { useState } from 'react'
import type { Server } from './types'

interface ServerRailProps {
  servers: Server[]
  selectedId: string
  onSelect: (id: string) => void
  dark: boolean
  // Set of channelIds that have unread messages — used to show a badge on the server icon
  unreadChannelIds?: Set<string>
}

export default function ServerRail({ servers, selectedId, onSelect, dark, unreadChannelIds }: ServerRailProps) {
  const bg     = dark ? '#1e2124' : '#e3e5e8'
  const pillBg = dark ? '#ffffff' : '#313338'

  // Track which server button is hovered for the pill animation
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <nav
      className="flex flex-col items-center pt-3 gap-2 overflow-y-auto shrink-0"
      style={{ width: 72, backgroundColor: bg, minHeight: '100%' }}
    >
      {servers.map((server) => {
        const selected = server.id === selectedId
        const hovered  = hoveredId === server.id
        // Server has unread if any of its channels is in the unread set
        const hasUnread = !selected && !!unreadChannelIds &&
          server.channels.some((c) => unreadChannelIds.has(c.id))

        return (
          <div
            key={server.id}
            className="relative flex items-center w-full justify-center"
            onMouseEnter={() => setHoveredId(server.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Left pill — tall when selected, short when hovered */}
            <span
              className="absolute left-0 rounded-r-full transition-all duration-200"
              style={{
                width: 4,
                backgroundColor: pillBg,
                height: selected ? 40 : hovered ? 20 : 0,
                opacity: selected || hovered ? 1 : 0,
              }}
            />

            <button
              onClick={() => onSelect(server.id)}
              title={server.name}
              className="flex items-center justify-center text-xl font-bold transition-all duration-200 border-0 cursor-pointer shrink-0"
              style={{
                width: 48,
                height: 48,
                backgroundColor: server.iconColor,
                borderRadius: selected || hovered ? 16 : 24,
                boxShadow: selected ? `0 0 0 3px ${server.iconColor}55` : 'none',
                color: '#ffffff',
                fontSize: '1.1rem',
              }}
            >
              {server.iconLabel}
            </button>

            {/* Unread dot — bottom-right of the icon, hidden when server is selected */}
            {hasUnread && (
              <span
                className="absolute rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: dark ? '#ffffff' : '#313338',
                  border: `2px solid ${bg}`,
                  bottom: 2,
                  right: 10,
                }}
              />
            )}
          </div>
        )
      })}

      {/* Separator + add server button — non-functional, just visual chrome */}
      <div
        className="w-8 rounded-full shrink-0"
        style={{ height: 2, backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)', margin: '4px 0' }}
      />
      <button
        className="flex items-center justify-center rounded-full border-0 cursor-pointer shrink-0 transition-all duration-200"
        title="Add a Server"
        style={{
          width: 48,
          height: 48,
          backgroundColor: dark ? 'rgba(87,242,135,0.15)' : 'rgba(87,242,135,0.2)',
          color: '#57F287',
          fontSize: '1.5rem',
          borderRadius: 24,
        }}
        onClick={() => {/* intentionally non-functional */}}
      >
        +
      </button>
    </nav>
  )
}
