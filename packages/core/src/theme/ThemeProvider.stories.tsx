import type { Meta, StoryObj } from '@storybook/react'
import { ThemeProvider, defineTheme } from './ThemeProvider'

const meta: Meta<typeof ThemeProvider> = {
  title: 'Theme/ThemeProvider',
  component: ThemeProvider,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof ThemeProvider>

export const Default: Story = {
  args: {
    children: (
      <p style={{ fontFamily: 'var(--notation-font-family)', fontSize: 'var(--notation-font-size-base)' }}>
        Default theme tokens active.
      </p>
    ),
  },
}

export const CustomColors: Story = {
  args: {
    theme: defineTheme({ 'color-chord': '#1a6cf5', 'color-lyric': '#444' }),
    children: (
      <div>
        <p style={{ color: 'var(--notation-color-chord)', fontWeight: 'bold' }}>Chord color</p>
        <p style={{ color: 'var(--notation-color-lyric)' }}>Lyric color</p>
      </div>
    ),
  },
}

export const LargeFontSize: Story = {
  args: {
    theme: defineTheme({ 'font-size-chord': '1.5rem', 'font-size-lyric': '1.25rem' }),
    children: (
      <div>
        <p style={{ fontSize: 'var(--notation-font-size-chord)', fontWeight: 600 }}>Cmaj7</p>
        <p style={{ fontSize: 'var(--notation-font-size-lyric)' }}>Autumn leaves drift by my window</p>
      </div>
    ),
  },
}
