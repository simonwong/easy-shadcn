# Context

## Domain language

- **Compose layer**: The `registry/ui/*` components that wrap shadcn primitives with flat props.
- **Primitive**: The raw `components/ui/*` shadcn components with full composition freedom.
- **Thin wrapper vs. State-machine component**: The two Compose tiers. A **thin wrapper** (Card, Tabs, Tooltip, Breadcrumb, Accordion, Popover) adds almost no logic — escaping to the primitive costs ~a dozen lines, so its API stays minimal. A **state-machine component** (Table, Select, Combobox, DatePicker) owns real state logic (selection tally, async race, selected-item merge-back), so escaping is expensive and its coverage is obligated to approach 100%. This tier decides how much a Compose component must cover. See [ADR-0004](docs/adr/0004-props-vocabulary.md).
- **Command-modal**: The imperative modal state-management library in `packages/command-modal/`.
- **Handler**: The object `useModal()` returns — the modal's live state (`visible`, `args`, …) plus the imperative verbs (`show`, `hide`, `remove`, `resolve`, `reject`, `resolveHide`). The unit an Adapter consumes.
- **Adapter** (`ModalPropsAdapter`): A pure function mapping a Handler to the prop shape one modal UI library expects (e.g. shadcn `{ open, onOpenChange }`, antd `{ open, onCancel, afterClose }`). The single seam by which command-modal stays UI-library-agnostic.
- **First-class adapter**: An adapter the library ships, types, and supports. Scope: **shadcn** (default) and **antd v6**. Everything else is a BYO adapter.
- **BYO adapter**: A user-supplied Adapter. Supported by the type system (must be fully type-safe to author and consume) but not shipped or maintained by the library.
- **Resolution value** (result): The value a modal hands back to whoever opened it when it completes — what `await show(Modal)` settles with, set via `modal.resolve(value)`. Distinct from a **dismissal** (hide/remove/unregister without an explicit resolve), which settles the promise with `undefined`.
- **Group root delegation**: The pattern Compose list/group components (`radio-group`, `tabs`, `accordion`, `checkbox-group`) follow — wrap the underlying base-ui *group primitive* as the stateful root and delegate selection `value`, controlled/uncontrolled resolution, `disabled` propagation, and the native `ChangeEventDetails` to it. The Compose layer only flattens `items[]` into rendered rows; it never hand-rolls selection state, never re-enforces controlled/uncontrolled at runtime, and never invents a custom event-details shape. See [ADR-0003](docs/adr/0003-group-root-delegation.md).

## Key decisions

- Dual-layer architecture: primitives (`components/ui/*`) + Compose layer (`registry/ui/*`)
- Compose API sizing & vocabulary: no single 80/20 hard line — coverage floats with escape cost (thin-wrapper vs state-machine tiers; area may approach 100%), the base-case concept count stays frozen, `xxxProps` is ownership-type-narrowed (`Omit` the keys Compose owns), and props naming follows a fixed reference order. See [ADR-0004](docs/adr/0004-props-vocabulary.md).
- `components/ui/**` is read-only, only modified via shadcn CLI
- command-modal's only UI-library coupling is the Adapter seam; the core stays UI-agnostic. First-class targets are shadcn + antd v6; other libraries are typed-but-BYO. See [ADR-0001](docs/adr/0001-adapter-seam-and-typed-factory.md).
- A modal's resolve (result) type is carried on `create<Props, Result>`, not at the `show()` call site. See [ADR-0002](docs/adr/0002-resolve-type-on-create.md).
- Compose group components delegate selection state to the base-ui group primitive instead of hand-rolling controlled/uncontrolled state (Group root delegation). See [ADR-0003](docs/adr/0003-group-root-delegation.md).
- Select async loading is an abortable single-flight (a new fetch aborts the previous) with a bounded selected-label cache that only shows labels the loader has actually returned. See [ADR-0006](docs/adr/0006-select-async-loading-contract.md).
- Table requires an explicit `rowKey` (no index fallback), and header select-all governs only the visible selectable rows while preserving selected disabled / off-page keys. See [ADR-0007](docs/adr/0007-table-required-rowkey-and-selection-model.md).
- DatePicker's `withInput` is single-mode only; typed text is a draft committed on Enter / blur / close (Escape discards, calendar clicks win) and held to the same day constraints as the calendar. See [ADR-0008](docs/adr/0008-date-picker-input-draft-commit.md).
- Pagination separates client-side page changes from route navigation: client mode owns a controlled or uncontrolled `value` and emits `onValueChange`, while navigation mode renders route-derived links from a controlled `value` and never also mutates client state. See [ADR-0009](docs/adr/0009-pagination-client-and-navigation-modes.md).
