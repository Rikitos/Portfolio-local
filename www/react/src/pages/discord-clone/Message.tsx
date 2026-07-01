/**
 * Message.tsx — a single message row in the chat.
 *
 * Handles three content types:
 *   text    — plain text content, rendered with basic newline support
 *   gif     — animated image from a URL, constrained width
 *   image   — static image, same treatment as gif
 *
 * Consecutive messages from the same user within 5 minutes are "grouped" —
 * the parent MessageList passes `grouped=true` to suppress the avatar and
 * username, matching Discord's compact display.
 *
 * Reactions are rendered below the message content as pill buttons.
 * Hovering a message reveals a small reaction-add button (smiley face icon)
 * in the top-right corner. Clicking it opens a compact emoji picker for quick
 * reactions. Clicking an existing reaction pill toggles the local user's reaction.
 */

import { useState, useRef, useEffect } from 'react'
import type { Message as MessageType, User, LocalUser } from './types'
import UserAvatar from './UserAvatar'

// Quick-react emojis shown in the hover popup — most common Discord reactions
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '💀', '😭', '🫡', '💯', '👀']

interface MessageProps {
  message: MessageType
  users: Record<string, User>
  localUser: LocalUser
  // When true: this message is a continuation from the same user — hide avatar/name
  grouped: boolean
  dark: boolean
  onReact?: (messageId: string, emoji: string) => void
}

export default function Message({ message, users, localUser, grouped, dark, onReact }: MessageProps) {
  const isLocal     = message.userId === 'local_user'
  const user        = isLocal ? localUser : users[message.userId]
  const displayName = user?.displayName ?? 'Unknown'
  const textColor   = dark ? '#dbdee1' : '#313338'
  const nameColor   = dark ? '#f2f3f5' : '#060607'
  const metaColor   = dark ? '#949ba4' : '#80848e'

  const [hovered,      setHovered]      = useState(false)
  const [pickerOpen,   setPickerOpen]   = useState(false)
  // Track whether the mouse is inside the row or the picker so we can close
  // the picker when both are left — avoids flicker on moving between them.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setPickerOpen(false), 120)
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  // Close picker on Escape
  useEffect(() => {
    if (!pickerOpen) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setPickerOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pickerOpen])

  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const rowBg = isLocal
    ? (dark ? 'rgba(88,101,242,0.06)' : 'rgba(88,101,242,0.04)')
    : hovered
      ? (dark ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)')
      : 'transparent'

  return (
    <div
      className="flex items-start gap-3 px-4 relative"
      style={{ paddingTop: grouped ? 2 : 16, paddingBottom: 2, backgroundColor: rowBg }}
      onMouseEnter={() => { setHovered(true); cancelClose() }}
      onMouseLeave={() => { setHovered(false); scheduleClose() }}
    >
      {/* Avatar column — always 40px wide to keep text aligned even in grouped rows */}
      <div className="shrink-0" style={{ width: 40 }}>
        {!grouped && (
          <UserAvatar userId={message.userId} users={users} localUser={localUser} size={40} showStatus={false} />
        )}
        {grouped && (
          <span
            className="text-[0.65rem] flex items-center justify-end h-full"
            style={{ color: metaColor, lineHeight: '20px', paddingTop: 2, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}
          >
            {time}
          </span>
        )}
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        {!grouped && (
          <div className="flex items-baseline gap-2 mb-[2px]">
            <span className="font-semibold text-[0.95rem] leading-tight" style={{ color: nameColor }}>
              {displayName}
            </span>
            <span className="text-[0.72rem]" style={{ color: metaColor }}>{time}</span>
          </div>
        )}

        {message.type === 'text' && (
          <p className="text-[0.95rem] leading-[1.375] m-0 whitespace-pre-wrap break-words" style={{ color: textColor }}>
            {message.content}
          </p>
        )}

        {(message.type === 'gif' || message.type === 'image') && message.mediaUrl && (
          <img
            src={message.mediaUrl}
            alt={message.mediaAlt ?? 'image'}
            className="rounded-md mt-1 block"
            style={{ maxWidth: 300, maxHeight: 250, objectFit: 'cover' }}
            loading="lazy"
          />
        )}

        {/* Existing reaction pills + add-reaction button */}
        {(message.reactions.length > 0 || pickerOpen) && (
          <div className="flex flex-wrap gap-1 mt-1 items-center">
            {message.reactions.map((reaction) => {
              const userReacted = reaction.userIds.includes('local_user')
              return (
                <button
                  key={reaction.emoji}
                  onClick={() => onReact?.(message.id, reaction.emoji)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.8rem] border cursor-pointer transition-colors"
                  style={{
                    backgroundColor: userReacted
                      ? (dark ? 'rgba(88,101,242,0.3)' : 'rgba(88,101,242,0.15)')
                      : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                    borderColor: userReacted
                      ? 'rgba(88,101,242,0.6)'
                      : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'),
                    color: dark ? '#dbdee1' : '#313338',
                  }}
                >
                  <span>{reaction.emoji}</span>
                  <span className="font-medium text-[0.78rem]" style={{ color: dark ? '#b5bac1' : '#4e5058' }}>
                    {reaction.userIds.length}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Hover action bar — reaction button in top-right corner */}
      {(hovered || pickerOpen) && (
        <div
          className="absolute right-4 flex items-center"
          style={{ top: grouped ? 0 : 14, zIndex: 10 }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          {/* Quick-react picker popup */}
          {pickerOpen && (
            <div
              className="absolute right-full mr-1 rounded-lg px-2 py-1.5 flex gap-1 flex-wrap"
              style={{
                bottom: 0,
                width: 228,
                backgroundColor: dark ? '#2b2d31' : '#ffffff',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onReact?.(message.id, emoji); setPickerOpen(false) }}
                  className="text-lg w-8 h-8 flex items-center justify-center rounded border-0 cursor-pointer transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Smiley-face reaction button */}
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="w-7 h-7 flex items-center justify-center rounded border-0 cursor-pointer transition-colors"
            title="Add reaction"
            style={{
              backgroundColor: pickerOpen
                ? (dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')
                : (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
              color: dark ? '#b5bac1' : '#4e5058',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = pickerOpen ? (dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)') : (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)') }}
          >
            {/* Smiley + plus icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9" y2="9.01"/>
              <line x1="15" y1="9" x2="15" y2="9.01"/>
              <line x1="19" y1="4" x2="22" y2="4"/>
              <line x1="20.5" y1="2.5" x2="20.5" y2="5.5"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
