---
sidebar_position: 3
---

# Theming

All visual styling is driven by CSS custom properties (`--notation-*` tokens).
Wrap your app in `<ThemeProvider>` to apply a theme, or override individual tokens with plain CSS.

## ThemeProvider

```tsx
import { ThemeProvider, defineTheme } from 'react-notation'
import 'react-notation/style.css'

const theme = defineTheme({
  'color-chord': '#1a6cf5',
  'font-size-chord': '1.125rem',
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ChordSheet score={score} />
    </ThemeProvider>
  )
}
```

`ThemeProvider` injects all `--notation-*` tokens as inline CSS variables onto a wrapper `<div>`.
Unspecified tokens fall back to the library defaults. Nesting `ThemeProvider` components is
supported — the innermost one wins.

## defineTheme

```ts
function defineTheme(tokens: Partial<ThemeTokens>): Theme
```

Accepts a partial token map. Only the tokens you specify are overridden; all others use defaults.

## CSS override (no ThemeProvider)

You can override tokens directly in your own stylesheet:

```css
.my-song-section {
  --notation-color-chord: #2563eb;
  --notation-font-size-chord: 1.25rem;
}
```

## Token reference

### Typography

| Token | Default | Description |
|-------|---------|-------------|
| `--notation-font-family` | `Georgia, "Times New Roman", serif` | Base font |
| `--notation-font-size-base` | `1rem` | Base font size |
| `--notation-font-size-chord` | `1rem` | Chord symbol size |
| `--notation-font-size-lyric` | `0.9375rem` | Lyric text size |
| `--notation-font-size-label` | `0.75rem` | Section/measure number labels |
| `--notation-font-weight-chord` | `600` | Chord symbol weight |
| `--notation-font-weight-lyric` | `400` | Lyric text weight |

### Color

| Token | Default | Description |
|-------|---------|-------------|
| `--notation-color-chord` | `inherit` | Chord symbol color |
| `--notation-color-lyric` | `inherit` | Lyric text color |
| `--notation-color-section-label` | `inherit` | Section/rehearsal mark color |
| `--notation-color-measure-border` | `currentColor` | Bar line color |
| `--notation-color-background` | `transparent` | Component background |

### Spacing

| Token | Default | Description |
|-------|---------|-------------|
| `--notation-measure-gap` | `1rem` | Gap between measures on a line |
| `--notation-beat-gap` | `0.5rem` | Gap between beat columns within a measure |
| `--notation-line-gap` | `1.5rem` | Vertical gap between lines |
| `--notation-section-gap` | `2rem` | Extra top gap before section labels |

### Borders

| Token | Default | Description |
|-------|---------|-------------|
| `--notation-measure-border-width` | `1px` | Bar line width |
| `--notation-measure-border-style` | `solid` | Bar line style |
| `--notation-measure-border-radius` | `0` | Bar line border radius |
