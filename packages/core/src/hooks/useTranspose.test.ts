import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTranspose } from './useTranspose'
import { createScore, createTrack, createMeasure, createChord } from '../builders'

function scoreWithChord(symbol: string, root: string) {
  return createScore({
    tracks: [
      createTrack({
        measures: [
          createMeasure({
            number: 1,
            events: [createChord({ beat: 1, duration: 'whole', symbol, root })],
          }),
        ],
      }),
    ],
  })
}

describe('useTranspose', () => {
  it('returns original reference when semitones is 0', () => {
    const score = scoreWithChord('C', 'C')
    const { result } = renderHook(() => useTranspose(score, 0))
    expect(result.current).toBe(score)
  })

  it('transposes chords', () => {
    const score = scoreWithChord('C', 'C')
    const { result } = renderHook(() => useTranspose(score, 2))
    const chord = result.current.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>
    expect(chord.root).toBe('D')
  })

  it('respects preferFlats option', () => {
    const score = scoreWithChord('C', 'C')
    const { result } = renderHook(() => useTranspose(score, 1, { preferFlats: true }))
    const chord = result.current.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>
    expect(chord.root).toBe('Db')
  })

  it('returns a stable reference when inputs do not change', () => {
    const score = scoreWithChord('C', 'C')
    const { result, rerender } = renderHook(() => useTranspose(score, 2))
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})
