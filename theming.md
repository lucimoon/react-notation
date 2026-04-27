# Theming

All visual styling is driven by CSS custom properties. Wrap your app (or just the music
components) in `<ThemeProvider>` to apply a theme, or override individual tokens with plain CSS.

---

## ThemeProvider

```tsx
import { ThemeProvider } from "react-notation"

<ThemeProvider theme={myTheme}>
  <ChordSheet score={score} />
</ThemeProvider>
```

Without a `theme` prop, the default theme is applied.

---

## Token reference

### Typography

| Token | Default | Description |
|---|---|---|
| `--notation-font-notation` | `"Bravura", serif` | SMuFL-compatible music font |
| `--notation-font-text` | `system-ui, sans-serif` | Lyrics, labels, chord symbols |
| `--notation-font-mono` | `"Courier New", monospace` | Tab fret numbers |
| `--notation-font-size-base` | `16px` | Base size; other sizes scale from this |
| `--notation-font-size-chord` | `0.9em` | Chord symbol size |
| `--notation-font-size-lyric` | `1em` | Lyric text size |
| `--notation-font-size-label` | `0.75em` | Section labels, rehearsal marks |

### Layout

| Token | Default | Description |
|---|---|---|
| `--notation-staff-line-gap` | `8px` | Space between staff lines |
| `--notation-measure-padding` | `12px` | Horizontal padding inside a measure |
| `--notation-system-gap` | `48px` | Vertical gap between systems (rows) |
| `--notation-chord-offset` | `-1.5em` | Vertical offset of chord symbols above text |

### Color

| Token | Default | Description |
|---|---|---|
| `--notation-color-ink` | `#1a1a1a` | Notes, barlines, stems |
| `--notation-color-staff` | `#555555` | Staff lines |
| `--notation-color-chord` | `#1a4fa3` | Chord symbol text |
| `--notation-color-lyric` | `#1a1a1a` | Lyric text |
| `--notation-color-label` | `#888888` | Section labels |
| `--notation-color-highlight` | `#f0c040` | Active note/measure during playback |
| `--notation-color-background` | `transparent` | Component background |

---

## Custom theme object

```ts
import { defineTheme } from "react-notation"

const darkTheme = defineTheme({
  "color-ink":        "#e8e8e8",
  "color-staff":      "#aaaaaa",
  "color-chord":      "#7eb8f7",
  "color-lyric":      "#e8e8e8",
  "color-background": "#1a1a1a",
})
```

`defineTheme` accepts any subset of token names (without the `--notation-` prefix) and merges
with the default theme.

---

## CSS override (no ThemeProvider)

```css
.my-chart {
  --notation-color-chord: #c0392b;
  --notation-font-size-chord: 1.1em;
}
```

```tsx
<ChordChart score={score} className="my-chart" />
```

---

## Print

All tokens apply under `@media print`. To override specifically for print:

```css
@media print {
  :root {
    --notation-color-highlight: transparent;
    --notation-font-size-base: 14px;
  }
}
```

---

## Music fonts

For staff notation rendering, the library expects a
[SMuFL-compatible](https://www.smufl.org/) font to be loaded. The recommended free option
is [Bravura](https://github.com/steinbergmedia/bravura).

```html
<!-- In your HTML head -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/bravura/index.css" />
```

Tab and chord-only views (ChordSheet, ChordChart) do not require a music font.
