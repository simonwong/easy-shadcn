import { createRef } from "react";
import type { MenuProps } from "./menu";

declare const acceptProps: (props: MenuProps) => undefined;

const items = [{ key: "overview", label: "Overview" }];

acceptProps({
  "aria-label": "Workspace",
  defaultValue: "overview",
  items,
  mode: "horizontal",
  onClick: (event) => event.preventDefault(),
  onKeyDown: (event) => event.preventDefault(),
  onValueChange: (_value) => undefined,
  ref: createRef<HTMLUListElement>(),
  style: { color: "red" },
  value: "overview",
});

// @ts-expect-error Menu owns its generated children.
acceptProps({ children: "Bypass", items });

// @ts-expect-error Raw HTML conflicts with generated children.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" }, items });

// @ts-expect-error Root element replacement bypasses generated children.
acceptProps({ items, render: <section /> });

// @ts-expect-error Menu owns its semantic root role.
acceptProps({ items, role: "listbox" });

// @ts-expect-error Orientation ARIA is derived from mode.
acceptProps({ "aria-orientation": "horizontal", items });

// @ts-expect-error The mode marker is derived from mode.
acceptProps({ "data-mode": "forged", items });

// @ts-expect-error Native change events conflict with onValueChange.
acceptProps({ items, onChange: () => undefined });
