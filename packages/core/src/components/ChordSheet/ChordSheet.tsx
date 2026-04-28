import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { MusicScore, Measure, Event, Chord, Lyric, ScoreEditor, Selection } from '../../types'
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
  /**
   * Pass a ScoreEditor (from useScore) to activate interactive mode.
   * Enables selection, keyboard navigation, and inline editing.
   */
  editor?: ScoreEditor
  /**
   * When true and editor is set, focused chord symbols show an inline text input on Enter.
   * Set to false to suppress the built-in input and handle editing via onEditStart.
   * @default true
   */
  inlineEdit?: boolean
  /** Fired when an element is selected (focused or clicked). */
  onSelect?: (selection: Selection) => void
  /** Fired when inline editing begins. Return false to suppress the built-in input. */
  onEditStart?: (selection: Selection) => void | false
  /** Fired when an inline edit is committed. The editor has already been updated. */
  onEditCommit?: (selection: Selection, value: string) => void
  /** Fired when an inline edit is cancelled. */
  onEditCancel?: (selection: Selection) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface BeatColumn {
  beat: number
  chord: Chord | null
  lyric: Lyric | null
}

function toBeatColumns(events: Event[]): BeatColumn[] {
  const map = new Map<number, BeatColumn>()
  for (const event of events) {
    if (event.type !== 'chord' && event.type !== 'lyric') continue
    if (!map.has(event.beat)) map.set(event.beat, { beat: event.beat, chord: null, lyric: null })
    const col = map.get(event.beat)!
    if (event.type === 'chord') col.chord = event as Chord
    if (event.type === 'lyric') col.lyric = event as Lyric
  }
  return Array.from(map.values()).sort((a, b) => a.beat - b.beat)
}

function toLines(measures: Measure[], measuresPerLine: number, breakAtSections: boolean): Measure[][] {
  const lines: Measure[][] = []
  let current: Measure[] = []
  for (const measure of measures) {
    const startsSection = breakAtSections && !!measure.section && current.length > 0
    if (startsSection || current.length >= measuresPerLine) { lines.push(current); current = [] }
    current.push(measure)
  }
  if (current.length > 0) lines.push(current)
  return lines
}

/** Collect all selectable beat columns in order across all lines. */
function flatColumns(lines: Measure[][]): Array<{ measureId: string; trackId: string; col: BeatColumn }> {
  const result: Array<{ measureId: string; trackId: string; col: BeatColumn }> = []
  for (const line of lines) {
    for (const measure of line) {
      for (const col of toBeatColumns(measure.events)) {
        result.push({ measureId: measure.id, trackId: '', col })
      }
    }
  }
  return result
}

// ─── Interactive Beat ─────────────────────────────────────────────────────────

interface BeatProps {
  col: BeatColumn
  measureId: string
  trackId: string
  editor?: ScoreEditor
  inlineEdit: boolean
  isSelected: boolean
  onSelect?: ChordSheetProps['onSelect']
  onEditStart?: ChordSheetProps['onEditStart']
  onEditCommit?: ChordSheetProps['onEditCommit']
  onEditCancel?: ChordSheetProps['onEditCancel']
  onKeyNavigation: (dir: 'left' | 'right' | 'up' | 'down', currentId: string) => void
  elementRef?: (el: HTMLDivElement | null) => void
}

