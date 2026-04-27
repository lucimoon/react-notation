# RFC 0000 — [Title]

**Status:** Draft | Under discussion | Accepted | Rejected  
**Author:**  
**Date:**  

---

## Summary

One paragraph. What are you proposing and why?

---

## Motivation

What problem does this solve? Who is affected? Link to any related issues or discussions.

---

## Proposed change

Show the before/after. For data model changes, show the TypeScript diff:

```ts
// Before
interface Measure {
  events: Event[]
}

// After
interface Measure {
  events: Event[]
  pickup?: boolean    // new: is this a pickup/anacrusis measure?
}
```

For new components, show the intended usage:

```tsx
<NewComponent score={score} someProp="value" />
```

---

## Alternatives considered

What else did you think about? Why did you rule it out?

---

## Open questions

- [ ] Question one
- [ ] Question two

---

## Implementation notes

Any known complexity, edge cases, or sequencing dependencies?
