import React, { createContext, useContext, useMemo } from 'react'
import { defaultTokens } from './tokens'
import type { ThemeTokens } from './tokens'

// ─── Theme object ─────────────────────────────────────────────────────────────

export interface Theme {
  tokens: Partial<ThemeTokens>
}

/**
 * Create a Theme object from a partial token map.
 * Unspecified tokens fall back to the library defaults at render time.
 */
export function defineTheme(tokens: Partial<ThemeTokens>): Theme {
  return { tokens }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<Theme | null>(null)

export function useTheme(): Theme | null {
  return useContext(ThemeContext)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface ThemeProviderProps {
  theme?: Theme
  children: React.ReactNode
}

/**
 * Wrap your app (or a subtree) in ThemeProvider to apply a custom theme.
 * Injects `--notation-*` CSS custom properties onto a wrapper div.
 * Nesting ThemeProviders is supported — the inner one wins.
 */
export const ThemeProvider = React.forwardRef<HTMLDivElement, ThemeProviderProps>(
  ({ theme, children }, ref) => {
    const tokens = useMemo(() => {
      const merged = { ...defaultTokens, ...(theme?.tokens ?? {}) }
      return Object.entries(merged).reduce<Record<string, string>>((acc, [key, value]) => {
        acc[`--notation-${key}`] = value
        return acc
      }, {})
    }, [theme])

    return (
      <ThemeContext.Provider value={theme ?? null}>
        <div
          ref={ref}
          className="notation-theme-root"
          style={tokens as React.CSSProperties}
          data-testid="notation-theme-root"
        >
          {children}
        </div>
      </ThemeContext.Provider>
    )
  }
)
ThemeProvider.displayName = 'ThemeProvider'
