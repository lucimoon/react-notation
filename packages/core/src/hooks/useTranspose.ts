import { useMemo } from 'react'
import { transposeScore } from '../utils/transpose'
import type { MusicScore } from '../types'
import type { TransposeOptions } from '../utils/transpose'

/**
 * Returns a memoized transposed copy of `score`.
 * The result is only recomputed when `score`, `semitones`, or `options` change.
 *
 * Positive semitones = up, negative = down. Returns the original reference when semitones === 0.
 */
export function useTranspose(
  score: MusicScore,
  semitones: number,
  options?: TransposeOptions
): MusicScore {
  const preferFlats = options?.preferFlats ?? false
  return useMemo(
    () => transposeScore(score, semitones, { preferFlats }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [score, semitones, preferFlats]
  )
}
