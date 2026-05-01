import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StemProps extends React.SVGAttributes<SVGLineElement> {
  /** X position of the stem */
  x: number
  /** Y start (notehead end) */
  y1: number
  /** Y end (free end) */
  y2: number
  staffSpace: number
}

// ─── Component ───────────────────────────────────────────────────────────────

/** A note stem: a thin vertical line. */
export const Stem = React.forwardRef<SVGLineElement, StemProps>(
  ({ x, y1, y2, staffSpace, className, ...rest }, ref) => {
    const strokeWidth = staffSpace * 0.12
    const classes = ['notation-stem', className].filter(Boolean).join(' ')

    return (
      <line
        ref={ref}
        className={classes}
        x1={x}
        y1={y1}
        x2={x}
        y2={y2}
        stroke="var(--notation-note-color, currentColor)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        {...rest}
      />
    )
  }
)
Stem.displayName = 'Stem'
