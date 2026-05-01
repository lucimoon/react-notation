/**
 * SMuFL (Standard Music Font Layout) glyph codepoints for Bravura.
 * Characters are in the Unicode Private Use Area (U+E000–U+F8FF).
 *
 * Reference: https://w3c.github.io/smufl/latest/
 * Bravura: https://github.com/steinbergmedia/bravura
 */

// ─── Clefs ───────────────────────────────────────────────────────────────────

export const GLYPH_G_CLEF = '\uE050'
export const GLYPH_F_CLEF = '\uE062'

// ─── Noteheads ───────────────────────────────────────────────────────────────

/** Filled notehead — used for quarter notes and shorter */
export const GLYPH_NOTEHEAD_BLACK = '\uE0A4'
/** Open notehead — used for half notes */
export const GLYPH_NOTEHEAD_HALF = '\uE0A3'
/** Whole notehead */
export const GLYPH_NOTEHEAD_WHOLE = '\uE0A2'

// ─── Rests ───────────────────────────────────────────────────────────────────

export const GLYPH_REST_WHOLE = '\uE4E3'
export const GLYPH_REST_HALF = '\uE4E4'
export const GLYPH_REST_QUARTER = '\uE4E5'
export const GLYPH_REST_EIGHTH = '\uE4E6'
export const GLYPH_REST_SIXTEENTH = '\uE4E7'

// ─── Accidentals ─────────────────────────────────────────────────────────────

export const GLYPH_ACCIDENTAL_FLAT = '\uE260'
export const GLYPH_ACCIDENTAL_NATURAL = '\uE261'
export const GLYPH_ACCIDENTAL_SHARP = '\uE262'

// ─── Augmentation ────────────────────────────────────────────────────────────

export const GLYPH_AUGMENTATION_DOT = '\uE1E7'

// ─── Flags ───────────────────────────────────────────────────────────────────

export const GLYPH_FLAG_8TH_UP = '\uE240'
export const GLYPH_FLAG_8TH_DOWN = '\uE241'
export const GLYPH_FLAG_16TH_UP = '\uE242'
export const GLYPH_FLAG_16TH_DOWN = '\uE243'

// ─── Time signature digits ───────────────────────────────────────────────────

/** Time signature digits 0–9 (SMuFL: timeSig0–timeSig9) */
export const TIME_SIG_DIGITS: Record<number, string> = {
  0: '\uE080',
  1: '\uE081',
  2: '\uE082',
  3: '\uE083',
  4: '\uE084',
  5: '\uE085',
  6: '\uE086',
  7: '\uE087',
  8: '\uE088',
  9: '\uE089',
}

/** Return the SMuFL glyph character(s) for a time signature number (1–16). */
export function timeSigGlyph(n: number): string {
  return String(n)
    .split('')
    .map((d) => TIME_SIG_DIGITS[parseInt(d, 10)] ?? d)
    .join('')
}
