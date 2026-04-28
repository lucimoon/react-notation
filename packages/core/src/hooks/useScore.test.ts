import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScore } from './useScore'
import { createScore, createTrack, createMeasure, createChord, createLyric, createNote } from '../builders'

function baseScore() {
  return createScore({
    tracks: [
      createTrack({
        measures: [
          createMeasure({
            number: 1,
            events: [
              createChord({ beat: 1, duration: 'whole', symbol: 'C', root: 'C' }),
              createLyric({ beat: 1, duration: 'whole', text: 'Hello' }),
            ],
          }),
          createMeasure({ number: 2, events: [] }),
        ],
      }),
    ],
  })
}

describe('useScore — initial state', () => {
  it('exposes score', () => {
    const { result } = renderHook(() => useScore(baseScore()))
    expect(result.current.score.tracks).toHaveLength(1)
  })

  it('selection starts null', () => {
    const { result } = renderHook(() => useScore(baseScore()))
    expect(result.current.selection).toBeNull()
  })

  it('canUndo and canRedo start false', () => {
    const { result } = renderHook(() => useScore(baseScore()))
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })
})

describe('useScore — selection', () => {
  it('select(id) sets selection for a chord event', () => {
    const score = baseScore()
    const chordId = (score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.select(chordId))

    expect(result.current.selection?.id).toBe(chordId)
    expect(result.current.selection?.type).toBe('chord')
    expect(result.current.selection?.beat).toBe(1)
  })

  it('select(null) clears selection', () => {
    const score = baseScore()
    const chordId = (score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.select(chordId))
    act(() => result.current.select(null))

    expect(result.current.selection).toBeNull()
  })
})

describe('useScore — updateChord', () => {
  it('updates chord symbol', () => {
    const score = baseScore()
    const chordId = (score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.updateChord(chordId, { symbol: 'G', root: 'G' }))

    const updated = result.current.score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>
    expect(updated.symbol).toBe('G')
    expect(updated.root).toBe('G')
  })

  it('does not mutate original score', () => {
    const score = baseScore()
    const chordId = (score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.updateChord(chordId, { symbol: 'G', root: 'G' }))

    expect((score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).symbol).toBe('C')
  })
})

describe('useScore — updateLyric', () => {
  it('updates lyric text', () => {
    const score = baseScore()
    const lyricId = (score.tracks[0].measures[0].events[1] as ReturnType<typeof createLyric>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.updateLyric(lyricId, { text: 'World' }))

    const updated = result.current.score.tracks[0].measures[0].events[1] as ReturnType<typeof createLyric>
    expect(updated.text).toBe('World')
  })
})

describe('useScore — addEvent / removeEvent', () => {
  it('addEvent appends to measure', () => {
    const score = baseScore()
    const measureId = score.tracks[0].measures[1].id
    const { result } = renderHook(() => useScore(score))
    const newChord = createChord({ beat: 1, duration: 'whole', symbol: 'Am', root: 'A', quality: 'minor' })

    act(() => result.current.addEvent(measureId, newChord))

    expect(result.current.score.tracks[0].measures[1].events).toHaveLength(1)
    expect((result.current.score.tracks[0].measures[1].events[0] as ReturnType<typeof createChord>).symbol).toBe('Am')
  })

  it('removeEvent deletes the event', () => {
    const score = baseScore()
    const chordId = (score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.removeEvent(chordId))

    const events = result.current.score.tracks[0].measures[0].events
    expect(events.find((e) => e.id === chordId)).toBeUndefined()
  })

  it('removeEvent clears selection if the removed event was selected', () => {
    const score = baseScore()
    const chordId = (score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.select(chordId))
    act(() => result.current.removeEvent(chordId))

    expect(result.current.selection).toBeNull()
  })
})

describe('useScore — moveEvent', () => {
  it('changes event beat', () => {
    const score = baseScore()
    const chordId = (score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.moveEvent(chordId, 3))

    const updated = result.current.score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>
    expect(updated.beat).toBe(3)
  })
})

describe('useScore — addMeasure / removeMeasure', () => {
  it('addMeasure appends to track', () => {
    const score = baseScore()
    const trackId = score.tracks[0].id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.addMeasure(trackId))

    expect(result.current.score.tracks[0].measures).toHaveLength(3)
  })

  it('addMeasure inserts after a given measure id', () => {
    const score = baseScore()
    const trackId = score.tracks[0].id
    const afterId = score.tracks[0].measures[0].id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.addMeasure(trackId, afterId))

    const measures = result.current.score.tracks[0].measures
    expect(measures).toHaveLength(3)
    expect(measures[1].number).toBe(2)
    expect(measures[2].number).toBe(3)
  })

  it('removeMeasure removes and renumbers', () => {
    const score = baseScore()
    const measureId = score.tracks[0].measures[0].id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.removeMeasure(measureId))

    const measures = result.current.score.tracks[0].measures
    expect(measures).toHaveLength(1)
    expect(measures[0].number).toBe(1)
  })
})

describe('useScore — addTrack / removeTrack', () => {
  it('addTrack appends a new empty track', () => {
    const { result } = renderHook(() => useScore(baseScore()))

    act(() => result.current.addTrack())

    expect(result.current.score.tracks).toHaveLength(2)
  })

  it('removeTrack removes the track', () => {
    const score = baseScore()
    const trackId = score.tracks[0].id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.removeTrack(trackId))

    expect(result.current.score.tracks).toHaveLength(0)
  })
})

describe('useScore — undo / redo', () => {
  it('undo reverts a mutation', () => {
    const score = baseScore()
    const chordId = (score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.updateChord(chordId, { symbol: 'G', root: 'G' }))
    expect((result.current.score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).symbol).toBe('G')
    expect(result.current.canUndo).toBe(true)

    act(() => result.current.undo())
    expect((result.current.score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).symbol).toBe('C')
    expect(result.current.canUndo).toBe(false)
  })

  it('redo re-applies after undo', () => {
    const score = baseScore()
    const chordId = (score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.updateChord(chordId, { symbol: 'G', root: 'G' }))
    act(() => result.current.undo())
    expect(result.current.canRedo).toBe(true)

    act(() => result.current.redo())
    expect((result.current.score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).symbol).toBe('G')
    expect(result.current.canRedo).toBe(false)
  })

  it('mutation after undo clears redo stack', () => {
    const score = baseScore()
    const chordId = (score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.updateChord(chordId, { symbol: 'G', root: 'G' }))
    act(() => result.current.undo())
    act(() => result.current.updateChord(chordId, { symbol: 'F', root: 'F' }))

    expect(result.current.canRedo).toBe(false)
  })

  it('undo does nothing when history is empty', () => {
    const score = baseScore()
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.undo())

    expect(result.current.score).toBe(score)
  })

  it('supports multiple undo steps', () => {
    const score = baseScore()
    const chordId = (score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).id
    const { result } = renderHook(() => useScore(score))

    act(() => result.current.updateChord(chordId, { symbol: 'G', root: 'G' }))
    act(() => result.current.updateChord(chordId, { symbol: 'F', root: 'F' }))
    act(() => result.current.undo())
    act(() => result.current.undo())

    expect((result.current.score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).symbol).toBe('C')
  })
})
