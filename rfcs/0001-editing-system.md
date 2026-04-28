# RFC 0001 — Interactive Editing System

**Status:** Accepted  
**Author:** Luci Moon  
**Date:** 2026-04-27

---

## Summary

Add a first-class editing layer to react-notation: a `useScore` hook that owns score state
and exposes typed actions, an `editor` prop on rendering components that activates
interactive mode, and a selection/focus model with hook points for popups and keyboard
navigation. This makes the library useful not just for displaying music but for building
music-writing tools.

---

## Motivation

react-notation's rendering components are pure display: they take a `MusicScore` and paint
it. Apps that want users to *write* music — edit chord symbols, add measures, move events —
currently have no built-in path. They'd need to reimplement selection, focus management,
keyboard nav, and state mutation from scratch for every app.

The goal is to provide those primitives so app builders spend their time on product
decisions (what popup to show, what the toolbar looks like) rather than plumbing.

---

## Proposed change

### `useScore` hook

```ts
import { useScore } from 'react-notation'

const editor = useScore(initialScore)
```

Returns an `ScoreEditor` object:

```ts
interface ScoreEditor {
  // State
  score: MusicScore
  selection: Selection | null

  // Selection
  select: (id: string | null) => void

  // Mutations (all return a new MusicScore, also update internal state)
  updateChord:   (id: string, patch: Partial<Omit<Chord,  'id' | 'type'>>) => void
  updateLyric:   (id: string, patch: Partial<Omit<Lyric,  'id' | 'type'>>) => void
  updateNote:    (id: string, patch: Partial<Omit<Note,   'id' | 'type'>>) => void
  updateMeasure: (id: string, patch: Partial<Omit<Measure,'id'>>) => void
  addEvent:      (measureId: string, event: Event) => void
  removeEvent:   (id: string) => void
  moveEvent:     (id: string, toBeat: number) => void
  addMeasure:    (trackId: string, after?: string) => void   // after = measure id
  removeMeasure: (id: string) => void
  addTrack:      (after?: string) => void
  removeTrack:   (id: string) => void

  // History
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}
```

### Selection model

```ts
interface Selection {
  type: 'chord' | 'lyric' | 'note' | 'rest' | 'measure' | 'beat'
  id: string          // event id, or measure id for type 'measure'
  measureId: string
  trackId: string
  beat?: number
}
```

### `editor` prop on rendering components

Passing `editor` to a rendering component activates interactive mode.
All selectable elements receive:
- `tabIndex` for keyboard focus
- `data-notation-id` attribute (the event or measure id) for external targeting
- `data-notation-type` attribute for CSS and popup targeting
- `aria-selected` reflecting selection state

```tsx
<ChordSheet
  score={editor.score}
  editor={editor}
  onSelect={(sel) => openChordPalette(sel)}       // fires on focus/click
  onEditStart={(sel) => openInlineEditor(sel)}    // fires on Enter/double-click
  onEditCommit={(sel, value) => ...}              // fires when edit is confirmed
  onEditCancel={(sel) => ...}                     // fires on Escape
/>
```

### Keyboard navigation

Default keybindings (overridable via `keyMap` prop):

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Next / previous selectable element |
| `→` / `←` | Next / previous beat within measure |
| `↑` / `↓` | Same beat, next / previous line |
| `Enter` | Enter edit mode on selected element |
| any printable char | Enter edit mode and seed input with typed character |
| `Escape` | Cancel edit / deselect |
| `Backspace` / `Delete` | Remove selected event (when not in edit mode) |
| `Cmd/Ctrl+Z` | Undo |
| `Cmd/Ctrl+Shift+Z` | Redo |

### Hook points for app builders

The `data-notation-id` + `data-notation-type` attributes on every interactive element mean
app builders can position popups without needing special APIs:

```tsx
function ChordPalette({ selection }: { selection: Selection }) {
  const anchor = document.querySelector(`[data-notation-id="${selection.id}"]`)
  return <Popup anchor={anchor}>...</Popup>
}
```

The `onSelect`, `onEditStart`, `onEditCommit`, `onEditCancel` callbacks cover the lifecycle
without requiring the library to ship its own popup/modal primitives.

---

## Alternatives considered

**Separate `ChordSheetEditor` component variants** — rejected because it duplicates the
rendering tree and diverges over time. One component with an optional `editor` prop is
cleaner.

**Uncontrolled editing (components own state internally)** — rejected because app builders
need access to the score state for persistence, undo stacks, network sync, etc.

**`onChange(newScore)` only, no `useScore`** — valid but requires every app to re-implement
the action helpers and selection model. `useScore` provides a baseline that can be swapped
out when apps outgrow it.

---

## Open questions

- [ ] Should `useScore` support external state (e.g., Zustand/Redux)? Proposal: yes, via an
  optional `state` + `dispatch` override pair — `useScore` becomes a thin adapter.
- [ ] Undo granularity: per-keystroke or per-commit? Proposal: per-commit (on `onEditCommit`
  or on blur), with batching for rapid changes.
- [ ] Multi-selection (select a range of beats/measures)? Defer post-1.0.
- [ ] `keyMap` prop shape: record of action → key string, or a full handler map?

---

## Implementation notes

- `useScore` should be pure React (no external state lib) in v1 to keep the zero-dependency
  guarantee. External adapter pattern can come later.
- History stack lives inside `useScore` via `useReducer`. Each mutation pushes to the stack.
- Interactive elements need to be actual focusable DOM nodes (`button` or `div[tabIndex]`).
  `button` is preferred for semantics unless layout constraints prevent it.
- CSS for selected/focused state uses `[data-notation-selected]` attribute selectors so
  theme tokens can control the highlight color via `--notation-color-selection`.
- Implement in M2.5, after ChordChart + ChordDiagram (M2), before LeadSheet (M3).
