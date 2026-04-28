---
sidebar_position: 2
---

# Editing scores

react-notation components are interactive by default — but only when you opt in. Pass a
`ScoreEditor` (from `useScore`) to any rendering component to activate editing mode.

## Quick start

```tsx
import { ChordSheet, useScore, createScore, createTrack, createMeasure, createChord } from 'react-notation'
import 'react-notation/style.css'

const initialScore = createScore({
  timeSignature: { beats: 4, value: 4 },
  keySignature: { root: 'C', mode: 'major' },
  tracks: [
    createTrack({
      measures: [
        createMeasure({ number: 1, events: [
          createChord({ beat: 1, duration: 'half', symbol: 'C', root: 'C' }),
          createChord({ beat: 3, duration: 'half', symbol: 'Am', root: 'A', quality: 'minor' }),
        ]}),
      ],
    }),
  ],
})

function Editor() {
  const editor = useScore(initialScore)

  return (
    <ChordSheet
      score={editor.score}
      editor={editor}
    />
  )
}
```

That's it. Every chord symbol is now:
- Focusable via `Tab`
- Editable with `Enter` (shows an inline input)
- Removable with `Delete`
- Navigable with arrow keys

## useScore API

```ts
const editor = useScore(initialScore)
```

| Property | Type | Description |
|----------|------|-------------|
| `score` | `MusicScore` | Current score state |
| `selection` | `Selection \| null` | Currently selected element |
| `select(id)` | `(id: string \| null) => void` | Programmatically move selection |
| `updateChord(id, patch)` | — | Update a chord's fields |
| `updateLyric(id, patch)` | — | Update a lyric's fields |
| `updateNote(id, patch)` | — | Update a note's fields |
| `updateMeasure(id, patch)` | — | Update a measure's fields |
| `addEvent(measureId, event)` | — | Append an event to a measure |
| `removeEvent(id)` | — | Remove an event |
| `moveEvent(id, toBeat)` | — | Move an event to a different beat |
| `addMeasure(trackId, after?)` | — | Insert a new measure |
| `removeMeasure(id)` | — | Remove a measure (renumbers remaining) |
| `addTrack(after?)` | — | Insert a new track |
| `removeTrack(id)` | — | Remove a track |
| `undo()` | — | Undo last mutation |
| `redo()` | — | Redo last undone mutation |
| `canUndo` | `boolean` | Whether undo is available |
| `canRedo` | `boolean` | Whether redo is available |

## Keyboard navigation (ChordSheet)

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Move between selectable elements |
| `←` / `→` | Previous / next beat |
| `↑` / `↓` | Same beat on previous / next line |
| `Enter` | Begin inline editing of a chord symbol |
| Any printable char | Begin editing, seeded with the typed character |
| `Escape` | Cancel edit |
| `Delete` / `Backspace` | Remove selected event |

## Attaching custom popups

Every interactive element receives `data-notation-id` and `data-notation-type` attributes,
making it easy to anchor a popup to the focused element without any special library APIs:

```tsx
function ChordEditor() {
  const editor = useScore(initialScore)
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null)

  return (
    <>
      <ChordSheet
        score={editor.score}
        editor={editor}
        inlineEdit={false}   // suppress built-in input
        onEditStart={(selection) => {
          const el = document.querySelector(`[data-notation-id="${selection.id}"]`)
          setAnchor(el as HTMLElement)
        }}
        onEditCancel={() => setAnchor(null)}
      />
      {anchor && (
        <MyChordPicker
          anchor={anchor}
          onSelect={(symbol, root, quality) => {
            if (editor.selection) {
              editor.updateChord(editor.selection.id, { symbol, root, quality })
            }
            setAnchor(null)
          }}
        />
      )}
    </>
  )
}
```

## Editor callbacks

| Prop | Signature | When it fires |
|------|-----------|---------------|
| `onSelect` | `(sel: Selection) => void` | Element focused or clicked |
| `onEditStart` | `(sel: Selection) => void \| false` | Editing begins. Return `false` to suppress the built-in input. |
| `onEditCommit` | `(sel: Selection, value: string) => void` | Edit confirmed (Enter or blur). Editor has already been updated. |
| `onEditCancel` | `(sel: Selection) => void` | Edit cancelled (Escape). |

## Persisting changes

`useScore` is uncontrolled — it owns its state internally. To persist changes, read
`editor.score` whenever you need the current state:

```tsx
function AutoSave() {
  const editor = useScore(initialScore)

  React.useEffect(() => {
    localStorage.setItem('my-score', JSON.stringify(editor.score))
  }, [editor.score])

  return <ChordSheet score={editor.score} editor={editor} />
}
```

## Undo / redo

`useScore` maintains a full history stack. Every mutation is a new entry; undo/redo are
instant (no re-parsing).

```tsx
function EditorWithHistory() {
  const editor = useScore(initialScore)

  return (
    <div>
      <button onClick={editor.undo} disabled={!editor.canUndo}>Undo</button>
      <button onClick={editor.redo} disabled={!editor.canRedo}>Redo</button>
      <ChordSheet score={editor.score} editor={editor} />
    </div>
  )
}
```

## Selection model

```ts
interface Selection {
  type: 'chord' | 'lyric' | 'note' | 'rest' | 'measure' | 'beat'
  id: string       // event id (or measure id for type 'measure')
  measureId: string
  trackId: string
  beat?: number
}
```

Use `editor.selection` to read the current selection, or `editor.select(id)` to set it
programmatically (e.g. to focus the first chord on mount).
