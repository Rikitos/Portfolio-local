/**
 * useBotReply.ts — hook that drives bot responses to user messages.
 *
 * When the user sends a message, call triggerReply(). The hook will:
 *   1. Pick a random online member of the current server
 *   2. Show them as typing after a short "reaction delay" (0.5–1.5s)
 *   3. After a "compose delay" (1.5–3.5s), post a reply from the server's reply pool
 *   4. Clear the typing indicator
 *
 * A second bot may also chime in ~40% of the time with another short delay.
 *
 * All timers are cleared on unmount and on server/channel switch to prevent
 * stale state updates after navigation.
 */

import { useRef, useCallback } from 'react'
import { USERS, REPLY_POOLS } from './seed-data'
import type { Message } from './types'

// Maps server IDs to the reply pool key that fits their topic
const SERVER_POOL_MAP: Record<string, string> = {
  'gaming-den':   'gaming',
  'world-cup-hq': 'general',
  'tech-lounge':  'tech',
  'chill-vibes':  'general',
  'design-hub':   'general',
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

let _replyId = 50_000  // above seed and user message IDs

interface UseBotReplyOptions {
  serverId: string
  channelId: string
  memberIds: string[]
  setTypingUsers: React.Dispatch<React.SetStateAction<string[]>>
  appendMessage: (channelId: string, message: Message) => void
}

export function useBotReply({
  serverId,
  channelId,
  memberIds,
  setTypingUsers,
  appendMessage,
}: UseBotReplyOptions) {
  // Track all pending timers so we can cancel them on unmount / navigation
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setTypingUsers([])
  }, [setTypingUsers])

  const triggerReply = useCallback(() => {
    // Resolve the pool for this server; fall back to 'general'
    const poolKey = SERVER_POOL_MAP[serverId] ?? 'general'
    const pool    = REPLY_POOLS[poolKey] ?? REPLY_POOLS.general

    // Pick only online/idle members (not dnd/offline) from the server's member list
    const eligible = memberIds
      .map((id) => USERS[id])
      .filter((u) => u && (u.status === 'online' || u.status === 'idle'))

    if (eligible.length === 0) return

    const responder = pick(eligible)

    // ── First bot reply ───────────────────────────────────────────────────────

    // Short delay before they start "typing"
    const typingDelay = rand(500, 1500)
    // How long they "compose" the reply
    const composeDelay = rand(1500, 3500)

    const t1 = setTimeout(() => {
      setTypingUsers([responder.displayName])
    }, typingDelay)

    const t2 = setTimeout(() => {
      setTypingUsers([])
      appendMessage(channelId, {
        id:        `bot_${_replyId++}`,
        userId:    responder.id,
        timestamp: new Date().toISOString(),
        type:      'text',
        content:   pick(pool),
        reactions: [],
      })
    }, typingDelay + composeDelay)

    timers.current.push(t1, t2)

    // ── Optional second reply (~40% chance) ───────────────────────────────────
    if (Math.random() < 0.4) {
      // Pick a different eligible member
      const others = eligible.filter((u) => u.id !== responder.id)
      if (others.length === 0) return

      const second       = pick(others)
      const secondOffset = rand(2000, 5000)
      const secondCompose = rand(1000, 2500)

      const t3 = setTimeout(() => {
        setTypingUsers([second.displayName])
      }, typingDelay + composeDelay + secondOffset)

      const t4 = setTimeout(() => {
        setTypingUsers([])
        appendMessage(channelId, {
          id:        `bot_${_replyId++}`,
          userId:    second.id,
          timestamp: new Date().toISOString(),
          type:      'text',
          content:   pick(pool),
          reactions: [],
        })
      }, typingDelay + composeDelay + secondOffset + secondCompose)

      timers.current.push(t3, t4)
    }
  }, [serverId, channelId, memberIds, setTypingUsers, appendMessage])

  return { triggerReply, clearBotTimers: clearAll }
}
