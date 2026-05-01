import React from 'react'
import type { Duration } from '../../../types'
import {
  GLYPH_NOTEHEAD_BLACK,
  GLYPH_NOTEHEAD_HALF,
  GLYPH_NOTEHEAD_WHOLE,
  GLYPH_ACCIDENTAL_SHARP,
  GLYPH_ACCIDENTAL_FLAT,
  GLYPH_ACCIDENTAL_NATURAL,
} from '../../../utils/smufl'
import { isFilledNotehead, ledgerLinePositions, staffPositionToY } from '../../../utils/staff'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NoteHeadProps extends React.SVGAttributes<SVGGElement> {
  duration: Duration
  /** Staff position of this note (0 = bottom E4 line in treble clef) */
  staffPos: number
  /** X center of the notehead */
  x: number
  /** Y center of the notehead, derived from staffPos */
  y: number
  /** Staff space in pixels */
  staffSpace: number
  /** Accidental to show before this note (-1 flat, 0 natural, 1 sharp, undefined = none) */
  accidental?: -1 | 0 | 1
  /** Whether the note is tied from a previous note (suppresses accidental display) */
  tied?: boolean
  /** Width of the ledger line drawn through the notehead */
  ledgerLineWidth?: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function noteheadGlyph(duration: Duration): string {
  if (duration.startsWith('whole')) return GLYPH_NOTEHEAD_WHOLE
  if (duration.startsWith('half')) return GLYPH_NOTEHEAD_HALF
  return GLYPH_NOTEHEAD_BLACK
}

function accidentalGlyph(alter: -1 | 0 | 1): string {
  if (alter === 1) return GLYPH_ACCIDENTAL_SHARP
  if (alter === -1) return GLYPH_ACCIDENTAL_FLAT
  return GLYPH_ACCIDENTAL_NATURAL
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Renders a notehead at a given staff position, with optional ledger lines and
 * accidental. Does not render the stem — that is handled by `Stem`.
 */
export const NoteHead = React.forwardRef<SVGGElement, NoteHeadProps>(
  (
    {
      duration,
      staffPos,
      x,
      y,
      staffSpace,
      accidental,
      tied,
      ledgerLineWidth,
      className,
      ...rest
    },
    ref
  ) => {
    const fontSize = staffSpace * 4
    const filled = isFilledNotehead(duration)
    const glyph = noteheadGlyph(duration)
    const ledgerPositions = ledgerLinePositions(staffPos)
    const ledgerW = ledgerLineWidth ?? staffSpace * 1.4
    const lineStroke = staffSpace * 0.12
    const classes = ['notation-notehead', className].filter(Boolean).join(' ')

    // For SMuFL: notehead glyph is positioned so the optical center is at the
    // font baseline. We shift the text so the baseline aligns with `y`.
    // Note: Bravura noteheads have their center roughly at y=0 of the glyph
    // origin, so placing text y at noteY is approximately correct.
    // Small correction: filled notehead sits slightly above baseline (~0.05sp).
    const yAdj = filled ? y + staffSpace * 0.05 : y

    return (
      <g ref={ref} className={classes} {...rest}>
        {/* Ledger lines */}
        {ledgerPositions.map((lp) => {
          const ly = staffPositionToY(lp, staffSpace) + (y - staffPositionToY(staffPos, staffSpace))
          return (
            <line
              key={lp}
              x1={x - ledgerW / 2}
              y1={ly}
              x2={x + ledgerW / 2}
              y2={ly}
              stroke="var(--notation-staff-line-color, currentColor)"
              strokeWidth={lineStroke}
              shapeRendering="crispEdges"
            />
          )
        })}

        {/* Accidental */}
        {accidental !== undefined && !tied && (
          <text
            x={x - staffSpace * 1.1}
            y={yAdj}
            fontSize={fontSize}
            fontFamily="var(--notation-music-font-family, Bravura, serif)"
            fill="var(--notation-note-color, currentColor)"
          >
            {accidentalGlyph(accidental)}
          </text>
        )}

        {/* Notehead */}
        <text
          x={x}
          y={yAdj}
          fontSize={fontSize}
          fontFamily="var(--notation-music-font-family, Bravura, serif)"
          fill="var(--notation-note-color, currentColor)"
          textAnchor="middle"
        >
          {glyph}
        </text>
      </g>
    )
  }
)
NoteHead.displayName = 'NoteHead'
