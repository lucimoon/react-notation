import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ChordSheet } from './ChordSheet'
import { createScore, createTrack, createMeasure, createChord, createLyric } from '../../builders'
import { useScore } from '../../hooks/useScore'
import type { Selection } from '../../types'

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

// ─── Interactive / editor stories ─────────────────────────────────────────────

export const Interactive: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const editor = useScore(autumnLeavesScore)
    return <ChordSheet score={editor.score} editor={editor} />
  },
}

export const WithUndoRedo: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const editor = useScore(autumnLeavesScore)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={editor.undo} disabled={!editor.canUndo}>Undo</button>
          <button onClick={editor.redo} disabled={!editor.canRedo}>Redo</button>
        </div>
        <ChordSheet score={editor.score} editor={editor} />
      </div>
    )
  },
}

export const CustomPopupHook: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const editor = useScore(autumnLeavesScore)
    const [lastEvent, setLastEvent] = useState<Selection | null>(null)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ChordSheet
          score={editor.score}
          editor={editor}
          inlineEdit={false}
          onEditStart={(sel) => { setLastEvent(sel); return false }}
        />
        <pre style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '0.75rem', borderRadius: '4px' }}>
          {lastEvent ? JSON.stringify(lastEvent, null, 2) : 'Press Enter on a chord to see onEditStart fire here'}
        </pre>
      </div>
    )
  },
}

export const SelectionCallbacks: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const editor = useScore(autumnLeavesScore)
    const [log, setLog] = useState<Array<{ event: string; payload: unknown }>>([])
    const push = (event: string, payload: unknown) =>
      setLog((prev) => [{ event, payload }, ...prev].slice(0, 6))
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ChordSheet
          score={editor.score}
          editor={editor}
          onSelect={(sel) => push('onSelect', sel)}
          onEditCommit={(sel, val) => push('onEditCommit', { ...sel, value: val })}
          onEditCancel={(sel) => push('onEditCancel', sel)}
        />
        <pre style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '0.75rem', borderRadius: '4px', minHeight: '6rem' }}>
          {log.length > 0
            ? log.map((e, i) => `[${e.event}] ${JSON.stringify(e.payload)}`).join('\n')
            : 'Click or Tab to a chord, press Enter to edit…'}
        </pre>
      </div>
    )
  },
}
