import React from 'react'
import type { TimeSignature as TimeSignatureType } from '../../../types'
import { timeSigGlyph } from '../../../utils/smufl'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimeSignatureProps extends React.SVGAttributes<SVGGElement> {
  timeSignature: TimeSignatureType
  /** X position of the time signature (centered on this x) */
  x: number
  /** Y coordinate of the top staff line */
  staffTop: number
  /** Staff space in pixels */
  staffSpace: number
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Renders a time signature as two stacked SMuFL digit glyphs centred on `x`.
 * The numerator sits in the upper half of the staff; denominator in the lower.
 */
export const TimeSignature = React.forwardRef<SVGGElement, TimeSignatureProps>(
  ({ timeSignature, x, staffTop, staffSpace, className, ...rest }, ref) => {
    const fontSize = staffSpace * 4
    const classes = ['notation-time-signature', className].filter(Boolean).join(' ')

    // Staff spans 4*sp; each number occupies 2*sp (upper / lower half)
    const numeratorY = staffTop + staffSpace * 2
    const denominatorY = staffTop + staffSpace * 4

    return (
      <g ref={ref} className={classes} {...rest}>
        {/* Numerator */}
        <text
          x={x}
          y={numeratorY}
          fontSize={fontSize}
          fontFamily="var(--notation-music-font-family, Bravura, serif)"
          fill="var(--notation-note-color, currentColor)"
          textAnchor="middle"
        >
          {timeSigGlyph(timeSignature.beats)}
        </text>
        {/* Denominator */}
        <text
          x={x}
          y={denominatorY}
          fontSize={fontSize}
          fontFamily="var(--notation-music-font-family, Bravura, serif)"
          fill="var(--notation-note-color, currentColor)"
          textAnchor="middle"
        >
          {timeSigGlyph(timeSignature.value)}
        </text>
      </g>
    )
  }
)
TimeSignature.displayName = 'TimeSignature'
