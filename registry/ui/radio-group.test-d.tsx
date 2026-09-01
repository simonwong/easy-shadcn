import { createRef } from "react";
import type { RadioGroupProps } from "./radio-group";

declare const acceptProps: (props: RadioGroupProps) => undefined;

acceptProps({
  "aria-label": "Plans",
  defaultValue: "free",
  form: "checkout",
  inputRef: createRef<HTMLInputElement>(),
  items: [{ label: "Free", value: "free" }],
  name: "plan",
  onClick: (event) => event.preventBaseUIHandler(),
  onValueChange: (_value, details) => details.cancel(),
  readOnly: false,
  ref: createRef<HTMLDivElement>(),
  required: true,
  value: "free",
});

// @ts-expect-error RadioGroup owns its generated children.
acceptProps({ children: "Bypass", items: [] });

// @ts-expect-error Raw HTML conflicts with generated children.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" }, items: [] });

// @ts-expect-error Root element replacement bypasses generated children.
acceptProps({ items: [], render: <section /> });

// @ts-expect-error RadioGroup owns its semantic role.
acceptProps({ items: [], role: "listbox" });

// @ts-expect-error Disabled ARIA is derived from disabled.
acceptProps({ "aria-disabled": true, items: [] });

// @ts-expect-error Readonly ARIA is derived from readOnly.
acceptProps({ "aria-readonly": true, items: [] });

// @ts-expect-error Required ARIA is derived from required.
acceptProps({ "aria-required": true, items: [] });

// @ts-expect-error Native change events conflict with onValueChange.
acceptProps({ items: [], onChange: () => undefined });

// @ts-expect-error The primitive slot marker is Compose-owned.
acceptProps({ "data-slot": "bypass", items: [] });
