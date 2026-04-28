import React from 'react'
import type { MusicScore, Measure, Event, Chord, Lyric } from '../../types'
import './ChordSheet.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChordSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  score: MusicScore
  /**
   * Maximum number of measures to show on a single line before wrapping.
   * @default 4
   */
  measuresPerLine?: number
  /**
   * When true, a new line begins whenever a measure carries a `section` label.
   * @default true
   */
  breakAtSections?: boolean
  /** Show measure numbers above each bar. @default false */
  showMeasureNumbers?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface BeatColumn {
  beat: number
  chord: Chord | null
  lyric: Lyric | null
}

/** Group Chord and Lyric events within a measure into beat-keyed columns. */
function toBeatColumns(events: Event[]): BeatColumn[] {
  const map = new Map<number, BeatColumn>()

  for (const event of events) {
    if (event.type !== 'chord' && event.type !== 'lyric') continue
    if (!map.has(event.beat)) {
      map.set(event.beat, { beat: event.beat, chord: null, lyric: null })
    }
    const col = map.get(event.beat)!
    if (event.type === 'chord') col.chord = event as Chord
    if (event.type === 'lyric') col.lyric = event as Lyric
  }

  return Array.from(map.values()).sort((a, b) => a.beat - b.beat)
}

/** Split a flat measure list into visual lines, respecting measuresPerLine and section breaks. */
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Beat({ col }: { col: BeatColumn }) {
  return (
    <div className="notation-beat">
      <span className="notation-beat-chord">{col.chord?.symbol ?? '\u00A0'}</span>
      <span className="notation-beat-lyric">{col.lyric?.text ?? '\u00A0'}</span>
    </div>
  )
}

function MeasureBlock({
  measure,
  showMeasureNumbers,
}: {
  measure: Measure
  showMeasureNumbers: boolean
}) {
  const columns = toBeatColumns(measure.events)

  return (
    <div className="notation-measure" data-measure={measure.number}>
      {showMeasureNumbers && (
        <span className="notation-measure-number">{measure.number}</span>
      )}
      <div className="notation-beat-row">
        {columns.length > 0 ? (
          columns.map((col) => <Beat key={col.beat} col={col} />)
        ) : (
          // Empty measure — render a single blank beat column so the bar still shows
          <div className="notation-beat">
            <span className="notation-beat-chord">&nbsp;</span>
            <span className="notation-beat-lyric">&nbsp;</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ChordSheet ───────────────────────────────────────────────────────────────

export const ChordSheet = React.forwardRef<HTMLDivElement, ChordSheetProps>(
  (
    {
      score,
      measuresPerLine = 4,
      breakAtSections = true,
      showMeasureNumbers = false,
      className,
      ...rest
    },
    ref
  ) => {
    // ChordSheet only uses the first track for now
    const track = score.tracks[0]
    const measures = track?.measures ?? []
    const lines = toLines(measures, measuresPerLine, breakAtSections)

    return (
      <div
        ref={ref}
        className={['notation-chord-sheet', className].filter(Boolean).join(' ')}
        {...rest}
      >
        {lines.map((lineMeasures, lineIdx) => {
          const firstMeasure = lineMeasures[0]
          const sectionLabel =
            breakAtSections && firstMeasure?.section ? firstMeasure.section : null

          return (
            <React.Fragment key={lineIdx}>
              {sectionLabel && (
                <div className="notation-section-label">{sectionLabel}</div>
              )}
              <div className="notation-chord-line">
                {lineMeasures.map((measure) => (
                  <MeasureBlock
                    key={measure.id}
                    measure={measure}
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
ChordSheet.displayName = 'ChordSheet'
