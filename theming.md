# Theming

All visual styling is driven by CSS custom properties. Wrap your app (or just the music
components) in `<ThemeProvider>` to apply a theme, or override individual tokens with plain CSS.

---

## ThemeProvider

```tsx
import { ThemeProvider } from "stave"

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
| `--stave-font-notation` | `"Bravura", serif` | SMuFL-compatible music font |
| `--stave-font-text` | `system-ui, sans-serif` | Lyrics, labels, chord symbols |
| `--stave-font-mono` | `"Courier New", monospace` | Tab fret numbers |
| `--stave-font-size-base` | `16px` | Base size; other sizes scale from this |
| `--stave-font-size-chord` | `0.9em` | Chord symbol size |
| `--stave-font-size-lyric` | `1em` | Lyric text size |
| `--stave-font-size-label` | `0.75em` | Section labels, rehearsal marks |

### Layout

| Token | Default | Description |
|---|---|---|
| `--stave-staff-line-gap` | `8px` | Space between staff lines |
| `--stave-measure-padding` | `12px` | Horizontal padding inside a measure |
| `--stave-system-gap` | `48px` | Vertical gap between systems (rows) |
| `--stave-chord-offset` | `-1.5em` | Vertical offset of chord symbols above text |

### Color

| Token | Default | Description |
|---|---|---|
| `--stave-color-ink` | `#1a1a1a` | Notes, barlines, stems |
| `--stave-color-staff` | `#555555` | Staff lines |
| `--stave-color-chord` | `#1a4fa3` | Chord symbol text |
| `--stave-color-lyric` | `#1a1a1a` | Lyric text |
| `--stave-color-label` | `#888888` | Section labels |
| `--stave-color-highlight` | `#f0c040` | Active note/measure during playback |
| `--stave-color-background` | `transparent` | Component background |

---

## Custom theme object

```ts
import { defineTheme } from "stave"

const darkTheme = defineTheme({
  "color-ink":        "#e8e8e8",
  "color-staff":      "#aaaaaa",
  "color-chord":      "#7eb8f7",
  "color-lyric":      "#e8e8e8",
  "color-background": "#1a1a1a",
})
```

`defineTheme` accepts any subset of token names (without the `--stave-` prefix) and merges
with the default theme.

---

## CSS override (no ThemeProvider)

```css
.my-chart {
  --stave-color-chord: #c0392b;
  --stave-font-size-chord: 1.1em;
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
    --stave-color-highlight: transparent;
    --stave-font-size-base: 14px;
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