function Beat({
  col,
  measureId,
  editor,
  inlineEdit,
  isSelected,
  onSelect,
  onEditStart,
  onEditCommit,
  onEditCancel,
  onKeyNavigation,
  elementRef,
}: BeatProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const interactive = !!editor
  const primaryId = col.chord?.id ?? col.lyric?.id ?? null

  const handleFocus = useCallback(() => {
    if (!interactive || !primaryId) return
    editor!.select(primaryId)
    onSelect?.({
      type: col.chord ? 'chord' : col.lyric ? 'lyric' : 'beat',
      id: primaryId,
      measureId,
      trackId: editor!.score.tracks[0]?.id ?? '',
      beat: col.beat,
    })
  }, [interactive, primaryId, editor, onSelect, col, measureId])

  // Focus the input whenever editing becomes true
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const startEditing = useCallback(() => {
    if (!col.chord) return
    const sel: Selection = {
      type: 'chord',
      id: col.chord.id,
      measureId,
      trackId: editor!.score.tracks[0]?.id ?? '',
      beat: col.beat,
    }
    const suppressed = onEditStart?.(sel)
    if (suppressed === false || !inlineEdit) return
    setEditValue(col.chord.symbol)
    setEditing(true)
  }, [col.chord, measureId, editor, onEditStart, inlineEdit])

  const commitEdit = useCallback(() => {
    if (!editing || !col.chord) return
    const trimmed = editValue.trim()
    if (trimmed) {
      editor!.updateChord(col.chord.id, { symbol: trimmed, root: trimmed[0] })
      onEditCommit?.(
        { type: 'chord', id: col.chord.id, measureId, trackId: editor!.score.tracks[0]?.id ?? '', beat: col.beat },
        trimmed
      )
    }
    setEditing(false)
  }, [editing, col.chord, editValue, editor, onEditCommit, measureId])

  const cancelEdit = useCallback(() => {
    if (!editing || !col.chord) return
    setEditing(false)
    onEditCancel?.({
      type: 'chord',
      id: col.chord.id,
      measureId,
      trackId: editor!.score.tracks[0]?.id ?? '',
      beat: col.beat,
    })
  }, [editing, col.chord, onEditCancel, measureId, editor])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || !primaryId) return
    if (editing) return // let input handle keys

    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        startEditing()
        break
      case 'ArrowLeft':
        e.preventDefault()
        onKeyNavigation('left', primaryId)
        break
      case 'ArrowRight':
        e.preventDefault()
        onKeyNavigation('right', primaryId)
        break
      case 'ArrowUp':
        e.preventDefault()
        onKeyNavigation('up', primaryId)
        break
      case 'ArrowDown':
        e.preventDefault()
        onKeyNavigation('down', primaryId)
        break
      case 'Backspace':
      case 'Delete':
        e.preventDefault()
        if (primaryId) editor!.removeEvent(primaryId)
        break
      default:
        // Printable character → start editing seeded with that char
        if (col.chord && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          const sel: Selection = {
            type: 'chord', id: col.chord.id, measureId,
            trackId: editor!.score.tracks[0]?.id ?? '', beat: col.beat,
          }
          const suppressed = onEditStart?.(sel)
          if (suppressed === false || !inlineEdit) return
          setEditValue(e.key)
          setEditing(true)
          // useEffect handles focus after render
        }
    }
  }, [interactive, primaryId, editing, startEditing, onKeyNavigation, editor, col, measureId, onEditStart, inlineEdit])

  if (!interactive) {
    return (
      <div className="notation-beat">
        <span className="notation-beat-chord">{col.chord?.symbol ?? '\u00A0'}</span>
        <span className="notation-beat-lyric">{col.lyric?.text ?? '\u00A0'}</span>
      </div>
    )
  }

  return (
    <div
      ref={elementRef}
      className="notation-beat"
      tabIndex={isSelected ? 0 : -1}
      role="button"
      aria-selected={isSelected}
      data-notation-id={primaryId ?? undefined}
      data-notation-type={col.chord ? 'chord' : col.lyric ? 'lyric' : 'beat'}
      data-notation-selected={isSelected ? '' : undefined}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onDoubleClick={startEditing}
    >
      {editing && col.chord ? (
        <input
          ref={inputRef}
          className="notation-beat-chord notation-beat-chord-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
            if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
            e.stopPropagation()
          }}
          onBlur={commitEdit}
          aria-label="Edit chord"
        />
      ) : (
        <span className="notation-beat-chord">{col.chord?.symbol ?? '\u00A0'}</span>
      )}
      <span className="notation-beat-lyric">{col.lyric?.text ?? '\u00A0'}</span>
    </div>
  )
}

// ─── MeasureBlock ─────────────────────────────────────────────────────────────

interface MeasureBlockProps {
  measure: Measure
  showMeasureNumbers: boolean
  editor?: ScoreEditor
  inlineEdit: boolean
  selectedId: string | null
  onSelect?: ChordSheetProps['onSelect']
  onEditStart?: ChordSheetProps['onEditStart']
  onEditCommit?: ChordSheetProps['onEditCommit']
  onEditCancel?: ChordSheetProps['onEditCancel']
  onKeyNavigation: (dir: 'left' | 'right' | 'up' | 'down', currentId: string) => void
  beatRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
}

