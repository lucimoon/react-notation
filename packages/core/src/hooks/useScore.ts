import { useReducer, useState, useCallback } from 'react'
import { createMeasure, createTrack } from '../builders'
import type {
  MusicScore,
  Track,
  Measure,
  Event,
  Chord,
  Lyric,
  Note,
  ScoreEditor,
  Selection,
} from '../types'

// ─── Immutable score mutations ────────────────────────────────────────────────

function mapEvents(
  score: MusicScore,
  fn: (event: Event, measureId: string, trackId: string) => Event
): MusicScore {
  return {
    ...score,
    tracks: score.tracks.map((track) => ({
      ...track,
      measures: track.measures.map((measure) => ({
        ...measure,
        events: measure.events.map((event) => fn(event, measure.id, track.id)),
      })),
    })),
  }
}

function updateEventById(score: MusicScore, id: string, patch: Partial<Event>): MusicScore {
  return mapEvents(score, (event) => (event.id === id ? { ...event, ...patch } : event))
}

function removeEventById(score: MusicScore, id: string): MusicScore {
  return {
    ...score,
    tracks: score.tracks.map((track) => ({
      ...track,
      measures: track.measures.map((measure) => ({
        ...measure,
        events: measure.events.filter((e) => e.id !== id),
      })),
    })),
  }
}

function addEventToMeasure(score: MusicScore, measureId: string, event: Event): MusicScore {
  return {
    ...score,
    tracks: score.tracks.map((track) => ({
      ...track,
      measures: track.measures.map((measure) =>
        measure.id === measureId
          ? { ...measure, events: [...measure.events, event] }
          : measure
      ),
    })),
  }
}

function updateMeasureById(score: MusicScore, id: string, patch: Partial<Measure>): MusicScore {
  return {
    ...score,
    tracks: score.tracks.map((track) => ({
      ...track,
      measures: track.measures.map((measure) =>
        measure.id === id ? { ...measure, ...patch } : measure
      ),
    })),
  }
}

function removeMeasureById(score: MusicScore, id: string): MusicScore {
  return {
    ...score,
    tracks: score.tracks.map((track) => {
      const measures = track.measures
        .filter((m) => m.id !== id)
        .map((m, i) => ({ ...m, number: i + 1 }))
      return { ...track, measures }
    }),
  }
}

function insertMeasure(score: MusicScore, trackId: string, after?: string): MusicScore {
  return {
    ...score,
    tracks: score.tracks.map((track) => {
      if (track.id !== trackId) return track
      const measures = [...track.measures]
      const newMeasure = createMeasure({ number: 0, events: [] })
      const insertIdx = after
        ? measures.findIndex((m) => m.id === after) + 1
        : measures.length
      measures.splice(insertIdx, 0, newMeasure)
      return {
        ...track,
        measures: measures.map((m, i) => ({ ...m, number: i + 1 })),
      }
    }),
  }
}

function removeTrackById(score: MusicScore, id: string): MusicScore {
  return { ...score, tracks: score.tracks.filter((t) => t.id !== id) }
}

function insertTrack(score: MusicScore, after?: string): MusicScore {
  const tracks = [...score.tracks]
  const newTrack = createTrack({ measures: [] })
  const insertIdx = after ? tracks.findIndex((t) => t.id === after) + 1 : tracks.length
  tracks.splice(insertIdx, 0, newTrack)
  return { ...score, tracks }
}

// ─── History reducer ──────────────────────────────────────────────────────────

interface HistoryState {
  past: MusicScore[]
  present: MusicScore
  future: MusicScore[]
}

type HistoryAction =
  | { type: 'PUSH'; next: MusicScore }
  | { type: 'UNDO' }
  | { type: 'REDO' }

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'PUSH':
      return { past: [...state.past, state.present], present: action.next, future: [] }
    case 'UNDO':
      if (state.past.length === 0) return state
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future],
      }
    case 'REDO':
      if (state.future.length === 0) return state
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1),
      }
  }
}

// ─── useScore ────────────────────────────────────────────────────────────────

/**
 * Manages a MusicScore with full mutation history (undo/redo) and selection state.
 * Returns a ScoreEditor object that can be passed to rendering components via the `editor` prop.
 */
export function useScore(initial: MusicScore): ScoreEditor {
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initial,
    future: [],
  })
  const [selection, setSelection] = useState<Selection | null>(null)

  const push = useCallback(
    (next: MusicScore) => dispatch({ type: 'PUSH', next }),
    []
  )

  const select = useCallback((id: string | null) => {
    if (id === null) { setSelection(null); return }
    // Find the event in the score to build a full Selection
    const score = history.present
    for (const track of score.tracks) {
      for (const measure of track.measures) {
        const event = measure.events.find((e) => e.id === id)
        if (event) {
          setSelection({
            type: event.type,
            id: event.id,
            measureId: measure.id,
            trackId: track.id,
            beat: event.beat,
          })
          return
        }
        if (measure.id === id) {
          setSelection({ type: 'measure', id: measure.id, measureId: measure.id, trackId: track.id })
          return
        }
      }
    }
    setSelection(null)
  }, [history.present])

  return {
    score: history.present,
    selection,
    select,

    updateChord: useCallback((id, patch) => {
      push(updateEventById(history.present, id, patch as Partial<Event>))
    }, [history.present, push]),

    updateLyric: useCallback((id, patch) => {
      push(updateEventById(history.present, id, patch as Partial<Event>))
    }, [history.present, push]),

    updateNote: useCallback((id, patch) => {
      push(updateEventById(history.present, id, patch as Partial<Event>))
    }, [history.present, push]),

    updateMeasure: useCallback((id, patch) => {
      push(updateMeasureById(history.present, id, patch))
    }, [history.present, push]),

    addEvent: useCallback((measureId, event) => {
      push(addEventToMeasure(history.present, measureId, event))
    }, [history.present, push]),

    removeEvent: useCallback((id) => {
      if (selection?.id === id) setSelection(null)
      push(removeEventById(history.present, id))
    }, [history.present, push, selection]),

    moveEvent: useCallback((id, toBeat) => {
      push(updateEventById(history.present, id, { beat: toBeat } as Partial<Event>))
    }, [history.present, push]),

    addMeasure: useCallback((trackId, after) => {
      push(insertMeasure(history.present, trackId, after))
    }, [history.present, push]),

    removeMeasure: useCallback((id) => {
      if (selection?.measureId === id) setSelection(null)
      push(removeMeasureById(history.present, id))
    }, [history.present, push, selection]),

    addTrack: useCallback((after) => {
      push(insertTrack(history.present, after))
    }, [history.present, push]),

    removeTrack: useCallback((id) => {
      if (selection?.trackId === id) setSelection(null)
      push(removeTrackById(history.present, id))
    }, [history.present, push, selection]),

    undo: useCallback(() => dispatch({ type: 'UNDO' }), []),
    redo: useCallback(() => dispatch({ type: 'REDO' }), []),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}

// ─── Type re-exports for convenience ─────────────────────────────────────────

export type { ScoreEditor, Selection }
export type { Chord, Lyric, Note, Track, Measure }
