# Props vocabulary: coverage tiers, ownership-typed `xxxProps`, and a naming reference order

Three slogans in the Compose-layer design guidance were carrying more weight than they could bear: a single **80/20 hard line** for every component, a blanket **"only expose `xxxClassName`, use `xxxProps` sparingly"**, and **"align names to the primitive"** with no tie-breaker. Each collapses distinct cases into one rule and forces a coin-flip whenever the case doesn't fit. This ADR replaces the three slogans with executable criteria and records how ownership deviations are corrected.

## Decision

### 1. Two rules replace the flat 80/20 line

The unified "Compose serves 80%, the other 20% drops to the primitive" hard line is abolished. It conflated two independent questions — *how much should this component cover?* and *how big is the base case?* — and answered both with the same fixed percentage. Split them:

**Rule A — the coverage target floats with the escape cost.** Compose components fall into two tiers:

- **Thin wrappers** (Card, Tabs, Tooltip, Breadcrumb, Accordion, Popover): rebuilding the missing case by hand on the primitive costs a dozen-odd lines. The escape hatch is nearly free, so the API stays **minimal** — a missing scenario routes straight to the primitive.
- **State-machine components** (Table, Select, Combobox, DatePicker): the Compose layer owns real state logic — selection tally, async race resolution, selected-item merge-back — that the primitive does not. "Use the primitive" here means rewriting hundreds of lines, so the escape hatch is expensive. These components have an **obligation to approach 100% coverage**, benchmarked against the capability surface of the equivalent antd component.

`table.tsx`'s `getCheckboxProps`, approved at the time as an explicit "exception" to the no-`xxxProps` guidance, is not an exception — it is exactly this rule: Table is a state-machine component, so surfacing per-row checkbox control is in-scope coverage, not an escape from the line.

**Rule B — the base-case concept count is frozen.** The *total* prop count may grow without limit; the number of props you must understand to run the **first** use case is frozen forever. Table is always `columns` + `dataSource` + `rowKey`. Select is always `items` + `value`/`onValueChange`. A new prop is admissible only if someone who doesn't use it stays completely unaware of it:

- it has a sensible default;
- it introduces no mutual-exclusion or combination semantics with existing props — and if a mutual-exclusion relationship genuinely exists, it **must** be spelled out in the prop's JSDoc, not left implicit;
- it does not appear in the component's first demo.

One line: **the area may approach 100%, but the onboarding slope must stay what it was at 80%.**

### 2. `xxxProps` by slot ownership — three categories

Whether a slot gets an `xxxProps` escape is decided by *what the slot's content is and who owns its state*, not by a "use sparingly" instinct. Three categories:

1. **Content slots** — `title`, `description`, `footer`, `content`, etc., whose type is `ReactNode`. **Never add `xxxProps`.** The slot interior is already 100% caller-controlled (they hand you the node); the only thing they can't reach is the wrapping element, and a wrapper has nothing but styling needs. `xxxClassName` is the ceiling. This is a hard rule.
2. **Interactive-component slots** — buttons, checkboxes, inputs: components with their own props surface. `xxxProps` is legitimate and its count is **not** capped. But it **must Omit, at the type level, every key the Compose layer has taken over** (`onClick`, `checked`, `onCheckedChange`, `children`, …) — a documentation note is not enough, because a passthrough spread will silently win at runtime.
   - Positive example: `registry/ui/table.tsx`'s `TableCheckboxProps` is `Omit<…, "checked" | "children" | "defaultChecked" | "indeterminate" | "onCheckedChange">`, so no external prop can desync the selection state.
   - Corrected example: AsyncButton owns a native button, Promise-derived busy/disabled semantics, and its spinner structure. Its Interface and runtime therefore reject element replacement, conflicting raw HTML/roles/ARIA, and primitive slot replacement. Modal, AlertModal, AlertDialog, and Toast apply the same contract to their action prop bags in addition to owning labels and click wiring. These guarantees survive JavaScript or `any` callers as well as typed callers.
