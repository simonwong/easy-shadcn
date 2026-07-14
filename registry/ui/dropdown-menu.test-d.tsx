import type { Menu as MenuPrimitive } from "@base-ui/react/menu";
import type { DropdownMenuProps } from "./dropdown-menu";

declare const acceptProps: (props: DropdownMenuProps) => undefined;

const trigger = <button type="button">Actions</button>;

acceptProps({
  align: "end",
  contentClassName: ["content-x", { active: true }],
  defaultOpen: true,
  disabled: false,
  itemClassName: ["item-x", false],
  items: [
    {
      content: <span>Edit</span>,
      disabled: false,
      icon: <svg aria-label="ignored" />,
      inset: true,
      itemClassName: ["specific-x", null],
      onClick: (event) => {
        event.preventBaseUIHandler();
      },
      shortcut: "⌘E",
      value: "edit",
      variant: "destructive",
    },
  ],
  onOpenChange: (_open, details) => {
    details.cancel();
  },
  open: true,
  shortcutClassName: ["shortcut-x", undefined],
  side: "top",
  sideOffset: 8,
  trigger,
});

const exactOpenChange: NonNullable<DropdownMenuProps["onOpenChange"]> = (
  _open,
  details
) => {
  details.cancel();
};
const primitiveOpenChange: MenuPrimitive.Root.Props["onOpenChange"] =
  exactOpenChange;
acceptProps({ items: [], onOpenChange: primitiveOpenChange, trigger });

// @ts-expect-error The two-concept base case requires trigger and items.
acceptProps({});

// @ts-expect-error Items are required even when the trigger is present.
acceptProps({ trigger });

// @ts-expect-error The trigger is required even for an empty item list.
acceptProps({ items: [] });

// @ts-expect-error Trigger composition requires a React element.
acceptProps({ items: [], trigger: "Actions" });

// @ts-expect-error Item identity is required.
acceptProps({ items: [{ content: "Edit" }], trigger });

// @ts-expect-error Item content is required.
acceptProps({ items: [{ value: "edit" }], trigger });

// @ts-expect-error Item identity is always a string.
acceptProps({ items: [{ content: "Edit", value: 1 }], trigger });

acceptProps({
  items: [
    {
      content: "Edit",
      // @ts-expect-error Variant is deliberately limited to the primitive vocabulary.
      variant: "warning",
      value: "edit",
    },
  ],
  trigger,
});

// @ts-expect-error Compose owns its complete child structure.
acceptProps({ children: "Bypass", items: [], trigger });

// @ts-expect-error Root rendering is fixed by the Compose component.
acceptProps({ items: [], render: <div />, trigger });

// @ts-expect-error Slots objects are not part of the flat API.
acceptProps({ items: [], slots: {}, trigger });

// @ts-expect-error Arbitrary insertion callbacks are outside the homogeneous list API.
acceptProps({ betweenItems: () => <hr />, items: [], trigger });

// @ts-expect-error Root identifiers remain primitive-owned.
acceptProps({ id: "forged", items: [], trigger });

// @ts-expect-error Primitive slot markers remain Compose-owned.
acceptProps({ "data-slot": "forged", items: [], trigger });

// @ts-expect-error Root prop bags would bypass explicit ownership.
acceptProps({ items: [], rootProps: {}, trigger });

// @ts-expect-error Trigger prop bags would bypass explicit ownership.
acceptProps({ items: [], trigger, triggerProps: {} });

// @ts-expect-error Content prop bags would bypass explicit ownership.
acceptProps({ contentProps: {}, items: [], trigger });

// @ts-expect-error Portal prop bags are an advanced primitive escape path.
acceptProps({ items: [], portalProps: {}, trigger });

// @ts-expect-error Positioner prop bags are an advanced primitive escape path.
acceptProps({ items: [], positionerProps: {}, trigger });

// @ts-expect-error Root modal behavior is intentionally outside the thin wrapper.
acceptProps({ items: [], modal: false, trigger });

