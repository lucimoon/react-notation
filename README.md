# react-notation

React components for rendering music notation — chord sheets, lead sheets, chord charts, and more.

**[Documentation → lucimoon.github.io/react-notation](https://lucimoon.github.io/react-notation)**

---

## What it is

react-notation gives you a set of composable React components for displaying music — the kind of notation working musicians actually use. Chord symbols above lyrics, session-player charts with slash notation and rehearsal marks, and an editing API for building interactive score editors.

Components render via plain HTML and CSS with no canvas, no SVG, and no heavy music engraving engine. Everything is themeable through CSS custom properties.

## Installation

```sh

```

```sh
pnpm add react-notation
```

## Quick start

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
            createChord({
              beat: 3,
              duration: 'half',
              symbol: 'F7',
              root: 'F',
              quality: 'dominant7',
            }),
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

## Components

| Component    | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `ChordSheet` | Chord symbols above lyrics, wrapped into lines               |
| `ChordChart` | Session-player chart with slash notation and rehearsal marks |

More components (lead sheet, tablature, staff notation, player bar) are on the roadmap.

## Local development

```sh
pnpm install
pnpm dev          # build core in watch mode + start Storybook
pnpm test         # run all tests
pnpm lint         # lint all packages
```

Storybook runs at `localhost:6006` and has interactive stories for every component.

## License

MIT
