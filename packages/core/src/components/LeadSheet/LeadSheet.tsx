import React, { useCallback, useEffect, useRef, useState } from 'react'
import type {
  MusicScore,
  Measure,
  Note,
  Chord,
  Lyric,
  Rest,
  Selection,
  ScoreEditor,
  TimeSignature as TimeSignatureType,
  KeySignature as KeySignatureType,
} from '../../types'
import {
  trebleStaffPosition,
  staffPositionToY,
  stemDirection,
  beamGroups,
  isDotted,
  flagCount,
} from '../../utils/staff'
import {
  GLYPH_REST_WHOLE,
  GLYPH_REST_HALF,
  GLYPH_REST_QUARTER,
  GLYPH_REST_EIGHTH,
  GLYPH_REST_SIXTEENTH,
  GLYPH_FLAG_8TH_UP,
  GLYPH_FLAG_8TH_DOWN,
  GLYPH_FLAG_16TH_UP,
  GLYPH_FLAG_16TH_DOWN,
} from '../../utils/smufl'
import { Staff } from './primitives/Staff'
import { Clef } from './primitives/Clef'
import { KeySignature, keySignatureWidth } from './primitives/KeySignature'
import { TimeSignature } from './primitives/TimeSignature'
import { NoteHead } from './primitives/NoteHead'
import { Stem } from './primitives/Stem'
import { Beam } from './primitives/Beam'
import { Tie } from './primitives/Tie'
import { Dot } from './primitives/Dot'
import { Barline } from './primitives/Barline'
import './LeadSheet.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeadSheetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  score: MusicScore
  /**
   * Index of the track to render (must be treble or bass clef).
   * @default 0
   */
  trackIndex?: number
  /**
   * Maximum number of measures per line before wrapping.
   * @default 4
   */
  measuresPerLine?: number
  /**
   * Start a new line when a measure has a `section` label.
   * @default true
   */
  breakAtSections?: boolean
  /**
   * Staff space in pixels — the distance between adjacent staff lines.
   * @default 10
   */
  staffSpace?: number
  /** Show chord symbols above the staff. @default true */
  showChords?: boolean
  /** Show lyrics below the staff. @default true */
  showLyrics?: boolean
  /** Show score title. @default true */
  showTitle?: boolean
  /** Show measure numbers. @default false */
  showMeasureNumbers?: boolean
  /**
   * Pass a ScoreEditor (from useScore) to enable selection mode.
   * Notes, chords, and rests receive data-notation-* attributes and are focusable.
   */
  editor?: ScoreEditor
  /** Fired when an element is selected. */
  onSelect?: (selection: Selection) => void
}

// ─── Layout constants ─────────────────────────────────────────────────────────

const CLEF_WIDTH_FACTOR = 2.2     // multiples of staffSpace
const TIME_SIG_WIDTH_FACTOR = 2   // multiples of staffSpace
const STEM_LENGTH_FACTOR = 3.5    // multiples of staffSpace
const LEDGER_W_FACTOR = 2.8       // total ledger line width (multiples of staffSpace)

// ─── Internal helpers ─────────────────────────────────────────────────────────

function toLines(
  measures: Measure[],
  measuresPerLine: number,
  breakAtSections: boolean
): Measure[][] {
  const lines: Measure[][] = []
  let current: Measure[] = []
  for (const measure of measures) {
    if (
      (breakAtSections && measure.section && current.length > 0) ||
      current.length >= measuresPerLine
    ) {
      lines.push(current)
      current = []
    }
    current.push(measure)
  }
  if (current.length > 0) lines.push(current)
  return lines
}

function restGlyph(duration: string): string {
  if (duration.startsWith('whole')) return GLYPH_REST_WHOLE
  if (duration.startsWith('half')) return GLYPH_REST_HALF
  if (duration.startsWith('eighth')) return GLYPH_REST_EIGHTH
  if (duration.startsWith('sixteenth')) return GLYPH_REST_SIXTEENTH
  return GLYPH_REST_QUARTER
}

function flagGlyph(duration: string, dir: 'up' | 'down'): string {
  if (duration.startsWith('sixteenth')) {
    return dir === 'up' ? GLYPH_FLAG_16TH_UP : GLYPH_FLAG_16TH_DOWN
  }
  return dir === 'up' ? GLYPH_FLAG_8TH_UP : GLYPH_FLAG_8TH_DOWN
}

