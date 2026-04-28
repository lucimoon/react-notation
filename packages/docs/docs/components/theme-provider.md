---
sidebar_position: 9
---

# ThemeProvider

Applies a custom theme by injecting `--notation-*` CSS variables onto a wrapper div.

## Usage

```tsx
import { ThemeProvider, defineTheme } from 'react-notation'

const theme = defineTheme({
  'color-chord': '#1a6cf5',
  'font-size-chord': '1.125rem',
})

<ThemeProvider theme={theme}>
  <ChordSheet score={score} />
</ThemeProvider>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `Theme` | — | Optional. Token overrides created with `defineTheme`. Omit to use library defaults. |
| `children` | `ReactNode` | — | **Required.** Content to theme. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | Forwarded to the wrapper div. |

## defineTheme

```ts
function defineTheme(tokens: Partial<ThemeTokens>): Theme
```

Creates a `Theme` object from a partial token map. Only the specified tokens are overridden.

## Nesting

ThemeProviders can be nested. The innermost provider's tokens win within its subtree.

```tsx
<ThemeProvider theme={lightTheme}>
  {/* light theme here */}
  <ThemeProvider theme={darkTheme}>
    {/* dark theme overrides within this subtree */}
  </ThemeProvider>
</ThemeProvider>
```

See the [Theming guide](../theming) for the full token reference.
