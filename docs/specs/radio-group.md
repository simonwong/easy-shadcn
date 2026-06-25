# Spec — Radio Group (Compose layer)

`registry/ui/radio-group.tsx`. Flattens shadcn base-ui RadioGroup into one `items`-driven
component, each option carrying its own label/description. Mirrors `tabs.tsx` / `accordion.tsx`.

## Ground truth (base-ui @1.4.0, components/ui/radio-group.tsx)
- `RadioGroup.Props<Value>`: `value`, `defaultValue`, `onValueChange(value, details)`, `disabled`,
  `readOnly`, `required`, `name`, `form`, + div props. Single `Value` (NOT array).
- `Radio.Root.Props<Value>`: `value` (required), `disabled`, `readOnly`, `required`. Renders a
  `<span role="radio">` + a hidden `<input>` — the span needs an accessible name (aria-labelledby).

## API
```ts
export interface RadioGroupItem {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  optionClassName?: ClassValue;       // the row <label>
  itemClassName?: ClassValue;         // the radio control (RadioGroupItem primitive)
  labelClassName?: ClassValue;
  descriptionClassName?: ClassValue;
}

export interface RadioGroupProps
  extends Omit<RadioGroupPrimitive.Props<string>,
    "value" | "defaultValue" | "onValueChange" | "render" | "children"> {
  items: RadioGroupItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, details: RadioGroupPrimitive.ChangeEventDetails) => void;
  optionClassName?: ClassValue;
  itemClassName?: ClassValue;
  labelClassName?: ClassValue;
  descriptionClassName?: ClassValue;
}
```
- Narrow `value`/`defaultValue`/`onValueChange` to `string` (base-ui types `any`).
- Export interface `RadioGroupItem`; import primitive control as `RadioGroupItemPrimitive` (name clash).
- Each option = `<label>` row wrapping the radio control + a label (and optional description).
  Associate via `aria-labelledby` / `aria-describedby` using ids derived from `useId()` + item.value
  so the `role=radio` span has a proper accessible name. The `<label>` makes the whole row clickable.
- Per-item class merged AFTER root-level (`cn(labelClassName, item.labelClassName)`), like tabs.
- `disabled`/`readOnly`/`required`/`name` forwarded to the group via `...rootProps`.

## Behavior / edge cases (tests)
1. Renders one radio per item, each named by its label (getByRole "radio", {name}).
2. Uncontrolled: clicking an option selects it (data-checked / aria-checked).
3. `defaultValue` selects initially.
4. Controlled `value` + `onValueChange`: click fires onValueChange(next); selection unchanged until value updates.
5. Per-item `disabled` blocks that option; group `disabled` blocks all.
6. Description renders and is associated via aria-describedby.
7. Merges root + per-item classNames onto option/item/label/description slots.
8. Empty items → renders group, no radios.

## Out of scope (→ primitives)
Heterogeneous option markup, custom indicators, non-string values, radio cards with arbitrary content
beyond label+description, horizontal layouts needing custom structure.

## Status
Pending implementation in `registry/ui/radio-group.tsx`.
