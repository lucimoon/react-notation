import type { Meta, StoryObj } from '@storybook/react'
import { LeadSheet } from './LeadSheet'
import { createScore, createTrack, createMeasure, createNote, createChord, createLyric, createRest } from '../../builders'
import { useScore } from '../../hooks'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const twinkleMelody = createScore({
  title: 'Twinkle Twinkle Little Star',
  composer: 'Traditional',
  timeSignature: { beats: 4, value: 4 },
  keySignature: { root: 'C', mode: 'major' },
  tracks: [
    createTrack({
      clef: 'treble',
      measures: [
        createMeasure({
          number: 1,
          events: [
            createNote({ pitch: { step: 'C', octave: 5 }, duration: 'quarter', beat: 1 }),
            createNote({ pitch: { step: 'C', octave: 5 }, duration: 'quarter', beat: 2 }),
            createNote({ pitch: { step: 'G', octave: 5 }, duration: 'quarter', beat: 3 }),
            createNote({ pitch: { step: 'G', octave: 5 }, duration: 'quarter', beat: 4 }),
            createChord({ symbol: 'C', root: 'C', quality: 'major', beat: 1, duration: 'whole' }),
            createLyric({ text: 'Twin', syllable: 'single', beat: 1, duration: 'quarter' }),
            createLyric({ text: 'kle', syllable: 'single', beat: 2, duration: 'quarter' }),
            createLyric({ text: 'twin', syllable: 'single', beat: 3, duration: 'quarter' }),
            createLyric({ text: 'kle', syllable: 'single', beat: 4, duration: 'quarter' }),
          ],
        }),
        createMeasure({
          number: 2,
          events: [
            createNote({ pitch: { step: 'A', octave: 5 }, duration: 'quarter', beat: 1 }),
            createNote({ pitch: { step: 'A', octave: 5 }, duration: 'quarter', beat: 2 }),
            createNote({ pitch: { step: 'G', octave: 5 }, duration: 'half', beat: 3 }),
            createChord({ symbol: 'F', root: 'F', quality: 'major', beat: 1, duration: 'half' }),
            createChord({ symbol: 'G', root: 'G', quality: 'major', beat: 3, duration: 'half' }),
            createLyric({ text: 'lit', syllable: 'single', beat: 1, duration: 'quarter' }),
            createLyric({ text: 'tle', syllable: 'single', beat: 2, duration: 'quarter' }),
            createLyric({ text: 'star', syllable: 'single', beat: 3, duration: 'half' }),
          ],
        }),
        createMeasure({
          number: 3,
          events: [
            createNote({ pitch: { step: 'F', octave: 5 }, duration: 'quarter', beat: 1 }),
            createNote({ pitch: { step: 'F', octave: 5 }, duration: 'quarter', beat: 2 }),
            createNote({ pitch: { step: 'E', octave: 5 }, duration: 'quarter', beat: 3 }),
            createNote({ pitch: { step: 'E', octave: 5 }, duration: 'quarter', beat: 4 }),
            createChord({ symbol: 'C', root: 'C', quality: 'major', beat: 1, duration: 'whole' }),
            createLyric({ text: 'How', syllable: 'single', beat: 1, duration: 'quarter' }),
            createLyric({ text: 'I', syllable: 'single', beat: 2, duration: 'quarter' }),
            createLyric({ text: 'won', syllable: 'single', beat: 3, duration: 'quarter' }),
            createLyric({ text: 'der', syllable: 'single', beat: 4, duration: 'quarter' }),
          ],
        }),
        createMeasure({
          number: 4,
          barline: 'final',
          events: [
            createNote({ pitch: { step: 'D', octave: 5 }, duration: 'quarter', beat: 1 }),
            createNote({ pitch: { step: 'D', octave: 5 }, duration: 'quarter', beat: 2 }),
            createNote({ pitch: { step: 'C', octave: 5 }, duration: 'half', beat: 3 }),
            createChord({ symbol: 'G', root: 'G', quality: 'major', beat: 1, duration: 'half' }),
            createChord({ symbol: 'C', root: 'C', quality: 'major', beat: 3, duration: 'half' }),
            createLyric({ text: 'what', syllable: 'single', beat: 1, duration: 'quarter' }),
            createLyric({ text: 'you', syllable: 'single', beat: 2, duration: 'quarter' }),
            createLyric({ text: 'are', syllable: 'single', beat: 3, duration: 'half' }),
          ],
        }),
      ],
    }),
  ],
})

