import React from 'react'
import type { KeySignature as KeySignatureType } from '../../../types'
import { trebleKeyAccidentals } from '../../../utils/staff'
import { GLYPH_ACCIDENTAL_SHARP, GLYPH_ACCIDENTAL_FLAT } from '../../../utils/smufl'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KeySignatureProps extends React.SVGAttributes<SVGGElement> {
  keySignature: KeySignatureType
  /** X position of the first accidental symbol */
  x: number
  /** Y coordinate of the bottom staff line */
  staffBottom: number
  /** Staff space in pixels */
  staffSpace: number
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Renders the accidental symbols for a key signature in treble clef.
 * Returns null for C major / A minor (no accidentals).
 */
export const KeySignature = React.forwardRef<SVGGElement, KeySignatureProps>(
  ({ keySignature, x, staffBottom, staffSpace, className, ...rest }, ref) => {
    const accidentals = trebleKeyAccidentals(keySignature)

    if (accidentals.length === 0) return null

    // Accidental glyphs are rendered at a reduced font size relative to noteheads
    const fontSize = staffSpace * 4
    // Horizontal spacing between accidental symbols (~0.7 sp each)
    const spacing = staffSpace * 0.8
    const classes = ['notation-key-signature', className].filter(Boolean).join(' ')

    return (
      <g ref={ref} className={classes} {...rest}>
        {accidentals.map((acc, i) => {
          const noteY = staffBottom - (acc.staffPos / 2) * staffSpace
          return (
            <text
              key={i}
              x={x + i * spacing}
              y={noteY}
              fontSize={fontSize}
              fontFamily="var(--notation-music-font-family, Bravura, serif)"
              fill="var(--notation-note-color, currentColor)"
            >
              {acc.alter === 1 ? GLYPH_ACCIDENTAL_SHARP : GLYPH_ACCIDENTAL_FLAT}
            </text>
          )
        })}
      </g>
    )
  }
)
KeySignature.displayName = 'KeySignature'

/**
 * Width occupied by a key signature (used for measure prefix layout).
 */
export function keySignatureWidth(keySignature: KeySignatureType, staffSpace: number): number {
  const count = trebleKeyAccidentals(keySignature).length
  return count === 0 ? 0 : count * staffSpace * 0.8 + staffSpace * 0.4
}
