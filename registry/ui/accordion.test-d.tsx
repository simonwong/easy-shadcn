import type { AccordionProps } from "./accordion";

declare const acceptProps: (props: AccordionProps) => undefined;

acceptProps({
  "aria-label": "FAQ",
  defaultValue: ["first"],
  items: [{ content: "Answer", trigger: "Question", value: "first" }],
  loopFocus: false,
  onValueChange: (_value, details) => details.cancel(),
  orientation: "horizontal",
  role: "presentation",
  value: ["first"],
});

// @ts-expect-error Accordion owns its generated children.
acceptProps({ children: "Bypass", items: [] });

// @ts-expect-error Raw HTML conflicts with generated children.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" }, items: [] });

// @ts-expect-error Root element replacement bypasses generated children.
acceptProps({ items: [], render: <section /> });

// @ts-expect-error The primitive root slot is Compose-owned.
acceptProps({ "data-slot": "bypass", items: [] });

// @ts-expect-error Disabled state marker is derived from disabled.
acceptProps({ "data-disabled": "", items: [] });

// @ts-expect-error Orientation marker is derived from orientation.
acceptProps({ "data-orientation": "horizontal", items: [] });
