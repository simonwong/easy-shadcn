# Menu owns persistent navigation state, not popup action behaviour

`Menu` is the canonical Compose owner for Ant Design-style navigation: a hierarchical `items` tree, selected value state, open submenu keys, and `vertical | horizontal | inline` presentation. It renders its own persistent navigation structure under `registry/ui/menu.tsx`; reusing Dropdown Menu or Context Menu primitives would couple the Interface to popup dismissal and trigger semantics that do not belong to persistent navigation.

## Decision

- Leaf items are links or actions. Submenu items own `children`; explicit group and separator entries cover the stable heterogeneous tree shapes.
- Selection follows the Compose vocabulary: single mode uses `value?: string`, multiple mode uses `value?: string[]`, with matching `defaultValue` and `onValueChange`. `selectable={false}` keeps action dispatch without selection state.
- Expansion uses `openKeys` / `defaultOpenKeys` / `onOpenKeysChange` because several submenu keys may be open independently.
- `vertical` and `horizontal` submenus are popup-positioned by the module; `inline` submenus expand in document flow. Click, keyboard, focus, outside-click, and Escape behaviour belong to the module.
- Dropdown Menu, Context Menu, Menubar, Command, responsive overflow, hover delays, inline collapse, themes, and arbitrary popup rendering are not folded into this Interface. A later shell may reuse the item vocabulary without sharing Menu behaviour.

## Consequences

The first use case remains `items` only. Optional selection, expansion, multiple mode, and presentation props add depth without raising the onboarding slope. The module uses no handwritten file under `components/ui/**` because shadcn has no matching generic persistent Menu primitive.
