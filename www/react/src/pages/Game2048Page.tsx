import { useReducer, useEffect, useRef, useState } from 'react'

/** TYPES **/
type Direction = 'up' | 'down' | 'left' | 'right'
type ChargeType = 'undo' | 'swap' | 'delete'
type PendingAction = 'swap' | 'delete' | null

// A tile is a positioned, identified value — tracking ids across moves (rather than a
// plain number[][] grid) is what lets the renderer animate a tile sliding from its old
// cell to its new one instead of values just teleporting between re-rendered cells.
interface Tile {
  id: number
  r: number
  c: number
  value: number
  isNew: boolean     // just spawned this move — plays the pop-in animation
  isMerged: boolean  // just absorbed another tile this move — plays the merge pop animation
}

interface HistoryEntry {
  tiles: Tile[]
  score: number
}

interface GameState {
  tiles: Tile[]
  score: number
  best: number
  status: 'playing' | 'won' | 'over'
  keepPlaying: boolean       // true once the player dismisses the "You win" banner and keeps going past 2048
  charges: Record<ChargeType, number>  // remaining uses of each special action, capped at 2
  history: HistoryEntry[]    // pre-move snapshots, popped by Undo
  pendingAction: PendingAction  // which special action is currently waiting for a tile pick
  selectedTileId: number | null // first tile picked while pendingAction === 'swap'
}

type GameAction =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'RESTART' }
  | { type: 'KEEP_PLAYING' }
  | { type: 'UNDO' }
  | { type: 'START_SWAP' }
  | { type: 'START_DELETE' }
  | { type: 'CANCEL_PENDING' }
  | { type: 'PICK_TILE'; id: number }

/** LOGIC **/
const SIZE = 4
const BEST_KEY = 'game2048_best'
const MAX_CHARGE = 2

let _tileId = 0
function nextTileId() { return ++_tileId }

function emptyGrid(): number[][] {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function tilesToGrid(tiles: Tile[]): number[][] {
  const grid = emptyGrid()
  for (const t of tiles) grid[t.r][t.c] = t.value
  return grid
}

// Drops a new tile (90% a 2, 10% a 4) into a random empty cell. No-op if the board is full.
function spawnTile(tiles: Tile[]): Tile[] {
  const occupied = new Set(tiles.map(t => `${t.r},${t.c}`))
  const empties: [number, number][] = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!occupied.has(`${r},${c}`)) empties.push([r, c])
    }
  }
  if (empties.length === 0) return tiles
  const [r, c] = empties[Math.floor(Math.random() * empties.length)]
  const value = Math.random() < 0.9 ? 2 : 4
  return [...tiles, { id: nextTileId(), r, c, value, isNew: true, isMerged: false }]
}

// Slides every tile toward the given direction and merges equal neighbours, one merge per tile per move.
// Every direction is handled by the same loop: rows are the "lines" for left/right, columns for up/down,
// and "reversed" picks which end of the line tiles compact toward.
function moveTiles(tiles: Tile[], direction: Direction): { tiles: Tile[]; gained: number; moved: boolean; mergedValues: number[] } {
  const vertical = direction === 'up' || direction === 'down'
  const reversed = direction === 'right' || direction === 'down'
  let gained = 0
  const mergedValues: number[] = []
  const result: Tile[] = []

  for (let lineIndex = 0; lineIndex < SIZE; lineIndex++) {
    const line = tiles
      .filter(t => (vertical ? t.c : t.r) === lineIndex)
      .sort((a, b) => {
        const posA = vertical ? a.r : a.c
        const posB = vertical ? b.r : b.c
        return reversed ? posB - posA : posA - posB
      })

    let slot = 0
    for (let i = 0; i < line.length; i++) {
      const current = line[i]
      const next = line[i + 1]
      const pos = reversed ? SIZE - 1 - slot : slot
      if (next && next.value === current.value) {
        const value = current.value * 2
        gained += value
        mergedValues.push(value)
        result.push({ id: current.id, value, isNew: false, isMerged: true, r: vertical ? pos : lineIndex, c: vertical ? lineIndex : pos })
        i++ // the next tile was consumed by this merge
      } else {
        result.push({ id: current.id, value: current.value, isNew: false, isMerged: false, r: vertical ? pos : lineIndex, c: vertical ? lineIndex : pos })
      }
      slot++
    }
  }

  const signature = (list: Tile[]) => JSON.stringify(list.map(t => ({ id: t.id, r: t.r, c: t.c, value: t.value })).sort((a, b) => a.id - b.id))
  const moved = signature(tiles) !== signature(result)

  return { tiles: result, gained, moved, mergedValues }
}

