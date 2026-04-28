import { describe, it, expect } from 'vitest'
import { transposeScore } from './transpose'
import { createScore, createTrack, createMeasure, createNote, createChord } from '../builders'

function simpleScore() {
  return createScore({
    tracks: [
      createTrack({
        measures: [
          createMeasure({
            number: 1,
            events: [
              createNote({ beat: 1, duration: 'quarter', pitch: { step: 'C', octave: 4 } }),
              createChord({ beat: 1, duration: 'whole', symbol: 'C', root: 'C' }),
            ],
          }),
        ],
      }),
    ],
  })
}

describe('transposeScore', () => {
  it('returns same reference when semitones is 0', () => {
    const score = simpleScore()
    expect(transposeScore(score, 0)).toBe(score)
  })

  it('does not mutate the original score', () => {
    const score = simpleScore()
    const transposed = transposeScore(score, 2)
    const origNote = score.tracks[0].measures[0].events[0]
    expect((origNote as ReturnType<typeof createNote>).pitch.step).toBe('C')
    expect(transposed).not.toBe(score)
  })

  it('transposes a note up by 2 semitones (C → D)', () => {
    const score = simpleScore()
    const transposed = transposeScore(score, 2)
    const note = transposed.tracks[0].measures[0].events[0] as ReturnType<typeof createNote>
    expect(note.pitch.step).toBe('D')
    expect(note.pitch.alter).toBe(0)
    expect(note.pitch.octave).toBe(4)
  })

  it('transposes a note up by 1 semitone (C → C#)', () => {
    const score = simpleScore()
    const transposed = transposeScore(score, 1)
    const note = transposed.tracks[0].measures[0].events[0] as ReturnType<typeof createNote>
    expect(note.pitch.step).toBe('C')
    expect(note.pitch.alter).toBe(1)
  })

  it('uses flats when preferFlats is true (C+1 → Db)', () => {
    const score = simpleScore()
    const transposed = transposeScore(score, 1, { preferFlats: true })
    const note = transposed.tracks[0].measures[0].events[0] as ReturnType<typeof createNote>
    expect(note.pitch.step).toBe('D')
    expect(note.pitch.alter).toBe(-1)
  })

  it('handles octave wrap (B4 + 2 → C#5)', () => {
    const score = createScore({
      tracks: [
        createTrack({
          measures: [
            createMeasure({
              number: 1,
              events: [
                createNote({ beat: 1, duration: 'quarter', pitch: { step: 'B', octave: 4 } }),
              ],
            }),
          ],
        }),
      ],
    })
    const transposed = transposeScore(score, 2)
    const note = transposed.tracks[0].measures[0].events[0] as ReturnType<typeof createNote>
    expect(note.pitch.step).toBe('C')
    expect(note.pitch.alter).toBe(1)
    expect(note.pitch.octave).toBe(5)
  })

  it('transposes chord root and symbol', () => {
    const score = simpleScore()
    const transposed = transposeScore(score, 2)
    const chord = transposed.tracks[0].measures[0].events[1] as ReturnType<typeof createChord>
    expect(chord.root).toBe('D')
    expect(chord.symbol).toBe('D')
  })

  it('preserves chord quality suffix after transposition', () => {
    const score = createScore({
      tracks: [
        createTrack({
          measures: [
            createMeasure({
              number: 1,
              events: [
                createChord({ beat: 1, duration: 'whole', symbol: 'Cmaj7', root: 'C', quality: 'maj7' }),
              ],
            }),
          ],
        }),
      ],
    })
    const transposed = transposeScore(score, 2)
    const chord = transposed.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>
    expect(chord.root).toBe('D')
    expect(chord.symbol).toBe('Dmaj7')
  })

  it('transposes slash chord bass note', () => {
    const score = createScore({
      tracks: [
        createTrack({
          measures: [
            createMeasure({
              number: 1,
              events: [
                createChord({ beat: 1, duration: 'whole', symbol: 'C/E', root: 'C', bass: 'E' }),
              ],
            }),
          ],
        }),
      ],
    })
    const transposed = transposeScore(score, 2)
    const chord = transposed.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>
    expect(chord.bass).toBe('F#')
    expect(chord.symbol).toBe('D/F#')
  })

  it('transposes down (C − 1 → B)', () => {
    const score = simpleScore()
    const transposed = transposeScore(score, -1)
    const note = transposed.tracks[0].measures[0].events[0] as ReturnType<typeof createNote>
    expect(note.pitch.step).toBe('B')
    expect(note.pitch.octave).toBe(3)
    const chord = transposed.tracks[0].measures[0].events[1] as ReturnType<typeof createChord>
    expect(chord.root).toBe('B')
  })

  it('transposes a full octave (12 semitones)', () => {
    const score = simpleScore()
    const transposed = transposeScore(score, 12)
    const note = transposed.tracks[0].measures[0].events[0] as ReturnType<typeof createNote>
    expect(note.pitch.step).toBe('C')
    expect(note.pitch.octave).toBe(5)
    const chord = transposed.tracks[0].measures[0].events[1] as ReturnType<typeof createChord>
    expect(chord.root).toBe('C')
  })
})
