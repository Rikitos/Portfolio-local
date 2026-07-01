/**
 * DiscordClonePage.tsx — root page for the Discord Clone project.
 *
 * Owns the top-level state:
 *   - Which server and channel are selected
 *   - The live message lists (per channel, keyed by channelId)
 *   - Which channels have unread dots
 *   - Which users are "typing" (shown in the typing indicator)
 *   - Whether the member list sidebar is visible
 *
 * The ChatEngine (Phase 3) will be instantiated here and will mutate
 * message lists and typing state via callbacks.
 *
 * Layout (left → right):
 *   ServerRail (72px) | ChannelSidebar (240px) | ChatArea (flex-1) | MemberList (240px, toggleable)
 *
 * The page fills the viewport below the portfolio header (64px).
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { SERVERS, USERS, LOCAL_USER as LOCAL_USER_DEFAULT } from './discord-clone/seed-data'
import type { LocalUser } from './discord-clone/types'
import type { Message } from './discord-clone/types'
import { useChatEngine } from './discord-clone/useChatEngine'
import ServerRail     from './discord-clone/ServerRail'
import ChannelSidebar from './discord-clone/ChannelSidebar'
import ChatHeader, { type MemberListMode } from './discord-clone/ChatHeader'
import MessageList    from './discord-clone/MessageList'
import MessageInput   from './discord-clone/MessageInput'
import MemberList     from './discord-clone/MemberList'

interface DiscordClonePageProps {
  dark: boolean
}

// Build initial message state: Record<channelId, Message[]> from all servers' seed data
function buildInitialMessages(): Record<string, Message[]> {
  const map: Record<string, Message[]> = {}
  for (const server of SERVERS) {
    for (const channel of server.channels) {
      map[channel.id] = [...channel.messages]
    }
  }
  return map
}

let _msgCounter = 10_000  // start above seed IDs to avoid collisions

export default function DiscordClonePage({ dark }: DiscordClonePageProps) {
  const [selectedServerId,  setSelectedServerId]  = useState(SERVERS[0].id)
  const [selectedChannelId, setSelectedChannelId] = useState(SERVERS[0].channels[0].id)
  const [messages,          setMessages]          = useState<Record<string, Message[]>>(buildInitialMessages)
  const [unreadChannelIds,  setUnreadChannelIds]  = useState<Set<string>>(new Set())
  const [typingUsers,       setTypingUsers]       = useState<string[]>([])
  const [memberListMode,    setMemberListMode]    = useState<MemberListMode>('full')
  const [sidebarOpen,       setSidebarOpen]       = useState(true)
  const [narrowViewport,    setNarrowViewport]    = useState(false)
  const [localUser,         setLocalUser]         = useState<LocalUser>(LOCAL_USER_DEFAULT)
  // Actual pixel height of the portfolio header — measured via ResizeObserver so it adapts to breakpoints
  const [headerHeight,      setHeaderHeight]      = useState(64)

  // Derived: current server and channel objects
  const server  = useMemo(() => SERVERS.find((s) => s.id === selectedServerId)!,  [selectedServerId])
  const channel = useMemo(
    () => server.channels.find((c) => c.id === selectedChannelId) ?? server.channels[0],
    [server, selectedChannelId],
  )

  // Switch server — also switch to the first channel in that server
  function handleSelectServer(id: string) {
    const s = SERVERS.find((srv) => srv.id === id)
    if (!s) return
    setSelectedServerId(id)
    setSelectedChannelId(s.channels[0].id)
  }

  // Switch channel — clear its unread dot
  function handleSelectChannel(id: string) {
    setSelectedChannelId(id)
    setUnreadChannelIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setTypingUsers([])
  }

  // Append a message — intercepts the '__reaction__' signal from useChatEngine
  // to add bot emoji reactions without a separate callback prop.
  // Signal format: channelId='__reaction__', content='<messageId>::<emoji>'
  const appendMessage = useCallback((channelId: string, message: Message) => {
    if (channelId === '__reaction__') {
      const [msgId, emoji] = (message.content ?? '').split('::')
      if (!msgId || !emoji) return
      setMessages((prev) => {
        // Search all channels for the target message (it's always in the current channel)
        const updated: typeof prev = {}
        for (const [chId, msgs] of Object.entries(prev)) {
          updated[chId] = msgs.map((m) => {
            if (m.id !== msgId) return m
            const existing = m.reactions.find((r) => r.emoji === emoji)
            if (existing) {
              return { ...m, reactions: m.reactions.map((r) =>
                r.emoji === emoji ? { ...r, userIds: [...r.userIds, message.userId] } : r
              )}
            }
            return { ...m, reactions: [...m.reactions, { emoji, userIds: [message.userId] }] }
          })
        }
        return updated
      })
      return
    }
    setMessages((prev) => ({
      ...prev,
      [channelId]: [...(prev[channelId] ?? []), message],
    }))
  }, [])

  const { triggerReply, triggerReactions, clearEngineTimers, setUserTyping } = useChatEngine({
    server,
    channelId:          channel.id,
    setTypingUsers,
    appendMessage,
    setUnreadChannelIds,
  })

  // Cancel pending timers when the user switches server or channel
  useEffect(() => {
    clearEngineTimers()
  }, [server.id, channel.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Responsive breakpoints:
  //   < 900px  → narrow: sidebar becomes overlay (hidden by default), member list hidden
  //   900–1100px → sidebar pinned, member list collapsed (avatars only)
  //   > 1100px → sidebar pinned, member list full
  const headerObsRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    // Measure the actual rendered header height so marginTop always matches exactly
    const headerEl = document.querySelector('header')
    if (headerEl) {
      headerObsRef.current = new ResizeObserver(() =>
        setHeaderHeight(headerEl.getBoundingClientRect().height)
      )
      headerObsRef.current.observe(headerEl)
      setHeaderHeight(headerEl.getBoundingClientRect().height)
    }

    function apply(width: number) {
      if (width < 900) {
        setNarrowViewport(true)
        setSidebarOpen(false)
        setMemberListMode('hidden')
      } else if (width < 1100) {
        setNarrowViewport(false)
        setSidebarOpen(true)
        setMemberListMode('collapsed')
      } else {
        setNarrowViewport(false)
        setSidebarOpen(true)
        setMemberListMode('full')
      }
    }
    apply(window.innerWidth)
    const observer = new ResizeObserver(() => apply(window.innerWidth))
    observer.observe(document.documentElement)
    return () => {
      observer.disconnect()
      headerObsRef.current?.disconnect()
    }
  }, [])

  // Called when the local user sends a text message
  function handleSend(content: string) {
    const message: Message = {
      id:        `user_${_msgCounter++}`,
      userId:    'local_user',
      timestamp: new Date().toISOString(),
      type:      'text',
      content,
      reactions: [],
    }
    appendMessage(channel.id, message)
    triggerReply(message)
    triggerReactions(message.id, false)
  }

  // Toggle a reaction on a message (local user only for now)
  function handleReact(messageId: string, emoji: string) {
    setMessages((prev) => {
      const list = prev[channel.id] ?? []
      const next = list.map((m) => {
        if (m.id !== messageId) return m
        const existing = m.reactions.find((r) => r.emoji === emoji)
        if (existing) {
          // Toggle: remove if already reacted, add if not
          const alreadyReacted = existing.userIds.includes('local_user')
          const updatedUserIds = alreadyReacted
            ? existing.userIds.filter((id) => id !== 'local_user')
            : [...existing.userIds, 'local_user']
          return {
            ...m,
            reactions: updatedUserIds.length === 0
              ? m.reactions.filter((r) => r.emoji !== emoji)
              : m.reactions.map((r) => r.emoji === emoji ? { ...r, userIds: updatedUserIds } : r),
          }
        }
        // New reaction
        return { ...m, reactions: [...m.reactions, { emoji, userIds: ['local_user'] }] }
      })
      return { ...prev, [channel.id]: next }
    })
  }

  const channelMessages = messages[channel.id] ?? []

  const chatBg = dark ? '#313338' : '#ffffff'

  // Member list toggle cycles: full → collapsed → hidden → full
  function handleToggleMemberList() {
    setMemberListMode((m) => m === 'full' ? 'collapsed' : m === 'collapsed' ? 'hidden' : 'full')
  }

  return (
    <div className="flex overflow-hidden relative" style={{ height: `calc(100vh - ${headerHeight}px)`, marginTop: headerHeight }}>

      {/* Server rail — always visible */}
      <ServerRail
        servers={SERVERS}
        selectedId={selectedServerId}
        onSelect={(id) => { handleSelectServer(id); if (narrowViewport) setSidebarOpen(false) }}
        dark={dark}
        unreadChannelIds={unreadChannelIds}
      />

      {/* Backdrop for overlay sidebar on mobile — tap outside to close */}
      {narrowViewport && sidebarOpen && (
        <div
          className="absolute inset-0 z-10"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Channel sidebar — pinned on wide, overlay on narrow */}
      {sidebarOpen && (
        <ChannelSidebar
          server={server}
          selectedChannelId={channel.id}
          onSelectChannel={handleSelectChannel}
          localUser={localUser}
          onUpdateLocalUser={(patch) => setLocalUser((u) => ({ ...u, ...patch }))}
          unreadChannelIds={unreadChannelIds}
          overlay={narrowViewport}
          onClose={() => setSidebarOpen(false)}
          dark={dark}
        />
      )}

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0" style={{ backgroundColor: chatBg }}>
        <ChatHeader
          channel={channel}
          memberListMode={memberListMode}
          onToggleMemberList={handleToggleMemberList}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          showSidebarToggle={narrowViewport}
          dark={dark}
        />
        <MessageList
          messages={channelMessages}
          users={USERS}
          localUser={localUser}
          typingUsers={typingUsers}
          dark={dark}
          onReact={handleReact}
        />
        <MessageInput
          channelName={channel.name}
          dark={dark}
          onSend={handleSend}
          onSendGif={(url, alt) => {
            const gifMsg: Message = {
              id:        `user_${_msgCounter++}`,
              userId:    'local_user',
              timestamp: new Date().toISOString(),
              type:      'gif',
              mediaUrl:  url,
              mediaAlt:  alt,
              reactions: [],
            }
            appendMessage(channel.id, gifMsg)
            triggerReply(gifMsg)
            triggerReactions(gifMsg.id, true)
          }}
          onTypingChange={setUserTyping}
        />
      </div>

      {/* Member list — full or collapsed, hidden when memberListMode === 'hidden' */}
      {memberListMode !== 'hidden' && (
        <MemberList
          server={server}
          users={USERS}
          localUser={localUser}
          collapsed={memberListMode === 'collapsed'}
          dark={dark}
        />
      )}
    </div>
  )
}
