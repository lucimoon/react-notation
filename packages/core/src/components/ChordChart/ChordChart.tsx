import React, { useCallback } from 'react'
import type { MusicScore, Measure, Event, Chord, Barline, ScoreEditor, Selection } from '../../types'
import './ChordChart.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChordChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
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
  /**
   * Pass a ScoreEditor (from useScore) to activate interactive mode.
   * Enables selection and `data-notation-*` attributes on chord elements.
   */
  editor?: ScoreEditor
  /** Fired when a chord or measure is selected. */
  onSelect?: (selection: Selection) => void
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
  editor,
  selectedId,
  trackId,
  onSelect,
}: {
  measure: Measure
  totalBeats: number
  showSlashes: boolean
  showMeasureNumbers: boolean
  editor?: ScoreEditor
  selectedId: string | null
  trackId: string
  onSelect?: ChordChartProps['onSelect']
}) {
  const chords = chordsInMeasure(measure.events)
  const interactive = !!editor

  const handleChordFocus = useCallback((chord: Chord) => {
    if (!interactive) return
    editor!.select(chord.id)
    onSelect?.({ type: 'chord', id: chord.id, measureId: measure.id, trackId, beat: chord.beat })
  }, [interactive, editor, onSelect, measure.id, trackId])

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
            <span
              key={chord.id}
              className="notation-chart-chord"
              tabIndex={interactive ? (chord.id === selectedId ? 0 : -1) : undefined}
              role={interactive ? 'button' : undefined}
              aria-selected={interactive ? chord.id === selectedId : undefined}
              data-notation-id={interactive ? chord.id : undefined}
              data-notation-type={interactive ? 'chord' : undefined}
              data-notation-selected={interactive && chord.id === selectedId ? '' : undefined}
              onFocus={interactive ? () => handleChordFocus(chord) : undefined}
            >
              {chord.symbol}
            </span>
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
      editor,
      onSelect,
      className,
      ...rest
    },
    ref
  ) => {
    const track = score.tracks[0]
    const measures = track?.measures ?? []
    const totalBeats = score.timeSignature.beats
    const lines = toLines(measures, measuresPerLine, breakAtSections)
    const selectedId = editor?.selection?.id ?? null
    const trackId = track?.id ?? ''

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
                    editor={editor}
                    selectedId={selectedId}
                    trackId={trackId}
                    onSelect={onSelect}
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
