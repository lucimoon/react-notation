// ─── Primitives ──────────────────────────────────────────────────────────────

export type Duration =
  | 'whole'
  | 'half'
  | 'quarter'
  | 'eighth'
  | 'sixteenth'
  | 'whole-dotted'
  | 'half-dotted'
  | 'quarter-dotted'
  | 'eighth-dotted'
  | 'half-triplet'
  | 'quarter-triplet'
  | 'eighth-triplet'

export type Step = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

export interface Pitch {
  step: Step
  octave: number
  /** -1 = flat, 0 = natural, 1 = sharp */
  alter?: -1 | 0 | 1
}

export type Clef = 'treble' | 'bass' | 'alto' | 'tenor' | 'tab'

export type Barline = 'single' | 'double' | 'final' | 'repeat-start' | 'repeat-end'

export interface TimeSignature {
  beats: number
  value: number
}

export interface KeySignature {
  root: string
  mode: 'major' | 'minor'
}

export type Articulation = 'staccato' | 'accent' | 'tenuto' | 'fermata'

export type Dynamic = 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff'

export type Technique =
  | 'bend'
  | 'slide-up'
  | 'slide-down'
  | 'hammer-on'
  | 'pull-off'
  | 'vibrato'

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'dominant7'
  | 'maj7'
  | 'min7'
  | 'dim'
  | 'dim7'
  | 'aug'
  | 'sus2'
  | 'sus4'
  | 'add9'
  | 'min9'
  | 'maj9'
  | '6'
  | 'min6'
  | 'power'

// ─── Events ──────────────────────────────────────────────────────────────────

export interface BaseEvent {
  id: string
  /** 1-based position in measure; supports fractions e.g. 1.5 */
  beat: number
  duration: Duration
}

export interface Note extends BaseEvent {
  type: 'note'
  pitch: Pitch
  tied?: boolean
  articulation?: Articulation
  dynamic?: Dynamic
  /** Tab: string number (1 = highest) */
  string?: number
  /** Tab: fret number */
  fret?: number
  technique?: Technique
}

export interface Chord extends BaseEvent {
  type: 'chord'
  /** Display symbol, e.g. "Cmaj7", "F#m", "Bb7" */
  symbol: string
  /** Root note letter, e.g. "C", "F#", "Bb" */
  root: string
  quality: ChordQuality
  /** Slash chord bass note, e.g. "E" in "C/E" */
  bass?: string
  /** Fret positions per string for diagram rendering */
  voicing?: number[]
}

export interface Lyric extends BaseEvent {
  type: 'lyric'
  text: string
  syllable?: 'begin' | 'middle' | 'end' | 'single'
  verse?: number
}

export interface Rest extends BaseEvent {
  type: 'rest'
  /** True when this rest fills the entire measure */
  full?: boolean
}

export type Event = Note | Chord | Lyric | Rest

// ─── Structure ───────────────────────────────────────────────────────────────

export interface Measure {
  id: string
  number: number
  timeSignature?: TimeSignature
  keySignature?: KeySignature
  /** Rehearsal mark, e.g. "A", "Chorus" */
  rehearsalMark?: string
  /** Section label, e.g. "Verse", "Bridge" — used for visual grouping */
  section?: string
  events: Event[]
  barline?: Barline
}

export interface Track {
  id: string
  name?: string
  instrument?: string
  clef: Clef
  /** Tab only — number of strings, default 6 */
  strings?: number
  measures: Measure[]
}

export interface MusicScore {
  id: string
  title?: string
  composer?: string
  /** BPM, default 120 */
  tempo?: number
  timeSignature: TimeSignature
  keySignature: KeySignature
  tracks: Track[]
  metadata?: Record<string, unknown>
}
