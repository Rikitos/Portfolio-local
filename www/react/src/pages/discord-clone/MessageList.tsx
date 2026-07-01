/**
 * MessageList.tsx — scrollable list of messages for the active channel.
 *
 * Handles:
 *   - Grouping consecutive messages from the same user within 5 minutes
 *   - Auto-scroll to bottom when new messages arrive (only if already near the bottom)
 *   - "Typing" indicator rendered below the last message when typingUsers is non-empty
 *
 * The scroll anchor div at the bottom is used by scrollIntoView on new messages.
 */

import { useEffect, useRef } from 'react'
import type { Message as MessageType, User, LocalUser } from './types'
import Message from './Message'

// Two messages from the same user are grouped if they arrive within this window (ms)
const GROUP_THRESHOLD_MS = 5 * 60_000

interface MessageListProps {
  messages: MessageType[]
  users: Record<string, User>
  localUser: LocalUser
  typingUsers: string[]   // displayNames of users currently "typing"
  dark: boolean
  onReact: (messageId: string, emoji: string) => void
}

export default function MessageList({ messages, users, localUser, typingUsers, dark, onReact }: MessageListProps) {
  const bottomRef   = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change, but only if user is already near the bottom.
  // "Near bottom" = within 150px of the scroll end.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150
    if (nearBottom) {
      // block/inline: 'nearest' prevents scrollIntoView from scrolling the page body
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  }, [messages])

  // Scroll to bottom on initial mount / channel switch
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const bg       = dark ? '#313338' : '#ffffff'
  const metaColor = dark ? '#949ba4' : '#80848e'

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden pb-2"
      style={{ backgroundColor: bg }}
    >
      {/* Welcome blurb at top of channel */}
      <div className="px-4 pt-6 pb-4">
        <div
          className="text-4xl mb-2"
          style={{ lineHeight: 1 }}
        >
          {messages[0] ? '#' : '👋'}
        </div>
        <p className="text-[0.9rem] m-0" style={{ color: metaColor }}>
          This is the beginning of the channel history.
        </p>
      </div>

      {/* Messages */}
      {messages.map((message, i) => {
        const prev = messages[i - 1]
        // Group with previous if same user and within the time threshold
        const grouped =
          !!prev &&
          prev.userId === message.userId &&
          new Date(message.timestamp).getTime() - new Date(prev.timestamp).getTime() < GROUP_THRESHOLD_MS

        return (
          <Message
            key={message.id}
            message={message}
            users={users}
            localUser={localUser}
            grouped={grouped}
            dark={dark}
            onReact={onReact}
          />
        )
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 pt-2 pb-1 flex items-center gap-2">
          {/* Animated dots */}
          <div className="flex gap-[3px] items-end" style={{ height: 14 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  backgroundColor: metaColor,
                  animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <span className="text-[0.82rem]" style={{ color: metaColor }}>
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing…`
              : `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers[typingUsers.length - 1]} are typing…`}
          </span>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  )
}
