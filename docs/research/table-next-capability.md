# Table: the next capability boundary

Research date: 2026-09-05.

## Recommendation

Deepen the existing `Table` with optional single-column sorting. Keep the first example and its three concepts unchanged: `columns`, `dataSource`, and `rowKey`. Deliver local comparison and externally ordered data through one column-level declaration. Do not introduce a second DataTable owner or replace the existing selection implementation.

This is a product recommendation inferred from the verified gaps and ownership rules below, not a claim that an upstream library prescribes this Interface.

## Verified starting point

- The [roadmap](../compose-roadmap.md) marks Sidebar complete and Table as “Keep and deepen”; no unresearched high-value boundary remains queued.
- [Table source](../../registry/ui/table.tsx) generates headers and row metadata, owns selection and row identity, and renders rows in input order. Its column and root Interfaces contain no sorting, pagination, or expansion state.
- The [Table documentation](../../content/docs/components/table.mdx) currently delegates sorting, filtering, and pagination to the caller. That blanket exclusion needs narrowing when this capability ships.
- [ADR-0004](../adr/0004-props-vocabulary.md) identifies Table as a state-machine component whose costly primitive fallback justifies deeper coverage, while freezing the first-use concept count.

Sorting has the smallest useful boundary: it connects a column header to row order without adding a footer, changing page membership, or introducing a second row hierarchy. Pagination adds total-count, page-size, page-reset, and bulk-selection membership policies. Expansion adds detail-content ownership and row hierarchy. Those remain separate candidates after sorting.

## Primary-source evidence

The shadcn Data Table guide builds on the Table primitive and presents sorting, pagination, filtering, and selection as composed capabilities. It deliberately offers a guide rather than one universal DataTable component. This supports retaining easy-shadcn's existing owner and adding a bounded capability. The current guide shows TanStack v9; implementation should not copy v8 setup code into it. [shadcn Data Table](https://ui.shadcn.com/docs/components/base/data-table)

TanStack's versioned sorting guide separates sorting state from row transformation. Manual sorting leaves supplied data in its existing order. It warns that local sorting combined with server pagination or filtering only sorts loaded records. A custom comparator describes ascending order; the table applies descending inversion. These are useful behavioral precedents without requiring TanStack as a dependency. [TanStack Table v8 sorting guide](https://tanstack.com/table/v8/docs/guide/sorting)

WAI's table pattern preserves native table semantics, permits independently focusable controls within cells, and places `aria-sort` on the sorted header cell. This supports a native header button and a single sorted header rather than converting the table into an interactive grid. [WAI Table Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/)

## Proposed Interface

```ts
type TableSort = {
  columnKey: string;
  order: "ascend" | "descend";
};

// Optional additions to existing types.
type SortingColumn<T> = {
  sorter?: true | ((a: T, b: T) => number);
};

type SortingTableProps = {
  sort?: TableSort | null;
  defaultSort?: TableSort | null;
  onSortChange?: (sort: TableSort | null) => void;
};
```

`sorter` absent means a normal header. A comparator opts into local sorting; `true` exposes the same control but leaves data order to the caller. This avoids a redundant root mode flag. `undefined` controlled state means uncontrolled; explicit `null` means controlled unsorted state. `sort` overrides `defaultSort`.

The proposed field names describe the existing `column.key` model. They are not aliases for TanStack's array-based sorting state. Only one column is active. Clicking an inactive sortable column requests ascending order; repeated activation requests descending order, then clears sorting. Switching columns starts ascending order. Shift does not add multi-sort.

## Behavioral contract

- Resolve keys, checkbox eligibility, and original indices before sorting. Sort a copy of row metadata, not `dataSource` or records. Equal comparisons preserve input order in both directions.
- Preserve original indices for `rowKey`, `column.render`, `getCheckboxProps`, `rowClassName`, and `onRowClick`. Preserve `onSelectedRowKeysChange` records in `dataSource` order. Visual order does not change row identity or selection membership.
- A comparator receives full records and must be pure and non-throwing. The caller owns null, date, locale, and domain-specific comparisons. No implicit value-type guessing is needed.
- `sorter: true` never invokes a comparator or transforms rows. The caller owns fetching, cancellation, errors, URL state, pagination, and replacing the data. Use controlled `sort` when the caller must decide when a requested order becomes active.
- Local comparators apply only to supplied records. Remote pagination or filtering should use `sorter: true` to keep whole-dataset order in the caller's authority.
- Invalid keys and non-sortable columns produce no effective sort and no change callback during render or prop reconciliation. Column keys remain unique under the existing contract.
- Render a fixed native `type="button"` control. Its label comes from the column title; sortable titles must contain non-interactive, meaningfully named content. No new header prop bag may override the click dispatcher or `aria-sort`. A direction icon supplies a visible non-color signal.
- Only the active sorted header receives `aria-sort="ascending"` or `"descending"`. Unsorted headers omit it. Keyboard activation follows native Enter/Space button behavior. Loading can disable sort controls while preserving the chosen state.

## Independent acceptance surface

1. Local ascending, descending, reset, column switching, stable ties, and frozen input arrays; missing or empty data remains safe.
2. Uncontrolled defaults, controlled `null`, delayed parent acceptance, external state updates, and no mount/reconciliation callback.
3. External ordering remains byte-for-byte in supplied order through all header actions; callback receives only the next single-column intent.
4. Selection survives reorder; disabled/readonly eligibility, preserved off-page keys, bulk behavior, and callback record order remain unchanged.
5. Every index-sensitive callback observes its original source index after sorting, including function-form row keys.
6. Invalid sort keys, removed sortable columns, and columns whose sorter changes stop effective sorting without phantom callbacks.
7. Header native semantics, keyboard activation, focus, `aria-sort`, loading-disabled behavior, and form non-submission.
8. Type tests preserve `defineColumns` value narrowing and reject malformed sorting state/comparators. Runtime tests prove generated sorting controls cannot be replaced through unsafe column extras.
9. Regenerate registry output; include separate local and externally ordered examples, updated API and boundary documentation, a fresh consumer install/typecheck, and a real-browser interaction check.

Pagination, filters, multi-sort, expansion, virtualization, column visibility, resizing, and a TanStack migration are not dependencies of this delivery. Keep future sorting-state expansion explicit rather than exposing unused configuration now.
