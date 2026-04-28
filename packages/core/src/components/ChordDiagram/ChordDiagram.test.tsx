import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChordDiagram } from './ChordDiagram'
import { createChord } from '../../builders'

const cMajor = createChord({
  beat: 1, duration: 'whole',
  symbol: 'C', root: 'C',
  voicing: [-1, 3, 2, 0, 1, 0],
})

const aMinor = createChord({
  beat: 1, duration: 'whole',
  symbol: 'Am', root: 'A', quality: 'minor',
  voicing: [0, 0, 2, 2, 1, 0],
})

// Barre chord high up the neck (frets 5-7, above the default 4-fret window)
const bBarreChord = createChord({
  beat: 1, duration: 'whole',
  symbol: 'A', root: 'A',
  voicing: [5, 7, 7, 6, 5, 5],
})

describe('ChordDiagram', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ChordDiagram chord={cMajor} />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('has accessible aria-label with chord symbol', () => {
    const { container } = render(<ChordDiagram chord={cMajor} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('aria-label')).toBe('C chord diagram')
  })

  it('renders the chord label by default', () => {
    const { container } = render(<ChordDiagram chord={cMajor} />)
    const label = container.querySelector('text:last-of-type')
    expect(label?.textContent).toBe('C')
  })

  it('hides the label when showLabel is false', () => {
    const { container } = render(<ChordDiagram chord={cMajor} showLabel={false} />)
    // Only fret position text (none for open chord) — no label text
    const texts = container.querySelectorAll('text')
    expect(texts).toHaveLength(0)
  })

  it('renders correct number of string lines', () => {
    const { container } = render(<ChordDiagram chord={cMajor} strings={6} />)
    // string lines have class-independent structure — count lines inside svg
    const lines = container.querySelectorAll('line')
    // 6 string lines + (4+1) fret lines + some X marks for muted strings
    expect(lines.length).toBeGreaterThan(6)
  })

  it('renders a nut rect for open-position chords', () => {
    const { container } = render(<ChordDiagram chord={aMinor} />)
    // Nut is a rect element
    expect(container.querySelector('rect')).toBeTruthy()
  })

  it('does not render nut for high-neck chords, shows fret number instead', () => {
    const { container } = render(<ChordDiagram chord={bBarreChord} frets={4} />)
    // No nut rect
    expect(container.querySelector('rect')).toBeNull()
    // Fret position text (startFret = 5)
    const texts = Array.from(container.querySelectorAll('text'))
    const hasFretNumber = texts.some((t) => t.textContent === '5')
    expect(hasFretNumber).toBe(true)
  })

  it('forwards className', () => {
    const { container } = render(<ChordDiagram chord={cMajor} className="my-diagram" />)
    expect(container.querySelector('svg')?.className.baseVal).toContain('my-diagram')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<ChordDiagram chord={cMajor} ref={ref} />)
    expect(ref.current).toBeTruthy()
  })

  it('renders with ukulele string count', () => {
    const ukeChord = createChord({
      beat: 1, duration: 'whole',
      symbol: 'C', root: 'C',
      voicing: [0, 0, 0, 3],
    })
    const { container } = render(<ChordDiagram chord={ukeChord} strings={4} />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders gracefully with no voicing', () => {
    const bare = createChord({ beat: 1, duration: 'whole', symbol: 'G', root: 'G' })
    const { container } = render(<ChordDiagram chord={bare} />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
