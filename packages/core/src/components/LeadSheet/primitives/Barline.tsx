import React from 'react'
import type { Barline as BarlineType } from '../../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BarlineProps extends React.SVGAttributes<SVGGElement> {
  type?: BarlineType
  /** X position of the barline */
  x: number
  /** Y of the top staff line */
  staffTop: number
  /** Y of the bottom staff line */
  staffBottom: number
  staffSpace: number
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Renders a barline: single, double, final, repeat-start, or repeat-end.
 */
export const Barline = React.forwardRef<SVGGElement, BarlineProps>(
  ({ type = 'single', x, staffTop, staffBottom, staffSpace, className, ...rest }, ref) => {
    const thin = staffSpace * 0.12
    const thick = staffSpace * 0.6
    const dotR = staffSpace * 0.2
    const dotXOffset = staffSpace * 0.6
    const dotY1 = staffTop + staffSpace * 1.5
    const dotY2 = staffTop + staffSpace * 2.5
    const classes = ['notation-barline', className].filter(Boolean).join(' ')

    const thinLine = (lx: number) => (
      <line
        x1={lx}
        y1={staffTop}
        x2={lx}
        y2={staffBottom}
        stroke="var(--notation-staff-line-color, currentColor)"
        strokeWidth={thin}
      />
    )

    const thickLine = (lx: number) => (
      <rect
        x={lx - thick / 2}
        y={staffTop}
        width={thick}
        height={staffBottom - staffTop}
        fill="var(--notation-staff-line-color, currentColor)"
      />
    )

    const dots = (side: 'left' | 'right') => {
      const dx = side === 'right' ? x + dotXOffset : x - dotXOffset
      return (
        <>
          <circle cx={dx} cy={dotY1} r={dotR} fill="var(--notation-note-color, currentColor)" />
          <circle cx={dx} cy={dotY2} r={dotR} fill="var(--notation-note-color, currentColor)" />
        </>
      )
    }

    let content: React.ReactNode

    switch (type) {
      case 'double':
        content = (
          <>
            {thinLine(x - thin)}
            {thinLine(x + thin)}
          </>
        )
        break
      case 'final':
        content = (
          <>
            {thinLine(x - thick / 2 - thin)}
            {thickLine(x)}
          </>
        )
        break
      case 'repeat-end':
        content = (
          <>
            {dots('left')}
            {thinLine(x - thick / 2 - thin * 2)}
            {thickLine(x)}
          </>
        )
        break
      case 'repeat-start':
        content = (
          <>
            {thickLine(x)}
            {thinLine(x + thick / 2 + thin * 2)}
            {dots('right')}
          </>
        )
        break
      default:
        content = thinLine(x)
    }

    return (
      <g ref={ref} className={classes} {...rest}>
        {content}
      </g>
    )
  }
)
Barline.displayName = 'Barline'
