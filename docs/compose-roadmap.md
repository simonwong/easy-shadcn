# Compose coverage roadmap

This is the durable product coverage ledger for easy-shadcn. It maps the current [shadcn component catalog](https://ui.shadcn.com/docs/components) to user capability families so upstream names do not cause duplicate Compose modules. GitHub issues own work dependencies and delivery state; this document owns classification and priority. The evidence behind the current classification lives in the [Compose depth audit](research/compose-depth-audit.md).

Snapshot: 2026-08-24, 64 official shadcn component entries.

## How to read this roadmap

- **Compose value** estimates how much caller state, behaviour, accessibility, or migration work the Compose owner deletes. It is not component usage frequency.
- **High** removes a state machine, repeated interaction policy, or costly migration. **Medium** removes recurring composition. **Low** mainly flattens a common structure. **None** means the Primitive is already the clearer answer.
- Each official shadcn entry appears in exactly one ledger section.
- `Build` and `Design` are current product intent, not permission to implement without the component-factory workflow.

## Priority queue

| Priority | Capability | Next decision or module | Compose value |
| --- | --- | --- | --- |
| P1 | Existing Compose depth | Audit current modules for AsyncButton-like behavioural leverage or ownership bugs; do not add props for shallow parity. | Varies |

## Completed decisions

| Date | Capability | Result |
| --- | --- | --- |
| 2026-08-24 | Menu family | Shipped canonical `Menu` item tree, selection/open state, vertical/horizontal/inline modes, and keyboard navigation. Dropdown Menu and Context Menu remain separate trigger shells. |
| 2026-08-24 | Choice list | Shipped `ChoiceGroup` for the four valid single/multiple × radio/checkbox/toggle combinations. Soft-deprecated `RadioGroup` and `CheckboxGroup`; no separate Toggle Group Compose registration. |
| 2026-08-31 | Toast | Shipped one Base UI-backed global queue with a stable callable facade for status, id upserts, update, close, action, and Promise lifecycles. |
| 2026-08-31 | Popover family | Shipped one `Popover` Interface with separate click and hover/focus primitive adapters. Tooltip remains separate; Hover Card has no second Compose registration. |
| 2026-08-31 | Slider | Shipped a scalar-preserving `multiple=true` branch with array callbacks, per-thumb accessible names, native multi-value forms, minimum spacing, and collision policy. |
| 2026-08-31 | Modal ownership | Narrowed and runtime-sanitized Modal and AlertModal action prop bags so labels, raw HTML, and click handlers cannot replace Compose-owned action/close wiring. |
| 2026-09-01 | AlertDialog ownership | Applied the same type and runtime ownership contract to declarative AlertDialog action prop bags. |
| 2026-09-02 | Action-control ownership | Closed Base UI element-replacement and conflicting semantic paths on AsyncButton and the Modal, AlertModal, AlertDialog, and Toast action prop bags. |

## Compose: current and planned

| Capability family | Official shadcn entries | Canonical Compose owner | State | Compose value | Boundary |
| --- | --- | --- | --- | --- | --- |
| Disclosure | Accordion, Collapsible | `Accordion` | Keep | Low | A one-item Accordion covers the common Collapsible task; heterogeneous structure escapes to Primitive. |
| Alert | Alert | `Alert` | Keep | Low | Presentational convenience only. |
| Modal feedback | Dialog, Alert Dialog | `Modal`, `AlertDialog` | Keep | High | Dialog maps to imperative Modal handling; Alert Dialog remains the confirm/cancel specialization. Modal, AlertModal, and AlertDialog action prop bags enforce Compose-owned button elements, semantics, labels, and action/close wiring. |
| Identity media | Avatar | `Avatar` | Keep | Low | Preserve current wrapper; no broader media abstraction. |
| Breadcrumb navigation | Breadcrumb | `Breadcrumb` | Keep | Low | Homogeneous navigation items only. |
| Date selection | Calendar, Date Picker | `Calendar`, `DatePicker` | Keep | High | DatePicker composes Calendar with input/popover state; Calendar remains useful alone. |
| Content container | Card | `Card` | Keep | Low | Flat common slots; unusual layouts use Primitive. |
| Carousel | Carousel | `Carousel` | Keep | Medium | Retain interaction and item flattening. |
| Boolean controls | Checkbox, Switch | `Checkbox`, `Switch` | Keep | Low | Single boolean values stay independent; they are not ChoiceGroup. |
| Select | Select, Combobox | `Select` | Keep and deepen | High | `Combobox` remains a thin searchable preset, never a second state owner. Native Select is excluded separately. |
| Menu family | Context Menu, Dropdown Menu | `Menu` | Keep and deepen | High | Menu owns item tree and menu state. Existing `ContextMenu` and `DropdownMenu` stay as right-click/dropdown shells. |
| Data table | Table, Data Table | `Table` | Keep and deepen | High | One owner for rendering, selection, pagination-facing state, and row identity. |
| Empty state | Empty | `Empty` | Keep | Medium | Common empty-state structure; domain workflows stay outside it. |
| Form layout | Field | `Field` | Keep | Medium | Own common label/control/description/error composition. |
| Input composition | Input Group | `InputGroup` | Keep | Medium | Own adornment and grouped-control composition; plain Input stays Primitive-only. |
| One-time password | Input OTP | `InputOTP` | Keep | Medium | Retain specialized interaction and form semantics. |
| Pagination | Pagination | `Pagination` | Keep and deepen | High | Own client-state vs navigation-mode contract. |
| Floating content | Popover, Hover Card | `Popover` | Keep | Medium | `interaction="click"` uses Popover; `interaction="hover"` uses Preview Card with delay controls. Shared slots and open vocabulary survive migration; Tooltip stays separate. |
| Progress | Progress | `Progress` | Keep | Low | Preserve current wrapper; Spinner and Skeleton remain Primitive-only. |
| Choice list | Radio Group, Toggle Group | `ChoiceGroup` | Keep and deepen | High | Single/multiple selection; radio/checkbox/toggle presentation. Existing `RadioGroup` and `CheckboxGroup` are soft-deprecated. |
| Edge panel | Sheet | `Sheet` | Keep | Medium | Binary edge-positioned dialog. Drawer gestures and snap points are excluded. |
| Range input | Slider | `Slider` | Keep | High | Scalar mode keeps the original `number` API. `multiple=true` switches to arrays, requires per-thumb accessible names, and exposes spacing/collision policy without changing the base case. |
| Tabs | Tabs | `Tabs` | Keep | Low | Homogeneous tab items; heterogeneous bodies use Primitive. |
| Notification | Toast | `Toast` | Keep | High | One global facade delegates queue/timer/focus state to Base UI while owning stable status, action element/label/click wiring, update, close, and Promise semantics. |
| Tooltip | Tooltip | `Tooltip` | Keep | Low | Separate from Popover/Hover Card because purpose and interaction contract differ. |

### Project-specific enhancement owners

These have no one-to-one official catalog entry:

| Compose owner | Related Primitive | Why it exists |
| --- | --- | --- |
| `AsyncButton` | Button | Owns a native button, async pending/completion semantics, spinner structure, and repeated-submit protection. Base Button remains Primitive-only. |
| `CheckboxGroup` | Checkbox | Legacy list-selection owner. Keep install compatibility during soft deprecation; `ChoiceGroup` becomes canonical. |
| `Menu` | Context Menu, Dropdown Menu, later Menubar | Canonical menu item/state model. Trigger and shell behaviours remain separate adapters. |

## Primitive-only

These capabilities do not justify a Compose module now. If the Primitive is absent locally, add it only through `pnpm dlx shadcn@latest add <component>` when a real consumer needs it.

| Official shadcn entry | Local Primitive | Reason |
| --- | --- | --- |
| Aspect Ratio | Not installed | One layout constraint; wrapper adds no behavioural leverage. |
| Attachment | Not installed | Its upload lifecycle is caller-supplied styling state. Reconsider only as a domain uploader that owns queue, retry, cancel, progress, and errors. |
| Badge | Not installed | Styling token with trivial composition. |
| Button | Installed | Base control stays Primitive; behavioural cases use explicit enhancements such as `AsyncButton`. |
| Button Group | Not installed | Visual grouping; caller composition is already direct. |
| Direction | Not installed | Application/provider configuration, not a data-driven Compose module. |
| Input | Installed | Base form control; compositions belong to Field or InputGroup. |
| Kbd | Not installed | Presentational semantic element. |
| Label | Installed | Base form semantic; compositions belong to Field. |
| Resizable | Not installed | Layout Primitive whose panel structure should stay composable. |
| Scroll Area | Not installed | Layout/overflow Primitive; no stable flat data model. |
| Separator | Installed | Presentational element. |
| Skeleton | Not installed | Presentational loading placeholder. |
| Spinner | Not installed | Presentational loading indicator. |
| Textarea | Installed | Base form control; compositions belong to Field or InputGroup. |
| Toggle | Not installed | Single boolean control; repeated selection belongs to ChoiceGroup. |
| Typography | Not installed | Styling conventions, not state or composition ownership. |

## Out of scope

These are deliberate exclusions, not backlog gaps.

| Capability family | Official shadcn entries | Why excluded | Reopen only when |
| --- | --- | --- | --- |
| Native Select | Native Select | Current Select family is sufficient; no native variant work now. | A concrete native form, low-JS, or platform-picker requirement appears. |
| Drawer | Drawer | Sheet covers current edge-panel use cases. | Drag, swipe, snap points, nested drawers, or mobile bottom-sheet behaviour is required. |
| Generic List / Item | Item | A universal schema adds little leverage and makes domain rows harder to express. | A repeated concrete domain list proves a stable shared state model. |
| Conversation | Bubble, Marker, Message, Message Scroller | AI/chat-specific product surface is outside current direction. | Conversation UI becomes an explicit library domain. |
| Chart | Chart | Data, interaction, renderer, and accessibility policy are too broad for a useful flat wrapper now. | A narrow repeated chart contract emerges from real consumers. |
| Questionnaire | Questionnaire | Domain workflow rather than a general Compose capability. | Questionnaire flows become an explicit supported domain. |

## Deferred, not currently planned

These are neither approved Compose work nor durable exclusions. Keep them out of component-factory selection until their Interface value is researched.

| Official shadcn entry | Current stance | Question to answer |
| --- | --- | --- |
| Command | Defer | Searchable quick actions are not Menu. Is there a reusable action/search state machine beyond the existing Primitive? |
| Menubar | Defer | Menu can supply its item model later; no separate Menubar Compose shell is urgent. |
| Navigation Menu | Defer | Can one flat model cover responsive navigation without hiding necessary composition? |
| Sidebar | Defer | Does the existing shadcn state model already provide the useful abstraction, or is a Compose owner valuable? |

## Duplicate-prevention map

Use this before opening any component-factory task:

| Requested name or change | Route |
| --- | --- |
| Combobox, searchable Select | Deepen `Select`; keep `Combobox` only as thin preset. |
| Data Table | Deepen `Table`. |
| Calendar popup, Date Picker | Deepen `DatePicker`; reuse `Calendar`. |
| Dialog | Use `Modal`; use `AlertDialog` only for confirm/cancel semantics. |
| Dropdown Menu, Context Menu | Reuse canonical `Menu` item/state model while keeping trigger shells distinct. |
| Menubar | Defer shell; later consume `Menu` model. |
| Command palette | Treat as Command, not Menu. |
| Radio list, checkbox list, toggle list | Deepen `ChoiceGroup`; do not create separate new group owners. |
| Single Checkbox, Switch, Toggle | Keep independent boolean controls; do not route to ChoiceGroup. |
| Hover Card | Use `Popover interaction="hover"`; do not create a second Compose owner or merge it with Tooltip. |
| Async action button | Enhance `AsyncButton`; do not wrap base Button again. |
| Generic list row | Use Item Primitive or create a domain-specific list only after a concrete state model exists. |