// ─── StaffRow ─────────────────────────────────────────────────────────────────

interface StaffRowProps {
  measures: Measure[]
  rowWidth: number
  staffSpace: number
  showChords: boolean
  showLyrics: boolean
  showMeasureNumbers: boolean
  isFirstRow: boolean
  globalTimeSig: TimeSignatureType
  globalKeySig: KeySignatureType
  trackId: string
  editor?: ScoreEditor
  onSelect?: (sel: Selection) => void
}

function StaffRow({
  measures,
  rowWidth,
  staffSpace: sp,
  showChords,
  showLyrics,
  showMeasureNumbers,
  isFirstRow,
  globalTimeSig,
  globalKeySig,
  trackId,
  editor,
  onSelect,
}: StaffRowProps) {
  const fontSize = sp * 4

  // ── Vertical layout ──
  const measureNumZone = showMeasureNumbers ? sp * 1.5 : 0
  const chordZone = showChords ? sp * 2.5 : 0
  const lyricZone = showLyrics ? sp * 2.5 : 0
  const staffTop = measureNumZone + chordZone
  const staffBottom = staffTop + 4 * sp
  const rowHeight = staffBottom + lyricZone + sp * 0.5

  // ── First-measure prefix width ──
  const firstMeasure = measures[0]
  const activeSig = firstMeasure?.keySignature ?? globalKeySig
  const activeTimeSig = firstMeasure?.timeSignature ?? globalTimeSig

  const clefW = isFirstRow ? sp * CLEF_WIDTH_FACTOR : 0
  const keySigW = isFirstRow ? keySignatureWidth(activeSig, sp) : 0
  const timeSigW = isFirstRow ? sp * TIME_SIG_WIDTH_FACTOR : 0
  const prefixWidth = clefW + keySigW + timeSigW

  const measureAreaWidth = (rowWidth - prefixWidth) / measures.length

  // ── Note x/y helpers ──
  const eventX = (mIdx: number, beat: number, timeSig: TimeSignatureType) => {
    const mLeft = prefixWidth + mIdx * measureAreaWidth
    const contentLeft = mLeft + sp * 0.5
    const contentWidth = measureAreaWidth - sp * 0.5
    const beatSlot = contentWidth / timeSig.beats
    return contentLeft + (beat - 1) * beatSlot + beatSlot / 2
  }

  const noteYFor = (note: Note) =>
    staffPositionToY(trebleStaffPosition(note.pitch), sp) + staffTop

  // ── Flatten notes for tie resolution ──
  type NoteRef = { note: Note; x: number; y: number; mIdx: number }
  const allNoteRefs: NoteRef[] = measures.flatMap((m, mIdx) =>
    m.events
      .filter((e): e is Note => e.type === 'note')
      .map((note) => ({
        note,
        x: eventX(mIdx, note.beat, m.timeSignature ?? globalTimeSig),
        y: noteYFor(note),
        mIdx,
      }))
  )

  const selectionAttrs = (
    id: string,
    type: Selection['type'],
    measureId: string,
    beat?: number
  ) =>
    editor
      ? {
          'data-notation-id': id,
          'data-notation-type': type,
          'data-notation-selected': editor.selection?.id === id ? 'true' : undefined,
          tabIndex: 0,
          role: 'button' as const,
          'aria-selected': editor.selection?.id === id,
          onClick: () => {
            editor.select(id)
            onSelect?.({ type, id, measureId, trackId, beat })
          },
        }
      : {}

  return (
    <Staff
      width={rowWidth}
      height={rowHeight}
      staffTop={staffTop}
      staffSpace={sp}
      className="notation-lead-sheet-staff"
    >
      {/* ── Opening barline ── */}
      <line
        x1={0}
        y1={staffTop}
        x2={0}
        y2={staffBottom}
        stroke="var(--notation-staff-line-color, currentColor)"
        strokeWidth={sp * 0.12}
      />

      {/* ── Row prefix (first row only) ── */}
      {isFirstRow && (
        <>
          <Clef x={sp * 0.3} staffBottom={staffBottom} staffSpace={sp} />
          {keySigW > 0 && (
            <KeySignature
              keySignature={activeSig}
              x={clefW + sp * 0.2}
              staffBottom={staffBottom}
              staffSpace={sp}
            />
          )}
          <TimeSignature
            timeSignature={activeTimeSig}
            x={clefW + keySigW + sp * TIME_SIG_WIDTH_FACTOR / 2}
            staffTop={staffTop}
            staffSpace={sp}
          />
        </>
      )}

      {/* ── Measures ── */}
      {measures.map((measure, mIdx) => {
        const timeSig = measure.timeSignature ?? globalTimeSig
        const mLeft = prefixWidth + mIdx * measureAreaWidth

        const ex = (beat: number) => eventX(mIdx, beat, timeSig)

        const notes = measure.events.filter((e): e is Note => e.type === 'note')
        const chords = measure.events.filter((e): e is Chord => e.type === 'chord')
        const lyrics = measure.events.filter((e): e is Lyric => e.type === 'lyric')
        const rests = measure.events.filter((e): e is Rest => e.type === 'rest')

        const measureBeamGroups = beamGroups(notes, timeSig)
        const beamedIds = new Set(measureBeamGroups.flatMap((g) => g.map((n) => n.id)))

        return (
          <g key={measure.id} className="notation-measure">

            {/* Measure number */}
            {showMeasureNumbers && (
              <text
                x={mLeft + sp * 0.3}
                y={measureNumZone > 0 ? measureNumZone - sp * 0.2 : staffTop - sp * 0.3}
                fontSize={sp * 0.9}
                fontFamily="var(--notation-font-family, Georgia, serif)"
                fill="var(--notation-color-section-label, currentColor)"
              >
                {measure.number}
              </text>
            )}

            {/* Section label */}
            {measure.section && (
              <text
                x={mLeft + sp * 0.4}
                y={staffTop - chordZone * 0.85}
                fontSize={sp * 1.1}
                fontFamily="var(--notation-font-family, Georgia, serif)"
                fill="var(--notation-color-section-label, currentColor)"
                fontStyle="italic"
              >
                {measure.section}
              </text>
            )}

            {/* Rehearsal mark */}
            {measure.rehearsalMark && (
              <g>
                <rect
                  x={mLeft + sp * 0.2}
                  y={staffTop - chordZone + sp * 0.1}
                  width={sp * 2.2}
                  height={sp * 1.5}
                  fill="none"
                  stroke="var(--notation-note-color, currentColor)"
                  strokeWidth={sp * 0.1}
                />
                <text
                  x={mLeft + sp * 1.3}
                  y={staffTop - chordZone + sp * 1.2}
                  fontSize={sp * 1.2}
                  fontFamily="var(--notation-font-family, Georgia, serif)"
                  fill="var(--notation-note-color, currentColor)"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {measure.rehearsalMark}
                </text>
              </g>
            )}

            {/* ── Rests ── */}
            {rests.map((rest) => {
              const rx = ex(rest.beat)
              // Whole/half rests hang from/sit on staff lines; quarter+ centred vertically
              const restY = rest.duration.startsWith('whole')
                ? staffTop + sp           // hangs from second line
                : rest.duration.startsWith('half')
                  ? staffTop + 2 * sp     // sits on middle line
                  : staffTop + 2 * sp
              const dotted = isDotted(rest.duration)

              return (
                <g key={rest.id} className="notation-rest" {...selectionAttrs(rest.id, 'rest', measure.id, rest.beat)}>
                  <text
                    x={rx}
                    y={restY}
                    fontSize={fontSize}
                    fontFamily="var(--notation-music-font-family, Bravura, serif)"
                    fill="var(--notation-note-color, currentColor)"
                    textAnchor="middle"
                  >
                    {restGlyph(rest.duration)}
                  </text>
                  {dotted && (
                    <Dot cx={rx + sp * 0.8} cy={restY - sp * 0.5} staffSpace={sp} />
                  )}
                </g>
              )
            })}

            {/* ── Notes ── */}
            {notes.map((note) => {
              const nx = ex(note.beat)
              const ny = noteYFor(note)
              const staffPos = trebleStaffPosition(note.pitch)
              const dir = stemDirection(staffPos)
              const flags = flagCount(note.duration)
              const inBeam = beamedIds.has(note.id)
              const dotted = isDotted(note.duration)
              const showStem = !note.duration.startsWith('whole')
              const needsFlag = flags > 0 && !inBeam

              const stemX = dir === 'up' ? nx + sp * 0.5 : nx - sp * 0.5
              const stemEndY = dir === 'up'
                ? ny - sp * STEM_LENGTH_FACTOR
                : ny + sp * STEM_LENGTH_FACTOR

              // Tie: find the next note of the same pitch in the measure or next ref
              const tieTarget = note.tied
                ? allNoteRefs.find(
                    (nr) =>
                      nr.note.id !== note.id &&
                      nr.note.pitch.step === note.pitch.step &&
                      nr.note.pitch.octave === note.pitch.octave &&
                      (nr.mIdx > mIdx || (nr.mIdx === mIdx && nr.note.beat > note.beat))
                  )
                : undefined

              return (
                <g key={note.id} className="notation-note" {...selectionAttrs(note.id, 'note', measure.id, note.beat)}>
                  <NoteHead
                    duration={note.duration}
                    staffPos={staffPos}
                    x={nx}
                    y={ny}
                    staffSpace={sp}
                    accidental={note.pitch.alter}
                    tied={note.tied}
                    ledgerLineWidth={sp * LEDGER_W_FACTOR}
                  />

                  {showStem && !inBeam && (
                    <Stem x={stemX} y1={ny} y2={stemEndY} staffSpace={sp} />
                  )}

                  {needsFlag && (
                    <text
                      x={stemX}
                      y={stemEndY}
                      fontSize={fontSize}
                      fontFamily="var(--notation-music-font-family, Bravura, serif)"
                      fill="var(--notation-note-color, currentColor)"
                    >
                      {flagGlyph(note.duration, dir)}
                    </text>
                  )}

                  {dotted && (
                    <Dot
                      cx={nx + sp * 0.9}
                      cy={ny - (staffPos % 2 === 0 ? sp * 0.5 : 0)}
                      staffSpace={sp}
                    />
                  )}

                  {note.tied && tieTarget && (
                    <Tie
                      x1={nx}
                      x2={tieTarget.x}
                      y={ny}
                      direction={dir === 'up' ? 'down' : 'up'}
                      staffSpace={sp}
                    />
                  )}
                </g>
              )
            })}

            {/* ── Beams ── */}
            {measureBeamGroups.map((group, gi) => {
              const first = group[0]
              const last = group[group.length - 1]

              // Dominant stem direction: if any note is below middle line, stems up
              const anyBelow = group.some(
                (n) => stemDirection(trebleStaffPosition(n.pitch)) === 'up'
              )
              const grpDir: 'up' | 'down' = anyBelow ? 'up' : 'down'

              const stemXOf = (n: Note) =>
                grpDir === 'up' ? ex(n.beat) + sp * 0.5 : ex(n.beat) - sp * 0.5

              const stemTopOf = (n: Note) => {
                const base = noteYFor(n)
                return grpDir === 'up'
                  ? base - sp * STEM_LENGTH_FACTOR
                  : base + sp * STEM_LENGTH_FACTOR
              }

              const y1 = stemTopOf(first)
              const y2 = stemTopOf(last)
              const flags2 = flagCount(first.duration) >= 2
              const beamOffset = grpDir === 'up' ? sp * 0.65 : -sp * 0.65

              return (
                <g key={`beam-${mIdx}-${gi}`} className="notation-beam-group">
                  {group.map((n) => (
                    <Stem
                      key={`bs-${n.id}`}
                      x={stemXOf(n)}
                      y1={noteYFor(n)}
                      y2={stemTopOf(n)}
                      staffSpace={sp}
                    />
                  ))}
                  <Beam
                    x1={stemXOf(first)}
                    x2={stemXOf(last)}
                    y1={y1}
                    y2={y2}
                    staffSpace={sp}
                  />
                  {flags2 && (
                    <Beam
                      x1={stemXOf(first)}
                      x2={stemXOf(last)}
                      y1={y1 + beamOffset}
                      y2={y2 + beamOffset}
                      staffSpace={sp}
                    />
                  )}
                </g>
              )
            })}

            {/* ── Chord symbols ── */}
            {showChords &&
              chords.map((chord) => (
                <text
                  key={chord.id}
                  className="notation-lead-sheet-chord"
                  x={ex(chord.beat)}
                  y={staffTop - sp * 0.5}
                  fontSize={sp * 1.5}
                  fontFamily="var(--notation-font-family, Georgia, serif)"
                  fontWeight="var(--notation-font-weight-chord, 600)"
                  fill="var(--notation-staff-chord-color, var(--notation-color-chord, currentColor))"
                  textAnchor="middle"
                  {...(editor
                    ? {
                        'data-notation-id': chord.id,
                        'data-notation-type': 'chord',
                        onClick: () => {
                          editor.select(chord.id)
                          onSelect?.({
                            type: 'chord',
                            id: chord.id,
                            measureId: measure.id,
                            trackId,
                            beat: chord.beat,
                          })
                        },
                      }
                    : {})}
                >
                  {chord.symbol}
                </text>
              ))}

            {/* ── Lyrics ── */}
            {showLyrics &&
              lyrics.map((lyric) => (
                <text
                  key={lyric.id}
                  className="notation-lead-sheet-lyric"
                  x={ex(lyric.beat)}
                  y={staffBottom + sp * 1.6}
                  fontSize={sp * 1.3}
                  fontFamily="var(--notation-font-family, Georgia, serif)"
                  fill="var(--notation-staff-lyric-color, var(--notation-color-lyric, currentColor))"
                  textAnchor="middle"
                >
                  {lyric.text}
                  {lyric.syllable === 'begin' || lyric.syllable === 'middle' ? '-' : ''}
                </text>
              ))}

            {/* Barline */}
            <Barline
              type={measure.barline ?? 'single'}
              x={mLeft + measureAreaWidth}
              staffTop={staffTop}
              staffBottom={staffBottom}
              staffSpace={sp}
            />
          </g>
        )
      })}
    </Staff>
  )
}

