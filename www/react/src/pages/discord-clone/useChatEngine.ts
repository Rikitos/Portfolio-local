/**
 * useChatEngine.ts — Phase 3 fake-live chat activity.
 *
 * Handles three layers of activity:
 *
 * 1. REPLIES — triggered by user send. Context-aware:
 *      • User sent a gif  → 55% chance bot replies with a gif sharing ≥1 tag;
 *                           remaining probability falls back to text reply.
 *      • User text has emoji → 40% chance bot reply is emoji-only (mirrors
 *                              the user's emoji + random reaction); else text.
 *      • Otherwise → text reply from the server's themed reply pool.
 *    ~40% chance of a second bot chiming in after the first.
 *
 * 2. REACTIONS — 70% chance: 1–3 bots add emoji reactions to the user's
 *    message, staggered 4–14 s after the message is sent.
 *    Gif messages attract fire/skull/laugh reactions; text messages draw from
 *    REACTION_POOL.
 *
 * 3. AMBIENT — every 30–70 s a random online member posts a message in a
 *    randomly chosen channel that is NOT the current one. That channel gets
 *    an unread dot. Pauses while the user is typing.
 *
 * All timers are collected in a ref and cancelled on unmount or navigation.
 */

import { useRef, useCallback, useEffect } from 'react'
import { USERS, REPLY_POOLS, GIF_POOL, REACTION_POOL } from './seed-data'
import type { Message, Server } from './types'

// ── Helpers ────────────────────────────────────────────────────────────────────

const SERVER_POOL_MAP: Record<string, string> = {
  'gaming-den':   'gaming',
  'world-cup-hq': 'football',
  'tech-lounge':  'tech',
  'chill-vibes':  'general',
  'design-hub':   'general',
}

// Reactions to favour when the user sends a gif
const GIF_REACTIONS = ['🔥', '😂', '💀', '🤣', '👀', '😭']

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Extract emoji characters from a string
function extractEmoji(text: string): string[] {
  return Array.from(text.matchAll(/\p{Extended_Pictographic}/gu), (m) => m[0])
}

// Find GIF_POOL entries that share ≥1 tag with the given tag list
function gifsWithSimilarTags(tags: string[]): typeof GIF_POOL {
  if (!tags.length) return GIF_POOL
  return GIF_POOL.filter((g) =>
    g.tag.split(',').map((t) => t.trim()).some((t) => tags.includes(t))
  )
}

// Parse tags from a GIF_POOL entry matching a URL
function tagsForGifUrl(url: string): string[] {
  const entry = GIF_POOL.find((g) => g.url === url)
  return entry ? entry.tag.split(',').map((t) => t.trim()) : []
}

let _engineId = 80_000  // above seed / user / bot reply IDs

// ── Types ──────────────────────────────────────────────────────────────────────

