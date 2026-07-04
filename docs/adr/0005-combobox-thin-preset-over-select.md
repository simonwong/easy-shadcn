# Ship Combobox as a thin preset delegating to Select

`registry/ui/combobox.tsx` is an always-searchable, single-select autocomplete. Rather than build it from scratch on the `components/ui/combobox` primitive, it forwards a closed, enumerated prop set to `registry/ui/select.tsx` with `searchable` forced on and `multiple` made unavailable.

## Decision

`Combobox` renders `<Select searchable … />`. It re-declares an explicit `ComboboxProps` interface (no `extends`, no `...rest` spread) and forwards only the enumerated props 1:1 — the slot names already match Select's (`className`, `inputClassName`, `contentClassName`, `itemClassName`, `emptyClassName`), so nothing is renamed. `value` presence is detected with `"value" in props` and the key is forwarded conditionally, so Combobox's controlled/uncontrolled decision mirrors Select's own `"value" in props` check even for `value={undefined}`.

## Why delegate, not reimplement

A searchable single-select Select already _is_ a combobox: its `effectiveSearchable` branch renders `ComboboxPrimitive.Input` inside an `InputGroup`, sharing the same `components/ui/combobox` primitive. A parallel implementation would duplicate `useSelectItems` (the `value→item` index, default filter, `itemToStringLabel`), the value/open controlled-state hooks, and the adornment/clear machinery for zero behavioral gain. Delegation keeps the component surgical (~1 real branch) and 80/20, and dissolves three ambiguities up front: there is no trigger button, no non-searchable mode, and no mode-selection props to disambiguate.

The only opinion Combobox bakes in over Select is the narrower, discoverable API — the shadcn-canonical name and autocomplete mental model, with the `searchable` / `multiple` / async / chips surface removed.

## Why the enumerated prop set is closed

Delegating means the passthrough surface is deliberately shut: only the listed props reach Select. Anything unlisted (grouped items, heterogeneous bodies, async loaders, multi-select) is out of scope and routes the user to `Select` or the primitives. This prevents Combobox from silently re-growing into Select-with-extra-steps.

## Slice structure

Built test-first in vertical slices, each red-green-refactor: (1) skeleton + search/selection + styling slots, (2) open state + core ARIA, (3) controlled value + placeholder, (4) empty-string vs `undefined` semantics, (5) disabled states, (6) clearable, (7) custom filter, (8) form integration + form ARIA, (9) demo + docs. Because behavior is delegated, most slices assert that Select's existing capability is correctly surfaced through the narrowed API rather than adding new logic; the one genuinely new branch is the controlled-value forwarding.

## Consequences

- Combobox inherits Select's behavior and bug fixes for free; regressions in the shared hooks are caught by both test suites.
- The component file carries almost no logic, so its coverage comes from exercising the delegation surface (slot classNames, controlled/uncontrolled value, disabled, clearable, filter, form) — 100% at time of writing.
- Fallback if the naming/discoverability value is ever judged insufficient: drop the component and document `<Select searchable />` under the Combobox doc page instead.
