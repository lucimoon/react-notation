import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StaffProps extends React.SVGAttributes<SVGSVGElement> {
  /** Total SVG width in pixels */
  width: number
  /** Total SVG height in pixels */
  height: number
  /** Y coordinate of the topmost staff line, measured from SVG top */
  staffTop: number
  /** Pixel distance between adjacent staff lines (one staff space) */
  staffSpace: number
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Root SVG element for one staff row. Renders the five horizontal staff lines
 * and accepts children (clefs, notes, chords, etc.) as SVG content.
 */
export const Staff = React.forwardRef<SVGSVGElement, StaffProps>(
  ({ width, height, staffTop, staffSpace, children, className, ...rest }, ref) => {
    const classes = ['notation-staff', className].filter(Boolean).join(' ')

    return (
      <svg
        ref={ref}
        className={classes}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-label="Staff"
        {...rest}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <line
            key={i}
            x1={0}
            y1={staffTop + i * staffSpace}
            x2={width}
            y2={staffTop + i * staffSpace}
            stroke="var(--notation-staff-line-color, currentColor)"
            strokeWidth="var(--notation-staff-line-width, 1)"
            shapeRendering="crispEdges"
          />
        ))}
        {children}
      </svg>
    )
  }
)
Staff.displayName = 'Staff'