// A move remains possible if any cell is empty, or two horizontally/vertically adjacent cells match.
function hasMovesLeft(grid: number[][]): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true
    }
  }
  return false
}

function loadBest(): number {
  const raw = localStorage.getItem(BEST_KEY)
  return raw ? parseInt(raw, 10) || 0 : 0
}

function newGameState(): GameState {
  const tiles = spawnTile(spawnTile([]))
  return {
    tiles,
    score: 0,
    best: loadBest(),
    status: 'playing',
    keepPlaying: false,
    charges: { undo: 0, swap: 0, delete: 0 },
    history: [],
    pendingAction: null,
    selectedTileId: null,
  }
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MOVE': {
      // Ignore input once the game is over, after a win unless the player kept playing,
      // or while a special action is mid-pick (moving would shift the tiles the player is about to select)
      if (state.status === 'over') return state
      if (state.status === 'won' && !state.keepPlaying) return state
      if (state.pendingAction) return state

      const { tiles, gained, moved, mergedValues } = moveTiles(state.tiles, action.direction)
      if (!moved) return state // nothing shifted — don't spawn a tile or push history

      const spawned = spawnTile(tiles)
      const score = state.score + gained
      const best = Math.max(state.best, score)
      const won = !state.keepPlaying && spawned.some(t => t.value >= 2048)
      const over = !won && !hasMovesLeft(tilesToGrid(spawned))

      // Reaching a fresh 128 / 256 / 512 tile earns one use of undo / swap / delete, capped at 2
      const charges = { ...state.charges }
      for (const value of mergedValues) {
        if (value === 128) charges.undo = Math.min(MAX_CHARGE, charges.undo + 1)
        if (value === 256) charges.swap = Math.min(MAX_CHARGE, charges.swap + 1)
        if (value === 512) charges.delete = Math.min(MAX_CHARGE, charges.delete + 1)
      }

      // Snapshot taken before this move was applied, so Undo can restore it — capped so it can't grow forever
      const history = [...state.history, { tiles: state.tiles, score: state.score }].slice(-10)

      return { ...state, tiles: spawned, score, best, status: won ? 'won' : over ? 'over' : 'playing', charges, history }
    }

    case 'UNDO': {
      if (state.charges.undo <= 0 || state.history.length === 0) return state
      const previous = state.history[state.history.length - 1]
      return {
        ...state,
        tiles: previous.tiles,
        score: previous.score,
        history: state.history.slice(0, -1),
        charges: { ...state.charges, undo: state.charges.undo - 1 },
        status: 'playing',
        pendingAction: null,
        selectedTileId: null,
      }
    }

    case 'START_SWAP':
      if (state.charges.swap <= 0 || state.status === 'over') return state
      return { ...state, pendingAction: 'swap', selectedTileId: null }

    case 'START_DELETE':
      if (state.charges.delete <= 0 || state.status === 'over') return state
      return { ...state, pendingAction: 'delete', selectedTileId: null }

    case 'CANCEL_PENDING':
      return { ...state, pendingAction: null, selectedTileId: null }

    case 'PICK_TILE': {
      if (state.pendingAction === 'delete') {
        const target = state.tiles.find(t => t.id === action.id)
        if (!target) return state
        // "Delete by number" removes every tile sharing that value, not just the one clicked
        const tiles = state.tiles.filter(t => t.value !== target.value)
        return { ...state, tiles, charges: { ...state.charges, delete: state.charges.delete - 1 }, pendingAction: null, selectedTileId: null }
      }
      if (state.pendingAction === 'swap') {
        if (state.selectedTileId === null) return { ...state, selectedTileId: action.id }
        if (state.selectedTileId === action.id) return { ...state, selectedTileId: null } // clicked the same tile again — deselect
        const a = state.tiles.find(t => t.id === state.selectedTileId)
        const b = state.tiles.find(t => t.id === action.id)
        if (!a || !b) return state
        const tiles = state.tiles.map(t => {
          if (t.id === a.id) return { ...t, r: b.r, c: b.c }
          if (t.id === b.id) return { ...t, r: a.r, c: a.c }
          return t
        })
        return { ...state, tiles, charges: { ...state.charges, swap: state.charges.swap - 1 }, pendingAction: null, selectedTileId: null }
      }
      return state
    }

    case 'KEEP_PLAYING':
      return { ...state, status: 'playing', keepPlaying: true }

    case 'RESTART':
      return newGameState()

    default:
      return state
  }
}

