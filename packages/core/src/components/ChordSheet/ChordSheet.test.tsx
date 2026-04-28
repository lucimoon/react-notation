import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChordSheet } from './ChordSheet'
import { createScore, createTrack, createMeasure, createChord, createLyric } from '../../builders'

function makeMeasure(number: number, opts: {
  section?: string
  chords?: string[]
  lyrics?: string[]
} = {}) {
  const events: ReturnType<typeof createChord | typeof createLyric>[] = []

  const chordSymbols = opts.chords ?? []
  const lyricTexts = opts.lyrics ?? []

  chordSymbols.forEach((symbol, i) => {
    events.push(createChord({ beat: i + 1, duration: 'quarter', symbol, root: symbol[0] }))
  })
  lyricTexts.forEach((text, i) => {
    events.push(createLyric({ beat: i + 1, duration: 'quarter', text }))
  })

  return createMeasure({ number, section: opts.section, events })
}

function makeScore(measures: ReturnType<typeof makeMeasure>[]) {
  return createScore({ tracks: [createTrack({ measures })] })
}

describe('ChordSheet', () => {
  it('renders chord symbols', () => {
    const score = makeScore([makeMeasure(1, { chords: ['C', 'Am'] })])
    render(<ChordSheet score={score} />)
    expect(screen.getByText('C')).toBeTruthy()
    expect(screen.getByText('Am')).toBeTruthy()
  })

  it('renders lyric text', () => {
    const score = makeScore([makeMeasure(1, { lyrics: ['Au-', 'tumn'] })])
    render(<ChordSheet score={score} />)
    expect(screen.getByText('Au-')).toBeTruthy()
    expect(screen.getByText('tumn')).toBeTruthy()
  })

  it('renders section labels', () => {
    const score = makeScore([
      makeMeasure(1, { section: 'Verse', chords: ['C'] }),
    ])
    render(<ChordSheet score={score} breakAtSections />)
    expect(screen.getByText('Verse')).toBeTruthy()
  })

  it('does not render section label when breakAtSections is false', () => {
    const score = makeScore([
      makeMeasure(1, { section: 'Verse', chords: ['C'] }),
    ])
    render(<ChordSheet score={score} breakAtSections={false} />)
    expect(screen.queryByText('Verse')).toBeNull()
  })

  it('wraps after measuresPerLine measures', () => {
    const measures = Array.from({ length: 8 }, (_, i) =>
      makeMeasure(i + 1, { chords: ['C'] })
    )
    const score = makeScore(measures)
    const { container } = render(<ChordSheet score={score} measuresPerLine={4} />)
    const lines = container.querySelectorAll('.notation-chord-line')
    expect(lines).toHaveLength(2)
    expect(lines[0].querySelectorAll('.notation-measure')).toHaveLength(4)
    expect(lines[1].querySelectorAll('.notation-measure')).toHaveLength(4)
  })

  it('breaks at section boundary even if line not full', () => {
    const measures = [
      makeMeasure(1, { chords: ['C'] }),
      makeMeasure(2, { section: 'Chorus', chords: ['F'] }),
    ]
    const score = makeScore(measures)
    const { container } = render(<ChordSheet score={score} measuresPerLine={4} breakAtSections />)
    const lines = container.querySelectorAll('.notation-chord-line')
    expect(lines).toHaveLength(2)
  })

  it('shows measure numbers when showMeasureNumbers is true', () => {
    const score = makeScore([makeMeasure(3, { chords: ['G'] })])
    render(<ChordSheet score={score} showMeasureNumbers />)
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('does not show measure numbers by default', () => {
    const score = makeScore([makeMeasure(3, { chords: ['G'] })])
    render(<ChordSheet score={score} />)
    expect(screen.queryByText('3')).toBeNull()
  })

  it('forwards className', () => {
    const score = makeScore([])
    const { container } = render(<ChordSheet score={score} className="my-sheet" />)
    expect(container.firstElementChild?.className).toContain('my-sheet')
    expect(container.firstElementChild?.className).toContain('notation-chord-sheet')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    const score = makeScore([])
    render(<ChordSheet score={score} ref={ref} />)
    expect(ref.current).toBeTruthy()
  })

  it('renders an empty score without crashing', () => {
    const score = createScore({ tracks: [] })
    render(<ChordSheet score={score} />)
  })
})
