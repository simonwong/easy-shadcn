import { createRef } from "react";
import type { MenubarItem, MenubarProps } from "./menubar";

declare const acceptProps: (props: MenubarProps) => void;
declare const acceptItem: (item: MenubarItem) => void;

acceptProps({
  items: [],
  ref: createRef<HTMLDivElement>(),
  "aria-label": "Editor",
  className: ["bar", { active: true }],
});
acceptProps({
  items: [
    {
      key: "file",
      trigger: "File",
      items: [
        {
          key: "new",
          content: "New",
          onClick: (event) => event.preventBaseUIHandler(),
        },
      ],
    },
  ],
});
acceptItem({
  key: "ruler",
  type: "checkbox",
  content: "Ruler",
  checked: false,
  onCheckedChange: (checked, details) => {
    const _value: boolean = checked;
    details.cancel();
  },
});
acceptItem({
  key: "theme",
  type: "radio-group",
  content: "Theme",
  value: "dark",
  items: [{ value: "dark", content: "Dark" }],
  onValueChange: (value, details) => {
    const _value: string = value;
    details.cancel();
  },
});
acceptItem({
  key: "export",
  type: "submenu",
  content: "Export",
  items: [{ key: "pdf", content: "PDF" }],
});
acceptItem({ key: "group", type: "group", content: "Document", items: [] });
acceptItem({ key: "divider", type: "separator" });

// @ts-expect-error The first use case requires items.
acceptProps({});
// @ts-expect-error The bar owns its generated structure.
acceptProps({ items: [], children: "Bypass" });
// @ts-expect-error Root element replacement is primitive-only.
acceptProps({ items: [], render: <div /> });
// @ts-expect-error Raw HTML cannot replace generated menus.
acceptProps({ items: [], dangerouslySetInnerHTML: { __html: "Bypass" } });
// @ts-expect-error The primitive owns semantics.
acceptProps({ items: [], role: "listbox" });
// @ts-expect-error Slots are outside the flat interface.
acceptProps({ items: [], slots: {} });
// @ts-expect-error Open policy is delegated to the primitive.
acceptProps({ items: [], open: true });
// @ts-expect-error Menu identity is required.
acceptProps({ items: [{ trigger: "File", items: [] }] });
// @ts-expect-error Checkbox state is controlled and required.
acceptItem({ key: "ruler", type: "checkbox", content: "Ruler" });
acceptItem({
  key: "ruler",
  type: "checkbox",
  content: "Ruler",
  checked: false,
  // @ts-expect-error Checkbox defaults cannot survive popup unmounting.
  defaultChecked: true,
});
acceptItem({
  key: "ruler",
  type: "checkbox",
  content: "Ruler",
  checked: false,
  // @ts-expect-error Checkbox items dispatch setting changes rather than actions.
  onClick: () => undefined,
});
acceptItem({
  key: "theme",
  type: "radio-group",
  content: "Theme",
  // @ts-expect-error Radio selection is a string, not the primitive any.
  value: 1,
  items: [],
});
// @ts-expect-error Radio selection is required.
acceptItem({ key: "theme", type: "radio-group", content: "Theme", items: [] });
acceptItem({
  key: "theme",
  type: "radio-group",
  content: "Theme",
  value: "",
  // @ts-expect-error Options need values distinct from the group's stable key.
  items: [{ key: "dark", content: "Dark" }],
});
acceptItem({
  key: "export",
  type: "submenu",
  content: "Export",
  items: [],
  // @ts-expect-error Submenus cannot dispatch leaf actions.
  onClick: () => undefined,
});
// @ts-expect-error Separators do not own content.
acceptItem({ key: "divider", type: "separator", content: "Wrong" });
// @ts-expect-error Item bags would bypass ownership.
acceptItem({ key: "new", content: "New", itemProps: {} });
// @ts-expect-error Custom close policy uses the primitive.
acceptItem({ key: "new", content: "New", closeOnClick: false });
