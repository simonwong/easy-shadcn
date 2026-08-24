# ChoiceGroup separates selection mode from presentation

RadioGroup and CheckboxGroup encode the same list-selection task in separate names, while Toggle Group adds a third presentation and supports both single and multiple selection. `ChoiceGroup` becomes the canonical owner with two explicit axes: `selectionMode` and `presentation`, so callers can change visual form without replacing their items or state wiring.

## Decision

The TypeScript Interface admits exactly four combinations:

- `single + radio` — the default;
- `multiple + checkbox` — checkbox is the default multiple presentation;
- `single + toggle`;
- `multiple + toggle`.

Single selection uses `string | undefined`; multiple selection uses `string[]`. Each form has matching `value` / `defaultValue` / `onValueChange`. The callback intentionally exposes only the stable value and hides Radio Group, Checkbox Group, and Toggle Group-specific event details; consumers that need cancellation or Primitive-specific events use the Primitive directly.

The implementation delegates selection to the matching Base UI group root. Toggle Group's array state is adapted to `string | undefined` only at the ChoiceGroup seam; selection is not reimplemented. Labels, descriptions, disabled state, orientation, and class slots keep one items vocabulary across presentations.

## Consequences

Existing `RadioGroup` and `CheckboxGroup` registry entries remain installable during soft deprecation, but their docs point to ChoiceGroup and they receive no new capabilities. No separate Toggle Group Compose entry is registered. Standalone Checkbox, Switch, and Toggle remain independent boolean controls rather than one-item ChoiceGroups.
