/**
 * ChannelSidebar.tsx — left sidebar showing the server name, categories, and channel list.
 *
 * On wide viewports it is pinned in the normal flex flow.
 * On narrow viewports (`overlay` prop) it renders absolutely on top of the chat area
 * and shows a close (×) button in the server header so the user can dismiss it.
 *
 * Unread dot badges are driven by the `unreadChannelIds` set passed from the parent.
 * The bottom strip shows the local user's avatar + status dot; clicking it opens
 * the UserStatusPanel popup to change name / status.
 */

import { useState } from 'react'
import type { Server, LocalUser } from './types'
import UserAvatar from './UserAvatar'
import UserStatusPanel from './UserStatusPanel'

const STATUS_COLORS: Record<string, string> = {
  online:  '#23a55a',
  idle:    '#f0b232',
  dnd:     '#f23f43',
  offline: '#80848e',
}

const STATUS_LABELS: Record<string, string> = {
  online:  'Online',
  idle:    'Idle',
  dnd:     'Do Not Disturb',
  offline: 'Offline',
}

const CHANNEL_TYPE_ICON: Record<string, string> = {
  text: '#',
  announcement: '📢',
}

interface ChannelSidebarProps {
  server: Server
  selectedChannelId: string
  onSelectChannel: (id: string) => void
  localUser: LocalUser
  onUpdateLocalUser: (patch: Partial<Pick<LocalUser, 'displayName' | 'status'>>) => void
  unreadChannelIds: Set<string>
  // When true the sidebar renders as an absolute overlay (mobile); shows a close button
  overlay: boolean
  onClose: () => void
  dark: boolean
}

export default function ChannelSidebar({
  server,
  selectedChannelId,
  onSelectChannel,
  localUser,
  onUpdateLocalUser,
  unreadChannelIds,
  overlay,
  onClose,
  dark,
}: ChannelSidebarProps) {
  const [panelOpen, setPanelOpen] = useState(false)

  const bg         = dark ? '#2b2d31' : '#f2f3f5'
  const headerBg   = dark ? '#2b2d31' : '#f2f3f5'
  const footerBg   = dark ? '#232428' : '#e3e5e8'
  const textMuted  = dark ? '#949ba4' : '#6d6f78'
  const textStrong = dark ? '#f2f3f5' : '#313338'

  const rowSelected    = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const rowTextActive  = dark ? '#ffffff' : '#313338'
  const rowTextDefault = dark ? '#949ba4' : '#6d6f78'

  const channelMap = Object.fromEntries(server.channels.map(c => [c.id, c]))

  return (
    <div
      className="flex flex-col shrink-0 overflow-hidden"
      style={{
        width: 240,
        backgroundColor: bg,
        minHeight: '100%',
        ...(overlay ? {
          position: 'absolute',
          top: 0,
          left: 72,
          height: '100%',
          zIndex: 20,
          boxShadow: '4px 0 16px rgba(0,0,0,0.3)',
        } : {}),
      }}
    >
      {/* Server name header */}
      <div
        className="flex items-center px-4 py-3 font-semibold text-[0.95rem] border-b shrink-0 cursor-pointer"
        style={{
          backgroundColor: headerBg,
          color: textStrong,
          borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
          minHeight: 48,
        }}
      >
        <span className="truncate flex-1">{server.name}</span>
        {overlay ? (
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 rounded border-0 cursor-pointer ml-2 shrink-0"
            style={{ backgroundColor: 'transparent', color: textMuted, fontSize: '1.1rem', lineHeight: 1 }}
            title="Close"
          >
            ×
          </button>
        ) : (
          <span className="ml-auto text-xs" style={{ color: textMuted }}>▼</span>
        )}
      </div>

      {/* Scrollable channel list */}
      <div className="flex-1 overflow-y-auto py-2">
        {server.categories.map((category) => (
          <div key={category.id} className="mb-1">
            <div
              className="px-4 pt-4 pb-1 text-[0.68rem] font-semibold tracking-widest uppercase select-none"
              style={{ color: textMuted }}
            >
              {category.name}
            </div>

            {category.channelIds.map((chId) => {
              const ch = channelMap[chId]
              if (!ch) return null

              const isSelected = ch.id === selectedChannelId
              const isUnread   = unreadChannelIds.has(ch.id) && !isSelected

              return (
                <button
                  key={ch.id}
                  onClick={() => { onSelectChannel(ch.id); if (overlay) onClose() }}
                  className="flex items-center w-full px-2 mx-2 py-[6px] rounded-md text-[0.93rem] border-0 cursor-pointer transition-colors duration-100 text-left"
                  style={{
                    backgroundColor: isSelected ? rowSelected : 'transparent',
                    color: isSelected ? rowTextActive : isUnread ? textStrong : rowTextDefault,
                    fontWeight: isUnread ? 600 : 400,
                    width: 'calc(100% - 16px)',
                  }}
                >
                  <span className="mr-1.5 text-[1rem] leading-none opacity-70 shrink-0">
                    {CHANNEL_TYPE_ICON[ch.type] ?? '#'}
                  </span>
                  <span className="truncate flex-1">{ch.name}</span>

                  {isUnread && (
                    <span
                      className="shrink-0 rounded-full ml-2"
                      style={{ width: 8, height: 8, backgroundColor: dark ? '#ffffff' : '#313338' }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Local user footer — clickable to open status panel */}
      <div className="relative shrink-0">
        {panelOpen && (
          <UserStatusPanel
            localUser={localUser}
            onUpdate={onUpdateLocalUser}
            onClose={() => setPanelOpen(false)}
            dark={dark}
          />
        )}

        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="flex items-center gap-2 w-full px-2 py-2 border-0 cursor-pointer text-left transition-colors"
          style={{
            backgroundColor: panelOpen
              ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')
              : footerBg,
            minHeight: 52,
          }}
          title="Change status or nickname"
        >
          {/* Avatar with status dot */}
          <div className="relative shrink-0">
            <UserAvatar userId={localUser.id} users={{}} localUser={localUser} size={32} showStatus={false} />
            {/* Status dot — coloured by current status */}
            <span
              className="absolute rounded-full"
              style={{
                width: 11,
                height: 11,
                backgroundColor: STATUS_COLORS[localUser.status] ?? STATUS_COLORS.offline,
                border: `2px solid ${footerBg}`,
                bottom: -1,
                right: -1,
              }}
            />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[0.85rem] font-semibold leading-tight truncate" style={{ color: textStrong }}>
              {localUser.displayName}
            </span>
            <span className="text-[0.72rem] leading-tight" style={{ color: STATUS_COLORS[localUser.status] }}>
              {STATUS_LABELS[localUser.status] ?? 'Online'}
            </span>
          </div>

          {/* Mute / settings icons — decorative */}
          <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {['🎙️', '⚙️'].map((icon) => (
              <span
                key={icon}
                className="w-7 h-7 flex items-center justify-center rounded text-sm"
                style={{ color: textMuted }}
                title={icon === '🎙️' ? 'Mute' : 'Settings'}
              >
                {icon}
              </span>
            ))}
          </div>
        </button>
      </div>
    </div>
  )
}
