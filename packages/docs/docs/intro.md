---
slug: /
sidebar_position: 1
---

# Introduction

**react-notation** is an open-source React library for rendering music notation.

It provides a shared data model and a set of rendering components — from simple chord sheets
to full staff notation — that are responsive, print-friendly, and easily restyled.

## Features

- Declarative, data-first API (`MusicScore` → components)
- Multiple formats: chord sheets, chord charts, lead sheets, tablature, staff notation
- CSS custom property theming (`--notation-*` tokens)
- Print-ready layouts
- TypeScript-first

## Install

```bash
npm install react-notation
```

## Quick start

```tsx
import { ChordSheet, createScore, createTrack, createMeasure, createChord } from 'react-notation'

const score = createScore({
  title: 'My Song',
  timeSignature: { beats: 4, value: 4 },
  keySignature: { root: 'C', mode: 'major' },
  tracks: [
    createTrack({ clef: 'treble', measures: [
      createMeasure({ number: 1, events: [
        createChord({ beat: 1, duration: 'whole', symbol: 'C' }),
      ]}),
    ]}),
  ],
})

export default function App() {
  return <ChordSheet score={score} />
}
```

:::note
The library is under active development. See [milestones](https://github.com/your-org/react-notation)
for what's available today.
:::
