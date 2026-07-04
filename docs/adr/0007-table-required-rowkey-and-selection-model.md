# Table requires an explicit `rowKey`, and select-all governs only the visible selectable subset

Table's selection is the part of its state logic that has to survive real-world data: rows that page in and out, rows gated from selection, and controlled/uncontrolled callers. Two decisions anchor it — `rowKey` is a required, identifier-typed prop with no index fallback, and header "select all" is scoped to the currently-visible selectable rows while preserving every other selected key.

## Decision

- **`rowKey` is required and identifier-typed.** The field form (`RowKey<T>`) accepts only string / number fields of `T`; the function form returns `string | number`. There is no fallback to the array index — an index fallback silently breaks reordering, filtering, pagination, selection identity, and React reconciliation, so the type forces a stable identifier. Raw values are stringified; in development only (never under `test` / `production`), nullish, `Symbol`, other non-string/number, and duplicate keys each warn once per fingerprint.
- **Selection is controlled by `selectedRowKeys` presence** (mirroring Select and DatePicker): present ⇒ controlled, absent ⇒ internal state seeded from `defaultSelectedRowKeys`. Passing both warns in dev; switching modes after mount warns in dev. There is no runtime throw.
- **Select-all governs only the visible selectable subset.** `allSelected` and the indeterminate state are computed against rows whose `getCheckboxProps().disabled` is falsy. Toggling the header preserves two classes of already-selected keys it must not touch: keys for disabled visible rows, and keys no longer present in `dataSource` (e.g. selected on another page). Select-all emits visible-selectable keys first then the preserved tail (deduplicated, order-stable); deselect-all emits only the preserved keys.
- **`onSelectedRowKeysChange(keys, rows)`** emits the next key list plus the matching records walked in `dataSource` order. Off-page keys stay in `keys` but cannot appear in `rows` (their record isn't on the current page), so callers own cross-page record lookup.
- **Per-row control via `getCheckboxProps`** supplies `disabled` (the select-all gate) and other safe checkbox props. Its ownership-narrowed type and runtime state-key stripping are the category-3 pattern governed by [ADR-0004](0004-props-vocabulary.md), not restated here.

## Consequences

- Cross-page selection "just works": a caller holding keys from many pages can toggle the current page's header without losing the rest, because preservation is keyed on `dataSource` membership + `disabled`, not on a global row set the Table does not have.
- Requiring `rowKey` is a one-time onboarding cost — it is the third frozen base-case concept under [ADR-0004](0004-props-vocabulary.md)'s Rule B (`columns` + `dataSource` + `rowKey`) — paid to eliminate a class of silent identity bugs.
- Diagnostics are dev-only and fingerprinted, so a stable bad shape warns once while identical duplicates scrolling past stay quiet, at no production cost.
