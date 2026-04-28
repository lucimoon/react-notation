import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChordSheet } from './ChordSheet'
import { createScore, createTrack, createMeasure, createChord, createLyric } from '../../builders'
import { useScore } from '../../hooks/useScore'
import { renderHook, act } from '@testing-library/react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeMeasure(number: number, opts: {
  section?: string
  chords?: string[]
  lyrics?: string[]
} = {}) {
  const events: ReturnType<typeof createChord | typeof createLyric>[] = []
  ;(opts.chords ?? []).forEach((symbol, i) => {
    events.push(createChord({ beat: i + 1, duration: 'quarter', symbol, root: symbol[0] }))
  })
  ;(opts.lyrics ?? []).forEach((text, i) => {
    events.push(createLyric({ beat: i + 1, duration: 'quarter', text }))
  })
  return createMeasure({ number, section: opts.section, events })
}

function makeScore(measures: ReturnType<typeof makeMeasure>[]) {
  return createScore({ tracks: [createTrack({ measures })] })
}

// ─── Read-only rendering ───────────────────────────────────────────────────────

describe('ChordSheet (read-only)', () => {
  it('renders chord symbols', () => {
    render(<ChordSheet score={makeScore([makeMeasure(1, { chords: ['C', 'Am'] })])} />)
    expect(screen.getByText('C')).toBeTruthy()
    expect(screen.getByText('Am')).toBeTruthy()
  })

  it('renders lyric text', () => {
    render(<ChordSheet score={makeScore([makeMeasure(1, { lyrics: ['Au-', 'tumn'] })])} />)
    expect(screen.getByText('Au-')).toBeTruthy()
    expect(screen.getByText('tumn')).toBeTruthy()
  })

  it('renders section labels', () => {
    render(<ChordSheet score={makeScore([makeMeasure(1, { section: 'Verse', chords: ['C'] })])} breakAtSections />)
    expect(screen.getByText('Verse')).toBeTruthy()
  })

  it('does not render section label when breakAtSections is false', () => {
    render(<ChordSheet score={makeScore([makeMeasure(1, { section: 'Verse', chords: ['C'] })])} breakAtSections={false} />)
    expect(screen.queryByText('Verse')).toBeNull()
  })

  it('wraps after measuresPerLine measures', () => {
    const measures = Array.from({ length: 8 }, (_, i) => makeMeasure(i + 1, { chords: ['C'] }))
    const { container } = render(<ChordSheet score={makeScore(measures)} measuresPerLine={4} />)
    const lines = container.querySelectorAll('.notation-chord-line')
    expect(lines).toHaveLength(2)
    expect(lines[0].querySelectorAll('.notation-measure')).toHaveLength(4)
    expect(lines[1].querySelectorAll('.notation-measure')).toHaveLength(4)
  })

  it('breaks at section boundary even if line not full', () => {
    const measures = [makeMeasure(1, { chords: ['C'] }), makeMeasure(2, { section: 'Chorus', chords: ['F'] })]
    const { container } = render(<ChordSheet score={makeScore(measures)} measuresPerLine={4} breakAtSections />)
    expect(container.querySelectorAll('.notation-chord-line')).toHaveLength(2)
  })

  it('shows measure numbers when showMeasureNumbers is true', () => {
    render(<ChordSheet score={makeScore([makeMeasure(3, { chords: ['G'] })])} showMeasureNumbers />)
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('does not show measure numbers by default', () => {
    render(<ChordSheet score={makeScore([makeMeasure(3, { chords: ['G'] })])} />)
    expect(screen.queryByText('3')).toBeNull()
  })

  it('forwards className', () => {
    const { container } = render(<ChordSheet score={makeScore([])} className="my-sheet" />)
    expect(container.firstElementChild?.className).toContain('my-sheet')
    expect(container.firstElementChild?.className).toContain('notation-chord-sheet')
  })

  it('forwards ref', () => {
    const ref = { current: null }
    render(<ChordSheet score={makeScore([])} ref={ref} />)
    expect(ref.current).toBeTruthy()
  })

  it('renders an empty score without crashing', () => {
    render(<ChordSheet score={createScore({ tracks: [] })} />)
  })
})

// ─── Interactive mode ─────────────────────────────────────────────────────────

function InteractiveSheet({
  chords = ['C', 'Am'],
  onSelect,
  onEditCommit,
  onEditStart,
  onEditCancel,
  inlineEdit,
}: {
  chords?: string[]
  onSelect?: ChordSheetProps['onSelect']
  onEditCommit?: ChordSheetProps['onEditCommit']
  onEditStart?: ChordSheetProps['onEditStart']
  onEditCancel?: ChordSheetProps['onEditCancel']
  inlineEdit?: boolean
}) {
  const score = makeScore([makeMeasure(1, { chords })])
  const editor = useScore(score) // can't use renderHook here; use inline
  return (
    <ChordSheet
      score={editor.score}
      editor={editor}
      onSelect={onSelect}
      onEditCommit={onEditCommit}
      onEditStart={onEditStart}
      onEditCancel={onEditCancel}
      inlineEdit={inlineEdit}
    />
  )
}

// Re-import type for the helper component
type ChordSheetProps = import('./ChordSheet').ChordSheetProps

describe('ChordSheet (interactive)', () => {
  it('beat elements have tabIndex and data-notation-id when editor is present', () => {
    const { container } = render(<InteractiveSheet />)
    const beats = container.querySelectorAll('[data-notation-id]')
    expect(beats.length).toBeGreaterThan(0)
    // At least the first one should have tabIndex=-1 (unselected)
    const beat = beats[0] as HTMLElement
    expect(beat.hasAttribute('tabindex')).toBe(true)
  })

  it('fires onSelect when a beat is focused', () => {
    const onSelect = vi.fn()
    const { container } = render(<InteractiveSheet onSelect={onSelect} />)
    const beat = container.querySelector('[data-notation-id]') as HTMLElement
    fireEvent.focus(beat)
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect.mock.calls[0][0].type).toBe('chord')
  })

  it('Enter key activates inline edit for chord', async () => {
    const user = userEvent.setup()
    const { container } = render(<InteractiveSheet />)
    const beat = container.querySelector('[data-notation-id]') as HTMLElement
    beat.focus()
    await user.keyboard('{Enter}')
    expect(container.querySelector('.notation-beat-chord-input')).toBeTruthy()
  })

  it('inline edit commits on Enter and updates the chord', async () => {
    const user = userEvent.setup()
    const onEditCommit = vi.fn()
    const { container } = render(<InteractiveSheet onEditCommit={onEditCommit} />)
    const beat = container.querySelector('[data-notation-id]') as HTMLElement
    beat.focus()
    await user.keyboard('{Enter}')
    const input = container.querySelector('.notation-beat-chord-input') as HTMLInputElement
    await user.clear(input)
    await user.type(input, 'G')
    await user.keyboard('{Enter}')
    expect(onEditCommit).toHaveBeenCalledOnce()
    expect(onEditCommit.mock.calls[0][1]).toBe('G')
    expect(container.querySelector('.notation-beat-chord-input')).toBeNull()
  })

  it('inline edit cancels on Escape', async () => {
    const user = userEvent.setup()
    const onEditCancel = vi.fn()
    const { container } = render(<InteractiveSheet onEditCancel={onEditCancel} />)
    const beat = container.querySelector('[data-notation-id]') as HTMLElement
    beat.focus()
    await user.keyboard('{Enter}')
    await user.keyboard('{Escape}')
    expect(onEditCancel).toHaveBeenCalledOnce()
    expect(container.querySelector('.notation-beat-chord-input')).toBeNull()
  })

  it('typing a printable character seeds the inline edit input', async () => {
    const user = userEvent.setup()
    const { container } = render(<InteractiveSheet />)
    const beat = container.querySelector('[data-notation-id]') as HTMLElement
    beat.focus()
    await user.keyboard('D')
    const input = container.querySelector('.notation-beat-chord-input') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.value).toBe('D')
  })

  it('inlineEdit=false suppresses the input but still fires onEditStart', async () => {
    const user = userEvent.setup()
    const onEditStart = vi.fn()
    const { container } = render(<InteractiveSheet inlineEdit={false} onEditStart={onEditStart} />)
    const beat = container.querySelector('[data-notation-id]') as HTMLElement
    beat.focus()
    await user.keyboard('{Enter}')
    expect(onEditStart).toHaveBeenCalledOnce()
    expect(container.querySelector('.notation-beat-chord-input')).toBeNull()
  })

  it('Delete key removes the event', async () => {
    const user = userEvent.setup()
    const { container } = render(<InteractiveSheet chords={['C', 'Am']} />)
    const beats = container.querySelectorAll('[data-notation-id]')
    const firstBeat = beats[0] as HTMLElement
    firstBeat.focus()
    await user.keyboard('{Delete}')
    // C should be gone, Am should remain
    expect(container.querySelector('[data-notation-type="chord"]')).toBeTruthy()
    expect(screen.queryByText('C')).toBeNull()
    expect(screen.getByText('Am')).toBeTruthy()
  })
})
