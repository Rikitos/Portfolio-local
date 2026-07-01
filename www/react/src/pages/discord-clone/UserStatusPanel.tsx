/**
 * UserStatusPanel.tsx — popup that appears when the user clicks their own
 * avatar strip at the bottom of the ChannelSidebar.
 *
 * Lets the user change their display name and online status.
 * Renders as an absolute panel anchored above the footer strip.
 * Clicking outside (the backdrop) dismisses it.
 */

import { useState, useRef, useEffect } from 'react'
import type { LocalUser, UserStatus } from './types'

const STATUSES: { value: UserStatus; label: string; color: string }[] = [
  { value: 'online',  label: 'Online',           color: '#23a55a' },
  { value: 'idle',    label: 'Idle',             color: '#f0b232' },
  { value: 'dnd',     label: 'Do Not Disturb',   color: '#f23f43' },
  { value: 'offline', label: 'Appear Offline',   color: '#80848e' },
]

interface UserStatusPanelProps {
  localUser: LocalUser
  onUpdate: (patch: Partial<Pick<LocalUser, 'displayName' | 'status'>>) => void
  onClose: () => void
  dark: boolean
}

export default function UserStatusPanel({ localUser, onUpdate, onClose, dark }: UserStatusPanelProps) {
  const [name, setName] = useState(localUser.displayName)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the name input on open
  useEffect(() => { inputRef.current?.focus() }, [])

  const bg       = dark ? '#111214' : '#ffffff'
  const border   = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const textMain = dark ? '#f2f3f5' : '#313338'
  const textMute = dark ? '#949ba4' : '#6d6f78'
  const inputBg  = dark ? '#1e1f22' : '#f2f3f5'
  const rowHover = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'

  function handleNameCommit() {
    const trimmed = name.trim()
    if (trimmed && trimmed !== localUser.displayName) {
      onUpdate({ displayName: trimmed })
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Panel */}
      <div
        className="absolute rounded-lg overflow-hidden z-40"
        style={{
          bottom: 60,         // above the footer strip
          left: 8,
          width: 220,
          backgroundColor: bg,
          border: `1px solid ${border}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}
      >
        {/* Name section */}
        <div className="px-3 pt-3 pb-2">
          <label className="block text-[0.68rem] font-semibold tracking-widest uppercase mb-1" style={{ color: textMute }}>
            Display Name
          </label>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameCommit}
            onKeyDown={(e) => { if (e.key === 'Enter') { handleNameCommit(); onClose() } }}
            className="w-full rounded px-2 py-1.5 text-[0.9rem] border-0 outline-none"
            style={{ backgroundColor: inputBg, color: textMain }}
            maxLength={32}
          />
        </div>

        <div className="h-px mx-3" style={{ backgroundColor: border }} />

        {/* Status section */}
        <div className="px-1 py-1">
          <div className="px-2 py-1 text-[0.68rem] font-semibold tracking-widest uppercase" style={{ color: textMute }}>
            Status
          </div>
          {STATUSES.map((s) => {
            const isActive = localUser.status === s.value
            return (
              <button
                key={s.value}
                onClick={() => { onUpdate({ status: s.value }); onClose() }}
                className="flex items-center gap-3 w-full px-2 py-[7px] rounded text-left border-0 cursor-pointer transition-colors text-[0.9rem]"
                style={{
                  backgroundColor: isActive ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)') : 'transparent',
                  color: textMain,
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = rowHover }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                {/* Status dot */}
                <span
                  className="rounded-full shrink-0"
                  style={{ width: 10, height: 10, backgroundColor: s.color }}
                />
                <span>{s.label}</span>
                {isActive && (
                  <span className="ml-auto text-[0.7rem]" style={{ color: textMute }}>✓</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