// ─── LeadSheet ────────────────────────────────────────────────────────────────

/**
 * Renders a lead sheet: a single-voice melody on a treble-clef staff with
 * chord symbols above and optional lyrics below.
 *
 * Requires the Bravura music font to be loaded. Import `react-notation/music-font.css`
 * or load Bravura via your own `@font-face` declaration.
 *
 * @example
 * ```tsx
 * import 'react-notation/music-font.css'
 * <LeadSheet score={score} measuresPerLine={4} />
 * ```
 */
export const LeadSheet = React.forwardRef<HTMLDivElement, LeadSheetProps>(
  (
    {
      score,
      trackIndex = 0,
      measuresPerLine = 4,
      breakAtSections = true,
      staffSpace = 10,
      showChords = true,
      showLyrics = true,
      showTitle = true,
      showMeasureNumbers = false,
      editor,
      onSelect,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const track = score.tracks[trackIndex]

    // ── Measure container width via ResizeObserver ──
    const containerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState(600)

    const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
      const width = entries[0]?.contentRect.width
      if (width && width > 0) setContainerWidth(Math.floor(width))
    }, [])

    useEffect(() => {
      const el = containerRef.current
      if (!el) return
      const ro = new ResizeObserver(handleResize)
      ro.observe(el)
      // Seed initial width
      const rect = el.getBoundingClientRect()
      if (rect.width > 0) setContainerWidth(Math.floor(rect.width))
      return () => ro.disconnect()
    }, [handleResize])

    if (!track) return null

    const lines = toLines(track.measures, measuresPerLine, breakAtSections)
    const classes = ['notation-lead-sheet', className].filter(Boolean).join(' ')

    return (
      <div ref={ref} className={classes} style={style} {...rest}>
        {showTitle && score.title && (
          <div className="notation-lead-sheet-title">{score.title}</div>
        )}
        {showTitle && score.composer && (
          <div className="notation-lead-sheet-composer">{score.composer}</div>
        )}
        <div ref={containerRef} className="notation-lead-sheet-rows">
          {lines.map((lineMeasures, li) => (
            <StaffRow
              key={li}
              measures={lineMeasures}
              rowWidth={containerWidth}
              staffSpace={staffSpace}
              showChords={showChords}
              showLyrics={showLyrics}
              showMeasureNumbers={showMeasureNumbers}
              isFirstRow={li === 0}
              globalTimeSig={score.timeSignature}
              globalKeySig={score.keySignature}
              trackId={track.id}
              editor={editor}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    )
  }
)
LeadSheet.displayName = 'LeadSheet'
