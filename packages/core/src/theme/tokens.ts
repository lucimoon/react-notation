/** All recognised --notation-* token names and their default values. */
export interface ThemeTokens {
  // Typography
  'font-family': string
  'font-size-base': string
  'font-size-chord': string
  'font-size-lyric': string
  'font-size-label': string
  'font-weight-chord': string
  'font-weight-lyric': string

  // Color
  'color-chord': string
  'color-lyric': string
  'color-section-label': string
  'color-measure-border': string
  'color-rehearsal-mark': string
  'color-background': string

  // Spacing
  'measure-gap': string
  'beat-gap': string
  'line-gap': string
  'section-gap': string

  // Borders
  'measure-border-width': string
  'measure-border-style': string
  'measure-border-radius': string
}

export const defaultTokens: ThemeTokens = {
  'font-family': 'Georgia, "Times New Roman", serif',
  'font-size-base': '1rem',
  'font-size-chord': '1rem',
  'font-size-lyric': '0.9375rem',
  'font-size-label': '0.75rem',
  'font-weight-chord': '600',
  'font-weight-lyric': '400',

  'color-chord': 'inherit',
  'color-lyric': 'inherit',
  'color-section-label': 'inherit',
  'color-measure-border': 'currentColor',
  'color-rehearsal-mark': 'inherit',
  'color-background': 'transparent',

  'measure-gap': '1rem',
  'beat-gap': '0.5rem',
  'line-gap': '1.5rem',
  'section-gap': '2rem',

  'measure-border-width': '1px',
  'measure-border-style': 'solid',
  'measure-border-radius': '0',
}
