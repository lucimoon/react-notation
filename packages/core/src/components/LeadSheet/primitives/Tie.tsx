import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TieProps extends React.SVGAttributes<SVGPathElement> {
  /** X of the start notehead center */
  x1: number
  /** X of the end notehead center */
  x2: number
  /** Y of both noteheads (ties connect same-pitch notes) */
  y: number
  /** Direction the tie curves ('up' = above notes, 'down' = below) */
  direction?: 'up' | 'down'
  staffSpace: number
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * A curved tie arc drawn as an SVG cubic bezier between two noteheads.
 * Uses `direction` to determine which way the arc bows.
 */
export const Tie = React.forwardRef<SVGPathElement, TieProps>(
  ({ x1, x2, y, direction = 'up', staffSpace, className, ...rest }, ref) => {
    const classes = ['notation-tie', className].filter(Boolean).join(' ')

    // Arc height scales with the span but caps at ~2 staff spaces
    const span = x2 - x1
    const arcHeight = Math.min(span * 0.25, staffSpace * 2)
    const sign = direction === 'up' ? -1 : 1

    // Offset tie ends slightly inward from notehead centres
    const inset = staffSpace * 0.4
    const startX = x1 + inset
    const endX = x2 - inset
    const midX = (startX + endX) / 2
    const ctrlY = y + sign * arcHeight

    const d = `M ${startX} ${y} C ${midX} ${ctrlY}, ${midX} ${ctrlY}, ${endX} ${y}`

    return (
      <path
        ref={ref}
        className={classes}
        d={d}
        fill="none"
        stroke="var(--notation-note-color, currentColor)"
        strokeWidth={staffSpace * 0.12}
        {...rest}
      />
    )
  }
)
Tie.displayName = 'Tie'
