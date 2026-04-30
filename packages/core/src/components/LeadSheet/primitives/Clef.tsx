import React from 'react'
import { GLYPH_G_CLEF, GLYPH_F_CLEF } from '../../../utils/smufl'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClefProps extends React.SVGAttributes<SVGGElement> {
  /**
   * Clef type. Only 'treble' and 'bass' are supported.
   * @default 'treble'
   */
  type?: 'treble' | 'bass'
  /** X position (left edge of the clef glyph) */
  x: number
  /** Y coordinate of the bottom staff line */
  staffBottom: number
  /** Staff space in pixels */
  staffSpace: number
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Renders a treble or bass clef glyph using the Bravura SMuFL font.
 *
 * For the treble clef the text is positioned at the G line (second line from
 * bottom) — Bravura's G-clef origin is at that reference line.
 *
 * For the bass clef the text is positioned at the F line (fourth line from
 * bottom = second from top).
 */
export const Clef = React.forwardRef<SVGGElement, ClefProps>(
  ({ type = 'treble', x, staffBottom, staffSpace, className, ...rest }, ref) => {
    const fontSize = staffSpace * 4
    const classes = ['notation-clef', className].filter(Boolean).join(' ')

    // Treble: origin is the G line (2nd line = position 2 → y = staffBottom - staffSpace)
    // Bass: origin is the F line (4th line = position 6 → y = staffBottom - 3*staffSpace)
    const glyphY =
      type === 'treble' ? staffBottom - staffSpace : staffBottom - 3 * staffSpace

    return (
      <g ref={ref} className={classes} {...rest}>
        <text
          x={x}
          y={glyphY}
          fontSize={fontSize}
          fontFamily="var(--notation-music-font-family, Bravura, serif)"
          fill="var(--notation-note-color, currentColor)"
        >
          {type === 'treble' ? GLYPH_G_CLEF : GLYPH_F_CLEF}
        </text>
      </g>
    )
  }
)
Clef.displayName = 'Clef'
