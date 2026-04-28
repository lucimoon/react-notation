import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ChordChart } from './ChordChart'
import { createScore, createTrack, createMeasure, createChord } from '../../builders'
import { useScore } from '../../hooks/useScore'
import type { Selection } from '../../types'

const meta: Meta<typeof ChordChart> = {
  title: 'Components/ChordChart',
  component: ChordChart,
  parameters: { layout: 'padded' },
  argTypes: {
    measuresPerLine: { control: { type: 'number', min: 1, max: 8 } },
    breakAtSections: { control: 'boolean' },
    showSlashes: { control: 'boolean' },
    showMeasureNumbers: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof ChordChart>

// Autumn Leaves — first 16 bars
const autumnLeaves = createScore({
  title: 'Autumn Leaves',
  tempo: 120,
  timeSignature: { beats: 4, value: 4 },
  keySignature: { root: 'G', mode: 'major' },
  tracks: [
    createTrack({
      measures: [
        createMeasure({ number: 1,  section: 'A', rehearsalMark: 'A', events: [
          createChord({ beat: 1, duration: 'half', symbol: 'Cm7',    root: 'C', quality: 'min7' }),
          createChord({ beat: 3, duration: 'half', symbol: 'F7',     root: 'F', quality: 'dominant7' }),
        ]}),
        createMeasure({ number: 2,  events: [createChord({ beat: 1, duration: 'whole', symbol: 'Bbmaj7', root: 'Bb', quality: 'maj7' })]}),
        createMeasure({ number: 3,  events: [
          createChord({ beat: 1, duration: 'half', symbol: 'Ebmaj7', root: 'Eb', quality: 'maj7' }),
          createChord({ beat: 3, duration: 'half', symbol: 'Am7b5',  root: 'A',  quality: 'min7' }),
        ]}),
        createMeasure({ number: 4,  events: [
          createChord({ beat: 1, duration: 'half', symbol: 'D7',     root: 'D', quality: 'dominant7' }),
          createChord({ beat: 3, duration: 'half', symbol: 'Gm',     root: 'G', quality: 'minor' }),
        ]}),
        createMeasure({ number: 5,  section: 'B', rehearsalMark: 'B', events: [
          createChord({ beat: 1, duration: 'half', symbol: 'Am7b5',  root: 'A', quality: 'min7' }),
          createChord({ beat: 3, duration: 'half', symbol: 'D7',     root: 'D', quality: 'dominant7' }),
        ]}),
        createMeasure({ number: 6,  events: [createChord({ beat: 1, duration: 'whole', symbol: 'Gm7',   root: 'G', quality: 'min7' })]}),
        createMeasure({ number: 7,  events: [
          createChord({ beat: 1, duration: 'half', symbol: 'Cm7',    root: 'C', quality: 'min7' }),
          createChord({ beat: 3, duration: 'half', symbol: 'F7',     root: 'F', quality: 'dominant7' }),
        ]}),
        createMeasure({ number: 8,  events: [createChord({ beat: 1, duration: 'whole', symbol: 'Bbmaj7', root: 'Bb', quality: 'maj7' })]}),
        createMeasure({ number: 9,  section: 'C', rehearsalMark: 'C', events: [
          createChord({ beat: 1, duration: 'half', symbol: 'Ebmaj7', root: 'Eb', quality: 'maj7' }),
          createChord({ beat: 3, duration: 'half', symbol: 'D7',     root: 'D',  quality: 'dominant7' }),
        ]}),
        createMeasure({ number: 10, events: [createChord({ beat: 1, duration: 'whole', symbol: 'Gm',    root: 'G', quality: 'minor' })]}),
        createMeasure({ number: 11, events: [
          createChord({ beat: 1, duration: 'half', symbol: 'Am7b5',  root: 'A', quality: 'min7' }),
          createChord({ beat: 3, duration: 'half', symbol: 'D7',     root: 'D', quality: 'dominant7' }),
        ]}),
        createMeasure({ number: 12, events: [createChord({ beat: 1, duration: 'whole', symbol: 'Gm',    root: 'G', quality: 'minor' })], barline: 'final' }),
      ],
    }),
  ],
})

export const Default: Story = {
  args: { score: autumnLeaves, measuresPerLine: 4, breakAtSections: true, showSlashes: true },
}

export const NoSlashes: Story = {
  args: { score: autumnLeaves, measuresPerLine: 4, breakAtSections: true, showSlashes: false },
}

export const WithMeasureNumbers: Story = {
  args: { score: autumnLeaves, measuresPerLine: 4, breakAtSections: true, showSlashes: true, showMeasureNumbers: true },
}

export const TwoPerLine: Story = {
  args: { score: autumnLeaves, measuresPerLine: 2, breakAtSections: false, showSlashes: true },
}

// Blues in Bb — 12-bar
const bluesInBb = createScore({
  title: 'Blues in Bb',
  tempo: 132,
  timeSignature: { beats: 4, value: 4 },
  keySignature: { root: 'Bb', mode: 'major' },
  tracks: [
    createTrack({
      measures: [
        createMeasure({ number: 1,  section: 'Blues', events: [createChord({ beat: 1, duration: 'whole', symbol: 'Bb7', root: 'Bb', quality: 'dominant7' })] }),
        createMeasure({ number: 2,  events: [createChord({ beat: 1, duration: 'whole', symbol: 'Bb7', root: 'Bb', quality: 'dominant7' })] }),
        createMeasure({ number: 3,  events: [createChord({ beat: 1, duration: 'whole', symbol: 'Bb7', root: 'Bb', quality: 'dominant7' })] }),
        createMeasure({ number: 4,  events: [createChord({ beat: 1, duration: 'whole', symbol: 'Bb7', root: 'Bb', quality: 'dominant7' })] }),
        createMeasure({ number: 5,  events: [createChord({ beat: 1, duration: 'whole', symbol: 'Eb7', root: 'Eb', quality: 'dominant7' })] }),
        createMeasure({ number: 6,  events: [createChord({ beat: 1, duration: 'whole', symbol: 'Eb7', root: 'Eb', quality: 'dominant7' })] }),
        createMeasure({ number: 7,  events: [createChord({ beat: 1, duration: 'whole', symbol: 'Bb7', root: 'Bb', quality: 'dominant7' })] }),
        createMeasure({ number: 8,  events: [createChord({ beat: 1, duration: 'whole', symbol: 'Bb7', root: 'Bb', quality: 'dominant7' })] }),
        createMeasure({ number: 9,  events: [createChord({ beat: 1, duration: 'whole', symbol: 'F7',  root: 'F',  quality: 'dominant7' })] }),
        createMeasure({ number: 10, events: [createChord({ beat: 1, duration: 'whole', symbol: 'Eb7', root: 'Eb', quality: 'dominant7' })] }),
        createMeasure({ number: 11, events: [createChord({ beat: 1, duration: 'whole', symbol: 'Bb7', root: 'Bb', quality: 'dominant7' })] }),
        createMeasure({ number: 12, events: [
          createChord({ beat: 1, duration: 'half', symbol: 'F7',  root: 'F',  quality: 'dominant7' }),
          createChord({ beat: 3, duration: 'half', symbol: 'Bb7', root: 'Bb', quality: 'dominant7' }),
        ], barline: 'repeat-end' }),
      ],
    }),
  ],
})

export const TwelveBarBlues: Story = {
  args: { score: bluesInBb, measuresPerLine: 4, breakAtSections: false, showSlashes: true, showMeasureNumbers: true },
}

// ─── Interactive / editor stories ─────────────────────────────────────────────

export const Interactive: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const editor = useScore(autumnLeaves)
    const [selection, setSelection] = useState<Selection | null>(null)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ChordChart
          score={editor.score}
          editor={editor}
          onSelect={(sel) => setSelection(sel)}
        />
        <pre style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '0.75rem', borderRadius: '4px' }}>
          {selection ? JSON.stringify(selection, null, 2) : 'Tab to or click a chord to see the selection here'}
        </pre>
      </div>
    )
  },
}

export const SelectionCallbacks: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const editor = useScore(autumnLeaves)
    const [log, setLog] = useState<Array<{ event: string; payload: unknown }>>([])
    const push = (event: string, payload: unknown) =>
      setLog((prev) => [{ event, payload }, ...prev].slice(0, 6))
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ChordChart
          score={editor.score}
          editor={editor}
          onSelect={(sel) => push('onSelect', sel)}
        />
        <pre style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '0.75rem', borderRadius: '4px', minHeight: '6rem' }}>
          {log.length > 0
            ? log.map((e) => `[${e.event}] ${JSON.stringify(e.payload)}`).join('\n')
            : 'Click or Tab to a chord to see selection events…'}
        </pre>
      </div>
    )
  },
}
