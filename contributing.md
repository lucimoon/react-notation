# Contributing

## Repo structure

```
stave/
├── packages/
│   ├── core/               # The library itself
│   │   ├── src/
│   │   │   ├── types/      # MusicScore schema, all TypeScript types
│   │   │   ├── builders/   # createScore, createTrack, etc.
│   │   │   ├── components/ # React components (one folder per component)
│   │   │   ├── hooks/      # useTranspose, usePlayback, etc.
│   │   │   ├── utils/      # Chord parsing, duration math, key utils
│   │   │   └── theme/      # ThemeProvider, defineTheme, default tokens
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── docs/               # Docusaurus site
│       ├── docs/           # Markdown pages
│       ├── src/            # Custom React components for docs
│       └── package.json
├── .storybook/
├── pnpm-workspace.yaml
├── package.json            # Root: scripts, lint, test
└── turbo.json              # Turborepo build pipeline
```

---

## Setup

**Requirements:** Node 18+, pnpm 8+

```bash
git clone https://github.com/your-org/stave
cd stave
pnpm install

# Run everything in dev
pnpm dev

# Library only
pnpm --filter core dev

# Docs only
pnpm --filter docs dev

# Storybook
pnpm storybook
```

---

## Adding a component

1. Create a folder under `packages/core/src/components/MyComponent/`
2. Files to include:
   ```
   MyComponent/
   ├── MyComponent.tsx       # Component implementation
   ├── MyComponent.test.tsx  # Unit + snapshot tests
   ├── MyComponent.stories.tsx  # Storybook stories
   └── index.ts              # Re-export
   ```
3. Export from `packages/core/src/index.ts`
4. Add a docs page under `packages/docs/docs/components/my-component.md`
5. Add a Storybook embed to the docs page

Every component ships with its docs page. A component without docs is not considered done.

---

## Component conventions

```tsx
// Props always extend a base HTML element's props for forwarding
interface ChordChartProps extends React.HTMLAttributes<HTMLDivElement> {
  score: MusicScore
  showDiagrams?: boolean    // default false
  className?: string
}

export const ChordChart = React.forwardRef<HTMLDivElement, ChordChartProps>(
  ({ score, showDiagrams = false, className, ...rest }, ref) => {
    return (
      <div ref={ref} className={cx("stave-chord-chart", className)} {...rest}>
        {/* ... */}
      </div>
    )
  }
)
ChordChart.displayName = "ChordChart"
```

- All components are `forwardRef`
- All CSS classes are prefixed `stave-`
- No hardcoded colors or sizes — use CSS token variables only
- No external runtime dependencies beyond React

---

## Testing

```bash
pnpm test          # vitest, all packages
pnpm test:watch
pnpm test:coverage
```

Snapshot tests render components to SVG/HTML strings and diff them. Update snapshots
intentionally with `pnpm test -- --update-snapshots`.

Visual regression testing (Chromatic + Storybook) is run on pull requests.

---

## Docs conventions

Each component page should include:

1. **One-line description** of what the component does
2. **Live Storybook embed** (use the `<StorybookEmbed>` MDX component)
3. **Minimal usage example** — the smallest possible working code
4. **Props table** (auto-generated from TSDoc via `docusaurus-plugin-typedoc`)
5. **Known limitations** if any

---

## Proposing changes to the data model

The `MusicScore` schema is the shared contract between all components. Changes to it are
breaking changes. Use the RFC process:

1. Copy `rfcs/0000-template.md` to `rfcs/0000-your-feature.md`
2. Fill it out (motivation, proposed shape, alternatives considered)
3. Open a PR — discussion happens in the PR
4. Once merged to `rfcs/`, implementation can begin

---

## Releasing

This repo uses [Changesets](https://github.com/changesets/changesets).

```bash
pnpm changeset        # describe your change
pnpm changeset version  # bump versions (CI does this)
pnpm changeset publish  # publish to npm (CI does this)
```

Semver policy:
- **Patch** — bug fixes, visual tweaks, docs
- **Minor** — new components, new props, additive data model changes
- **Major** — breaking data model changes, removed components, renamed props
