# Classify Compose coverage by user capability, not shadcn catalog page

The shadcn component catalog is an upstream inventory, not an implementation quota for `registry/ui/*`. Building one Compose module per catalog page would duplicate state models, create overlapping choices, and make migrations such as Select to searchable Select needlessly expensive. Compose coverage is therefore classified by **user capability family**: one family may cover several shadcn entries and has at most one canonical Compose owner.

## Decision

Every shadcn catalog entry maps exactly once in the [Compose coverage roadmap](../compose-roadmap.md) to one of these product states:

- **Compose** — an existing, planned, or deliberately deepened Compose owner removes meaningful state, behaviour, accessibility, or migration work.
- **Primitive-only** — the shadcn Primitive is the product answer; a flat wrapper would mostly rename slots or styling props.
- **Out of scope** — the capability is intentionally absent from the current Compose product surface, not accidentally missing.
- **Deferred** — evidence is insufficient for a durable classification. This is a temporary roadmap state, not a fourth architecture tier.

Before proposing a new Compose module, map the request to an existing capability family. If an existing owner can absorb the use case without raising the base-case concept count, deepen that owner instead of adding a sibling. Separate names remain valid only when they provide real discovery or compatibility value, as `Combobox` does as a thin preset over `Select`; they do not create a second state owner.

Simple presentation primitives remain Primitive-only. Behavioural enhancement remains allowed when it deletes real caller work: `AsyncButton` is justified by async pending and completion behaviour, not because shadcn has a `Button` page. Existing Compose wrappers are not removed merely because this classification would not admit them today; removal needs its own migration decision.

## Deliberate exclusions

The following families are Out of scope for the current Compose product surface:

- **Native Select** — no Compose work until a concrete native-form or platform-picker requirement appears.
- **Drawer** — `Sheet` covers current edge-panel needs; reconsider only for drag, swipe, snap-point, or nested-drawer requirements.
- **Generic List / Item** — a universal item schema creates little leverage and blocks domain-specific list design.
- **Conversation** — `Bubble`, `Marker`, `Message`, and `Message Scroller` form a domain-specific chat surface outside the current library direction.
- **Chart** — chart data, interaction, and rendering policy are too broad to flatten into the current Compose surface.
- **Questionnaire** — a domain workflow, not a reusable Compose primitive for the current product.

## Consequences

- Completeness means every upstream entry has a recorded disposition, not that every entry has a same-named file under `registry/ui/*`.
- `Select` covers Select and Combobox selection behaviour; `Table` covers Table and Data Table; planned `ChoiceGroup` covers list selection rendered as radio, checkbox, or toggle; planned `Menu` supplies the menu model while Dropdown Menu, Context Menu, and Menubar remain distinct trigger/shell behaviours.
- Tooltip remains separate. Popover and Hover Card may share a capability family, but only after their trigger and open-state boundary is designed explicitly.
- The ADR holds stable classification rules. The roadmap holds the mutable catalog snapshot, current status, value, and priority.
