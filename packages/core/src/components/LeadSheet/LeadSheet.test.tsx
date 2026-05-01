import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LeadSheet } from './LeadSheet'
import { createScore, createTrack, createMeasure, createNote, createChord, createLyric, createRest } from '../../builders'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeScore() {
  return createScore({
    title: 'Test Melody',
    composer: 'Test Composer',
    timeSignature: { beats: 4, value: 4 },
    keySignature: { root: 'G', mode: 'major' },
    tracks: [
      createTrack({
        clef: 'treble',
        measures: [
          createMeasure({
            number: 1,
            events: [
              createNote({ pitch: { step: 'G', octave: 4 }, duration: 'quarter', beat: 1 }),
              createNote({ pitch: { step: 'A', octave: 4 }, duration: 'quarter', beat: 2 }),
              createNote({ pitch: { step: 'B', octave: 4 }, duration: 'quarter', beat: 3 }),
              createChord({ symbol: 'G', root: 'G', quality: 'major', beat: 1, duration: 'whole' }),
              createLyric({ text: 'Hel', syllable: 'begin', beat: 1, duration: 'quarter' }),
            ],
          }),
          createMeasure({
            number: 2,
            events: [
              createNote({ pitch: { step: 'C', octave: 5 }, duration: 'half', beat: 1 }),
              createRest({ duration: 'half', beat: 3 }),
            ],
          }),
        ],
      }),
    ],
  })
}

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('LeadSheet', () => {
  it('renders an SVG staff', () => {
    const { container } = render(<LeadSheet score={makeScore()} />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders the score title', () => {
    render(<LeadSheet score={makeScore()} />)
    expect(screen.getByText('Test Melody')).toBeTruthy()
  })

  it('renders the composer', () => {
    render(<LeadSheet score={makeScore()} />)
    expect(screen.getByText('Test Composer')).toBeTruthy()
  })

  it('renders staff lines (5 <line> elements)', () => {
    const { container } = render(<LeadSheet score={makeScore()} />)
    const staffLines = Array.from(container.querySelectorAll('svg line')).filter(
      (el) => el.getAttribute('x1') === '0' && el.getAttribute('x2') !== '0'
    )
    expect(staffLines.length).toBeGreaterThanOrEqual(5)
  })

  it('hides title when showTitle=false', () => {
    const { queryByText } = render(<LeadSheet score={makeScore()} showTitle={false} />)
    expect(queryByText('Test Melody')).toBeNull()
  })

  it('hides chord symbols when showChords=false', () => {
    const { container } = render(<LeadSheet score={makeScore()} showChords={false} />)
    const chordText = Array.from(container.querySelectorAll('.notation-lead-sheet-chord'))
    expect(chordText).toHaveLength(0)
  })

  it('hides lyrics when showLyrics=false', () => {
    const { container } = render(<LeadSheet score={makeScore()} showLyrics={false} />)
    const lyricText = Array.from(container.querySelectorAll('.notation-lead-sheet-lyric'))
    expect(lyricText).toHaveLength(0)
  })

  it('renders note elements for each note', () => {
    const { container } = render(<LeadSheet score={makeScore()} />)
    const noteGroups = container.querySelectorAll('.notation-note')
    // 3 notes in measure 1 + 1 in measure 2 = 4
    expect(noteGroups.length).toBe(4)
  })

  it('renders rest elements', () => {
    const { container } = render(<LeadSheet score={makeScore()} />)
    const restGroups = container.querySelectorAll('.notation-rest')
    expect(restGroups.length).toBe(1)
  })

  it('renders chord symbol text', () => {
    render(<LeadSheet score={makeScore()} />)
    expect(screen.getByText('G')).toBeTruthy()
  })

  it('renders lyric text', () => {
    render(<LeadSheet score={makeScore()} />)
    expect(screen.getByText('Hel-')).toBeTruthy()
  })

  it('returns null when trackIndex is out of range', () => {
    const { container } = render(<LeadSheet score={makeScore()} trackIndex={99} />)
    expect(container.firstChild).toBeNull()
  })

  it('applies custom className', () => {
    const { container } = render(<LeadSheet score={makeScore()} className="my-sheet" />)
    expect(container.querySelector('.my-sheet')).toBeTruthy()
  })

  it('forwards ref to outer div', () => {
    const ref = { current: null }
    render(<LeadSheet score={makeScore()} ref={ref} />)
    expect(ref.current).not.toBeNull()
  })
})

// ─── Section labels ───────────────────────────────────────────────────────────

describe('LeadSheet section labels', () => {
  it('renders section label when measure has section', () => {
    const score = createScore({
      timeSignature: { beats: 4, value: 4 },
      keySignature: { root: 'C', mode: 'major' },
      tracks: [
        createTrack({
          clef: 'treble',
          measures: [
            createMeasure({
              number: 1,
              section: 'Verse',
              events: [createNote({ pitch: { step: 'C', octave: 5 }, duration: 'whole', beat: 1 })],
            }),
          ],
        }),
      ],
    })
    render(<LeadSheet score={score} />)
    expect(screen.getByText('Verse')).toBeTruthy()
  })
})

// ─── Repeat barlines ──────────────────────────────────────────────────────────

describe('LeadSheet barlines', () => {
  it('renders final barline', () => {
    const score = createScore({
      timeSignature: { beats: 4, value: 4 },
      keySignature: { root: 'C', mode: 'major' },
      tracks: [
        createTrack({
          clef: 'treble',
          measures: [
            createMeasure({
              number: 1,
              barline: 'final',
              events: [createNote({ pitch: { step: 'C', octave: 5 }, duration: 'whole', beat: 1 })],
            }),
          ],
        }),
      ],
    })
    const { container } = render(<LeadSheet score={score} />)
    expect(container.querySelector('.notation-barline')).toBeTruthy()
  })
})

// ─── Editor / selection ───────────────────────────────────────────────────────

describe('LeadSheet editor mode', () => {
  it('adds data-notation-id to notes when editor is provided', () => {
    const score = makeScore()
    const mockEditor = {
      score,
      selection: null,
      select: vi.fn(),
      updateChord: vi.fn(),
      updateNote: vi.fn(),
      updateLyric: vi.fn(),
      updateMeasure: vi.fn(),
      addEvent: vi.fn(),
      removeEvent: vi.fn(),
      moveEvent: vi.fn(),
      addMeasure: vi.fn(),
      removeMeasure: vi.fn(),
      addTrack: vi.fn(),
      removeTrack: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: false,
      canRedo: false,
    }
    const { container } = render(<LeadSheet score={score} editor={mockEditor} />)
    const notesWithId = container.querySelectorAll('[data-notation-id]')
    expect(notesWithId.length).toBeGreaterThan(0)
  })
})

// ─── Line breaking ────────────────────────────────────────────────────────────

describe('LeadSheet line breaking', () => {
  it('breaks into two rows when measuresPerLine=1', () => {
    const { container } = render(<LeadSheet score={makeScore()} measuresPerLine={1} />)
    const rows = container.querySelectorAll('svg.notation-lead-sheet-staff')
    expect(rows.length).toBe(2)
  })

  it('fits both measures on one row when measuresPerLine=4', () => {
    const { container } = render(<LeadSheet score={makeScore()} measuresPerLine={4} />)
    const rows = container.querySelectorAll('svg.notation-lead-sheet-staff')
    expect(rows.length).toBe(1)
  })
})
