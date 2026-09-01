import { createRef } from "react";
import type { CheckboxGroupProps } from "./checkbox-group";

declare const acceptProps: (props: CheckboxGroupProps) => undefined;

acceptProps({
  "aria-label": "Features",
  allValues: ["sync", "backup"],
  defaultValue: ["sync"],
  items: [{ label: "Sync", value: "sync" }],
  onClick: (event) => event.preventBaseUIHandler(),
  onValueChange: (_value, details) => details.cancel(),
  ref: createRef<HTMLDivElement>(),
  value: ["sync"],
});

// @ts-expect-error CheckboxGroup owns its generated children.
acceptProps({ children: "Bypass", items: [] });

// @ts-expect-error Raw HTML conflicts with generated children.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" }, items: [] });

// @ts-expect-error Root element replacement bypasses generated children.
acceptProps({ items: [], render: <section /> });

// @ts-expect-error CheckboxGroup owns its semantic role.
acceptProps({ items: [], role: "listbox" });

// @ts-expect-error Disabled ARIA is derived from disabled.
acceptProps({ "aria-disabled": true, items: [] });

// @ts-expect-error Native change events conflict with onValueChange.
acceptProps({ items: [], onChange: () => undefined });

// @ts-expect-error The Compose root slot marker is owned.
acceptProps({ "data-slot": "bypass", items: [] });
