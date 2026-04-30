---
sidebar_position: 5
---

# Staff Primitives

Low-level SVG building blocks for staff notation. Use these when you need custom layouts
or want to embed staff elements inside your own SVG — for example, rendering a grand staff,
adding annotations, or building a custom view.

Most apps should use [`LeadSheet`](./lead-sheet) instead.

:::info Font required
All glyph-rendering primitives (`Clef`, `KeySignature`, `TimeSignature`, `NoteHead`) require
the Bravura font. Import once at your app root:
```tsx
import 'react-notation/music-font.css'
```
:::

## Coordinate system

All primitives share a common pixel coordinate system:

- **`staffSpace`** (`sp`) — the distance between adjacent staff lines in pixels. All vertical
  measurements derive from this: the staff spans `4 × sp`, stems are `3.5 × sp` long, etc.
- **`staffTop`** — the y-coordinate of the top (fifth) staff line, measured from the SVG origin.
- **`staffBottom`** — `staffTop + 4 × sp`, the y-coordinate of the bottom (first) staff line.
- **`staffPos`** — integer staff position: `0` = bottom line (E4 in treble), each step up = `+1`.
  Lines are at even positions (0, 2, 4, 6, 8); spaces at odd positions (1, 3, 5, 7).

```
staffTop  ─────────── line 5 (F5)  pos 8
          ─────────── line 4 (D5)  pos 6
          ─────────── line 3 (B4)  pos 4  ← middle line
          ─────────── line 2 (G4)  pos 2
staffBot  ─────────── line 1 (E4)  pos 0
                      ledger (C4)  pos -2
```

## Staff utilities

The following helpers are exported from `react-notation` for computing positions:

```ts
import {
  trebleStaffPosition,  // Pitch → staff position (treble clef)
  bassStaffPosition,    // Pitch → staff position (bass clef)
  staffPositionToY,     // (staffPos, staffSpace) → y from staffTop
  stemDirection,        // staffPos → 'up' | 'down'
  ledgerLinePositions,  // staffPos → number[] of ledger line staff positions
  beamGroups,           // (Note[], TimeSignature) → Note[][] of beam groups
  trebleKeyAccidentals, // KeySignature → KeyAccidental[]
} from 'react-notation'
```

```ts
// Example: find where to draw a note
const pos = trebleStaffPosition({ step: 'A', octave: 4 })  // → 3
const y = staffPositionToY(pos, staffSpace) + staffTop      // → pixel y
const dir = stemDirection(pos)                              // → 'up'
```

---

## Staff

The root SVG element for a staff row. Renders the five horizontal staff lines and accepts
other primitives as SVG `children`.

```tsx
import { Staff } from 'react-notation'

<Staff width={600} height={80} staffTop={20} staffSpace={10}>
  {/* Clef, notes, barlines, etc. go here */}
</Staff>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `width` | `number` | SVG width in pixels |
| `height` | `number` | SVG height in pixels |
| `staffTop` | `number` | Y of the topmost staff line |
| `staffSpace` | `number` | Distance between adjacent lines (px) |
| `...rest` | `SVGAttributes<SVGSVGElement>` | Forwarded to `<svg>` |

---

## Clef

Renders a treble or bass clef glyph using Bravura.

```tsx
import { Clef } from 'react-notation'

// Inside a <Staff>:
<Clef x={4} staffBottom={staffBottom} staffSpace={staffSpace} />
<Clef type="bass" x={4} staffBottom={staffBottom} staffSpace={staffSpace} />
```

The treble clef is positioned so its curl wraps around the G line (second line).
The bass clef is positioned so its dots straddle the F line (fourth line).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'treble' \| 'bass'` | `'treble'` | Clef type |
| `x` | `number` | — | Left edge x position |
| `staffBottom` | `number` | — | Y of the bottom staff line |
| `staffSpace` | `number` | — | Staff space in pixels |
| `...rest` | `SVGAttributes<SVGGElement>` | — | Forwarded to wrapping `<g>` |

---

## KeySignature

Renders the accidental symbols for a key signature in treble clef.
Returns `null` for C major / A minor (no accidentals).

