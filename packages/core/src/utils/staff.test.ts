import { describe, it, expect } from 'vitest'
import {
  trebleStaffPosition,
  bassStaffPosition,
  staffPositionToY,
  stemDirection,
  ledgerLinePositions,
  isDotted,
  isFilledNotehead,
  isBeamable,
  flagCount,
  beamGroups,
  trebleKeyAccidentals,
} from './staff'
import { createNote } from '../builders'

// ─── trebleStaffPosition ──────────────────────────────────────────────────────

describe('trebleStaffPosition', () => {
  it('E4 = position 0 (bottom line)', () => {
    expect(trebleStaffPosition({ step: 'E', octave: 4 })).toBe(0)
  })
  it('F4 = position 1 (first space)', () => {
    expect(trebleStaffPosition({ step: 'F', octave: 4 })).toBe(1)
  })
  it('G4 = position 2 (second line)', () => {
    expect(trebleStaffPosition({ step: 'G', octave: 4 })).toBe(2)
  })
  it('B4 = position 4 (middle line)', () => {
    expect(trebleStaffPosition({ step: 'B', octave: 4 })).toBe(4)
  })
  it('F5 = position 8 (top line)', () => {
    expect(trebleStaffPosition({ step: 'F', octave: 5 })).toBe(8)
  })
  it('C4 (middle C) = position -2', () => {
    expect(trebleStaffPosition({ step: 'C', octave: 4 })).toBe(-2)
  })
  it('D4 = position -1 (just below staff)', () => {
    expect(trebleStaffPosition({ step: 'D', octave: 4 })).toBe(-1)
  })
  it('C5 = position 5 (third space)', () => {
    expect(trebleStaffPosition({ step: 'C', octave: 5 })).toBe(5)
  })
})

// ─── bassStaffPosition ────────────────────────────────────────────────────────

describe('bassStaffPosition', () => {
  it('G2 = position 0 (bottom line)', () => {
    expect(bassStaffPosition({ step: 'G', octave: 2 })).toBe(0)
  })
  it('A3 = position 8 (top line)', () => {
    expect(bassStaffPosition({ step: 'A', octave: 3 })).toBe(8)
  })
})

// ─── staffPositionToY ─────────────────────────────────────────────────────────

describe('staffPositionToY', () => {
  const sp = 10

  it('bottom line (pos 0) → y = 4*sp', () => {
    expect(staffPositionToY(0, sp)).toBe(40)
  })
  it('top line (pos 8) → y = 0', () => {
    expect(staffPositionToY(8, sp)).toBe(0)
  })
  it('middle line (pos 4) → y = 2*sp', () => {
    expect(staffPositionToY(4, sp)).toBe(20)
  })
  it('middle C (pos -2) → y = 5*sp (below staff)', () => {
    expect(staffPositionToY(-2, sp)).toBe(50)
  })
})

// ─── stemDirection ────────────────────────────────────────────────────────────

describe('stemDirection', () => {
  it('B4 (pos 4, middle line) → down', () => {
    expect(stemDirection(4)).toBe('down')
  })
  it('above middle line → down', () => {
    expect(stemDirection(6)).toBe('down')
    expect(stemDirection(8)).toBe('down')
  })
  it('below middle line → up', () => {
    expect(stemDirection(3)).toBe('up')
    expect(stemDirection(0)).toBe('up')
    expect(stemDirection(-2)).toBe('up')
  })
})

// ─── ledgerLinePositions ──────────────────────────────────────────────────────

describe('ledgerLinePositions', () => {
  it('note within staff → no ledger lines', () => {
    expect(ledgerLinePositions(0)).toEqual([])
    expect(ledgerLinePositions(4)).toEqual([])
    expect(ledgerLinePositions(8)).toEqual([])
  })
  it('D4 (pos -1, space just below staff) → no ledger lines', () => {
    expect(ledgerLinePositions(-1)).toEqual([])
  })
  it('G5 (pos 9, space just above staff) → no ledger lines', () => {
    expect(ledgerLinePositions(9)).toEqual([])
  })
  it('C4 middle C (pos -2) → [-2]', () => {
    expect(ledgerLinePositions(-2)).toEqual([-2])
  })
  it('B3 (pos -3) → [-2]', () => {
    expect(ledgerLinePositions(-3)).toEqual([-2])
  })
  it('A3 (pos -4) → [-2, -4]', () => {
    expect(ledgerLinePositions(-4)).toEqual([-2, -4])
  })
  it('A5 (pos 10) → [10]', () => {
    expect(ledgerLinePositions(10)).toEqual([10])
  })
  it('B5 (pos 11) → [10]', () => {
    expect(ledgerLinePositions(11)).toEqual([10])
  })
  it('C6 (pos 12) → [10, 12]', () => {
    expect(ledgerLinePositions(12)).toEqual([10, 12])
  })
})

// ─── Duration helpers ─────────────────────────────────────────────────────────

describe('isDotted', () => {
  it('dotted durations', () => {
    expect(isDotted('quarter-dotted')).toBe(true)
    expect(isDotted('half-dotted')).toBe(true)
  })
  it('plain durations', () => {
    expect(isDotted('quarter')).toBe(false)
    expect(isDotted('whole')).toBe(false)
  })
})

