/**
 * types.ts — shared data model for the Discord Clone project.
 *
 * All data is static and sourced from seed-data.ts — no real backend.
 * Reactions are stored per-message; the ChatEngine (Phase 3) appends them via callbacks.
 *
 * IDs are plain strings (slugs) for readability in seed data.
 */

// ── Users ─────────────────────────────────────────────────────────────────────

export type UserStatus = 'online' | 'idle' | 'offline' | 'dnd'

export interface User {
  id: string
  name: string
  displayName: string
  // Used to render a coloured avatar circle when no image is provided
  avatarColor: string
  // Optional — base64 or URL; if absent an initials circle is shown
  avatarUrl?: string
  status: UserStatus
  // Short tag shown below name in the member list (e.g. "Moderator", "Bot")
  role?: string
  bot?: boolean
}

// ── Messages ──────────────────────────────────────────────────────────────────

export interface Reaction {
  emoji: string
  // userIds who reacted — used to show count and highlight if the local user reacted
  userIds: string[]
}

export type MessageContentType = 'text' | 'gif' | 'image'

export interface Message {
  id: string
  userId: string
  // ISO timestamp string
  timestamp: string
  type: MessageContentType
  // Plain text content for 'text' messages; ignored for 'gif'/'image'
  content?: string
  // URL for 'gif' or 'image' type messages
  mediaUrl?: string
  // Alt text for accessibility on media messages
  mediaAlt?: string
  reactions: Reaction[]
}

// ── Channels ──────────────────────────────────────────────────────────────────

export type ChannelType = 'text' | 'announcement'

export interface Channel {
  id: string
  name: string
  type: ChannelType
  topic?: string
  // Seed messages loaded on mount; ChatEngine appends to this at runtime
  messages: Message[]
}

// ── Category groups ───────────────────────────────────────────────────────────

export interface ChannelCategory {
  id: string
  name: string
  channelIds: string[]
}

// ── Servers ───────────────────────────────────────────────────────────────────

export interface Server {
  id: string
  name: string
  // Short label shown inside the server icon circle (1–2 chars or an emoji)
  iconLabel: string
  // Accent colour for the server icon background
  iconColor: string
  channels: Channel[]
  categories: ChannelCategory[]
  // Members present on this server — subset of the global user pool
  memberIds: string[]
}

// ── Local user ────────────────────────────────────────────────────────────────

// The person using the app — always id "local_user"
export interface LocalUser {
  id: 'local_user'
  name: string
  displayName: string
  avatarColor: string
  status: UserStatus
}
