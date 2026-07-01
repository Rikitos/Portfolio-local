/**
 * MessageInput.tsx — message composition bar at the bottom of the chat.
 *
 * Contains:
 *   - Auto-resizing textarea (Enter sends, Shift+Enter newline)
 *   - Emoji picker popup (inserts emoji at cursor / end of text)
 *   - GIF picker popup (sends a gif message directly)
 *   - Send button (visible when textarea has content)
 */

import { useState, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import EmojiPicker from './EmojiPicker'
import GifPicker   from './GifPicker'

type OpenPicker = 'none' | 'emoji' | 'gif'

interface MessageInputProps {
  channelName: string
  dark: boolean
  onSend: (content: string) => void
  onSendGif: (url: string, alt: string) => void
  onTypingChange?: (isTyping: boolean) => void
}

export default function MessageInput({ channelName, dark, onSend, onSendGif, onTypingChange }: MessageInputProps) {
  const [value,      setValue]      = useState('')
  const [openPicker, setOpenPicker] = useState<OpenPicker>('none')
  const textareaRef  = useRef<HTMLTextAreaElement>(null)
  const typingRef    = useRef(false)

  const inputBg   = dark ? '#383a40' : '#ebedef'
  const textColor = dark ? '#dbdee1' : '#313338'
  const iconColor = dark ? '#b5bac1' : '#80848e'
  const iconHover = dark ? '#dbdee1' : '#313338'

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    if (typingRef.current) { typingRef.current = false; onTypingChange?.(false) }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value
    setValue(v)
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px' }
    if (v && !typingRef.current) { typingRef.current = true; onTypingChange?.(true) }
    else if (!v && typingRef.current) { typingRef.current = false; onTypingChange?.(false) }
  }

  // Insert emoji at end of current value (simple append)
  function handleEmojiPick(emoji: string) {
    setValue((v) => v + emoji)
    textareaRef.current?.focus()
  }

  function togglePicker(which: OpenPicker) {
    setOpenPicker((cur) => cur === which ? 'none' : which)
  }

  function IconBtn({ title, onClick, active, children }: {
    title: string
    onClick: () => void
    active?: boolean
    children: React.ReactNode
  }) {
    return (
      <button
        onClick={onClick}
        title={title}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded border-0 cursor-pointer transition-colors"
        style={{ backgroundColor: active ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') : 'transparent',
                 color: active ? iconHover : iconColor }}
      >
        {children}
      </button>
    )
  }

  return (
    <div
      className="px-4 py-3 shrink-0"
      style={{ backgroundColor: dark ? '#313338' : '#ffffff' }}
    >
      <div
        className="flex items-end gap-1 rounded-lg px-3 py-2"
        style={{ backgroundColor: inputBg }}
      >
        {/* Attachment — decorative */}
        <IconBtn title="Attach file" onClick={() => {}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.44 11.05L12.25 20.24a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.67 3.67 0 0 1 5.19 5.19l-9.2 9.19a1.83 1.83 0 0 1-2.59-2.59l8.49-8.48"/>
          </svg>
        </IconBtn>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          rows={1}
          className="flex-1 resize-none border-0 outline-none text-[0.95rem] leading-[1.375] bg-transparent py-0.5"
          style={{ color: textColor, caretColor: textColor, maxHeight: 120, overflowY: 'auto' }}
        />

        {/* Right-side buttons */}
        <div className="flex items-center gap-0.5 shrink-0 relative">

          {/* GIF picker */}
          <div className="relative">
            {openPicker === 'gif' && (
              <GifPicker
                onPick={({ url, alt }) => onSendGif(url, alt)}
                onClose={() => setOpenPicker('none')}
                dark={dark}
              />
            )}
            <IconBtn title="Send a GIF" onClick={() => togglePicker('gif')} active={openPicker === 'gif'}>
              <span className="text-[0.65rem] font-bold tracking-tight leading-none">GIF</span>
            </IconBtn>
          </div>

          {/* Emoji picker */}
          <div className="relative">
            {openPicker === 'emoji' && (
              <EmojiPicker
                onPick={handleEmojiPick}
                onClose={() => setOpenPicker('none')}
                dark={dark}
              />
            )}
            <IconBtn title="Emoji" onClick={() => togglePicker('emoji')} active={openPicker === 'emoji'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2.5-5H6.5C7 9 9.24 7.5 12 7.5s5 1.5 5.5 4z"/>
              </svg>
            </IconBtn>
          </div>

          {/* Send button — only when text is present */}
          {value.trim() && (
            <button
              onClick={handleSend}
              className="w-8 h-8 flex items-center justify-center rounded border-0 cursor-pointer transition-colors"
              style={{ backgroundColor: '#5865F2', color: '#ffffff' }}
              title="Send Message"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