function MeasureBlock({
  measure, showMeasureNumbers, editor, inlineEdit, selectedId,
  onSelect, onEditStart, onEditCommit, onEditCancel, onKeyNavigation, beatRefs,
}: MeasureBlockProps) {
  const columns = toBeatColumns(measure.events)
  const trackId = editor?.score.tracks[0]?.id ?? ''

  return (
    <div className="notation-measure" data-measure={measure.number}>
      {showMeasureNumbers && <span className="notation-measure-number">{measure.number}</span>}
      <div className="notation-beat-row">
        {columns.length > 0 ? (
          columns.map((col) => {
            const primaryId = col.chord?.id ?? col.lyric?.id ?? null
            return (
              <Beat
                key={col.beat}
                col={col}
                measureId={measure.id}
                trackId={trackId}
                editor={editor}
                inlineEdit={inlineEdit}
                isSelected={!!primaryId && primaryId === selectedId}
                onSelect={onSelect}
                onEditStart={onEditStart}
                onEditCommit={onEditCommit}
                onEditCancel={onEditCancel}
                onKeyNavigation={onKeyNavigation}
                elementRef={primaryId ? (el) => {
                  if (el) beatRefs.current.set(primaryId, el)
                  else beatRefs.current.delete(primaryId)
                } : undefined}
              />
            )
          })
        ) : (
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
      editor,
      inlineEdit = true,
      onSelect,
      onEditStart,
      onEditCommit,
      onEditCancel,
      className,
      ...rest
    },
    ref
  ) => {
    const track = score.tracks[0]
    const measures = track?.measures ?? []
    const lines = toLines(measures, measuresPerLine, breakAtSections)
    const beatRefs = useRef<Map<string, HTMLDivElement>>(new Map())
    const allCols = flatColumns(lines)

    const handleKeyNavigation = useCallback(
      (dir: 'left' | 'right' | 'up' | 'down', currentId: string) => {
        const idx = allCols.findIndex((c) => {
          const pid = c.col.chord?.id ?? c.col.lyric?.id
          return pid === currentId
        })
        if (idx === -1) return

        let targetIdx: number | null = null
        if (dir === 'left' && idx > 0) targetIdx = idx - 1
        if (dir === 'right' && idx < allCols.length - 1) targetIdx = idx + 1
        if (dir === 'up' || dir === 'down') {
          // Find same beat position on previous/next line
          const beatsPerLine = measures.length > 0
            ? Math.ceil(allCols.length / lines.length)
            : measuresPerLine
          const delta = dir === 'up' ? -beatsPerLine : beatsPerLine
          const candidate = idx + delta
          if (candidate >= 0 && candidate < allCols.length) targetIdx = candidate
        }

        if (targetIdx !== null) {
          const target = allCols[targetIdx]
          const targetId = target.col.chord?.id ?? target.col.lyric?.id
          if (targetId) {
            editor?.select(targetId)
            beatRefs.current.get(targetId)?.focus()
          }
        }
      },
      [allCols, lines.length, measures.length, measuresPerLine, editor]
    )

    const selectedId = editor?.selection?.id ?? null

    return (
      <div
        ref={ref}
        className={['notation-chord-sheet', className].filter(Boolean).join(' ')}
        {...rest}
      >
        {lines.map((lineMeasures, lineIdx) => {
          const firstMeasure = lineMeasures[0]
          const sectionLabel = breakAtSections && firstMeasure?.section ? firstMeasure.section : null

          return (
            <React.Fragment key={lineIdx}>
              {sectionLabel && <div className="notation-section-label">{sectionLabel}</div>}
              <div className="notation-chord-line">
                {lineMeasures.map((measure) => (
                  <MeasureBlock
                    key={measure.id}
                    measure={measure}
                    showMeasureNumbers={showMeasureNumbers}
                    editor={editor}
                    inlineEdit={inlineEdit}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onEditStart={onEditStart}
                    onEditCommit={onEditCommit}
                    onEditCancel={onEditCancel}
                    onKeyNavigation={handleKeyNavigation}
                    beatRefs={beatRefs}
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
