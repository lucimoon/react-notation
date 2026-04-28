import type { MusicScore, Track, Measure, Event, Note, Chord, Pitch, Step } from '../types'

// ─── Chromatic tables ─────────────────────────────────────────────────────────

const SHARPS: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLATS: string[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const STEP_TO_SEMITONE: Record<Step, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
}

const SEMITONE_TO_STEP_SHARP: Record<number, { step: Step; alter: -1 | 0 | 1 }> = {
  0:  { step: 'C', alter: 0 },
  1:  { step: 'C', alter: 1 },
  2:  { step: 'D', alter: 0 },
  3:  { step: 'D', alter: 1 },
  4:  { step: 'E', alter: 0 },
  5:  { step: 'F', alter: 0 },
  6:  { step: 'F', alter: 1 },
  7:  { step: 'G', alter: 0 },
  8:  { step: 'G', alter: 1 },
  9:  { step: 'A', alter: 0 },
  10: { step: 'A', alter: 1 },
  11: { step: 'B', alter: 0 },
}

const SEMITONE_TO_STEP_FLAT: Record<number, { step: Step; alter: -1 | 0 | 1 }> = {
  0:  { step: 'C', alter: 0 },
  1:  { step: 'D', alter: -1 },
  2:  { step: 'D', alter: 0 },
  3:  { step: 'E', alter: -1 },
  4:  { step: 'E', alter: 0 },
  5:  { step: 'F', alter: 0 },
  6:  { step: 'G', alter: -1 },
  7:  { step: 'G', alter: 0 },
  8:  { step: 'A', alter: -1 },
  9:  { step: 'A', alter: 0 },
  10: { step: 'B', alter: -1 },
  11: { step: 'B', alter: 0 },
}

function mod12(n: number): number {
  return ((n % 12) + 12) % 12
}

// ─── Pitch transposition ─────────────────────────────────────────────────────

function transposePitch(pitch: Pitch, semitones: number, preferFlats: boolean): Pitch {
  const base = STEP_TO_SEMITONE[pitch.step] + (pitch.alter ?? 0)
  const transposed = mod12(base + semitones)
  const octaveDelta = Math.floor((base + semitones) / 12)
  const table = preferFlats ? SEMITONE_TO_STEP_FLAT : SEMITONE_TO_STEP_SHARP
  const { step, alter } = table[transposed]
  return { step, octave: pitch.octave + octaveDelta, alter }
}

// ─── Chord root / symbol transposition ───────────────────────────────────────

/**
 * Parse a note name like "C", "F#", "Bb" into a chromatic index (0–11).
 * Returns -1 if unrecognised.
 */
function parseRoot(root: string): number {
  const idx = SHARPS.indexOf(root)
  if (idx !== -1) return idx
  return FLATS.indexOf(root)
}

/**
 * Given an existing chord symbol string and its root, replace the root
 * prefix with a new root while preserving the quality suffix.
 *
 * e.g. replaceRoot("Cmaj7", "C", "D") → "Dmaj7"
 *      replaceRoot("F#m7b5", "F#", "G#") → "G#m7b5"
 */
function replaceRoot(symbol: string, oldRoot: string, newRoot: string): string {
  if (symbol.startsWith(oldRoot)) {
    return newRoot + symbol.slice(oldRoot.length)
  }
  return symbol
}

function transposeRoot(root: string, semitones: number, preferFlats: boolean): string {
  const idx = parseRoot(root)
  if (idx === -1) return root // unrecognised — leave unchanged
  const newIdx = mod12(idx + semitones)
  return preferFlats ? FLATS[newIdx] : SHARPS[newIdx]
}

// ─── Event transposition ─────────────────────────────────────────────────────

function transposeEvent(event: Event, semitones: number, preferFlats: boolean): Event {
  if (event.type === 'note') {
    const note = event as Note
    return { ...note, pitch: transposePitch(note.pitch, semitones, preferFlats) }
  }

  if (event.type === 'chord') {
    const chord = event as Chord
    const newRoot = transposeRoot(chord.root, semitones, preferFlats)
    const newBass = chord.bass ? transposeRoot(chord.bass, semitones, preferFlats) : undefined
    const newSymbol = replaceRoot(chord.symbol, chord.root, newRoot)
    const finalSymbol = newBass ? `${newSymbol.split('/')[0]}/${newBass}` : newSymbol
    return { ...chord, root: newRoot, bass: newBass, symbol: finalSymbol }
  }

  return event
}

function transposeMeasure(measure: Measure, semitones: number, preferFlats: boolean): Measure {
  return {
    ...measure,
    events: measure.events.map((e) => transposeEvent(e, semitones, preferFlats)),
  }
}

function transposeTrack(track: Track, semitones: number, preferFlats: boolean): Track {
  return {
    ...track,
    measures: track.measures.map((m) => transposeMeasure(m, semitones, preferFlats)),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface TransposeOptions {
  /** Prefer flat spellings for transposed roots and pitches. Default false (use sharps). */
  preferFlats?: boolean
}

/**
 * Return a new MusicScore with all Note pitches and Chord roots/symbols
 * transposed by `semitones`. Positive = up, negative = down.
 * Does not mutate the input.
 */
export function transposeScore(
  score: MusicScore,
  semitones: number,
  options: TransposeOptions = {}
): MusicScore {
  if (semitones === 0) return score
  const preferFlats = options.preferFlats ?? false
  return {
    ...score,
    tracks: score.tracks.map((t) => transposeTrack(t, semitones, preferFlats)),
  }
}
