---
sidebar_position: 1
---

# Getting Started

## Installation

```bash
npm install react-notation
# or
pnpm add react-notation
```

react-notation requires React 18 or later as a peer dependency.

## Import the stylesheet

The library ships a single CSS file for all components. Import it once at your app root:

```ts
import 'react-notation/style.css'
```

## Your first chord sheet

```tsx
import {
  ChordSheet,
  createScore,
  createTrack,
  createMeasure,
  createChord,
  createLyric,
} from 'react-notation'
import 'react-notation/style.css'

const score = createScore({
  title: 'Autumn Leaves',
  tempo: 120,
  timeSignature: { beats: 4, value: 4 },
  keySignature: { root: 'G', mode: 'major' },
  tracks: [
    createTrack({
      measures: [
        createMeasure({
          number: 1,
          section: 'Verse',
          events: [
            createChord({ beat: 1, duration: 'half', symbol: 'Cm7', root: 'C', quality: 'min7' }),
            createChord({ beat: 3, duration: 'half', symbol: 'F7',  root: 'F', quality: 'dominant7' }),
            createLyric({ beat: 1, duration: 'half', text: 'The' }),
            createLyric({ beat: 3, duration: 'half', text: 'au-' }),
          ],
        }),
      ],
    }),
  ],
})

export function App() {
  return <ChordSheet score={score} />
}
```

## Transposing

```tsx
import { useTranspose } from 'react-notation'

function TransposedSheet({ score }) {
  const transposed = useTranspose(score, 2)  // up 2 semitones
  return <ChordSheet score={transposed} />
}
```

## Applying a theme

```tsx
import { ThemeProvider, defineTheme } from 'react-notation'

const theme = defineTheme({
  'color-chord': '#1a6cf5',
  'font-size-chord': '1.125rem',
})

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <ChordSheet score={score} />
    </ThemeProvider>
  )
}
```

## Components at a glance

| Component | Use when… |
|-----------|-----------|
| [`ChordSheet`](../components/chord-sheet) | You want chords above lyrics (songwriting format) |
| [`ChordChart`](../components/chord-chart) | You want a musician's chart with barlines and slash notation |
| [`ChordDiagram`](../components/chord-diagram) | You want a single fretboard fingering diagram |

## Next steps

- Read the [Data Model](../data-model) reference to understand `MusicScore`
- See [Theming](../theming) for the full CSS token reference