```tsx
import { KeySignature, keySignatureWidth } from 'react-notation'

// Inside a <Staff>:
<KeySignature
  keySignature={{ root: 'G', mode: 'major' }}  // 1 sharp
  x={clefWidth}
  staffBottom={staffBottom}
  staffSpace={staffSpace}
/>
```

`keySignatureWidth(keySignature, staffSpace)` returns the pixel width occupied by the
key signature — useful for computing the horizontal offset of the following time signature
or first note.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `keySignature` | `KeySignature` | The key to render |
| `x` | `number` | Left edge x of the first accidental |
| `staffBottom` | `number` | Y of the bottom staff line |
| `staffSpace` | `number` | Staff space in pixels |
| `...rest` | `SVGAttributes<SVGGElement>` | Forwarded to wrapping `<g>` |

---

## TimeSignature

Renders a time signature as two stacked SMuFL digit glyphs.

```tsx
import { TimeSignature } from 'react-notation'

// Inside a <Staff> — centred on x:
<TimeSignature
  timeSignature={{ beats: 4, value: 4 }}
  x={timeSigCentreX}
  staffTop={staffTop}
  staffSpace={staffSpace}
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `timeSignature` | `TimeSignature` | Beats and note value |
| `x` | `number` | Centre x of the glyph |
| `staffTop` | `number` | Y of the top staff line |
| `staffSpace` | `number` | Staff space in pixels |
| `...rest` | `SVGAttributes<SVGGElement>` | Forwarded to wrapping `<g>` |

---

## NoteHead

Renders a notehead glyph at a staff position, with optional ledger lines and accidental.
Does **not** render the stem — use `Stem` separately.

```tsx
import { NoteHead, trebleStaffPosition, staffPositionToY } from 'react-notation'

const staffPos = trebleStaffPosition({ step: 'A', octave: 4 })
const y = staffPositionToY(staffPos, staffSpace) + staffTop

// Inside a <Staff>:
<NoteHead
  duration="quarter"
  staffPos={staffPos}
  x={noteX}
  y={y}
  staffSpace={staffSpace}
  accidental={1}   // sharp
/>
```

Noteheads for `'whole'` and `'half'` durations are open; `'quarter'` and shorter are filled.
Ledger lines are drawn automatically based on `staffPos`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `duration` | `Duration` | — | Determines notehead shape (whole / half / black) |
| `staffPos` | `number` | — | Staff position — used to place ledger lines |
| `x` | `number` | — | Centre x of the notehead |
| `y` | `number` | — | Centre y of the notehead (from `staffPositionToY`) |
| `staffSpace` | `number` | — | Staff space in pixels |
| `accidental` | `-1 \| 0 \| 1` | — | `1` = sharp, `-1` = flat, `0` = natural. Omit for none. |
| `tied` | `boolean` | — | When `true`, suppresses the accidental (note is tied from previous) |
| `ledgerLineWidth` | `number` | `2.8 × sp` | Width of ledger lines drawn through the notehead |
| `...rest` | `SVGAttributes<SVGGElement>` | — | Forwarded to wrapping `<g>` |

---

## Stem

A vertical stem line attached to a notehead.

```tsx
import { Stem, stemDirection } from 'react-notation'

const dir = stemDirection(staffPos)   // 'up' or 'down'
const stemX = dir === 'up' ? noteX + sp * 0.5 : noteX - sp * 0.5
const stemEndY = dir === 'up' ? noteY - sp * 3.5 : noteY + sp * 3.5

<Stem x={stemX} y1={noteY} y2={stemEndY} staffSpace={staffSpace} />
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `x` | `number` | X position of the stem |
| `y1` | `number` | Y at the notehead end |
| `y2` | `number` | Y at the free end |
| `staffSpace` | `number` | Staff space in pixels (controls stroke width) |
| `...rest` | `SVGAttributes<SVGLineElement>` | Forwarded to `<line>` |

---

## Beam

A filled parallelogram connecting two stems. Stack multiple `Beam` elements vertically
for sixteenth-note double beams.

