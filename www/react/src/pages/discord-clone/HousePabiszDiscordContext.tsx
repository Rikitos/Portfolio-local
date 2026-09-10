import { createContext, useContext } from 'react'

/**
 * Whether the Discord Clone is rendering inside the House Pabisz theme.
 * A context (not a prop) on purpose: every subcomponent already takes a
 * `dark` prop and computes its own colors locally, so threading a second
 * boolean through every signature and call site would touch far more code
 * than the actual color swaps do. Each component just reads this once.
 */
const HousePabiszDiscordContext = createContext(false)

export const HousePabiszDiscordProvider = HousePabiszDiscordContext.Provider

export function useDiscordHousePabisz() {
  return useContext(HousePabiszDiscordContext)
}
