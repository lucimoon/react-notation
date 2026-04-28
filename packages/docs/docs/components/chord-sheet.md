---
sidebar_position: 1
---

# ChordSheet

Renders chord symbols above lyrics, grouped into measures and wrapped into visual lines.

## Usage

```tsx
import { ChordSheet, createScore, createTrack, createMeasure, createChord, createLyric } from 'react-notation'
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
            createChord({ beat: 1, duration: 'half',  symbol: 'Cm7', root: 'C', quality: 'min7' }),
            createChord({ beat: 3, duration: 'half',  symbol: 'F7',  root: 'F', quality: 'dominant7' }),
            createLyric({ beat: 1, duration: 'half',  text: 'The' }),
            createLyric({ beat: 3, duration: 'half',  text: 'au-' }),
          ],
        }),
      ],
    }),
  ],
})

<ChordSheet score={score} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `score` | `MusicScore` | — | **Required.** Score to render. Only the first track is used. |
| `measuresPerLine` | `number` | `4` | Maximum measures per visual line before wrapping. |
| `breakAtSections` | `boolean` | `true` | Start a new line when a measure has a `section` label. |
| `showMeasureNumbers` | `boolean` | `false` | Show bar numbers above each measure. |
| `className` | `string` | — | Additional CSS class applied to the root element. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All standard div props are forwarded. |

`ChordSheet` is a `forwardRef` component — you can pass a `ref` to access the root `<div>`.

## Section breaks

When a `Measure` has a `section` field and `breakAtSections` is `true`, the section name is
rendered as a label and the measure starts a new line, regardless of how many measures are
already on the current line.

```tsx
createMeasure({ number: 5, section: 'Chorus', events: [...] })
```

## Line wrapping

`measuresPerLine` sets the maximum number of measures per row. Actual lines may be shorter
due to section breaks. Set `breakAtSections={false}` to disable section-based breaks and
rely solely on `measuresPerLine`.

## Theming

`ChordSheet` reads the following `--notation-*` CSS tokens:

| Token | Default | Controls |
|-------|---------|----------|
| `--notation-font-family` | `Georgia, serif` | All text |
| `--notation-font-size-chord` | `1rem` | Chord symbols |
| `--notation-font-weight-chord` | `600` | Chord symbols |
| `--notation-font-size-lyric` | `0.9375rem` | Lyric text |
| `--notation-color-chord` | `inherit` | Chord symbol color |
| `--notation-color-lyric` | `inherit` | Lyric text color |
| `--notation-color-section-label` | `inherit` | Section label color |
| `--notation-color-measure-border` | `currentColor` | Bar line color |
| `--notation-measure-gap` | `1rem` | Gap between measures |
| `--notation-beat-gap` | `0.5rem` | Gap between beat columns |
| `--notation-line-gap` | `1.5rem` | Gap between lines |
| `--notation-section-gap` | `2rem` | Extra gap above section labels |

Override via `ThemeProvider` or plain CSS.

## Known limitations

- Only the **first track** of a `MusicScore` is rendered.
- Beat columns are spaced equally — no proportional beat placement.
- Multi-verse lyrics are not differentiated visually (only verse 1 text is shown per beat).