interface UseChatEngineOptions {
  server: Server
  channelId: string           // currently viewed channel
  setTypingUsers: React.Dispatch<React.SetStateAction<string[]>>
  appendMessage: (channelId: string, msg: Message) => void
  setUnreadChannelIds: React.Dispatch<React.SetStateAction<Set<string>>>
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useChatEngine({
  server,
  channelId,
  setTypingUsers,
  appendMessage,
  setUnreadChannelIds,
}: UseChatEngineOptions) {
  const timers       = useRef<ReturnType<typeof setTimeout>[]>([])
  const ambientTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userTyping   = useRef(false)   // pauses ambient when true

  const t = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
    return id
  }

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (ambientTimer.current) clearTimeout(ambientTimer.current)
    ambientTimer.current = null
    setTypingUsers([])
  }, [setTypingUsers])

  // ── 1. Replies ──────────────────────────────────────────────────────────────

  const triggerReply = useCallback((userMessage: Message) => {
    const poolKey  = SERVER_POOL_MAP[server.id] ?? 'general'
    const textPool = REPLY_POOLS[poolKey] ?? REPLY_POOLS.general

    const eligible = server.memberIds
      .map((id) => USERS[id])
      .filter((u) => u && (u.status === 'online' || u.status === 'idle'))

    if (!eligible.length) return

    // Analyse what the user sent
    const isGif   = userMessage.type === 'gif'
    const gifTags = isGif ? tagsForGifUrl(userMessage.mediaUrl ?? '') : []
    const msgEmojis = !isGif ? extractEmoji(userMessage.content ?? '') : []
    const hasEmoji  = msgEmojis.length > 0

    // Build the reply message for a given bot
    function buildReply(userId: string): Message {
      const base = { id: `eng_${_engineId++}`, userId, timestamp: new Date().toISOString(), reactions: [] as Message['reactions'] }

      // Gif reply path
      if (isGif && Math.random() < 0.55) {
        const candidates = gifsWithSimilarTags(gifTags)
        const chosen = pick(candidates)
        return { ...base, type: 'gif', mediaUrl: chosen.url, mediaAlt: chosen.alt }
      }

      // Emoji-only reply path
      if (hasEmoji && Math.random() < 0.40) {
        const replyEmojis = [
          ...msgEmojis.slice(0, 2),
          pick(REACTION_POOL),
        ].slice(0, 3).join(' ')
        return { ...base, type: 'text', content: replyEmojis }
      }

      // Standard text reply (maybe sprinkle an emoji from the user's message)
      let content = pick(textPool)
      if (hasEmoji && Math.random() < 0.3) content += ' ' + pick(msgEmojis)
      return { ...base, type: 'text', content }
    }

    const responder    = pick(eligible)
    const typingDelay  = rand(600, 1600)
    const composeDelay = rand(1400, 3200)

    t(() => setTypingUsers([responder.displayName]), typingDelay)
    t(() => {
      setTypingUsers([])
      appendMessage(channelId, buildReply(responder.id))
    }, typingDelay + composeDelay)

    // Optional second responder (~40%)
    if (Math.random() < 0.4) {
      const others = eligible.filter((u) => u.id !== responder.id)
      if (others.length) {
        const second        = pick(others)
        const secondOffset  = rand(1800, 4500)
        const secondCompose = rand(900, 2200)
        const base2         = typingDelay + composeDelay

        t(() => setTypingUsers([second.displayName]), base2 + secondOffset)
        t(() => {
          setTypingUsers([])
          appendMessage(channelId, buildReply(second.id))
        }, base2 + secondOffset + secondCompose)
      }
    }
  }, [server, channelId, setTypingUsers, appendMessage])

  // ── 2. Reactions ────────────────────────────────────────────────────────────

  const triggerReactions = useCallback((messageId: string, isGif: boolean) => {
    if (Math.random() > 0.70) return   // 70% chance to react at all

    const eligible = server.memberIds
      .map((id) => USERS[id])
      .filter((u) => u && u.status !== 'offline')

    const reactionPool = isGif ? GIF_REACTIONS : REACTION_POOL
    const reactorCount = rand(1, Math.min(3, eligible.length))
    const reactors     = [...eligible].sort(() => Math.random() - 0.5).slice(0, reactorCount)

    reactors.forEach((bot, i) => {
      const delay = rand(4000 + i * 1500, 9000 + i * 2000)
      t(() => {
        const emoji = pick(reactionPool)
        appendMessage('__reaction__', {
          id:        `rxn_${_engineId++}`,
          userId:    bot.id,
          timestamp: new Date().toISOString(),
          type:      'text',
          content:   `${messageId}::${emoji}`,
          reactions: [],
        })
      }, delay)
    })
  }, [server, appendMessage])

  // ── 3. Ambient ─────────────────────────────────────────────────────────────

  const scheduleAmbient = useCallback(() => {
    const delay = rand(30_000, 70_000)
    ambientTimer.current = setTimeout(() => {
      if (!userTyping.current) {
        const allChannels = server.channels
        const otherChannels = allChannels.filter((c) => c.id !== channelId)
        if (otherChannels.length) {
          const targetChannel = pick(otherChannels)
          const eligible = server.memberIds
            .map((id) => USERS[id])
            .filter((u) => u && u.status === 'online')
          if (eligible.length) {
            const bot     = pick(eligible)
            const poolKey = SERVER_POOL_MAP[server.id] ?? 'general'
            const pool    = REPLY_POOLS[poolKey] ?? REPLY_POOLS.general
            appendMessage(targetChannel.id, {
              id:        `amb_${_engineId++}`,
              userId:    bot.id,
              timestamp: new Date().toISOString(),
              type:      'text',
              content:   pick(pool),
              reactions: [],
            })
            setUnreadChannelIds((prev) => new Set([...prev, targetChannel.id]))
          }
        }
      }
      scheduleAmbient()   // reschedule regardless of whether we fired
    }, delay)
  }, [server, channelId, appendMessage, setUnreadChannelIds])

  // Start ambient loop when the hook mounts / server or channel changes
  useEffect(() => {
    if (ambientTimer.current) clearTimeout(ambientTimer.current)
    scheduleAmbient()
    return () => { if (ambientTimer.current) clearTimeout(ambientTimer.current) }
  }, [scheduleAmbient])

  // Expose userTyping setter for the input's onTypingChange
  const setUserTyping = useCallback((typing: boolean) => {
    userTyping.current = typing
  }, [])

  return { triggerReply, triggerReactions, clearEngineTimers: clearAll, setUserTyping }
}
