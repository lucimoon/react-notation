import { describe, it, expect } from 'vitest'
import {
  createScore,
  createTrack,
  createMeasure,
  createNote,
  createChord,
  createLyric,
  createRest,
} from './index'

describe('createScore', () => {
  it('fills in defaults', () => {
    const score = createScore()
    expect(score.id).toBeTruthy()
    expect(score.tempo).toBe(120)
    expect(score.timeSignature).toEqual({ beats: 4, value: 4 })
    expect(score.keySignature).toEqual({ root: 'C', mode: 'major' })
    expect(score.tracks).toEqual([])
  })

  it('uses provided values', () => {
    const score = createScore({
      id: 'abc',
      title: 'Autumn Leaves',
      tempo: 160,
      timeSignature: { beats: 3, value: 4 },
      keySignature: { root: 'G', mode: 'minor' },
    })
    expect(score.id).toBe('abc')
    expect(score.title).toBe('Autumn Leaves')
    expect(score.tempo).toBe(160)
    expect(score.timeSignature).toEqual({ beats: 3, value: 4 })
    expect(score.keySignature).toEqual({ root: 'G', mode: 'minor' })
  })

  it('generates unique ids', () => {
    const a = createScore()
    const b = createScore()
    expect(a.id).not.toBe(b.id)
  })
})

describe('createTrack', () => {
  it('fills in defaults', () => {
    const track = createTrack()
    expect(track.id).toBeTruthy()
    expect(track.clef).toBe('treble')
    expect(track.measures).toEqual([])
  })

  it('uses provided values', () => {
    const track = createTrack({ name: 'Bass', clef: 'bass', strings: 4 })
    expect(track.name).toBe('Bass')
    expect(track.clef).toBe('bass')
    expect(track.strings).toBe(4)
  })
})

describe('createMeasure', () => {
  it('requires number', () => {
    const m = createMeasure({ number: 1 })
    expect(m.number).toBe(1)
    expect(m.events).toEqual([])
  })

  it('carries section label', () => {
    const m = createMeasure({ number: 1, section: 'Chorus' })
    expect(m.section).toBe('Chorus')
  })
})

describe('createNote', () => {
  it('sets type discriminant', () => {
    const note = createNote({ beat: 1, duration: 'quarter', pitch: { step: 'C', octave: 4 } })
    expect(note.type).toBe('note')
    expect(note.pitch).toEqual({ step: 'C', octave: 4 })
  })
})

describe('createChord', () => {
  it('sets type discriminant and defaults quality to major', () => {
    const chord = createChord({ beat: 1, duration: 'half', symbol: 'C', root: 'C' })
    expect(chord.type).toBe('chord')
    expect(chord.quality).toBe('major')
  })

  it('accepts explicit quality', () => {
    const chord = createChord({ beat: 1, duration: 'half', symbol: 'Am', root: 'A', quality: 'minor' })
    expect(chord.quality).toBe('minor')
  })
})

describe('createLyric', () => {
  it('sets type discriminant', () => {
    const lyric = createLyric({ beat: 1, duration: 'quarter', text: 'hel-' })
    expect(lyric.type).toBe('lyric')
    expect(lyric.text).toBe('hel-')
  })
})

describe('createRest', () => {
  it('sets type discriminant', () => {
    const rest = createRest({ beat: 1, duration: 'whole', full: true })
    expect(rest.type).toBe('rest')
    expect(rest.full).toBe(true)
  })
})

describe('builder composition', () => {
  it('builds a full score graph', () => {
    const score = createScore({
      title: 'Test',
      tracks: [
        createTrack({
          measures: [
            createMeasure({
              number: 1,
              events: [
                createChord({ beat: 1, duration: 'half', symbol: 'Cm7', root: 'C', quality: 'min7' }),
                createChord({ beat: 3, duration: 'half', symbol: 'F7', root: 'F', quality: 'dominant7' }),
              ],
            }),
          ],
        }),
      ],
    })

    expect(score.tracks).toHaveLength(1)
    expect(score.tracks[0].measures).toHaveLength(1)
    expect(score.tracks[0].measures[0].events).toHaveLength(2)
    expect((score.tracks[0].measures[0].events[0] as ReturnType<typeof createChord>).symbol).toBe('Cm7')
  })
})