const gMajorMelody = createScore({
  title: 'G Major Melody',
  timeSignature: { beats: 4, value: 4 },
  keySignature: { root: 'G', mode: 'major' },
  tracks: [
    createTrack({
      clef: 'treble',
      measures: [
        createMeasure({
          number: 1,
          section: 'Verse',
          events: [
            createNote({ pitch: { step: 'G', octave: 4 }, duration: 'quarter', beat: 1 }),
            createNote({ pitch: { step: 'A', octave: 4 }, duration: 'quarter', beat: 2 }),
            createNote({ pitch: { step: 'B', octave: 4 }, duration: 'quarter', beat: 3 }),
            createNote({ pitch: { step: 'D', octave: 5 }, duration: 'quarter', beat: 4 }),
            createChord({ symbol: 'G', root: 'G', quality: 'major', beat: 1, duration: 'whole' }),
          ],
        }),
        createMeasure({
          number: 2,
          events: [
            createNote({ pitch: { step: 'E', octave: 5 }, duration: 'half', beat: 1 }),
            createNote({ pitch: { step: 'D', octave: 5 }, duration: 'half', beat: 3 }),
            createChord({ symbol: 'Em', root: 'E', quality: 'minor', beat: 1, duration: 'half' }),
            createChord({ symbol: 'D', root: 'D', quality: 'major', beat: 3, duration: 'half' }),
          ],
        }),
        createMeasure({
          number: 3,
          events: [
            createNote({ pitch: { step: 'C', octave: 5 }, duration: 'quarter', beat: 1 }),
            createNote({ pitch: { step: 'B', octave: 4 }, duration: 'quarter', beat: 2 }),
            createNote({ pitch: { step: 'A', octave: 4 }, duration: 'quarter', beat: 3 }),
            createNote({ pitch: { step: 'G', octave: 4 }, duration: 'quarter', beat: 4 }),
            createChord({ symbol: 'C', root: 'C', quality: 'major', beat: 1, duration: 'half' }),
            createChord({ symbol: 'G', root: 'G', quality: 'major', beat: 3, duration: 'half' }),
          ],
        }),
        createMeasure({
          number: 4,
          barline: 'final',
          events: [
            createNote({ pitch: { step: 'G', octave: 4 }, duration: 'whole', beat: 1 }),
            createChord({ symbol: 'G', root: 'G', quality: 'major', beat: 1, duration: 'whole' }),
          ],
        }),
      ],
    }),
  ],
})

const beamedMelody = createScore({
  title: 'Beamed Eighth Notes',
  timeSignature: { beats: 4, value: 4 },
  keySignature: { root: 'C', mode: 'major' },
  tracks: [
    createTrack({
      clef: 'treble',
      measures: [
        createMeasure({
          number: 1,
          events: [
            createNote({ pitch: { step: 'C', octave: 5 }, duration: 'eighth', beat: 1 }),
            createNote({ pitch: { step: 'D', octave: 5 }, duration: 'eighth', beat: 1.5 }),
            createNote({ pitch: { step: 'E', octave: 5 }, duration: 'eighth', beat: 2 }),
            createNote({ pitch: { step: 'F', octave: 5 }, duration: 'eighth', beat: 2.5 }),
            createNote({ pitch: { step: 'G', octave: 5 }, duration: 'eighth', beat: 3 }),
            createNote({ pitch: { step: 'F', octave: 5 }, duration: 'eighth', beat: 3.5 }),
            createNote({ pitch: { step: 'E', octave: 5 }, duration: 'eighth', beat: 4 }),
            createNote({ pitch: { step: 'D', octave: 5 }, duration: 'eighth', beat: 4.5 }),
          ],
        }),
        createMeasure({
          number: 2,
          barline: 'final',
          events: [
            createNote({ pitch: { step: 'C', octave: 5 }, duration: 'whole', beat: 1 }),
          ],
        }),
      ],
    }),
  ],
})

const ledgerLineMelody = createScore({
  title: 'Ledger Lines',
  timeSignature: { beats: 4, value: 4 },
  keySignature: { root: 'C', mode: 'major' },
  tracks: [
    createTrack({
      clef: 'treble',
      measures: [
        createMeasure({
          number: 1,
          events: [
            createNote({ pitch: { step: 'C', octave: 4 }, duration: 'quarter', beat: 1 }),
            createNote({ pitch: { step: 'B', octave: 3 }, duration: 'quarter', beat: 2 }),
            createNote({ pitch: { step: 'C', octave: 6 }, duration: 'quarter', beat: 3 }),
            createNote({ pitch: { step: 'D', octave: 6 }, duration: 'quarter', beat: 4 }),
          ],
        }),
        createMeasure({
          number: 2,
          barline: 'final',
          events: [createRest({ duration: 'whole', full: true, beat: 1 })],
        }),
      ],
    }),
  ],
})

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof LeadSheet> = {
  title: 'Components/LeadSheet',
  component: LeadSheet,
  parameters: { layout: 'padded' },
  argTypes: {
    staffSpace: { control: { type: 'range', min: 6, max: 18, step: 1 } },
    measuresPerLine: { control: { type: 'number', min: 1, max: 8 } },
    showChords: { control: 'boolean' },
    showLyrics: { control: 'boolean' },
    showTitle: { control: 'boolean' },
    showMeasureNumbers: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof LeadSheet>

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { score: twinkleMelody, measuresPerLine: 4, staffSpace: 10 },
}

export const GMajorScale: Story = {
  args: { score: gMajorMelody, measuresPerLine: 4, staffSpace: 10 },
}

export const BeamedEighths: Story = {
  args: { score: beamedMelody, measuresPerLine: 2, staffSpace: 12 },
}

export const LedgerLines: Story = {
  args: { score: ledgerLineMelody, measuresPerLine: 2, staffSpace: 12 },
}

export const NoChords: Story = {
  args: { score: twinkleMelody, measuresPerLine: 4, showChords: false },
}

export const NoLyrics: Story = {
  args: { score: twinkleMelody, measuresPerLine: 4, showLyrics: false },
}

export const LargeStaff: Story = {
  args: { score: twinkleMelody, measuresPerLine: 2, staffSpace: 16 },
}

// Interactive story — editor mode
function InteractiveStory() {
  const editor = useScore(twinkleMelody)
  return (
    <div>
      <LeadSheet score={editor.score} editor={editor} measuresPerLine={4} staffSpace={10} />
      {editor.selection && (
        <pre style={{ fontSize: 11, marginTop: 12 }}>
          {JSON.stringify(editor.selection, null, 2)}
        </pre>
      )}
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveStory />,
}
