import React from 'react'
import type { Chord } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChordDiagramProps extends React.SVGAttributes<SVGSVGElement> {
  /** The chord to diagram. Must have a `voicing` array. */
  chord: Chord
  /**
   * Number of strings. Overrides chord track context.
   * @default 6
   */
  strings?: number
  /**
   * Number of frets to display.
   * @default 4
   */
  frets?: number
  /**
   * Show the chord symbol as a label below the diagram.
   * @default true
   */
  showLabel?: boolean
  /**
   * Width of the SVG in pixels. Height is derived automatically.
   * @default 80
   */
  width?: number
}

// ─── Layout constants (all derived from `width`) ─────────────────────────────

function layout(width: number, strings: number, frets: number) {
  const pad = width * 0.12
  const gridWidth = width - pad * 2
  const stringSpacing = strings > 1 ? gridWidth / (strings - 1) : gridWidth
  const fretSpacing = stringSpacing * 1.15
  const gridHeight = fretSpacing * frets
  const nutHeight = width * 0.05
  const markerRadius = stringSpacing * 0.28
  const labelHeight = width * 0.22
  const topPad = pad * 1.1  // space above nut for open/muted markers
  const totalHeight = topPad + nutHeight + gridHeight + labelHeight + pad * 0.5

  return {
    pad,
    gridWidth,
    stringSpacing,
    fretSpacing,
    gridHeight,
    nutHeight,
    markerRadius,
    labelHeight,
    topPad,
    totalHeight,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Compute the starting fret for the diagram.
 * If all pressed frets are ≤ maxFrets, show from fret 1 (nut visible).
 * Otherwise start at the lowest pressed fret.
 */
function startingFret(voicing: number[], maxFrets: number): number {
  const pressed = voicing.filter((f) => f > 0)
  if (pressed.length === 0) return 1
  const min = Math.min(...pressed)
  const max = Math.max(...pressed)
  if (max <= maxFrets) return 1
  return min
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ChordDiagram = React.forwardRef<SVGSVGElement, ChordDiagramProps>(
  (
    {
      chord,
      strings = 6,
      frets = 4,
      showLabel = true,
      width = 80,
      className,
      ...rest
    },
    ref
  ) => {
    const voicing = chord.voicing ?? []
    const l = layout(width, strings, frets)
    const startFret = startingFret(voicing, frets)
    const showNut = startFret === 1

    const nutY = l.topPad
    const gridTop = nutY + l.nutHeight
    const labelY = gridTop + l.gridHeight + l.pad * 0.6

    // x position for string i (0 = lowest/leftmost)
    const sx = (i: number) => l.pad + i * l.stringSpacing
    // y position for fret f (1-based, relative to startFret)
    const fy = (f: number) => gridTop + (f - startFret + 0.5) * l.fretSpacing

    const classes = ['notation-chord-diagram', className].filter(Boolean).join(' ')

    return (
      <svg
        ref={ref}
        className={classes}
        viewBox={`0 0 ${width} ${l.totalHeight}`}
        width={width}
        height={l.totalHeight}
        aria-label={`${chord.symbol} chord diagram`}
        role="img"
        {...rest}
      >
        {/* ── Nut or position indicator ── */}
        {showNut ? (
          <rect
            x={l.pad}
            y={nutY}
            width={l.gridWidth}
            height={l.nutHeight}
            fill="var(--notation-diagram-nut-color, currentColor)"
            rx={l.nutHeight * 0.2}
          />
        ) : (
          <text
            x={l.pad + l.gridWidth + l.pad * 0.35}
            y={gridTop + l.fretSpacing * 0.65}
            fontSize={l.pad * 0.85}
            fill="var(--notation-diagram-text-color, currentColor)"
            dominantBaseline="middle"
            fontFamily="var(--notation-font-family, Georgia, serif)"
          >
            {startFret}
          </text>
        )}

        {/* ── Fret lines ── */}
        {Array.from({ length: frets + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={l.pad}
            y1={gridTop + i * l.fretSpacing}
            x2={l.pad + l.gridWidth}
            y2={gridTop + i * l.fretSpacing}
            stroke="var(--notation-diagram-grid-color, currentColor)"
            strokeWidth={i === 0 && showNut ? 0.5 : 0.75}
            opacity={i === 0 && showNut ? 0.3 : 0.6}
          />
        ))}

        {/* ── String lines ── */}
        {Array.from({ length: strings }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={sx(i)}
            y1={gridTop}
            x2={sx(i)}
            y2={gridTop + l.gridHeight}
            stroke="var(--notation-diagram-grid-color, currentColor)"
            strokeWidth={0.75}
            opacity={0.6}
          />
        ))}

        {/* ── Open / muted markers above nut ── */}
        {voicing.map((fret, i) => {
          if (fret === 0) {
            // Open string: circle
            return (
              <circle
                key={`open-${i}`}
                cx={sx(i)}
                cy={nutY - l.markerRadius * 0.9}
                r={l.markerRadius * 0.75}
                fill="none"
                stroke="var(--notation-diagram-marker-color, currentColor)"
                strokeWidth={0.9}
              />
            )
          }
          if (fret === -1) {
            // Muted: X
            const cx = sx(i)
            const cy = nutY - l.markerRadius * 0.9
            const d = l.markerRadius * 0.55
            return (
              <g key={`mute-${i}`}>
                <line
                  x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d}
                  stroke="var(--notation-diagram-marker-color, currentColor)"
                  strokeWidth={0.9}
                  strokeLinecap="round"
                />
                <line
                  x1={cx + d} y1={cy - d} x2={cx - d} y2={cy + d}
                  stroke="var(--notation-diagram-marker-color, currentColor)"
                  strokeWidth={0.9}
                  strokeLinecap="round"
                />
              </g>
            )
          }
          return null
        })}

        {/* ── Finger dots ── */}
        {voicing.map((fret, i) => {
          if (fret <= 0) return null
          return (
            <circle
              key={`dot-${i}-${fret}`}
              cx={sx(i)}
              cy={fy(fret)}
              r={l.markerRadius}
              fill="var(--notation-diagram-dot-color, currentColor)"
            />
          )
        })}

        {/* ── Chord label ── */}
        {showLabel && (
          <text
            x={width / 2}
            y={labelY}
            fontSize={l.pad * 0.95}
            fill="var(--notation-color-chord, currentColor)"
            fontFamily="var(--notation-font-family, Georgia, serif)"
            fontWeight="var(--notation-font-weight-chord, 600)"
            textAnchor="middle"
            dominantBaseline="hanging"
          >
            {chord.symbol}
          </text>
        )}
      </svg>
    )
  }
)
ChordDiagram.displayName = 'ChordDiagram'
