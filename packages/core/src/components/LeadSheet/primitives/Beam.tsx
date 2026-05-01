import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BeamProps extends React.SVGAttributes<SVGRectElement> {
  /** X of left stem */
  x1: number
  /** X of right stem */
  x2: number
  /** Y of beam at left side */
  y1: number
  /** Y of beam at right side */
  y2: number
  /** Beam thickness (default: staffSpace * 0.5) */
  thickness?: number
  staffSpace: number
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * A single beam bar drawn as a filled parallelogram between two stems.
 * Multiple `Beam` elements stacked vertically represent sixteenth-note beams.
 */
export const Beam = React.forwardRef<SVGPolygonElement, BeamProps>(
  ({ x1, x2, y1, y2, thickness, staffSpace, className, ...rest }, ref) => {
    const t = thickness ?? staffSpace * 0.5
    const classes = ['notation-beam', className].filter(Boolean).join(' ')

    // Four corners of the parallelogram (top-left, top-right, bottom-right, bottom-left)
    const points = [
      `${x1},${y1 - t / 2}`,
      `${x2},${y2 - t / 2}`,
      `${x2},${y2 + t / 2}`,
      `${x1},${y1 + t / 2}`,
    ].join(' ')

    return (
      <polygon
        ref={ref}
        className={classes}
        points={points}
        fill="var(--notation-note-color, currentColor)"
        {...(rest as React.SVGAttributes<SVGPolygonElement>)}
      />
    )
  }
)
Beam.displayName = 'Beam'
