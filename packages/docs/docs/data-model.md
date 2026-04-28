---
sidebar_position: 2
---

# Data Model

The library is data-first. Every rendering component accepts a `MusicScore` object as its
primary prop. The schema is a plain TypeScript object tree — no classes, no magic.

## Type hierarchy

```
MusicScore
  └── Track[]
        └── Measure[]
              └── Event[] (Note | Chord | Lyric | Rest)
```

## MusicScore

The root object.

```ts
interface MusicScore {
  id: string
  title?: string
  composer?: string
  tempo?: number          // BPM, default 120
  timeSignature: TimeSignature
  keySignature: KeySignature
  tracks: Track[]
  metadata?: Record<string, unknown>
}
```

## Track

One instrument or voice. A lead sheet has one track; a grand staff piano score has two.

```ts
interface Track {
  id: string
  name?: string           // e.g. "Guitar", "Vocals"
  instrument?: string     // e.g. "acoustic-guitar"
  clef: Clef              // "treble" | "bass" | "alto" | "tenor" | "tab"
  strings?: number        // tab only, default 6
  measures: Measure[]
}
```

## Measure

One bar of music.

```ts
interface Measure {
  id: string
  number: number
  timeSignature?: TimeSignature   // override score default
  keySignature?: KeySignature     // override score default
  rehearsalMark?: string          // e.g. "A", "Chorus"
  section?: string                // e.g. "Verse", "Bridge"
  events: Event[]
  barline?: Barline
}
```

## Events

All events share a base shape.

```ts
interface BaseEvent {
  id: string
  beat: number            // position in measure (1-based, supports fractions e.g. 1.5)
  duration: Duration
}
```

### Note

```ts
interface Note extends BaseEvent {
  type: "note"
  pitch: Pitch            // { step: "C"|"D"|...|"B", octave: number, alter?: -1|0|1 }
  tied?: boolean
  articulation?: Articulation   // "staccato" | "accent" | "tenuto" | "fermata"
  dynamic?: Dynamic             // "pp" | "p" | "mp" | "mf" | "f" | "ff"
  // Tab-specific
  string?: number
  fret?: number
  technique?: Technique   // "bend" | "slide-up" | "slide-down" | "hammer-on" | "pull-off" | "vibrato"
}
```

### Chord

```ts
interface Chord extends BaseEvent {
  type: "chord"
  symbol: string          // e.g. "Cmaj7", "F#m", "Bb7"
  root: string            // e.g. "C", "F#", "Bb"
  quality: ChordQuality
  bass?: string           // slash chord bass note, e.g. "E" in "C/E"
  voicing?: number[]      // fret positions per string for diagram rendering
}
```

### Lyric

```ts
interface Lyric extends BaseEvent {
  type: "lyric"
  text: string
  syllable?: "begin" | "middle" | "end" | "single"
  verse?: number
}
```

### Rest

```ts
interface Rest extends BaseEvent {
  type: "rest"
  full?: boolean          // whole-measure rest
}
```

## Supporting types

```ts
type Duration =
  | "whole" | "half" | "quarter" | "eighth" | "sixteenth"
  | "whole-dotted" | "half-dotted" | "quarter-dotted" | "eighth-dotted"
  | "half-triplet" | "quarter-triplet" | "eighth-triplet"

type TimeSignature = { beats: number; value: number }

type KeySignature = { root: string; mode: "major" | "minor" }

type Clef = "treble" | "bass" | "alto" | "tenor" | "tab"
type Barline = "single" | "double" | "final" | "repeat-start" | "repeat-end"
```

## Builder helpers

Rather than constructing raw objects, use the builder helpers. Each auto-generates a UUID `id`.

```ts
import {
  createScore,
  createTrack,
  createMeasure,
  createNote,
  createChord,
  createLyric,
  createRest,
} from 'react-notation'

const score = createScore({
  title: 'Autumn Leaves',
  tempo: 120,
  timeSignature: { beats: 4, value: 4 },
  keySignature: { root: 'G', mode: 'major' },
  tracks: [
    createTrack({ name: 'Melody', clef: 'treble', measures: [
      createMeasure({ number: 1, section: 'Verse', events: [
        createChord({ beat: 1, duration: 'half', symbol: 'Cm7',    root: 'C', quality: 'min7' }),
        createChord({ beat: 3, duration: 'half', symbol: 'F7',     root: 'F', quality: 'dominant7' }),
      ]}),
      createMeasure({ number: 2, events: [
        createChord({ beat: 1, duration: 'whole', symbol: 'Bbmaj7', root: 'Bb', quality: 'maj7' }),
      ]}),
    ]}),
  ],
})
```

## Import utilities (Milestone 3+)

```ts
import { fromMusicXML } from 'react-notation/import'

const score = await fromMusicXML(xmlString)
```
