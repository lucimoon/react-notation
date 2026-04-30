import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DotProps extends React.SVGAttributes<SVGCircleElement> {
  /** Center x */
  cx: number
  /** Center y */
  cy: number
  /** Dot radius (default: staffSpace * 0.18) */
  r?: number
  staffSpace: number
}

// ─── Component ───────────────────────────────────────────────────────────────

/** Augmentation dot rendered as a filled circle. */
export const Dot = React.forwardRef<SVGCircleElement, DotProps>(
  ({ cx, cy, r, staffSpace, className, ...rest }, ref) => {
    const radius = r ?? staffSpace * 0.18
    const classes = ['notation-dot', className].filter(Boolean).join(' ')

    return (
      <circle
        ref={ref}
        className={classes}
        cx={cx}
        cy={cy}
        r={radius}
        fill="var(--notation-note-color, currentColor)"
        {...rest}
      />
    )
  }
)
Dot.displayName = 'Dot'
