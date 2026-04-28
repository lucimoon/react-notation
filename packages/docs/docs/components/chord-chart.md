---
sidebar_position: 2
---

# ChordChart

Renders a professional musician's chart: measures with chord symbols, slash notation, section labels, rehearsal marks, and bar lines. The format you'd hand to a session player.

## Usage

```tsx
import { ChordChart, createScore, createTrack, createMeasure, createChord } from 'react-notation'
import 'react-notation/style.css'

const score = createScore({
  timeSignature: { beats: 4, value: 4 },
  keySignature: { root: 'G', mode: 'major' },
  tracks: [
    createTrack({
      measures: [
        createMeasure({
          number: 1,
          section: 'A',
          rehearsalMark: 'A',
          events: [
            createChord({ beat: 1, duration: 'half',  symbol: 'Cm7', root: 'C', quality: 'min7' }),
            createChord({ beat: 3, duration: 'half',  symbol: 'F7',  root: 'F', quality: 'dominant7' }),
          ],
        }),
        createMeasure({
          number: 2,
          events: [createChord({ beat: 1, duration: 'whole', symbol: 'Bbmaj7', root: 'Bb', quality: 'maj7' })],
          barline: 'final',
        }),
      ],
    }),
  ],
})

<ChordChart score={score} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `score` | `MusicScore` | — | **Required.** Only the first track is rendered. |
| `measuresPerLine` | `number` | `4` | Maximum measures per visual line. |
| `breakAtSections` | `boolean` | `true` | Start a new line when a measure has a `section` label. |
| `showSlashes` | `boolean` | `true` | Render slash notation (/ / / /) below chord symbols. |
| `showMeasureNumbers` | `boolean` | `false` | Show bar numbers inside each measure. |
| `className` | `string` | — | Additional CSS class on the root element. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All standard div props forwarded. |

`ChordChart` is a `forwardRef` component.

## Rehearsal marks

Set `rehearsalMark` on a `Measure` to render a boxed label (e.g. `[A]`, `[Bridge]`) inside that bar:

```ts
createMeasure({ number: 1, rehearsalMark: 'A', events: [...] })
```

## Barlines

Set `barline` on a `Measure` to render special barlines at the end of that bar:

| Value | Renders |
|-------|---------|
| `'single'` | Default single bar line |
| `'double'` | Double bar line (thicker right edge on the line) |
| `'final'` | Final double bar (thick + thin) |
| `'repeat-end'` | Repeat end marker |
| `'repeat-start'` | Repeat start marker |

## Slash notation

When `showSlashes` is `true`, one `/` is rendered per beat below the chord row. The number of
slashes is derived from `score.timeSignature.beats`.

## Theming

ChordChart uses the same `--notation-*` tokens as ChordSheet, plus:

| Token | Default | Controls |
|-------|---------|----------|
| `--notation-color-measure-border` | `currentColor` | Bar line and measure box border |
| `--notation-font-size-chord` | `1rem` | Chord symbols |
| `--notation-font-weight-chord` | `600` | Chord symbol weight |
| `--notation-font-size-label` | `0.75rem` | Measure numbers and rehearsal marks |
| `--notation-color-lyric` | `inherit` | Slash notation color |

## Known limitations

- Only the first track is rendered.
- Slash count is uniform across a measure — beat-accurate slash positioning is not yet supported.
- Repeat barlines are rendered via CSS pseudo-elements; complex repeat structures (D.S., D.C.) are not yet supported.
