# Table column filtering

## Contract

Table keeps its first-use interface: `columns`, `dataSource`, `rowKey`. Optional column filtering adds finite option lists without a second Table or a TanStack dependency.

- `column.filter` is a configuration with `items: { value: string; label: ReactNode; disabled?: boolean }[]`, optional `multiple` (default true), and optional `label` for an accessible filter name when the column title is not text. Local mode (default) requires pure, non-throwing `onFilter(value, record)`; `mode: "external"` forbids this predicate and only emits intent.
- Root `filters`, `defaultFilters`, and `onFiltersChange` use `TableFilters = Record<string, string[]>`. Defined `filters` controls state; `{}` clears all. Defaults are mount-only and ignored when controlled.
- Effective values must belong to the current unique column and unique option keys. Ignore unknown columns/options and deduplicate values. Single mode uses the first matching option in option order. Invalid, removed, or ambiguous configuration has no effective filter; retain stored intent so restoring configuration restores it. Special string keys such as `__proto__` are ordinary identities, not object inheritance.
- A column button opens a named primitive Popover. Multiple choice uses checkboxes; single choice uses a radio group. Draft changes stay inside the panel until Apply. Escape/outside dismissal discards the draft. Reset clears only that column and commits immediately. Reopening reads accepted state, including controlled refusal. Changes to accepted values or option identities, disabled state, mode, or multiplicity while open discard stale drafts. Loading disables opening and every draft/commit control, including a panel already open.
- Active buttons show a visible selected-option count and a meaningful accessible name. Sort and filter buttons are siblings; applying a filter never cycles sort or submits a surrounding form. Primitive focus, Escape, outside dismissal, and positioning remain authoritative.
- Values within one column combine with OR; active local columns combine with AND. Resolve row identity/source indices first, then filter, stable sort, and paginate. No input mutation or automatic comparator/matcher guessing.
- Local pagination uses the filtered count. An effective filter change resets enabled uncontrolled local pagination to page one. Data changes and sorting retain existing page/clamp behavior. Controlled page and external data remain caller-owned.
- A user filter commit emits one `onFiltersChange(next, { columnKey, pagination: { value: 1 } | null })` intent. Pagination is null when disabled. Controlled/external consumers accept filters and page one together in this callback. Do not emit a second page callback or auto-fetch. No callback on mount, prop/config/data change, cancelled draft, or unchanged commit. Controlled refusal does not reset an uncontrolled page because effective filters did not change.
- Header selection affects only visible eligible rows. Filtered-out, off-page, disabled, readonly, and absent selected keys survive. Selection callback records still come from the complete supplied data in source order. All existing index callbacks keep source indices. Empty filtered results use the existing empty state.
- External mode never filters supplied rows. Explicit local predicates combined with external pagination filter only supplied rows and do not change the caller's total. Callers own requests, races, URL state, and server totals.

## Boundary

No free-text search, nested filter trees, custom filter renderers, prop bags, automatic field matching, global reset toolbar, or remote fetching in this slice. The first Table example remains unchanged. Finite column filters follow the existing stateful-Compose coverage rule; further filter kinds need their own finite contract.

## Verification

Public-interface tests cover draft/apply/reset/dismissal, OR/AND, single mode, controlled refusal, external intent, dynamic/invalid values, loading, sorting/paging/selection integration, source-index preservation, and special string keys. Type fixtures cover the local/external union and ownership. Verify focused and full tests, typecheck, targeted lint, registry parity, production build, and browser keyboard/touch/narrow-screen interactions.

Reference: [Ant Design Table filtering](https://ant.design/components/table/), reviewed for option filtering and page-reset expectations. This contract preserves this repository's separate state callbacks rather than adopting Ant Design's combined `onChange` API.