3. **Slots the Compose state must flow into** — use the function form `(record, index) => Partial<Props>` (the `getCheckboxProps` pattern). It, too, Omits the state keys, and the function is required to be **pure and non-throwing** (it runs for every row on every render; throwing unmounts the surrounding tree).

Verdict: **count was never the problem; un-narrowed ownership is.**

### 3. Props naming — a reference-frame priority order

Names are chosen against a fixed priority of reference frames:

1. **The primitive already has the concept → align to the primitive.** Highest priority: when a user escapes to the primitive their mental model must not have to switch tracks. This is why `Select` uses `multiple: boolean` (aligned to base-ui) while `DatePicker` uses `mode: "single" | "multiple" | "range"` (aligned to react-day-picker). The resulting **horizontal** inconsistency between the two Compose components is an **acceptable cost** — do not force-align it.
2. **A Compose-invented concept → must align to sibling Compose components.** These are written into a standard vocabulary:
   - **Controlled triple**: `value` / `defaultValue` / `onValueChange`; `open` / `defaultOpen` / `onOpenChange`.
   - **Async group**: `loading` / `loadingMessage` / `loadItems` / `loadOn` / `debounceMs`.
   - **Empty group**: `emptyMessage` / `emptyClassName`.
   - **List convention**: `items: Item[]`, each item carrying `value` + a content field + `disabled` + its per-item `xxxClassName`s.
   - **Slot names**: `title` / `description` / `action` / `footer` / `content` / `trigger`, each paired with its `xxxClassName`.
   - **Boolean dual form**: `boolean | { … }` (e.g. `dividers`) — a bare boolean for the simple case, an object when it needs configuring.
3. **Conflict adjudication → follow the primitive's *child component* name.** When frames 1 and 2 disagree, the primitive's child element name wins. `TabsTrigger` renders the tab, so a tabs item's content field should be `trigger`. `RadioGroupItem` renders a `<label>`, so `radio-group` / `checkbox-group` keep `label` — correct as-is.

## Consequences

- **Sanctioned inconsistency.** `multiple` (Select) vs `mode` (DatePicker) is now explicitly an acceptable cost of frame-1 primitive alignment, not a defect. Reviewers should not "harmonize" it.
- **Completed cleanup — action-control ownership.** AsyncButton fixes its native button, busy/disabled semantics, and spinner structure. Modal, AlertModal, AlertDialog, and Toast action prop bags exclude element replacement, conflicting semantics, label injection, and click wiring while preserving supported styling, form, variant, icon, loading, and disabled capabilities. Full custom modal action rows use `footer`.
- **Completed cleanup — form-control ownership.** InputGroup fixes its void input structure and primitive slot. Switch fixes its root element, role, generated thumb, state-derived ARIA/data attributes, size, and slot markers while preserving caller-owned naming/description ARIA, supported form/state props, styles, and events. Both contracts survive JavaScript or `any` callers.
- **Completed cleanup — structural-root ownership.** Alert, Avatar, Card, Breadcrumb, and both Popover adapters reject raw HTML, element replacement, or root/popup attributes that contradict their generated structure. Caller-owned content nodes stay opaque; Popover trigger ReactElements retain their own children, ids, handlers, navigation, and attributes.
- **Completed cleanup — collection-root ownership.** Accordion, Tabs, ChoiceGroup, RadioGroup, CheckboxGroup, and Menu reject generated-child replacement and conflicting root role/orientation/state markers at type and runtime seams. ChoiceGroup keeps its four-mode value adapter stable; the soft-deprecated group entries gain no new capability; Menu preserves its chained keyboard handler and merges caller/internal root refs.
- **Completed cleanup — Table ownership.** Table rejects generated-child/raw-HTML root replacement plus caller-forged busy and slot markers while preserving the actual `<table>` ref and caller-owned native props. Its row-selection checkbox bag fixes the Base UI element, indicator, role, selection state, derived ARIA/data, and slot marker; preserves form props, accessible naming, refs, state-aware styles, safe events, and ordinary data; and treats both disabled and readonly rows as outside header bulk selection.
- Future component reviews decide props by Rules A/B (sizing), the three slot categories (`xxxProps`), and the reference-frame order (naming) — no more coin-flips at the 80/20 line.
