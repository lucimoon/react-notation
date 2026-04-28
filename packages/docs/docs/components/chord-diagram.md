---
sidebar_position: 3
---

# ChordDiagram

Renders an SVG fretboard fingering diagram for guitar, ukulele, and other fretted instruments.

## Usage

```tsx
import { ChordDiagram, createChord } from 'react-notation'

const cMajor = createChord({
  beat: 1,
  duration: 'whole',
  symbol: 'C',
  root: 'C',
  // index 0 = lowest string (low E on guitar)
  // -1 = muted, 0 = open, N = fret number
  voicing: [-1, 3, 2, 0, 1, 0],
})

<ChordDiagram chord={cMajor} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `chord` | `Chord` | — | **Required.** Must have a `voicing` array. |
| `strings` | `number` | `6` | Number of strings (4 for ukulele, 6 for guitar, etc.). |
| `frets` | `number` | `4` | Number of frets to display. |
| `showLabel` | `boolean` | `true` | Show the chord symbol below the diagram. |
| `width` | `number` | `80` | SVG width in pixels. Height is derived automatically. |
| `className` | `string` | — | Additional CSS class on the SVG element. |
| `...rest` | `SVGAttributes<SVGSVGElement>` | — | All standard SVG props forwarded. |

`ChordDiagram` is a `forwardRef` component.

## Voicing format

`voicing` is an array of fret numbers, one per string:

| Value | Meaning |
|-------|---------|
| `-1` | Muted string (rendered as ×) |
| `0` | Open string (rendered as ○) |
| `1–N` | Fret number (rendered as filled dot) |

Index `0` is the **lowest-pitched string** (thickest, displayed on the left).

```ts
// Guitar C major: x32010
voicing: [-1, 3, 2, 0, 1, 0]

// Guitar Am: 002210
voicing: [0, 0, 2, 2, 1, 0]

// Ukulele C: 0003
voicing: [0, 0, 0, 3]
```

## High-neck chords

When the minimum pressed fret is above the default window (`frets`), the diagram omits the
nut and shows a fret position number instead:

```tsx
// Barre at 5th position — shows "5" indicator
<ChordDiagram chord={aAt5th} />
```

## Theming

ChordDiagram responds to these CSS custom properties:

| Token | Default | Controls |
|-------|---------|----------|
| `--notation-diagram-dot-color` | `currentColor` | Finger dot fill |
| `--notation-diagram-marker-color` | `currentColor` | Open/muted marker stroke |
| `--notation-diagram-grid-color` | `currentColor` | Fret and string lines |
| `--notation-diagram-nut-color` | `currentColor` | Nut bar fill |
| `--notation-diagram-text-color` | `currentColor` | Fret position number |
| `--notation-color-chord` | `inherit` | Chord label below diagram |
| `--notation-font-family` | `Georgia, serif` | Chord label font |
| `--notation-font-weight-chord` | `600` | Chord label weight |

## Known limitations

- Barre chords are not rendered with a curved barre indicator — dots are shown individually.
- Finger numbers inside dots are not yet supported.
