import type { Meta, StoryObj } from '@storybook/react'
import { ChordDiagram } from './ChordDiagram'
import { createChord } from '../../builders'

const meta: Meta<typeof ChordDiagram> = {
  title: 'Components/ChordDiagram',
  component: ChordDiagram,
  parameters: { layout: 'centered' },
  argTypes: {
    strings: { control: { type: 'number', min: 4, max: 8 } },
    frets:   { control: { type: 'number', min: 3, max: 7 } },
    width:   { control: { type: 'number', min: 60, max: 200, step: 10 } },
    showLabel: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof ChordDiagram>

// Guitar chords — voicing: index 0 = low E, -1 = muted, 0 = open
const chords = {
  C:   createChord({ beat: 1, duration: 'whole', symbol: 'C',    root: 'C',  voicing: [-1, 3, 2, 0, 1, 0] }),
  Am:  createChord({ beat: 1, duration: 'whole', symbol: 'Am',   root: 'A',  quality: 'minor',    voicing: [0, 0, 2, 2, 1, 0] }),
  F:   createChord({ beat: 1, duration: 'whole', symbol: 'F',    root: 'F',  voicing: [1, 1, 2, 3, 3, 1] }),
  G:   createChord({ beat: 1, duration: 'whole', symbol: 'G',    root: 'G',  voicing: [3, 2, 0, 0, 0, 3] }),
  D:   createChord({ beat: 1, duration: 'whole', symbol: 'D',    root: 'D',  voicing: [-1, -1, 0, 2, 3, 2] }),
  E:   createChord({ beat: 1, duration: 'whole', symbol: 'E',    root: 'E',  voicing: [0, 2, 2, 1, 0, 0] }),
  Em:  createChord({ beat: 1, duration: 'whole', symbol: 'Em',   root: 'E',  quality: 'minor',    voicing: [0, 2, 2, 0, 0, 0] }),
  Dm:  createChord({ beat: 1, duration: 'whole', symbol: 'Dm',   root: 'D',  quality: 'minor',    voicing: [-1, -1, 0, 2, 3, 1] }),
  B7:  createChord({ beat: 1, duration: 'whole', symbol: 'B7',   root: 'B',  quality: 'dominant7', voicing: [-1, 2, 1, 2, 0, 2] }),
  // High-neck barre
  Bb:  createChord({ beat: 1, duration: 'whole', symbol: 'Bb',   root: 'Bb', voicing: [1, 1, 3, 3, 3, 1] }),
}

export const Default: Story = { args: { chord: chords.C, strings: 6, frets: 4, showLabel: true, width: 80 } }

export const AmMinor: Story = { args: { chord: chords.Am, strings: 6, frets: 4, showLabel: true, width: 80 } }

export const FMajorBarre: Story = { args: { chord: chords.F, strings: 6, frets: 4, showLabel: true, width: 80 } }

export const HighNeckBarre: Story = { args: { chord: chords.Bb, strings: 6, frets: 4, showLabel: true, width: 80 } }

export const Large: Story = { args: { chord: chords.G, strings: 6, frets: 4, showLabel: true, width: 160 } }

export const NoLabel: Story = { args: { chord: chords.E, strings: 6, frets: 4, showLabel: false, width: 80 } }

export const CommonGuitarChords: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start', padding: 16 }}>
      {Object.values(chords).map((chord) => (
        <ChordDiagram key={chord.id} chord={chord} width={80} />
      ))}
    </div>
  ),
}

export const UkuleleC: Story = {
  args: {
    chord: createChord({ beat: 1, duration: 'whole', symbol: 'C', root: 'C', voicing: [0, 0, 0, 3] }),
    strings: 4,
    frets: 4,
    showLabel: true,
    width: 70,
  },
}
