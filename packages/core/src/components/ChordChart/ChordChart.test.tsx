import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChordChart } from './ChordChart'
import { createScore, createTrack, createMeasure, createChord } from '../../builders'
import { useScore } from '../../hooks/useScore'

function makeScore(measures: ReturnType<typeof createMeasure>[]) {
  return createScore({
    timeSignature: { beats: 4, value: 4 },
    keySignature: { root: 'C', mode: 'major' },
    tracks: [createTrack({ measures })],
  })
}

function m(number: number, opts: {
  section?: string
  rehearsalMark?: string
  chords?: string[]
  barline?: 'single' | 'double' | 'final' | 'repeat-start' | 'repeat-end'
} = {}) {
  const events = (opts.chords ?? []).map((symbol, i) =>
    createChord({ beat: i + 1, duration: 'quarter', symbol, root: symbol[0] })
  )
  return createMeasure({ number, section: opts.section, rehearsalMark: opts.rehearsalMark, events, barline: opts.barline })
}

describe('ChordChart', () => {
  it('renders chord symbols', () => {
    const score = makeScore([m(1, { chords: ['C', 'Am'] })])
    render(<ChordChart score={score} />)
    expect(screen.getByText('C')).toBeTruthy()
    expect(screen.getByText('Am')).toBeTruthy()
  })

  it('renders slash notation by default', () => {
    const score = makeScore([m(1, { chords: ['C'] })])
    const { container } = render(<ChordChart score={score} />)
    const slashes = container.querySelectorAll('.notation-chart-slash')
    expect(slashes.length).toBeGreaterThan(0)
  })

  it('hides slash notation when showSlashes is false', () => {
    const score = makeScore([m(1, { chords: ['C'] })])
    const { container } = render(<ChordChart score={score} showSlashes={false} />)
    expect(container.querySelectorAll('.notation-chart-slash')).toHaveLength(0)
  })

  it('renders 4 slashes per measure for 4/4', () => {
    const score = makeScore([m(1, { chords: ['C'] })])
    const { container } = render(<ChordChart score={score} />)
    const slashes = container.querySelectorAll('.notation-chart-slash')
    expect(slashes).toHaveLength(4)
  })

  it('renders section label when breakAtSections is true', () => {
    const score = makeScore([m(1, { section: 'Verse', chords: ['C'] })])
    render(<ChordChart score={score} breakAtSections />)
    expect(screen.getByText('Verse')).toBeTruthy()
  })

  it('does not render section label when breakAtSections is false', () => {
    const score = makeScore([m(1, { section: 'Verse', chords: ['C'] })])
    render(<ChordChart score={score} breakAtSections={false} />)
    expect(screen.queryByText('Verse')).toBeNull()
  })

  it('renders rehearsal mark', () => {
    const score = makeScore([m(1, { rehearsalMark: 'A', chords: ['C'] })])
    render(<ChordChart score={score} />)
    expect(screen.getByText('A')).toBeTruthy()
  })

  it('wraps at measuresPerLine', () => {
    const measures = Array.from({ length: 8 }, (_, i) => m(i + 1, { chords: ['C'] }))
    const { container } = render(<ChordChart score={makeScore(measures)} measuresPerLine={4} />)
    const lines = container.querySelectorAll('.notation-chart-line')
    expect(lines).toHaveLength(2)
    expect(lines[0].querySelectorAll('.notation-chart-measure')).toHaveLength(4)
  })

  it('breaks at section boundary before line is full', () => {
    const measures = [m(1, { chords: ['C'] }), m(2, { section: 'Chorus', chords: ['F'] })]
    const { container } = render(<ChordChart score={makeScore(measures)} measuresPerLine={4} breakAtSections />)
    expect(container.querySelectorAll('.notation-chart-line')).toHaveLength(2)
  })

  it('shows measure numbers when enabled', () => {
    const score = makeScore([m(5, { chords: ['G'] })])
    render(<ChordChart score={score} showMeasureNumbers />)
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('forwards className', () => {
    const { container } = render(<ChordChart score={makeScore([])} className="my-chart" />)
    expect(container.firstElementChild?.className).toContain('my-chart')
    expect(container.firstElementChild?.className).toContain('notation-chord-chart')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<ChordChart score={makeScore([])} ref={ref} />)
    expect(ref.current).toBeTruthy()
  })

  it('renders gracefully with empty score', () => {
    render(<ChordChart score={createScore({ tracks: [] })} />)
  })

  it('sets data-barline attribute on measure with repeat barline', () => {
    const score = makeScore([m(1, { chords: ['C'], barline: 'repeat-end' })])
    const { container } = render(<ChordChart score={score} />)
    const measure = container.querySelector('[data-barline="repeat-end"]')
    expect(measure).toBeTruthy()
  })
})

// ─── Interactive mode ─────────────────────────────────────────────────────────

function InteractiveChart({ onSelect }: { onSelect?: (s: import('../../types').Selection) => void }) {
  const score = makeScore([m(1, { chords: ['C', 'Am'] })])
  const editor = useScore(score)
  return <ChordChart score={editor.score} editor={editor} onSelect={onSelect} />
}

describe('ChordChart (interactive)', () => {
  it('chord elements have data-notation-id when editor is present', () => {
    const { container } = render(<InteractiveChart />)
    const chords = container.querySelectorAll('[data-notation-id]')
    expect(chords.length).toBeGreaterThan(0)
    expect(chords[0].getAttribute('data-notation-type')).toBe('chord')
  })

  it('fires onSelect when a chord is focused', () => {
    const onSelect = vi.fn()
    const { container } = render(<InteractiveChart onSelect={onSelect} />)
    const chord = container.querySelector('[data-notation-id]') as HTMLElement
    fireEvent.focus(chord)
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect.mock.calls[0][0].type).toBe('chord')
  })

  it('selected chord gets data-notation-selected attribute', () => {
    const { container } = render(<InteractiveChart />)
    const chord = container.querySelector('[data-notation-id]') as HTMLElement
    fireEvent.focus(chord)
    expect(chord.hasAttribute('data-notation-selected')).toBe(true)
  })

  it('read-only mode has no data-notation-id attributes', () => {
    const score = makeScore([m(1, { chords: ['C'] })])
    const { container } = render(<ChordChart score={score} />)
    expect(container.querySelector('[data-notation-id]')).toBeNull()
  })
})