/** STYLES **/
const font = "font-['Palatino_Linotype',Palatino,serif]"

// Classic 2048 tile palette — kept constant across both site themes since these
// colours are the game's own identity, not part of the portfolio's theme system.
const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2:    { bg: '#eee4da', text: '#776e65' },
  4:    { bg: '#ede0c8', text: '#776e65' },
  8:    { bg: '#f2b179', text: '#f9f6f2' },
  16:   { bg: '#f59563', text: '#f9f6f2' },
  32:   { bg: '#f67c5f', text: '#f9f6f2' },
  64:   { bg: '#f65e3b', text: '#f9f6f2' },
  128:  { bg: '#edcf72', text: '#f9f6f2' },
  256:  { bg: '#edcc61', text: '#f9f6f2' },
  512:  { bg: '#edc850', text: '#f9f6f2' },
  1024: { bg: '#edc53f', text: '#f9f6f2' },
  2048: { bg: '#edc22e', text: '#f9f6f2' },
}
const HIGH_TILE = { bg: '#3c3a32', text: '#f9f6f2' } // fallback for anything past 2048

// Percentage-based layout for the board: GAP_PCT reproduces the outer-edge + between-tile
// gaps of the classic 2048 board, all in %, so the same numbers place both the static
// background cells and the animated tile layer without a px/​% unit mismatch.
const GAP_PCT = 2.5
const TILE_PCT = (100 - GAP_PCT * (SIZE + 1)) / SIZE
function cellPct(i: number) { return GAP_PCT * (i + 1) + TILE_PCT * i }

function fontSizeFor(value: number) {
  return value >= 1000 ? 'text-[1.3rem] sm:text-[1.6rem]' : value >= 100 ? 'text-[1.6rem] sm:text-[2rem]' : 'text-[1.8rem] sm:text-[2.3rem]'
}

/** BUTTON SUBCOMPONENTS **/
// Both buttons manage their own hover state in JS rather than a Tailwind `hover:` class,
// because their background is an inline style (driven by the dark/light prop) which always
// wins the cascade over a plain hover class — see CLAUDE.md's note on avoiding dark: variants.
function GhostButton({ label, onClick, dark, disabled = false }: { label: string; onClick: () => void; dark: boolean; disabled?: boolean }) {
  const [hover, setHover] = useState(false)
  const bg = disabled ? (dark ? '#182739' : '#c4c9d8') : hover ? (dark ? '#2f4d73' : '#c0c6d4') : (dark ? '#243D5C' : '#cdd2e0')
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`${font} text-[0.7rem] tracking-[0.15em] uppercase px-4 py-2 rounded-sm border transition-colors duration-150 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      style={{ color: dark ? '#c0c8d8' : '#1a2035', borderColor: 'rgba(201,168,76,0.35)', backgroundColor: bg }}
    >
      {label}
    </button>
  )
}

function AccentButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`${font} text-[0.75rem] tracking-[0.15em] uppercase px-5 py-2.5 rounded-sm cursor-pointer transition-colors duration-150`}
      style={{ color: '#f9f6f2', backgroundColor: hover ? '#dab958' : '#C9A84C' }}
    >
      {label}
    </button>
  )
}

// Feather-style stroke icons — sized to inherit color from the button via currentColor
function UndoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M3.51 13a9 9 0 1 0 2.13-9.36L3 7" />
    </svg>
  )
}
function SwapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4L3 8l4 4" />
      <path d="M3 8h15" />
      <path d="M17 20l4-4-4-4" />
      <path d="M21 16H6" />
    </svg>
  )
}
function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

// Icon button for the special actions — a hover tooltip explains what it does since the
// icon alone doesn't convey the milestone that unlocks it or the remaining use count.
function ChargeButton({ icon, hint, count, onClick, dark, active = false }: {
  icon: React.ReactNode
  hint: string
  count: number
  onClick: () => void
  dark: boolean
  active?: boolean
}) {
  const [hover, setHover] = useState(false)
  const disabled = count <= 0
  const bg = disabled
    ? (dark ? '#182739' : '#c4c9d8')
    : active
      ? '#C9A84C'
      : hover
        ? (dark ? '#2f4d73' : '#c0c6d4')
        : (dark ? '#243D5C' : '#cdd2e0')

  return (
    <div className="relative">
      {/* No `disabled` attribute — disabled form elements don't fire mouse events in browsers,
          which would silently kill the hover tooltip. Click is guarded manually instead. */}
      <button
        onClick={() => { if (!disabled) onClick() }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-disabled={disabled}
        aria-label={`${hint} (${count} of ${MAX_CHARGE} left)`}
        className={`relative w-9 h-9 flex items-center justify-center rounded-sm border transition-colors duration-150 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        style={{ color: active ? '#1a2035' : (dark ? '#c0c8d8' : '#1a2035'), borderColor: 'rgba(201,168,76,0.35)', backgroundColor: bg }}
      >
        <span className="scale-[0.8]">{icon}</span>
        <span
          className={`${font} absolute -top-1.5 -right-1.5 flex items-center justify-center w-3.5 h-3.5 rounded-full text-[0.5rem] font-bold`}
          style={{ backgroundColor: '#C9A84C', color: '#1a2035' }}
        >
          {count}
        </span>
      </button>

      {/* Hover tooltip — explains the action and what unlocked it, shown regardless of charge count */}
      {hover && (
        <div
          className={`${font} absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-max max-w-[160px] text-center px-2.5 py-1.5 rounded text-[0.7rem] leading-snug pointer-events-none`}
          style={{ backgroundColor: dark ? '#0A1628' : '#1a2035', color: '#e4e8f0' }}
        >
          {hint}
        </div>
      )}
    </div>
  )
}

