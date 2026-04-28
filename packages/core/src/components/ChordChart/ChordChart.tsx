import React from 'react'
import type { MusicScore, Measure, Event, Chord, Barline } from '../../types'
import './ChordChart.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChordChartProps extends React.HTMLAttributes<HTMLDivElement> {
  score: MusicScore
  /**
   * Maximum measures per line before wrapping.
   * @default 4
   */
  measuresPerLine?: number
  /**
   * Start a new line when a measure has a `section` label.
   * @default true
   */
  breakAtSections?: boolean
  /**
   * Render slash notation (/ / / /) below chord symbols to indicate beats.
   * @default true
   */
  showSlashes?: boolean
  /** Show measure numbers. @default false */
  showMeasureNumbers?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function chordsInMeasure(events: Event[]): Chord[] {
  return events.filter((e): e is Chord => e.type === 'chord').sort((a, b) => a.beat - b.beat)
}

/** Compute beat slots occupied by each chord (used for slash count). */
function slotsForChords(chords: Chord[], totalBeats: number): { chord: Chord; beats: number }[] {
  if (chords.length === 0) return []
  return chords.map((chord, i) => {
    const nextBeat = chords[i + 1]?.beat ?? totalBeats + 1
    return { chord, beats: Math.max(1, Math.round(nextBeat - chord.beat)) }
  })
}

function toLines(
  measures: Measure[],
  measuresPerLine: number,
  breakAtSections: boolean
): Measure[][] {
  const lines: Measure[][] = []
  let current: Measure[] = []

  for (const measure of measures) {
    const startsSection = breakAtSections && !!measure.section && current.length > 0
    const lineIsFull = current.length >= measuresPerLine
    if (startsSection || lineIsFull) {
      lines.push(current)
      current = []
    }
    current.push(measure)
  }

  if (current.length > 0) lines.push(current)
  return lines
}

function lastBarline(measures: Measure[]): Barline | undefined {
  return measures[measures.length - 1]?.barline
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SlashRow({ chords, totalBeats }: { chords: Chord[]; totalBeats: number }) {
  if (chords.length === 0) {
    return (
      <div className="notation-chart-slash-row">
        {Array.from({ length: totalBeats }, (_, i) => (
          <span key={i} className="notation-chart-slash">/</span>
        ))}
      </div>
    )
  }

  const slots = slotsForChords(chords, totalBeats)
  return (
    <div className="notation-chart-slash-row">
      {slots.map(({ chord, beats }) =>
        Array.from({ length: beats }, (_, i) => (
          <span key={`${chord.id}-${i}`} className="notation-chart-slash">/</span>
        ))
      )}
    </div>
  )
}

function MeasureBlock({
  measure,
  totalBeats,
  showSlashes,
  showMeasureNumbers,
}: {
  measure: Measure
  totalBeats: number
  showSlashes: boolean
  showMeasureNumbers: boolean
}) {
  const chords = chordsInMeasure(measure.events)

  return (
    <div
      className="notation-chart-measure"
      data-measure={measure.number}
      data-barline={measure.barline ?? undefined}
    >
      {(showMeasureNumbers || measure.rehearsalMark) && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {showMeasureNumbers && (
            <span className="notation-chart-measure-number">{measure.number}</span>
          )}
          {measure.rehearsalMark && (
            <span className="notation-chart-rehearsal">{measure.rehearsalMark}</span>
          )}
        </div>
      )}

      <div className="notation-chart-chord-row">
        {chords.length > 0 ? (
          chords.map((chord) => (
            <span key={chord.id} className="notation-chart-chord">{chord.symbol}</span>
          ))
        ) : (
          <span className="notation-chart-chord">&nbsp;</span>
        )}
      </div>

      {showSlashes && <SlashRow chords={chords} totalBeats={totalBeats} />}
    </div>
  )
}

// ─── ChordChart ───────────────────────────────────────────────────────────────

export const ChordChart = React.forwardRef<HTMLDivElement, ChordChartProps>(
  (
    {
      score,
      measuresPerLine = 4,
      breakAtSections = true,
      showSlashes = true,
      showMeasureNumbers = false,
      className,
      ...rest
    },
    ref
  ) => {
    const track = score.tracks[0]
    const measures = track?.measures ?? []
    const totalBeats = score.timeSignature.beats
    const lines = toLines(measures, measuresPerLine, breakAtSections)

    return (
      <div
        ref={ref}
        className={['notation-chord-chart', className].filter(Boolean).join(' ')}
        {...rest}
      >
        {lines.map((lineMeasures, lineIdx) => {
          const firstMeasure = lineMeasures[0]
          const sectionLabel = breakAtSections && firstMeasure?.section ? firstMeasure.section : null
          const barline = lastBarline(lineMeasures)
          const finalBarlineAttr =
            barline === 'double' || barline === 'final' ? barline : undefined

          return (
            <React.Fragment key={lineIdx}>
              {sectionLabel && (
                <div className="notation-chart-section">{sectionLabel}</div>
              )}
              <div
                className="notation-chart-line"
                data-final-barline={finalBarlineAttr}
              >
                {lineMeasures.map((measure) => (
                  <MeasureBlock
                    key={measure.id}
                    measure={measure}
                    totalBeats={totalBeats}
                    showSlashes={showSlashes}
                    showMeasureNumbers={showMeasureNumbers}
                  />
                ))}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    )
  }
)
ChordChart.displayName = 'ChordChart'