// @ts-expect-error Root orientation is primitive-only.
acceptProps({ items: [], orientation: "horizontal", trigger });

// @ts-expect-error Looping policy is primitive-only.
acceptProps({ items: [], loop: false, trigger });

// @ts-expect-error Hover opening is primitive-only.
acceptProps({ items: [], openOnHover: true, trigger });

// @ts-expect-error Open delay is primitive-only.
acceptProps({ delay: 100, items: [], trigger });

// @ts-expect-error Close delay is primitive-only.
acceptProps({ closeDelay: 100, items: [], trigger });

// @ts-expect-error Payload state is outside this action-menu wrapper.
acceptProps({ items: [], payload: { source: "test" }, trigger });

// @ts-expect-error Imperative action handles are primitive-only.
acceptProps({ actionsRef: { current: null }, items: [], trigger });

// @ts-expect-error Alignment offsets require direct primitive composition.
acceptProps({ alignOffset: 2, items: [], trigger });

// @ts-expect-error Dynamic offset functions require direct primitive composition.
acceptProps({ items: [], sideOffset: () => 4, trigger });

// @ts-expect-error Collision configuration requires direct primitive composition.
acceptProps({ collisionAvoidance: {}, items: [], trigger });

// @ts-expect-error Final-focus control remains primitive-owned.
acceptProps({ finalFocus: trigger, items: [], trigger });

// @ts-expect-error Generic root styling is not part of the explicit class vocabulary.
acceptProps({ className: "root-x", items: [], trigger });

// @ts-expect-error Trigger semantics belong on the composed trigger element.
acceptProps({ "aria-label": "Bypass", items: [], trigger });

// @ts-expect-error Wrapper refs are not part of the public API.
acceptProps({ items: [], ref: () => undefined, trigger });

acceptProps({
  items: [
    {
      // @ts-expect-error Visible content is named content, not Base UI's typeahead label.
      label: "Edit",
      content: "Edit",
      value: "edit",
    },
  ],
  trigger,
});

acceptProps({
  items: [
    {
      // @ts-expect-error Compose owns item descendants.
      children: "Bypass",
      content: "Edit",
      value: "edit",
    },
  ],
  trigger,
});

acceptProps({
  items: [
    {
      content: "Edit",
      // @ts-expect-error Item rendering is fixed by the homogeneous schema.
      render: <button type="button" />,
      value: "edit",
    },
  ],
  trigger,
});

acceptProps({
  items: [
    {
      content: "Edit",
      // @ts-expect-error Item prop bags could override interaction ownership.
      itemProps: {},
      value: "edit",
    },
  ],
  trigger,
});

acceptProps({
  items: [
    {
      content: "Edit",
      // @ts-expect-error onSelect is not an alternate action API.
      onSelect: () => undefined,
      value: "edit",
    },
  ],
  trigger,
});

acceptProps({
  items: [
    {
      // @ts-expect-error Custom dismissal policy is primitive-only.
      closeOnClick: false,
      content: "Edit",
      value: "edit",
    },
  ],
  trigger,
});

acceptProps({
  items: [
    {
      content: "Edit",
      // @ts-expect-error Item roles remain primitive-derived.
      role: "option",
      value: "edit",
    },
  ],
  trigger,
});

// @ts-expect-error Groups require direct compound-component composition.
acceptProps({ groups: [], items: [], trigger });

// @ts-expect-error Separators require direct compound-component composition.
acceptProps({ items: [], separators: [], trigger });

// @ts-expect-error Submenus require direct compound-component composition.
acceptProps({ items: [], submenus: [], trigger });

// @ts-expect-error Checkbox state requires direct compound-component composition.
acceptProps({ checkedValues: [], items: [], trigger });

// @ts-expect-error Radio state requires direct compound-component composition.
acceptProps({ items: [], selectedValue: "edit", trigger });
