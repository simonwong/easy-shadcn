import type { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import type { ContextMenuItem, ContextMenuProps } from "./context-menu";

declare const acceptProps: (props: ContextMenuProps) => undefined;

const trigger = <button type="button">File actions</button>;

acceptProps({
  items: [
    { content: "Edit", value: "edit" },
    { content: "Duplicate", value: "duplicate" },
  ],
  trigger,
});

const exactOpenChange: NonNullable<ContextMenuProps["onOpenChange"]> = (
  _open,
  details
) => {
  details.cancel();
  details.allowPropagation();
};
const primitiveOpenChange: ContextMenuPrimitive.Root.Props["onOpenChange"] =
  exactOpenChange;
acceptProps({
  disabled: false,
  items: [],
  onOpenChange: primitiveOpenChange,
  open: false,
  trigger,
});
acceptProps({ items: [], trigger });
acceptProps({
  align: "center",
  items: [],
  side: "inline-end",
  sideOffset: 12,
  trigger,
});
acceptProps({
  contentClassName: ["content-x", false],
  itemClassName: ["item-x", null],
  items: [
    {
      content: <span>Edit</span>,
      disabled: false,
      icon: <svg aria-label="Ignored" />,
      inset: true,
      itemClassName: ["specific-x", undefined],
      onClick: (event) => {
        event.preventBaseUIHandler();
      },
      shortcut: "⌘E",
      value: "edit",
      variant: "destructive",
    },
  ],
  shortcutClassName: ["shortcut-x", false],
  trigger,
});

const exactItemClick: NonNullable<ContextMenuItem["onClick"]> = (event) => {
  event.preventBaseUIHandler();
};
const primitiveItemClick: ContextMenuPrimitive.Item.Props["onClick"] =
  exactItemClick;
acceptProps({
  items: [{ content: "Edit", onClick: primitiveItemClick, value: "edit" }],
  trigger,
});

// @ts-expect-error The base case requires trigger and items.
acceptProps({});

// @ts-expect-error Items are required.
acceptProps({ trigger });

// @ts-expect-error Trigger is required.
acceptProps({ items: [] });

// @ts-expect-error Trigger composition requires a React element.
acceptProps({ items: [], trigger: "File actions" });

// @ts-expect-error Compose owns the complete child structure.
acceptProps({ children: "Bypass", items: [], trigger });

// @ts-expect-error Root rendering is fixed by Compose.
acceptProps({ items: [], render: <div />, trigger });

// @ts-expect-error Root prop bags bypass explicit ownership.
acceptProps({ items: [], rootProps: {}, trigger });

// @ts-expect-error Trigger prop bags bypass explicit ownership.
acceptProps({ items: [], trigger, triggerProps: {} });

// @ts-expect-error Content prop bags bypass explicit ownership.
acceptProps({ contentProps: {}, items: [], trigger });

// @ts-expect-error Context menus cannot default-open before an anchor exists.
acceptProps({ defaultOpen: true, items: [], trigger });

// @ts-expect-error Primitive naming remains onOpenChange.
acceptProps({ items: [], onValueChange: () => undefined, trigger });

// @ts-expect-error onChange is not an open-state alias.
acceptProps({ items: [], onChange: () => undefined, trigger });

// @ts-expect-error Imperative action handles are primitive-only.
acceptProps({ actionsRef: { current: null }, items: [], trigger });

// @ts-expect-error Modal policy remains primitive-owned.
acceptProps({ items: [], modal: false, trigger });

// @ts-expect-error Orientation remains primitive-owned.
acceptProps({ items: [], orientation: "horizontal", trigger });

// @ts-expect-error Focus looping remains primitive-owned.
acceptProps({ items: [], loopFocus: false, trigger });

// @ts-expect-error Alignment offset remains fixed by Compose.
acceptProps({ alignOffset: 4, items: [], trigger });

// @ts-expect-error Side offset is intentionally numeric-only.
acceptProps({ items: [], sideOffset: () => 4, trigger });

// @ts-expect-error Anchor ownership stays with context-menu invocation.
acceptProps({ anchor: document.body, items: [], trigger });

// @ts-expect-error Collision policy remains primitive-owned.
acceptProps({ collisionAvoidance: { side: "none" }, items: [], trigger });

// @ts-expect-error Portal prop bags bypass explicit ownership.
acceptProps({ items: [], portalProps: {}, trigger });

// @ts-expect-error Positioner prop bags bypass explicit ownership.
acceptProps({ items: [], positionerProps: {}, trigger });

// @ts-expect-error Final focus policy remains primitive-owned.
acceptProps({ finalFocus: document.body, items: [], trigger });

// @ts-expect-error Portal container ownership remains primitive-only.
acceptProps({ container: document.body, items: [], trigger });

// @ts-expect-error Backdrops require primitive composition.
acceptProps({ backdrop: <div />, items: [], trigger });

// @ts-expect-error Arrows require primitive composition.
acceptProps({ arrow: <span />, items: [], trigger });

// @ts-expect-error Item identity is required.
acceptProps({ items: [{ content: "Edit" }], trigger });

// @ts-expect-error Item content is required.
acceptProps({ items: [{ value: "edit" }], trigger });

// @ts-expect-error Item identity is string-only.
acceptProps({ items: [{ content: "Edit", value: 1 }], trigger });

acceptProps({
  items: [
    {
      content: "Edit",
      // @ts-expect-error Variant is limited to the primitive vocabulary.
      variant: "warning",
      value: "edit",
    },
  ],
  trigger,
});

acceptProps({
  items: [
    {
      content: "Edit",
      // @ts-expect-error Visible content owns the name; no label alias.
      label: "Edit",
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
      // @ts-expect-error Item rendering is fixed.
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
      // @ts-expect-error Item prop bags bypass ownership.
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
      // @ts-expect-error onSelect is not an action alias.
      onSelect: () => undefined,
      value: "edit",
    },
  ],
  trigger,
});

acceptProps({
  items: [
    {
      // @ts-expect-error Custom close policy is primitive-only.
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
      // @ts-expect-error Selection state is primitive-only.
      checked: true,
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
      // @ts-expect-error Links require primitive LinkItem composition.
      href: "/edit",
      value: "edit",
    },
  ],
  trigger,
});

acceptProps({
  items: [
    {
      content: "Edit",
      // @ts-expect-error Submenus require compound primitive composition.
      items: [],
      value: "edit",
    },
  ],
  trigger,
});
