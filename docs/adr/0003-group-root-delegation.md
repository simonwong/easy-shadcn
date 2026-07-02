# Compose group components delegate selection state to the base-ui group primitive

Compose list/group components (`radio-group`, `tabs`, `accordion`, and now `checkbox-group`) each have a native base-ui *group primitive* that already owns the hard parts: it tracks the selection `value`, resolves controlled vs. uncontrolled from the `value` / `defaultValue` props, propagates `disabled` down to its children, and emits a typed `ChangeEventDetails`. The Compose layer wraps that primitive as the stateful root and only flattens `items[]` into rendered rows. It never re-implements any of that behaviour.

For `checkbox-group` this reverses an earlier draft that proposed hand-rolling `string[]` state inside the Compose component (internal `useState`, manual controlled/uncontrolled branching, a runtime throw when both `value` and `defaultValue` are passed, and a bespoke `{ item, checked }` event-details object). base-ui ships `@base-ui/react/checkbox-group`, whose `Root` already exposes `value?: string[]`, `defaultValue?: string[]`, `onValueChange?(value: string[], details: CheckboxGroup.ChangeEventDetails)`, and `disabled`, and whose child `Checkbox` joins the group by its `value` prop — the exact mirror of how `radio-group` wraps `RadioGroup` + `RadioGroupItem`.

## Decision

- The Compose group root is the native base-ui group primitive. Selection `value`, `defaultValue`, controlled/uncontrolled resolution, and `disabled` propagation flow through it via `...rootProps`; the Compose layer adds none of its own state.
- `onValueChange` re-exports the primitive's native `ChangeEventDetails` type. No custom event-details shape, no `checked` field, no full-`item` payload.
- Group-level `disabled` is whatever the primitive natively provides (base-ui ORs group + item `disabled`, so an item `disabled: false` cannot re-enable a disabled group). The Compose layer does not compute `disabled` per item.
- No runtime enforcement of the controlled/uncontrolled contract. base-ui's own dev warnings are the mirror-consistent behaviour; `radio-group` / `tabs` / `accordion` don't throw either.
- Anything the group primitive can't express by flattening homogeneous rows — a `parent` / "select all" checkbox, per-item `indeterminate`, heterogeneous rows — is the 20%: users drop to the primitive.

## Consequences

- Sibling group components stay behaviourally identical, so learning one teaches the rest.
- `indeterminate` never leaks into the Compose API surface: because the event type is the primitive's native `string[]` details, there is no `boolean | "indeterminate"` field to contradict the "indeterminate is out of scope" stance.
- The Compose component has near-zero logic to test — tests assert wiring (rows rendered, `value` reflected, `onValueChange` fired, `disabled` propagated, classNames merged), not a re-implemented state machine.
