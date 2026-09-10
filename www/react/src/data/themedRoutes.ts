/**
 * Routes that have a House Pabisz-themed version — each one is fully
 * self-contained (own header + footer) when that theme is active, same as
 * the homepage. Shared between App.tsx (which branches each route's element
 * on this) and the classic Header (whose "House Pabisz" link uses this to
 * decide whether to switch the current page's theme in place or, for a
 * route with no themed version, fall back to sending the visitor home).
 */
export const THEMED_ROUTES = ['/', '/calculator', '/tic-tac-toe', '/cat-generator', '/2048', '/discord-clone', '/room-designer']
