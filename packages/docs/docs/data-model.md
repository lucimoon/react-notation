---
sidebar_position: 2
---

# Data Model

:::caution Coming in Milestone 1
Full data model documentation ships with the first component.
:::

The library is data-first. Every rendering component accepts a `MusicScore` object as its
primary prop. The schema is a plain TypeScript object tree — no classes, no magic.

## Type hierarchy

```
MusicScore
  └── Track[]
        └── Measure[]
              └── Event[] (Note | Chord | Lyric | Rest)
```

Full type reference and builder helper documentation coming soon.
