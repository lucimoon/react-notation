import { describe, it, expectTypeOf } from 'vitest'
import type {
  MusicScore,
  Track,
  Measure,
  Note,
  Chord,
  Lyric,
  Rest,
  Event,
  Pitch,
  Duration,
  TimeSignature,
  KeySignature,
} from './index'

describe('Type shape checks', () => {
  it('MusicScore has required fields', () => {
    expectTypeOf<MusicScore>().toHaveProperty('id')
    expectTypeOf<MusicScore>().toHaveProperty('tracks')
    expectTypeOf<MusicScore>().toHaveProperty('timeSignature')
    expectTypeOf<MusicScore>().toHaveProperty('keySignature')
  })

  it('Track has measures', () => {
    expectTypeOf<Track>().toHaveProperty('measures')
    expectTypeOf<Track['measures']>().toEqualTypeOf<Measure[]>()
  })

  it('Measure has events', () => {
    expectTypeOf<Measure>().toHaveProperty('events')
    expectTypeOf<Measure['events']>().toEqualTypeOf<Event[]>()
  })

  it('Note has pitch and type discriminant', () => {
    expectTypeOf<Note['type']>().toEqualTypeOf<'note'>()
    expectTypeOf<Note>().toHaveProperty('pitch')
    expectTypeOf<Note['pitch']>().toEqualTypeOf<Pitch>()
  })

  it('Chord has symbol and type discriminant', () => {
    expectTypeOf<Chord['type']>().toEqualTypeOf<'chord'>()
    expectTypeOf<Chord>().toHaveProperty('symbol')
  })

  it('Lyric has text and type discriminant', () => {
    expectTypeOf<Lyric['type']>().toEqualTypeOf<'lyric'>()
    expectTypeOf<Lyric>().toHaveProperty('text')
  })

  it('Rest has type discriminant', () => {
    expectTypeOf<Rest['type']>().toEqualTypeOf<'rest'>()
  })

  it('Event is a discriminated union', () => {
    expectTypeOf<Event>().toEqualTypeOf<Note | Chord | Lyric | Rest>()
  })

  it('Duration is a string union', () => {
    expectTypeOf<Duration>().toEqualTypeOf<
      | 'whole'
      | 'half'
      | 'quarter'
      | 'eighth'
      | 'sixteenth'
      | 'whole-dotted'
      | 'half-dotted'
      | 'quarter-dotted'
      | 'eighth-dotted'
      | 'half-triplet'
      | 'quarter-triplet'
      | 'eighth-triplet'
    >()
  })

  it('TimeSignature has beats and value', () => {
    expectTypeOf<TimeSignature>().toEqualTypeOf<{ beats: number; value: number }>()
  })

  it('KeySignature has root and mode', () => {
    expectTypeOf<KeySignature['mode']>().toEqualTypeOf<'major' | 'minor'>()
  })
})
