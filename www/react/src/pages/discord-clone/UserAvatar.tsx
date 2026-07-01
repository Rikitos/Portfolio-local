/**
 * UserAvatar.tsx — reusable coloured circle avatar with initials fallback.
 *
 * Used in the message list, member list, and the user footer strip.
 * If the user has an avatarUrl it renders an img; otherwise a coloured circle
 * showing the first letter of their display name.
 *
 * Status dot colours follow Discord's convention:
 *   online → green, idle → yellow, dnd → red, offline → grey
 */

import type { User, LocalUser, UserStatus } from './types'

const STATUS_COLORS: Record<UserStatus, string> = {
  online:  '#23a55a',
  idle:    '#f0b232',
  dnd:     '#f23f43',
  offline: '#80848e',
}

interface UserAvatarProps {
  userId: string
  users: Record<string, User>
  localUser: LocalUser
  size?: number
  // When true a status dot is rendered in the bottom-right corner
  showStatus?: boolean
}

export default function UserAvatar({ userId, users, localUser, size = 40, showStatus = false }: UserAvatarProps) {
  // Resolve either a bot user or the local user
  const user: User | LocalUser | undefined =
    userId === 'local_user' ? localUser : users[userId]

  const displayName = user?.displayName ?? '?'
  const color       = (user as User)?.avatarColor ?? '#5865F2'
  const initial     = displayName.charAt(0).toUpperCase()
  const avatarUrl   = (user as User)?.avatarUrl
  const status      = (user as User)?.status ?? (localUser?.status ?? 'offline')

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center font-bold text-white select-none"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            fontSize: size * 0.4,
          }}
        >
          {initial}
        </div>
      )}

      {showStatus && (
        <span
          className="absolute rounded-full"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            backgroundColor: STATUS_COLORS[status as UserStatus] ?? STATUS_COLORS.offline,
            border: '2px solid transparent',
            bottom: 0,
            right: 0,
          }}
        />
      )}
    </div>
  )
}
