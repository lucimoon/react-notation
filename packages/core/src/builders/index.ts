import type {
  MusicScore,
  Track,
  Measure,
  Note,
  Chord,
  Lyric,
  Rest,
  TimeSignature,
  KeySignature,
  Clef,
  Duration,
  Pitch,
  ChordQuality,
  Articulation,
  Dynamic,
  Technique,
  Barline,
} from '../types'

function uid(): string {
  return crypto.randomUUID()
}

// ─── Score ────────────────────────────────────────────────────────────────────

interface CreateScoreOptions {
  id?: string
  title?: string
  composer?: string
  tempo?: number
  timeSignature?: TimeSignature
  keySignature?: KeySignature
  tracks?: Track[]
  metadata?: Record<string, unknown>
}

export function createScore(options: CreateScoreOptions = {}): MusicScore {
  return {
    id: options.id ?? uid(),
    title: options.title,
    composer: options.composer,
    tempo: options.tempo ?? 120,
    timeSignature: options.timeSignature ?? { beats: 4, value: 4 },
    keySignature: options.keySignature ?? { root: 'C', mode: 'major' },
    tracks: options.tracks ?? [],
    metadata: options.metadata,
  }
}

// ─── Track ────────────────────────────────────────────────────────────────────

interface CreateTrackOptions {
  id?: string
  name?: string
  instrument?: string
  clef?: Clef
  strings?: number
  measures?: Measure[]
}

export function createTrack(options: CreateTrackOptions = {}): Track {
  return {
    id: options.id ?? uid(),
    name: options.name,
    instrument: options.instrument,
    clef: options.clef ?? 'treble',
    strings: options.strings,
    measures: options.measures ?? [],
  }
}

// ─── Measure ──────────────────────────────────────────────────────────────────

interface CreateMeasureOptions {
  id?: string
  number: number
  timeSignature?: TimeSignature
  keySignature?: KeySignature
  rehearsalMark?: string
  section?: string
  events?: Measure['events']
  barline?: Barline
}

export function createMeasure(options: CreateMeasureOptions): Measure {
  return {
    id: options.id ?? uid(),
    number: options.number,
    timeSignature: options.timeSignature,
    keySignature: options.keySignature,
    rehearsalMark: options.rehearsalMark,
    section: options.section,
    events: options.events ?? [],
    barline: options.barline,
  }
}

// ─── Note ─────────────────────────────────────────────────────────────────────

interface CreateNoteOptions {
  id?: string
  beat: number
  duration: Duration
  pitch: Pitch
  tied?: boolean
  articulation?: Articulation
  dynamic?: Dynamic
  string?: number
  fret?: number
  technique?: Technique
}

export function createNote(options: CreateNoteOptions): Note {
  return {
    id: options.id ?? uid(),
    type: 'note',
    beat: options.beat,
    duration: options.duration,
    pitch: options.pitch,
    tied: options.tied,
    articulation: options.articulation,
    dynamic: options.dynamic,
    string: options.string,
    fret: options.fret,
    technique: options.technique,
  }
}

// ─── Chord ────────────────────────────────────────────────────────────────────

interface CreateChordOptions {
  id?: string
  beat: number
  duration: Duration
  symbol: string
  root: string
  quality?: ChordQuality
  bass?: string
  voicing?: number[]
}

export function createChord(options: CreateChordOptions): Chord {
  return {
    id: options.id ?? uid(),
    type: 'chord',
    beat: options.beat,
    duration: options.duration,
    symbol: options.symbol,
    root: options.root,
    quality: options.quality ?? 'major',
    bass: options.bass,
    voicing: options.voicing,
  }
}

// ─── Lyric ────────────────────────────────────────────────────────────────────

interface CreateLyricOptions {
  id?: string
  beat: number
  duration: Duration
  text: string
  syllable?: Lyric['syllable']
  verse?: number
}

export function createLyric(options: CreateLyricOptions): Lyric {
  return {
    id: options.id ?? uid(),
    type: 'lyric',
    beat: options.beat,
    duration: options.duration,
    text: options.text,
    syllable: options.syllable,
    verse: options.verse,
  }
}

// ─── Rest ─────────────────────────────────────────────────────────────────────

interface CreateRestOptions {
  id?: string
  beat: number
  duration: Duration
  full?: boolean
}

export function createRest(options: CreateRestOptions): Rest {
  return {
    id: options.id ?? uid(),
    type: 'rest',
    beat: options.beat,
    duration: options.duration,
    full: options.full,
  }
}