interface Game2048PageProps {
  dark: boolean
}

/** COMPONENT **/
export default function Game2048Page({ dark }: Game2048PageProps) {
  const [state, dispatch] = useReducer(reducer, undefined, newGameState)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  // Persist the best score across sessions
  useEffect(() => {
    localStorage.setItem(BEST_KEY, String(state.best))
  }, [state.best])

  // Arrow-key controls — prevent default so the page doesn't scroll while playing
  useEffect(() => {
    const keyToDirection: Record<string, Direction> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    }
    function onKeyDown(e: KeyboardEvent) {
      const direction = keyToDirection[e.key]
      if (!direction) return
      e.preventDefault()
      dispatch({ type: 'MOVE', direction })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Touch swipe controls — direction is whichever axis moved further
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null
    const SWIPE_THRESHOLD = 24 // px — filters out taps/jitter from real swipes
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return
    const direction: Direction = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down' : 'up')
    dispatch({ type: 'MOVE', direction })
  }

  const pageBg  = dark ? '#112240' : '#d8dce8'
  const boardBg = dark ? '#243D5C' : '#bbada0'
  const cellBg  = dark ? 'rgba(17,34,64,0.4)' : 'rgba(238,228,218,0.35)'
  const text    = dark ? '#c0c8d8' : '#1a2035'
  const label   = dark ? '#8896b0' : '#5a6480'
  const accent  = '#C9A84C'
  // Score and best boxes share a family but use distinct backgrounds so they read as separate stats at a glance
  const scoreBg = boardBg
  const bestBg  = dark ? '#4a3a1f' : '#c9ab6b'
  const bestValueColor = dark ? '#f9f6f2' : '#2a1f0a'

  const clickable = state.pendingAction !== null

  return (
    // pt clears the fixed header (which otherwise overlaps this page's top content); min-h subtracts its height from the viewport
    <main
      className="flex flex-col items-center min-h-[calc(100vh-64px)] px-4 pt-24 pb-12 transition-colors duration-300"
      style={{ backgroundColor: pageBg }}
    >
      <div className="w-full max-w-[420px]">

        <div className="flex items-center justify-between mb-4">
          <h1 className={`${font} font-normal text-[2rem] sm:text-[2.6rem]`} style={{ color: text }}>2048</h1>

          <div className="flex gap-2">
            <div className="rounded px-4 py-2 text-center min-w-[68px]" style={{ backgroundColor: scoreBg }}>
              <div className={`${font} text-[0.6rem] tracking-[0.15em] uppercase`} style={{ color: '#eee4da' }}>Score</div>
              <div className={`${font} text-[1.1rem] font-bold`} style={{ color: '#f9f6f2' }}>{state.score}</div>
            </div>
            <div className="rounded px-4 py-2 text-center min-w-[68px]" style={{ backgroundColor: bestBg }}>
              <div className={`${font} text-[0.6rem] tracking-[0.15em] uppercase`} style={{ color: '#f3e6c9' }}>Best</div>
              <div className={`${font} text-[1.1rem] font-bold`} style={{ color: bestValueColor }}>{state.best}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className={`${font} text-[0.85rem]`} style={{ color: label }}>
            Join the tiles, get to <strong>2048</strong>!
          </p>
          <GhostButton label="New Game" dark={dark} onClick={() => dispatch({ type: 'RESTART' })} />
        </div>

        {/* Special actions — earned by first creating a 128 / 256 / 512 tile, max 2 uses each */}
        <div className="flex justify-center gap-2 mb-3">
          <ChargeButton
            icon={<UndoIcon />}
            hint="Undo the last move — earned by making a 128 tile"
            count={state.charges.undo}
            dark={dark}
            onClick={() => dispatch({ type: 'UNDO' })}
          />
          <ChargeButton
            icon={<SwapIcon />}
            hint="Swap two tiles' positions — earned by making a 256 tile"
            count={state.charges.swap}
            dark={dark}
            active={state.pendingAction === 'swap'}
            onClick={() => dispatch({ type: 'START_SWAP' })}
          />
          <ChargeButton
            icon={<DeleteIcon />}
            hint="Delete every tile with a chosen number — earned by making a 512 tile"
            count={state.charges.delete}
            dark={dark}
            active={state.pendingAction === 'delete'}
            onClick={() => dispatch({ type: 'START_DELETE' })}
          />
        </div>

        {state.pendingAction && (
          <div className="flex items-center justify-between mb-3 rounded px-3 py-2" style={{ backgroundColor: dark ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.15)' }}>
            <span className={`${font} text-[0.8rem]`} style={{ color: text }}>
              {state.pendingAction === 'swap'
                ? (state.selectedTileId === null ? 'Pick the first tile to swap' : 'Pick the second tile to swap')
                : 'Pick a tile — every tile with that number will be deleted'}
            </span>
            <button
              onClick={() => dispatch({ type: 'CANCEL_PENDING' })}
              className={`${font} text-[0.7rem] uppercase tracking-wider cursor-pointer`}
              style={{ color: accent }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Board — touch-none stops mobile Safari from scrolling the page while swiping */}
        <div
          className="relative rounded-md p-2 select-none touch-none"
          style={{ backgroundColor: boardBg }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative w-full aspect-square">
            {/* Static background cells — never move, so no animation classes needed */}
            {Array.from({ length: SIZE * SIZE }).map((_, i) => {
              const r = Math.floor(i / SIZE), c = i % SIZE
              return (
                <div
                  key={`bg-${i}`}
                  className="absolute rounded"
                  style={{ left: `${cellPct(c)}%`, top: `${cellPct(r)}%`, width: `${TILE_PCT}%`, height: `${TILE_PCT}%`, backgroundColor: cellBg }}
                />
              )
            })}

            {/* Animated tile layer — each tile keeps its id across moves so React reuses the DOM node
                and the left/top transition actually plays instead of the tile just teleporting */}
            {state.tiles.map(tile => {
              const colors = TILE_COLORS[tile.value] ?? HIGH_TILE
              const isSelected = tile.id === state.selectedTileId
              return (
                <div
                  key={tile.id}
                  onClick={() => clickable && dispatch({ type: 'PICK_TILE', id: tile.id })}
                  className={[
                    'absolute rounded flex items-center justify-center font-bold',
                    font, fontSizeFor(tile.value),
                    'transition-all duration-200 ease-in-out',
                    tile.isNew ? 'animate-[tile-pop_180ms_ease-out]' : '',
                    tile.isMerged ? 'animate-[tile-merge_280ms_ease-in-out]' : '',
                    clickable ? 'cursor-pointer' : '',
                  ].join(' ')}
                  style={{
                    left: `${cellPct(tile.c)}%`,
                    top: `${cellPct(tile.r)}%`,
                    width: `${TILE_PCT}%`,
                    height: `${TILE_PCT}%`,
                    backgroundColor: colors.bg,
                    color: colors.text,
                    boxShadow: clickable ? (isSelected ? '0 0 0 3px #C9A84C' : '0 0 0 2px rgba(201,168,76,0.5)') : 'none',
                  }}
                >
                  {tile.value}
                </div>
              )
            })}
          </div>

          {/* Win / game-over overlay */}
          {(state.status === 'won' || state.status === 'over') && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md"
              style={{ backgroundColor: dark ? 'rgba(17,34,64,0.75)' : 'rgba(238,228,218,0.75)' }}
            >
              <p className={`${font} text-[1.6rem] font-bold`} style={{ color: text }}>
                {state.status === 'won' ? 'You win!' : 'Game over'}
              </p>
              <div className="flex gap-3">
                {state.status === 'won' && (
                  <GhostButton label="Keep Playing" dark={dark} onClick={() => dispatch({ type: 'KEEP_PLAYING' })} />
                )}
                <AccentButton label="Try Again" onClick={() => dispatch({ type: 'RESTART' })} />
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
