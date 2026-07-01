/**
 * ChatHeader.tsx — the bar above the message list.
 *
 * Left side: hamburger button (shows sidebar on mobile) + channel name + topic.
 * Right side: member-list toggle cycles through full → collapsed → hidden.
 *
 * The hamburger is hidden at wide viewports where the sidebar is always visible.
 * `memberListMode` drives the button's active/inactive appearance.
 */

import type { Channel } from './types'

export type MemberListMode = 'full' | 'collapsed' | 'hidden'

interface ChatHeaderProps {
  channel: Channel
  memberListMode: MemberListMode
  onToggleMemberList: () => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
  showSidebarToggle: boolean   // false on wide viewports where sidebar is always pinned
  dark: boolean
}

export default function ChatHeader({
  channel,
  memberListMode,
  onToggleMemberList,
  sidebarOpen,
  onToggleSidebar,
  showSidebarToggle,
  dark,
}: ChatHeaderProps) {
  const bg         = dark ? '#313338' : '#ffffff'
  const border     = dark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)'
  const textStrong = dark ? '#f2f3f5' : '#313338'
  const textMuted  = dark ? '#949ba4' : '#6d6f78'
  const iconBase   = dark ? '#949ba4' : '#80848e'
  const iconActive = dark ? '#dbdee1' : '#313338'

  const typeIcon = channel.type === 'announcement' ? '📢' : '#'

  // Member list button is highlighted when showing anything other than hidden
  const membersActive = memberListMode !== 'hidden'

  return (
    <div
      className="flex items-center px-3 gap-2 shrink-0 border-b"
      style={{ backgroundColor: bg, borderColor: border, minHeight: 48 }}
    >
      {/* Hamburger — shows the channel sidebar on narrow viewports */}
      {showSidebarToggle && (
        <button
          onClick={onToggleSidebar}
          className="flex flex-col gap-[4px] w-7 h-7 items-center justify-center rounded border-0 cursor-pointer transition-colors shrink-0"
          title={sidebarOpen ? 'Close channel list' : 'Open channel list'}
          style={{
            backgroundColor: sidebarOpen ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') : 'transparent',
            color: sidebarOpen ? iconActive : iconBase,
          }}
        >
          <span className="block w-4 h-[2px] rounded-full" style={{ backgroundColor: 'currentColor' }} />
          <span className="block w-4 h-[2px] rounded-full" style={{ backgroundColor: 'currentColor' }} />
          <span className="block w-4 h-[2px] rounded-full" style={{ backgroundColor: 'currentColor' }} />
        </button>
      )}

      {/* Channel type icon + name */}
      <span className="text-lg leading-none" style={{ color: textMuted }}>
        {typeIcon}
      </span>
      <span className="font-semibold text-[0.95rem]" style={{ color: textStrong }}>
        {channel.name}
      </span>

      {/* Topic */}
      {channel.topic && (
        <>
          <div className="w-px h-5 shrink-0" style={{ backgroundColor: border }} />
          <span className="text-[0.82rem] truncate hidden sm:block" style={{ color: textMuted }}>
            {channel.topic}
          </span>
        </>
      )}

      {/* Member list toggle — cycles full → collapsed → hidden */}
      <button
        onClick={onToggleMemberList}
        className="ml-auto flex items-center justify-center w-8 h-8 rounded border-0 cursor-pointer transition-colors shrink-0"
        title={
          memberListMode === 'full'      ? 'Collapse member list' :
          memberListMode === 'collapsed' ? 'Hide member list' :
                                          'Show member list'
        }
        style={{
          backgroundColor: membersActive ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') : 'transparent',
          color: membersActive ? iconActive : iconBase,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 20a6 6 0 0 1 12 0H2zm16-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-1.7 0-5 .9-5 2.7V20h10v-3.3c0-1.8-3.3-2.7-5-2.7z"/>
        </svg>
      </button>
    </div>
  )
}
