# Spec — Accordion (Compose layer)

`registry/ui/accordion.tsx`. Flattens shadcn base-ui Accordion compound parts into one
`items`-driven component. Mirrors `registry/ui/tabs.tsx`.

## Ground truth (base-ui @1.4.0)
- `AccordionRoot.Props<Value>`: `value?: Value[]`, `defaultValue?: Value[]`,
  `onValueChange?(value: Value[], details)`, `multiple?: boolean` (default false),
  `disabled?`, `keepMounted?`, `hiddenUntilFound?`, `loopFocus?`, `orientation?`, + div props.
  **value is an ARRAY** (multi-open native).
- `AccordionItem.Props`: `value?: any` (auto index if omitted), `disabled?`, `onOpenChange?`.
- shadcn `AccordionTrigger` wraps `Trigger` in a `Header` and injects up/down chevrons.
- shadcn `AccordionContent` wraps `Panel` + an inner div; `className` lands on the inner div.

## API
```ts
export interface AccordionItem {
  value: string;            // required, stable key + controlled id (matches TabsItem)
  trigger: ReactNode;       // header label
  content: ReactNode;       // panel body
  disabled?: boolean;
  itemClassName?: ClassValue;
  triggerClassName?: ClassValue;
  contentClassName?: ClassValue;
}

export interface AccordionProps
  extends Omit<AccordionPrimitive.Root.Props<string>,
    "children" | "defaultValue" | "onValueChange" | "render" | "value"> {
  items: AccordionItem[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[], details: AccordionPrimitive.Root.ChangeEventDetails) => void;
  itemClassName?: ClassValue;       // every AccordionItem
  triggerClassName?: ClassValue;    // every AccordionTrigger
  contentClassName?: ClassValue;    // every AccordionContent
}
```
- Narrow `value`/`defaultValue`/`onValueChange` to `string[]` (base-ui types them `any[]`).
- `multiple`, `disabled`, `keepMounted`, `orientation`, `className`, etc. forwarded via `...rootProps`.
- Per-item class merged AFTER root-level: `cn(triggerClassName, item.triggerClassName)`.
- Import primitive `AccordionItem` aliased to avoid clashing with the exported interface name.

## Behavior / edge cases (tests)
1. Renders all triggers + panels from `items`.
2. Uncontrolled: clicking a trigger opens its panel (single mode collapses others).
3. `multiple` lets two panels open at once.
4. `defaultValue={["b"]}` opens b initially.
5. Controlled `value` + `onValueChange`: click fires onValueChange with next string[]; panel
   does not change until `value` prop updates.
6. Per-item `disabled` blocks toggle; root `disabled` blocks all.
7. Merges root + per-item classNames onto item / trigger / content slots.
8. Empty `items` → renders accordion root, no items.

## Out of scope (→ primitives)
Heterogeneous item markup, custom chevrons, `hiddenUntilFound` search semantics beyond pass-through,
non-string item values.

## Status
Implemented in `registry/ui/accordion.tsx` (+ `accordion.test.tsx`, 10 tests, 100% coverage).
