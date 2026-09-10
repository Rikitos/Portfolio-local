import { useReducer, useEffect, useRef } from 'react'

/** TYPES **/
export type Direction = 'up' | 'down' | 'left' | 'right'
export type ChargeType = 'undo' | 'swap' | 'delete'
export type PendingAction = 'swap' | 'delete' | null

// A tile is a positioned, identified value — tracking ids across moves (rather than a
// plain number[][] grid) is what lets the renderer animate a tile sliding from its old
// cell to its new one instead of values just teleporting between re-rendered cells.
export interface Tile {
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

export interface GameState {
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

export type GameAction =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'RESTART' }
  | { type: 'KEEP_PLAYING' }
  | { type: 'UNDO' }
  | { type: 'START_SWAP' }
  | { type: 'START_DELETE' }
  | { type: 'CANCEL_PENDING' }
  | { type: 'PICK_TILE'; id: number }

/** LOGIC **/
export const SIZE = 4
const BEST_KEY = 'game2048_best'
export const MAX_CHARGE = 2

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

/** SHARED PRESENTATION CONSTANTS **/
// Classic 2048 tile palette — kept constant across both site themes since these
// colours are the game's own identity, not part of the portfolio's theme system.
export const TILE_COLORS: Record<number, { bg: string; text: string }> = {
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
export const HIGH_TILE = { bg: '#3c3a32', text: '#f9f6f2' } // fallback for anything past 2048

// Percentage-based layout for the board: GAP_PCT reproduces the outer-edge + between-tile
// gaps of the classic 2048 board, all in %, so the same numbers place both the static
// background cells and the animated tile layer without a px/​% unit mismatch.
export const GAP_PCT = 2.5
export const TILE_PCT = (100 - GAP_PCT * (SIZE + 1)) / SIZE
export function cellPct(i: number) { return GAP_PCT * (i + 1) + TILE_PCT * i }

export function fontSizeFor(value: number) {
  return value >= 1000 ? 'text-[1.3rem] sm:text-[1.6rem]' : value >= 100 ? 'text-[1.6rem] sm:text-[2rem]' : 'text-[1.8rem] sm:text-[2.3rem]'
}

/** HOOK **/
// Shared game engine — both the classic and House Pabisz 2048 pages use
// this so the rules/state logic, best-score persistence, and keyboard/touch
// controls exist in exactly one place. Presentation (colors, buttons,
// tooltips) is deliberately NOT here — each page builds its own.
export function useGame2048() {
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

  return { state, dispatch, onTouchStart, onTouchEnd }
}
