import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, defineTheme } from './ThemeProvider'

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <span>hello</span>
      </ThemeProvider>
    )
    expect(screen.getByText('hello')).toBeTruthy()
  })

  it('injects default CSS tokens as inline style', () => {
    render(<ThemeProvider><span /></ThemeProvider>)
    const root = screen.getByTestId('notation-theme-root')
    expect(root.style.getPropertyValue('--notation-font-family')).toBeTruthy()
    expect(root.style.getPropertyValue('--notation-color-chord')).toBeTruthy()
  })

  it('overrides individual tokens', () => {
    const theme = defineTheme({ 'color-chord': 'red' })
    render(<ThemeProvider theme={theme}><span /></ThemeProvider>)
    const root = screen.getByTestId('notation-theme-root')
    expect(root.style.getPropertyValue('--notation-color-chord')).toBe('red')
  })

  it('preserves unoverridden default tokens', () => {
    const theme = defineTheme({ 'color-chord': 'red' })
    render(<ThemeProvider theme={theme}><span /></ThemeProvider>)
    const root = screen.getByTestId('notation-theme-root')
    expect(root.style.getPropertyValue('--notation-font-size-chord')).toBeTruthy()
  })

  it('applies notation-theme-root class', () => {
    render(<ThemeProvider><span /></ThemeProvider>)
    expect(screen.getByTestId('notation-theme-root').className).toContain('notation-theme-root')
  })
})

describe('defineTheme', () => {
  it('returns a Theme with the provided tokens', () => {
    const theme = defineTheme({ 'font-size-chord': '1.25rem' })
    expect(theme.tokens['font-size-chord']).toBe('1.25rem')
  })
})
