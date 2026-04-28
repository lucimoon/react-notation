import type { Meta, StoryObj } from '@storybook/react'
import { ChordSheet } from './ChordSheet'
import { createScore, createTrack, createMeasure, createChord, createLyric } from '../../builders'

const meta: Meta<typeof ChordSheet> = {
  title: 'Components/ChordSheet',
  component: ChordSheet,
  parameters: { layout: 'padded' },
  argTypes: {
    measuresPerLine: { control: { type: 'number', min: 1, max: 8 } },
    breakAtSections: { control: 'boolean' },
    showMeasureNumbers: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof ChordSheet>

// ─── Autumn Leaves (first 8 bars) ────────────────────────────────────────────

const autumnLeavesScore = createScore({
  title: 'Autumn Leaves',
  tempo: 120,
  keySignature: { root: 'G', mode: 'major' },
  timeSignature: { beats: 4, value: 4 },
  tracks: [
    createTrack({
      name: 'Chords + Melody',
      measures: [
        createMeasure({
          number: 1,
          section: 'Verse',
          events: [
            createChord({ beat: 1, duration: 'half', symbol: 'Cm7',   root: 'C', quality: 'min7' }),
            createChord({ beat: 3, duration: 'half', symbol: 'F7',    root: 'F', quality: 'dominant7' }),
          ],
        }),
        createMeasure({
          number: 2,
          events: [
            createChord({ beat: 1, duration: 'whole', symbol: 'Bbmaj7', root: 'Bb', quality: 'maj7' }),
          ],
        }),
        createMeasure({
          number: 3,
          events: [
            createChord({ beat: 1, duration: 'half', symbol: 'Ebmaj7', root: 'Eb', quality: 'maj7' }),
            createChord({ beat: 3, duration: 'half', symbol: 'Am7b5',  root: 'A',  quality: 'min7' }),
          ],
        }),
        createMeasure({
          number: 4,
          events: [
            createChord({ beat: 1, duration: 'half', symbol: 'D7',  root: 'D', quality: 'dominant7' }),
            createChord({ beat: 3, duration: 'half', symbol: 'Gm7', root: 'G', quality: 'min7' }),
          ],
        }),
        createMeasure({
          number: 5,
          section: 'Bridge',
          events: [
            createChord({ beat: 1, duration: 'half', symbol: 'Am7b5', root: 'A', quality: 'min7' }),
            createChord({ beat: 3, duration: 'half', symbol: 'D7',    root: 'D', quality: 'dominant7' }),
          ],
        }),
        createMeasure({
          number: 6,
          events: [
            createChord({ beat: 1, duration: 'whole', symbol: 'Gm7', root: 'G', quality: 'min7' }),
          ],
        }),
        createMeasure({
          number: 7,
          events: [
            createChord({ beat: 1, duration: 'half', symbol: 'Cm7', root: 'C', quality: 'min7' }),
            createChord({ beat: 3, duration: 'half', symbol: 'F7',  root: 'F', quality: 'dominant7' }),
          ],
        }),
        createMeasure({
          number: 8,
          events: [
            createChord({ beat: 1, duration: 'whole', symbol: 'Bbmaj7', root: 'Bb', quality: 'maj7' }),
          ],
        }),
      ],
    }),
  ],
})

export const Default: Story = {
  args: { score: autumnLeavesScore, measuresPerLine: 4, breakAtSections: true },
}

export const WithLyrics: Story = {
  args: {
    score: createScore({
      title: 'Simple Song',
      timeSignature: { beats: 4, value: 4 },
      keySignature: { root: 'C', mode: 'major' },
      tracks: [
        createTrack({
          measures: [
            createMeasure({
              number: 1,
              section: 'Verse',
              events: [
                createChord({ beat: 1, duration: 'quarter', symbol: 'C',  root: 'C' }),
                createChord({ beat: 3, duration: 'quarter', symbol: 'Am', root: 'A', quality: 'minor' }),
                createLyric({ beat: 1, duration: 'quarter', text: 'The ' }),
                createLyric({ beat: 2, duration: 'quarter', text: 'sky' }),
                createLyric({ beat: 3, duration: 'quarter', text: 'is' }),
                createLyric({ beat: 4, duration: 'quarter', text: 'blue,' }),
              ],
            }),
            createMeasure({
              number: 2,
              events: [
                createChord({ beat: 1, duration: 'quarter', symbol: 'F',  root: 'F' }),
                createChord({ beat: 3, duration: 'quarter', symbol: 'G',  root: 'G' }),
                createLyric({ beat: 1, duration: 'quarter', text: 'the' }),
                createLyric({ beat: 2, duration: 'quarter', text: 'stars' }),
                createLyric({ beat: 3, duration: 'quarter', text: 'are' }),
                createLyric({ beat: 4, duration: 'quarter', text: 'bright.' }),
              ],
            }),
          ],
        }),
      ],
    }),
    measuresPerLine: 4,
    breakAtSections: true,
  },
}

export const ShowMeasureNumbers: Story = {
  args: { score: autumnLeavesScore, measuresPerLine: 4, breakAtSections: true, showMeasureNumbers: true },
}

export const TwoMeasuresPerLine: Story = {
  args: { score: autumnLeavesScore, measuresPerLine: 2, breakAtSections: false },
}

export const NoSectionBreaks: Story = {
  args: { score: autumnLeavesScore, measuresPerLine: 4, breakAtSections: false },
}
