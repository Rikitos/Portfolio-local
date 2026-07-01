/**
 * MemberList.tsx — right sidebar listing server members by status group.
 *
 * Supports two display modes controlled by the `collapsed` prop:
 *   false — full panel (200px): avatar + name + role tag, grouped Online/Offline
 *   true  — avatar-only strip (56px): stacked avatars with status dots, no labels
 *
 * The local user always appears first in the Online group.
 */

import { useState } from 'react'
import type { User, Server, LocalUser } from './types'
import UserAvatar from './UserAvatar'

const STATUS_ORDER = ['online', 'idle', 'dnd', 'offline'] as const

interface MemberListProps {
  server: Server
  users: Record<string, User>
  localUser: LocalUser
  collapsed: boolean
  dark: boolean
}

export default function MemberList({ server, users, localUser, collapsed, dark }: MemberListProps) {
  const bg         = dark ? '#2b2d31' : '#f2f3f5'
  const textStrong = dark ? '#f2f3f5' : '#313338'
  const textMuted  = dark ? '#949ba4' : '#6d6f78'
  const labelColor = dark ? '#949ba4' : '#6d6f78'

  const members = server.memberIds
    .map((id) => users[id])
    .filter(Boolean)
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))

  const onlineMembers  = members.filter((u) => u.status !== 'offline')
  const offlineMembers = members.filter((u) => u.status === 'offline')

  // ── Collapsed (avatar-only) mode ────────────────────────────────────────────
  if (collapsed) {
    const allMembers = [localUser as unknown as User, ...members]
    return (
      <div
        className="flex flex-col items-center shrink-0 overflow-y-auto py-3 gap-2"
        style={{ width: 56, backgroundColor: bg, minHeight: '100%' }}
      >
        {allMembers.map((u) => (
          <div key={(u as User).id ?? 'local_user'} title={(u as User).displayName} style={{ opacity: (u as User).status === 'offline' ? 0.45 : 1 }}>
            <UserAvatar
              userId={(u as User).id ?? 'local_user'}
              users={users}
              localUser={localUser}
              size={32}
              showStatus
            />
          </div>
        ))}
      </div>
    )
  }

  // ── Full mode ───────────────────────────────────────────────────────────────
  function MemberRow({ user }: { user: User | LocalUser }) {
    const u = user as User
    const isOffline = u.status === 'offline'
    const [hovered, setHovered] = useState(false)
    const rowBg = hovered
      ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')
      : 'transparent'
    return (
      <div
        className="flex items-center gap-2 px-2 py-[6px] rounded-md cursor-pointer transition-colors"
        style={{ opacity: isOffline ? 0.5 : 1, backgroundColor: rowBg }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <UserAvatar userId={u.id} users={users} localUser={localUser} size={32} showStatus />
        <div className="flex flex-col min-w-0">
          <span className="text-[0.87rem] font-medium leading-tight truncate" style={{ color: isOffline ? textMuted : hovered ? (dark ? '#ffffff' : '#060607') : textStrong }}>
            {u.displayName}
          </span>
          {u.role && (
            <span className="text-[0.7rem] leading-tight truncate" style={{ color: textMuted }}>
              {u.role}
            </span>
          )}
        </div>
      </div>
    )
  }

  function SectionLabel({ label, count }: { label: string; count: number }) {
    return (
      <div className="px-2 pt-4 pb-1 text-[0.68rem] font-semibold tracking-widest uppercase select-none" style={{ color: labelColor }}>
        {label} — {count}
      </div>
    )
  }

  return (
    <div
      className="flex flex-col shrink-0 overflow-y-auto py-2 px-2"
      style={{ width: 200, backgroundColor: bg, minHeight: '100%' }}
    >
      <SectionLabel label="Online" count={onlineMembers.length + 1} />
      <MemberRow user={localUser as unknown as User} />
      {onlineMembers.map((u) => <MemberRow key={u.id} user={u} />)}

      {offlineMembers.length > 0 && (
        <>
          <SectionLabel label="Offline" count={offlineMembers.length} />
          {offlineMembers.map((u) => <MemberRow key={u.id} user={u} />)}
        </>
      )}
    </div>
  )
}
