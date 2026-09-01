# Compose depth audit

Snapshot: 2026-08-24

## Question

Which existing Compose components should stay thin, which already earn their
place by owning meaningful behavior, and which should be deepened? Which
capabilities in the current shadcn catalog should be absorbed by an existing
task-level module, kept Primitive-only, left out of scope, or introduced as a
new Compose module?

This is a decision audit, not an implementation plan. It covers the 31
`registry:component` entries in [`registry.json`](../../registry.json), the
current [`registry/ui`](../../registry/ui) implementations, the domain language
in [`CONTEXT.md`](../../CONTEXT.md), and the existing ADRs. The external
baseline is shadcn's 64-component catalog as listed on 2026-08-24 in the
[official component index](https://ui.shadcn.com/docs/components).

## Decision rubric

A Compose module is organized around a **user task**, not around a one-to-one
copy of shadcn filenames. One Compose module may preserve one stable Interface
while selecting among several primitives or interaction adapters. This is
valuable when it reduces migration/change cost: switching presentation should
not force the consumer to rewrite data, value state, validation, and callbacks.

A Compose module earns a deep surface when it owns at least one of:

- async work, error/race handling, or another non-trivial state machine;
- a stable Interface across materially different primitive presentations;
- ARIA, keyboard, form, or slot wiring that otherwise repeats in callers;
- task-level algorithms or identity rules whose deletion would scatter logic
  back into many call sites.

Pure styling, a single element, or props pass-through stays Primitive-only.
Thin wrappers already shipped are not mass-deprecated: ADR-0004 deliberately
keeps their escape cost low and their API small. These rules extend, rather
than replace, the current coverage and ownership rules in
[`CONTEXT.md`](../../CONTEXT.md) and
[ADR-0004](../adr/0004-props-vocabulary.md).

The practical deletion test is: **if deleting the module merely adds a dozen
lines of JSX, keep it thin; if deleting it makes consumers rebuild state,
accessibility, migration adapters, or repeated wiring, deepen or create it.**

## Result

- **17 stable thin wrappers/presets:** keep them; do not grow them merely to
  match an official page.
- **10 already-deep modules:** they already own enough behavior or wiring to
  justify broad coverage.
- **4 concrete deepening candidates:** `radio-group` + `checkbox-group` into
  ChoiceGroup, Popover into a Popover/Hover Card family, and Slider into
  scalar/multi-thumb modes.
- **2 new modules are ready for product decisions:** Toast and an AntD-style
  Menu. They are not wrappers around the current dropdown components.
- **2 additional high-leverage capabilities need later boundary decisions:**
  Sidebar and Command. Neither should be folded into Menu by name alone.
- Native Select, Drawer, generic List, Conversation, Chart, and Questionnaire
  are explicitly out of scope for this map.

## Current Compose audit

### Stable thin wrappers and presets

These modules flatten common homogeneous JSX or provide a discoverable preset.
Their deletion cost is low, so their existing minimal surface is the correct
depth.

| Current Compose | Evidence and disposition |
| --- | --- |
| [Accordion](../../registry/ui/accordion.tsx) | Maps homogeneous `items[]` to trigger/content pairs and delegates all selection state to Base UI. Keep thin. A one-item use already covers the common Collapsible task; document that instead of adding a separate Compose. |
| [Alert](../../registry/ui/alert.tsx) | Flattens icon/title/description/action slots while fixing the alert role, root marker, and generated child order at type and runtime seams. Keep thin. |
| [Avatar](../../registry/ui/avatar.tsx) | Flattens image/fallback/badge composition while fixing the root element, descendants, slot, and size marker at type and runtime seams. Keep thin. |
| [Breadcrumb](../../registry/ui/breadcrumb.tsx) | Generates homogeneous breadcrumb entries and separators while protecting the generated nav list and root marker at type and runtime seams. Keep thin. |
| [Card](../../registry/ui/card.tsx) | Flattens stable header/content/footer slots while protecting generated descendants and root markers from raw HTML or forged data attributes. Keep thin. |
| [Carousel](../../registry/ui/carousel.tsx) | Generates slides, controls, orientation-safe options, and required carousel naming, while leaving Embla's richer state/API as the escape. Keep thin; no controlled selection model without a concrete task. |
| [Checkbox](../../registry/ui/checkbox.tsx) | Owns label/description ids and ARIA relationships for one boolean control. Keep independent from list selection. |
| [Combobox](../../registry/ui/combobox.tsx) | Correctly remains a closed, always-searchable single-select preset over Select; [ADR-0005](../adr/0005-combobox-thin-preset-over-select.md) explains why a second implementation would duplicate state for no gain. |
| [Context Menu](../../registry/ui/context-menu.tsx) | Flattens a context-triggered action list. Keep the current component; do not redefine it as the future navigation Menu. |
| [Dropdown Menu](../../registry/ui/dropdown-menu.tsx) | Flattens trigger + positioned action list. Keep the current component; Dropdown is a trigger/positioning shell around action-menu behavior, not the future navigation Menu. |
| [Empty](../../registry/ui/empty.tsx) | Flattens media/title/description/content slots. Keep thin. |
| [Input Group](../../registry/ui/input-group.tsx) | Flattens addon/input composition while fixing the void input structure and primitive slot at type and runtime seams. Keep thin. |
| [Input OTP](../../registry/ui/input-otp.tsx) | Generates groups, separators, and slots from `maxLength`/`groupSize`; the primitive owns input state. Keep the generated-structure wrapper thin. |
| [Sheet](../../registry/ui/sheet.tsx) | Flattens edge, title, body, footer, and open state over Dialog. Keep Sheet only. Drawer gestures and snap points are not folded into it. |
| [Switch](../../registry/ui/switch.tsx) | Owns label/description ids, ARIA relationships, root semantics, state attributes, and generated thumb at type and runtime seams for one immediate boolean setting. Keep independent from ChoiceGroup. |
| [Tabs](../../registry/ui/tabs.tsx) | Maps homogeneous `items[]` to triggers/content and delegates value state. Keep thin. The source already uses `trigger`; ADR-0004's old `label` cleanup note is stale. |
| [Tooltip](../../registry/ui/tooltip.tsx) | Flattens trigger/content and provider delay. Keep separate from Popover: tooltip semantics and content constraints differ from rich interactive overlays. |

### Already deep

Deleting any of these would reintroduce meaningful state, algorithms, async
behavior, or repeated accessibility wiring.

| Current Compose | Owned leverage |
| --- | --- |
| [Alert Dialog](../../registry/ui/alert-dialog.tsx) | Owns controlled/uncontrolled open state plus async confirm/cancel completion through AsyncButton. Its action prop bags preserve supported AsyncButton customization while rejecting element/semantic replacement, labels, and click wiring at type and runtime seams. |
| [Async Button](../../registry/ui/async-button.tsx) | Owns a native button, promise-derived busy state, delayed loading, same-frame double-submit blocking, disabled semantics, primitive slot, and spinner placement. This is the reference enhancement pattern. |
| [Calendar](../../registry/ui/calendar.tsx) | Adds month/year/decade view state and navigation on top of react-day-picker, including keyboard/ARIA naming. |
| [Date Picker](../../registry/ui/date-picker.tsx) | Owns popover state, single/multiple/range value plumbing, and manual-input draft/commit races. The input lifecycle is recorded in [ADR-0008](../adr/0008-date-picker-input-draft-commit.md). |
| [Field](../../registry/ui/field.tsx) | Owns label/control/description/error ids, `aria-describedby`, `aria-invalid`, required output, and form-error normalization. |
| [Modal](../../registry/ui/modal/modal.tsx) | Owns Dialog slots, open state, async confirm/cancel completion, and the command-modal Adapter seam described by [ADR-0001](../adr/0001-adapter-seam-and-typed-factory.md). Keep Modal as the Dialog capability. |
| [Pagination](../../registry/ui/pagination.tsx) | Owns normalization, page-window/ellipsis generation, controlled/uncontrolled client state, and safe separation from native navigation, as recorded in [ADR-0009](../adr/0009-pagination-client-and-navigation-modes.md). |
| [Progress](../../registry/ui/progress.tsx) | Owns determinate/indeterminate value semantics plus accessible name/value wiring. Spinner and Skeleton remain primitives; they do not need to become Progress modes. |
| [Select](../../registry/ui/select.tsx) | Owns single/multiple value state, search, clear/chips UI, async single-flight loading, retry/error state, and selected-label merge-back. The async contract is recorded in [ADR-0006](../adr/0006-select-async-loading-contract.md). |
| [Table](../../registry/ui/table.tsx) | Owns row identity, selection, visible select-all preservation, empty/loading output, and accessibility diagnostics. The identity/selection contract is recorded in [ADR-0007](../adr/0007-table-required-rowkey-and-selection-model.md). Data Table is already this module, not another Compose. |

### Concrete deepening candidates

| Candidate | Why the deletion test passes | Required boundary |
| --- | --- | --- |
| [Radio Group](../../registry/ui/radio-group.tsx) -> **ChoiceGroup single/radio** | RadioGroup already owns `items`, label/description wiring, disabled propagation, and group-root delegation. It is one presentation of the list-selection task, not a separate future state model. Official Radio Group defines the single-choice semantic boundary ([official docs](https://ui.shadcn.com/docs/components/radio-group)). | ChoiceGroup has two independent axes: selection `single | multiple`; presentation `radio | checkbox | toggle`. Radio is valid only with single selection. Keep the RadioGroup installation entry during the agreed soft-deprecation window and mark its docs deprecated. |
| [Checkbox Group](../../registry/ui/checkbox-group.tsx) -> **ChoiceGroup multiple/checkbox** | CheckboxGroup has the same data and accessibility shape as RadioGroup but a `string[]` value. Adding Toggle presentation lets consumers preserve `items` and value wiring while changing how multiple choices look. Official Toggle Group supports a homogeneous set, single selection, orientation, variants, spacing, and disabled state ([official docs](https://ui.shadcn.com/docs/components/toggle-group)). | Checkbox is valid only with multiple list selection; standalone Checkbox and Switch stay independent boolean controls. ChoiceGroup also owns single-or-multiple Toggle presentation. Keep the CheckboxGroup installation entry during the soft-deprecation window, mark its docs deprecated, and do not create a separate ToggleGroup registry entry. |
| [Popover](../../registry/ui/popover.tsx) -> **Popover/Hover Card family** | Both need the same rich content slots and positioning vocabulary, so consumers should not rewrite those when changing click to link-hover preview. Both adapters now fix their popup element, marker, and generated slot tree at type and runtime seams while leaving the trigger ReactElement caller-owned. shadcn describes Popover as button-triggered rich portal content ([official docs](https://ui.shadcn.com/docs/components/popover)) and Hover Card as sighted-user link preview with open/close delays ([official docs](https://ui.shadcn.com/docs/components/hover-card)). | Share the task-level content/position Interface, but use the correct Popover or Hover Card primitive internally. Do not implement hover by bolting mouse events onto Popover, do not recursively sanitize caller-owned triggers, and do not merge Tooltip into this family. |
| [Slider](../../registry/ui/slider.tsx) -> **scalar + multi-thumb Slider** | The current Compose deliberately coerces the primitive's array to one scalar and excludes `minStepsBetweenValues`/collision behavior. A consumer moving from a single value to a range must replace its value type and drop to primitives. Official shadcn Slider supports two-value ranges and arbitrary multiple thumbs ([official docs](https://ui.shadcn.com/docs/components/slider)). | Add a discriminated scalar/multiple surface without changing the scalar base case; range formatting and per-thumb accessible names need explicit design. This is a real change-cost improvement, not an API-parity exercise. |

## Correctness and documentation debt found during the audit

These are not reasons to grow the product surface, but they should become
maintenance work:

1. **Resolved:** [`AsyncButton`](../../registry/ui/async-button.tsx) now owns its
   native button element, Promise-derived busy/disabled semantics, primitive
   slot marker, and generated spinner structure at both type and runtime seams.
   [`Modal`](../../registry/ui/modal/modal.tsx), AlertModal,
   [`AlertDialog`](../../registry/ui/alert-dialog.tsx), and
   [`Toast`](../../registry/ui/toast.tsx) apply the same ownership contract to
   action prop bags in addition to owning action labels and click/close wiring.
   JavaScript or `any` callers cannot restore the rejected element, raw HTML,
   role, ARIA, slot, label, or handler paths.
2. [ADR-0004](../adr/0004-props-vocabulary.md) previously called Tabs' item
   field `label`. Current source already uses `trigger`; the refreshed
   consequence note is not active implementation debt.

## Missing official capabilities: disposition

### Absorb into an existing or planned task module

| Official capability | Disposition |
| --- | --- |
| Collapsible | Common one-panel use is a one-item Accordion. Add documentation, not a separate Compose. Heterogeneous edge cases use the primitive. |
| Data Table | Already absorbed by Table. |
| Dialog | Already absorbed by Modal. AlertDialog remains its semantic confirmation variant. |
| Hover Card | Absorb into the Popover family through a primitive adapter, as above. |
| Toggle + Toggle Group | Absorb list selection into ChoiceGroup. Standalone Toggle remains Primitive-only unless a later enhancement owns behavior beyond pressed state. |
| Menubar | A shell that may consume the future Menu item model later. No independent Compose now. |
| Navigation Menu | Homogeneous navigation trees may consume the future Menu model; heterogeneous mega-menu content remains primitive composition. Do not promise full Navigation Menu coverage through Menu. |
| Combobox | Already a Select preset. Native Select belongs to the same consumer task but is explicitly out of scope. |

### Keep Primitive-only unless a concrete enhancement appears

Aspect Ratio, Attachment, Badge, Button, Button Group, Direction, Input, Item,
Kbd, Label, Resizable, Scroll Area, Separator, Skeleton, Spinner, Textarea, and
Typography do not currently pass the deletion test.

- Attachment's official component accepts upload lifecycle state and styles it,
  but does not own uploading; its states are caller inputs
  ([official docs](https://ui.shadcn.com/docs/components/attachment)). Reconsider
  only as a domain-specific uploader that owns queue, progress, retry, cancel,
  and errors—not as generic List or visual Item Compose.
- Button already has AsyncButton for meaningful enhancement. Textarea should
  gain a Compose only for a similarly concrete behavior such as measured
  autosizing, not for props forwarding.
- Skeleton and Spinner are caller-arranged visual primitives. Progress already
  owns the determinate/indeterminate progress task.

### Explicitly out of scope for this map

- Native Select
- Drawer; keep the existing Sheet. Sheet is a Dialog extension, while Drawer
  adds swipe direction, snap points, swipe state, and nested-drawer behavior
  ([Sheet](https://ui.shadcn.com/docs/components/sheet),
  [Drawer](https://ui.shadcn.com/docs/components/drawer)).
- Generic List / Item Compose
- Conversation: Bubble, Message, Message Scroller, and Marker
- Chart
- Questionnaire

Out of scope means no active decision or implementation ticket. It does not
mean the primitive can never be installed when an application needs it.

### Merits a new module or a later decision

#### Ready now

**Toast** merits its own Compose module. The official primitive surface includes
status types, actions, promise-driven loading/success/error updates, stacking,
and swipe dismissal ([official docs](https://ui.shadcn.com/docs/components/toast)).
Those are queue and async-lifecycle behaviors that would otherwise repeat
across the app. The Interface decision must cover provider/viewport placement,
imperative calls, close/update ids, action ownership, promise messages, and
copy-in installation.

**Menu** merits a new `registry/ui/menu.tsx` Compose module even though shadcn
does not list a standalone navigation Menu. It should model the AntD-style
navigation task: hierarchical `items`, selected keys, open submenu keys, and
`vertical | horizontal | inline` presentation. Ant Design's primary docs expose
exactly those independent selection/navigation concepts
([Menu API](https://ant.design/components/menu/)). Dropdown Menu and Context
Menu remain trigger-specific action overlays; they are not renamed or merged
into Menu.

#### Later boundary tickets, not implementation commitments

**Sidebar** passes the deletion test but its Interface is not yet bounded. The
official component owns desktop/mobile open state, a provider/context,
collapsible variants, shortcuts, nested menu structure, actions, badges, and a
mobile Sheet ([official docs](https://ui.shadcn.com/docs/components/sidebar)).
That makes it a plausible state-machine Compose, but also too large to infer
from `items[]` alone. Open a later decision ticket for the navigation-tree seam,
route ownership, persistence, mobile behavior, and heterogeneous header/footer
content.

**Command** is not Menu. The official structure combines an input, filtered
list, empty state, groups, separators, shortcuts, and an optional Dialog
([official docs](https://ui.shadcn.com/docs/components/command)). A future
CommandPalette could own filtering, keyboard invocation, async actions, and
Modal integration; defer it until that task is requested. Sharing item
vocabulary with Menu is allowed, but sharing one behavior Interface is not.

## Recommended frontier after this audit

1. Decide ChoiceGroup's discriminated Interface and soft-deprecation migration.
2. Decide Toast's provider + imperative/promise contract.
3. Decide the AntD-style Menu tree, selection, expansion, and mode contract.
4. Decide Popover/Hover Card's shared Interface and primitive adapter boundary.
5. Decide Slider scalar/multi-thumb typing and accessible naming.
6. Fix Modal's owned button prop bags as maintenance work.
7. Only then decide implementation order. Sidebar and Command remain later
   boundary tickets; all explicit out-of-scope items stay off the frontier.