describe('isFilledNotehead', () => {
  it('quarter and shorter → filled', () => {
    expect(isFilledNotehead('quarter')).toBe(true)
    expect(isFilledNotehead('eighth')).toBe(true)
    expect(isFilledNotehead('sixteenth')).toBe(true)
  })
  it('half and whole → open', () => {
    expect(isFilledNotehead('half')).toBe(false)
    expect(isFilledNotehead('whole')).toBe(false)
  })
})

describe('isBeamable', () => {
  it('eighth and sixteenth → beamable', () => {
    expect(isBeamable('eighth')).toBe(true)
    expect(isBeamable('sixteenth')).toBe(true)
  })
  it('quarter and longer → not beamable', () => {
    expect(isBeamable('quarter')).toBe(false)
    expect(isBeamable('half')).toBe(false)
  })
})

describe('flagCount', () => {
  it('eighth → 1 flag', () => expect(flagCount('eighth')).toBe(1))
  it('sixteenth → 2 flags', () => expect(flagCount('sixteenth')).toBe(2))
  it('quarter → 0 flags', () => expect(flagCount('quarter')).toBe(0))
})

// ─── beamGroups ───────────────────────────────────────────────────────────────

describe('beamGroups', () => {
  const ts = { beats: 4, value: 4 }

  it('returns empty when no beamable notes', () => {
    const notes = [
      createNote({ pitch: { step: 'C', octave: 5 }, duration: 'quarter', beat: 1 }),
    ]
    expect(beamGroups(notes, ts)).toEqual([])
  })

  it('groups two eighth notes on same beat', () => {
    const notes = [
      createNote({ pitch: { step: 'C', octave: 5 }, duration: 'eighth', beat: 1 }),
      createNote({ pitch: { step: 'D', octave: 5 }, duration: 'eighth', beat: 1.5 }),
    ]
    const groups = beamGroups(notes, ts)
    expect(groups).toHaveLength(1)
    expect(groups[0]).toHaveLength(2)
  })

  it('does not group eighth notes on different beats', () => {
    const notes = [
      createNote({ pitch: { step: 'C', octave: 5 }, duration: 'eighth', beat: 1 }),
      createNote({ pitch: { step: 'D', octave: 5 }, duration: 'eighth', beat: 2 }),
    ]
    const groups = beamGroups(notes, ts)
    // Each is alone in its beat group → filtered out (< 2 notes)
    expect(groups).toHaveLength(0)
  })

  it('groups four eighth notes on beats 1 & 2 into two beam groups', () => {
    const notes = [
      createNote({ pitch: { step: 'C', octave: 5 }, duration: 'eighth', beat: 1 }),
      createNote({ pitch: { step: 'D', octave: 5 }, duration: 'eighth', beat: 1.5 }),
      createNote({ pitch: { step: 'E', octave: 5 }, duration: 'eighth', beat: 2 }),
      createNote({ pitch: { step: 'F', octave: 5 }, duration: 'eighth', beat: 2.5 }),
    ]
    const groups = beamGroups(notes, ts)
    expect(groups).toHaveLength(2)
    expect(groups[0]).toHaveLength(2)
    expect(groups[1]).toHaveLength(2)
  })
})

// ─── trebleKeyAccidentals ─────────────────────────────────────────────────────

describe('trebleKeyAccidentals', () => {
  it('C major → no accidentals', () => {
    expect(trebleKeyAccidentals({ root: 'C', mode: 'major' })).toEqual([])
  })

  it('G major → 1 sharp at position 8 (F5)', () => {
    const acc = trebleKeyAccidentals({ root: 'G', mode: 'major' })
    expect(acc).toHaveLength(1)
    expect(acc[0]).toEqual({ staffPos: 8, alter: 1 })
  })

  it('D major → 2 sharps', () => {
    const acc = trebleKeyAccidentals({ root: 'D', mode: 'major' })
    expect(acc).toHaveLength(2)
    expect(acc.every((a) => a.alter === 1)).toBe(true)
  })

  it('F major → 1 flat at position 4 (B4)', () => {
    const acc = trebleKeyAccidentals({ root: 'F', mode: 'major' })
    expect(acc).toHaveLength(1)
    expect(acc[0]).toEqual({ staffPos: 4, alter: -1 })
  })

  it('Bb major → 2 flats', () => {
    const acc = trebleKeyAccidentals({ root: 'Bb', mode: 'major' })
    expect(acc).toHaveLength(2)
    expect(acc.every((a) => a.alter === -1)).toBe(true)
  })

  it('A minor (= C major) → no accidentals', () => {
    expect(trebleKeyAccidentals({ root: 'A', mode: 'minor' })).toEqual([])
  })

  it('E minor (= G major) → 1 sharp', () => {
    const acc = trebleKeyAccidentals({ root: 'E', mode: 'minor' })
    expect(acc).toHaveLength(1)
    expect(acc[0].alter).toBe(1)
  })
})
