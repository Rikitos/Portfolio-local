/**
 * EmojiPicker.tsx — a small popup emoji grid that inserts into the message input.
 *
 * Grouped by category, clicking an emoji calls onPick(emoji).
 * Renders above the message input bar.
 */

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: 'Faces', emojis: ['😂','😭','😍','🥹','😊','😎','🤔','😅','🤣','😤','🥲','😏','🤩','😬','😴','🤯','😱','🥸','😇','🤗'] },
  { label: 'Gestures', emojis: ['👍','👎','👏','🙌','🤝','🫡','✌️','🤙','💪','🫶','🙏','🤞','👀','🫠','💅','🫂'] },
  { label: 'Symbols', emojis: ['🔥','💀','✅','❌','💯','⚡','🎉','🎊','💥','❤️','💙','💚','🩵','🖤','💜','🤍','⭐','🏆','🎯','💎'] },
  { label: 'Animals', emojis: ['🐱','🐶','🐸','🐧','🦆','🐙','🦊','🐻','🐼','🦁','🐯','🦋','🐢','🦄','🐳','🦖'] },
  { label: 'Food', emojis: ['🍕','🍔','🌮','🍜','🍣','☕','🧃','🍺','🧁','🍰','🍿','🥐','🍩','🧋','🥤','🍦'] },
]

interface EmojiPickerProps {
  onPick: (emoji: string) => void
  onClose: () => void
  dark: boolean
}

export default function EmojiPicker({ onPick, onClose, dark }: EmojiPickerProps) {
  const bg     = dark ? '#2b2d31' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const label  = dark ? '#949ba4' : '#6d6f78'

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      <div
        className="absolute bottom-full mb-2 right-0 rounded-lg overflow-hidden z-40"
        style={{
          width: 320,
          maxHeight: 300,
          backgroundColor: bg,
          border: `1px solid ${border}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          overflowY: 'auto',
        }}
      >
        {EMOJI_GROUPS.map((group) => (
          <div key={group.label} className="px-3 pt-3 pb-1">
            <div className="text-[0.65rem] font-semibold tracking-widest uppercase mb-1" style={{ color: label }}>
              {group.label}
            </div>
            <div className="flex flex-wrap gap-0.5">
              {group.emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onPick(emoji); onClose() }}
                  className="text-xl w-9 h-9 flex items-center justify-center rounded border-0 cursor-pointer transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
