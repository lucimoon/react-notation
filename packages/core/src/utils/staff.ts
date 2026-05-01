import type { Duration, KeySignature, Note, Pitch, Step, TimeSignature } from '../types'

// ─── Staff position ───────────────────────────────────────────────────────────

/**
 * Map each diatonic step to its position index within an octave (C=0 … B=6).
 */
const STEP_INDEX: Record<Step, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
}

/**
 * Return the staff position of a pitch in treble clef.
 *
 * Position 0 = E4 (bottom line).
 * Each integer step = one half-space upward (i.e. one diatonic step).
 * Lines are at even positions: 0 (E4), 2 (G4), 4 (B4), 6 (D5), 8 (F5).
 * Spaces are at odd positions: 1 (F4), 3 (A4), 5 (C5), 7 (E5).
 *
 * Middle C (C4) = −2; one ledger line below.
 */
export function trebleStaffPosition(pitch: Pitch): number {
  // E4 is the reference: octave 4, step index 2
  return (pitch.octave - 4) * 7 + (STEP_INDEX[pitch.step] - 2)
}

/**
 * Return the staff position of a pitch in bass clef.
 *
 * Position 0 = G2 (bottom line).
 * Lines: 0 (G2), 2 (B2), 4 (D3), 6 (F3), 8 (A3).
 */
export function bassStaffPosition(pitch: Pitch): number {
  // G2 is the reference: octave 2, step index 4
  return (pitch.octave - 2) * 7 + (STEP_INDEX[pitch.step] - 4)
}

/**
 * Convert a staff position to a y coordinate relative to the **top** of the
 * five-line staff (y increases downward).
 *
 * @param pos   Staff position (0 = bottom line, 8 = top line).
 * @param sp    Staff space in pixels (distance between adjacent lines).
 */
export function staffPositionToY(pos: number, sp: number): number {
  // Bottom line is at y = 4*sp; top line at y = 0.
  return 4 * sp - (pos / 2) * sp
}

// ─── Stem direction ───────────────────────────────────────────────────────────

/**
 * Standard stem direction rule: notes on or above the middle line (B4,
 * position 4) get a downward stem; notes below get an upward stem.
 */
export function stemDirection(staffPos: number): 'up' | 'down' {
  return staffPos >= 4 ? 'down' : 'up'
}

// ─── Ledger lines ─────────────────────────────────────────────────────────────

/**
 * Return the staff positions at which ledger lines should be drawn for a note
 * at `staffPos`.  Empty array when the note is within (or adjacent to) the staff.
 *
 * - Below: positions −2, −4, … as needed.
 * - Above: positions 10, 12, … as needed.
 */
export function ledgerLinePositions(staffPos: number): number[] {
  const lines: number[] = []

  if (staffPos < -1) {
    // Nearest ledger line at or above staffPos (must be even)
    const lowest = staffPos % 2 === 0 ? staffPos : staffPos + 1
    for (let p = -2; p >= lowest; p -= 2) lines.push(p)
  } else if (staffPos > 9) {
    // Nearest ledger line at or below staffPos (must be even)
    const highest = staffPos % 2 === 0 ? staffPos : staffPos - 1
    for (let p = 10; p <= highest; p += 2) lines.push(p)
  }

  return lines
}

// ─── Duration helpers ─────────────────────────────────────────────────────────

/** True when the duration has an augmentation dot. */
export function isDotted(d: Duration): boolean {
  return d.includes('dotted')
}

/** True when the duration is a triplet. */
export function isTriplet(d: Duration): boolean {
  return d.includes('triplet')
}

/** True when the duration requires a filled (black) notehead. */
export function isFilledNotehead(d: Duration): boolean {
  return !d.startsWith('whole') && !d.startsWith('half')
}

/** True when the duration is beamable (eighth or shorter). */
export function isBeamable(d: Duration): boolean {
  return d.startsWith('eighth') || d.startsWith('sixteenth')
}

/** Number of flag/beam rows for a duration. */
export function flagCount(d: Duration): number {
  if (d.startsWith('sixteenth')) return 2
  if (d.startsWith('eighth')) return 1
  return 0
}

// ─── Beat grouping & beaming ──────────────────────────────────────────────────

/**
 * Group notes into beam groups according to the time signature.
 *
 * Strategy: notes at the same integer beat index (0-based) that are beamable
 * form a beam group.  A "group" with a single note gets individual flags;
 * groups with 2+ notes share a beam.
 *
 * Returns an array of arrays of Note objects.
 */
export function beamGroups(notes: Note[], timeSig: TimeSignature): Note[][] {
  void timeSig // reserved for future meter-aware grouping
  const buckets = new Map<number, Note[]>()

  for (const note of notes) {
    if (!isBeamable(note.duration)) continue
    // 0-based integer beat index
    const group = Math.floor(note.beat - 1)
    if (!buckets.has(group)) buckets.set(group, [])
    buckets.get(group)!.push(note)
  }

  return Array.from(buckets.values()).filter((g) => g.length >= 2)
}

// ─── Key signature ────────────────────────────────────────────────────────────

/**
 * Staff positions of sharps in treble clef (order: F C G D A E B).
 * Each entry is the staff position at which the sharp/flat symbol is drawn.
 */
const TREBLE_SHARP_POSITIONS = [8, 5, 9, 6, 3, 7, 4] as const
const TREBLE_FLAT_POSITIONS = [4, 7, 3, 6, 2, 5, 1] as const

/**
 * Map a major key root to accidental count (+n = n sharps, -n = n flats).
 */
const KEY_ACCIDENTAL_COUNT: Record<string, number> = {
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  'F#': 6,
  'C#': 7,
  F: -1,
  Bb: -2,
  Eb: -3,
  Ab: -4,
  Db: -5,
  Gb: -6,
  Cb: -7,
}

/**
 * Relative minor → major equivalents (same key signature).
 */
const MINOR_TO_MAJOR: Record<string, string> = {
  A: 'C',
  E: 'G',
  B: 'D',
  'F#': 'A',
  'C#': 'E',
  'G#': 'B',
  'D#': 'F#',
  'A#': 'C#',
  D: 'F',
  G: 'Bb',
  C: 'Eb',
  F: 'Ab',
  Bb: 'Db',
  Eb: 'Gb',
  Ab: 'Cb',
}

export interface KeyAccidental {
  /** Staff position of the accidental symbol */
  staffPos: number
  /** +1 = sharp, -1 = flat */
  alter: 1 | -1
}

/**
 * Return the list of accidental symbols to draw for a key signature in treble
 * clef, in display order (left to right).
 */
export function trebleKeyAccidentals(key: KeySignature): KeyAccidental[] {
  const majorRoot = key.mode === 'minor' ? (MINOR_TO_MAJOR[key.root] ?? 'C') : key.root
  const count = KEY_ACCIDENTAL_COUNT[majorRoot] ?? 0

  if (count === 0) return []

  if (count > 0) {
    return TREBLE_SHARP_POSITIONS.slice(0, count).map((staffPos) => ({
      staffPos,
      alter: 1,
    }))
  }

  return TREBLE_FLAT_POSITIONS.slice(0, -count).map((staffPos) => ({
    staffPos,
    alter: -1,
  }))
}