```tsx
import { Beam } from 'react-notation'

<Beam
  x1={stemXOfFirstNote}
  x2={stemXOfLastNote}
  y1={stemEndYOfFirstNote}
  y2={stemEndYOfLastNote}
  staffSpace={staffSpace}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `x1` | `number` | — | X of left stem |
| `x2` | `number` | — | X of right stem |
| `y1` | `number` | — | Y at left end |
| `y2` | `number` | — | Y at right end |
| `thickness` | `number` | `0.5 × sp` | Beam bar height |
| `staffSpace` | `number` | — | Staff space in pixels |
| `...rest` | `SVGAttributes<SVGPolygonElement>` | — | Forwarded to `<polygon>` |

---

## Tie

A curved arc between two noteheads of the same pitch.

```tsx
import { Tie } from 'react-notation'

<Tie
  x1={firstNoteX}
  x2={secondNoteX}
  y={noteY}
  direction="down"   // arc below notes (stem-up context)
  staffSpace={staffSpace}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `x1` | `number` | — | X centre of first notehead |
| `x2` | `number` | — | X centre of second notehead |
| `y` | `number` | — | Y of both noteheads |
| `direction` | `'up' \| 'down'` | `'up'` | Which way the arc bows |
| `staffSpace` | `number` | — | Staff space in pixels |
| `...rest` | `SVGAttributes<SVGPathElement>` | — | Forwarded to `<path>` |

---

## Dot

An augmentation dot — a small filled circle placed to the right of a notehead or rest.

```tsx
import { Dot } from 'react-notation'

// Dot floats into the space above the notehead if note is on a line
<Dot
  cx={noteX + sp * 0.9}
  cy={noteY - (onLine ? sp * 0.5 : 0)}
  staffSpace={staffSpace}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cx` | `number` | — | Centre x |
| `cy` | `number` | — | Centre y |
| `r` | `number` | `0.18 × sp` | Dot radius |
| `staffSpace` | `number` | — | Staff space (used for default radius) |
| `...rest` | `SVGAttributes<SVGCircleElement>` | — | Forwarded to `<circle>` |

---

## Barline

Renders a barline in one of five styles.

```tsx
import { Barline } from 'react-notation'

<Barline
  type="final"
  x={measureRightEdge}
  staffTop={staffTop}
  staffBottom={staffBottom}
  staffSpace={staffSpace}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'single' \| 'double' \| 'final' \| 'repeat-start' \| 'repeat-end'` | `'single'` | Barline style |
| `x` | `number` | — | X position of the barline |
| `staffTop` | `number` | — | Y of the top staff line |
| `staffBottom` | `number` | — | Y of the bottom staff line |
| `staffSpace` | `number` | — | Staff space in pixels |
| `...rest` | `SVGAttributes<SVGGElement>` | — | Forwarded to wrapping `<g>` |

---

## Composing primitives

Here's a minimal example of a single measure using the primitives directly:

```tsx
import {
  Staff, Clef, TimeSignature, NoteHead, Stem,
  trebleStaffPosition, staffPositionToY, stemDirection,
} from 'react-notation'
import 'react-notation/music-font.css'

function SingleNote() {
  const sp = 10
  const staffTop = 20
  const staffBottom = staffTop + 4 * sp

  const pitch = { step: 'A' as const, octave: 4 }
  const staffPos = trebleStaffPosition(pitch)          // 3
  const noteY = staffPositionToY(staffPos, sp) + staffTop
  const dir = stemDirection(staffPos)                   // 'up'
  const stemX = noteX + (dir === 'up' ? sp * 0.5 : -sp * 0.5)
  const noteX = 80

  return (
    <Staff width={200} height={80} staffTop={staffTop} staffSpace={sp}>
      <Clef x={4} staffBottom={staffBottom} staffSpace={sp} />
      <TimeSignature
        timeSignature={{ beats: 4, value: 4 }}
        x={30}
        staffTop={staffTop}
        staffSpace={sp}
      />
      <NoteHead
        duration="quarter"
        staffPos={staffPos}
        x={noteX}
        y={noteY}
        staffSpace={sp}
      />
      <Stem
        x={stemX}
        y1={noteY}
        y2={noteY - sp * 3.5}
        staffSpace={sp}
      />
    </Staff>
  )
}
```
