import type { TabsProps } from "./tabs";

declare const acceptProps: (props: TabsProps) => undefined;

acceptProps({
  "aria-label": "Account settings",
  defaultValue: "profile",
  items: [{ content: "Profile content", trigger: "Profile", value: "profile" }],
  onValueChange: (_value, details) => details.cancel(),
  orientation: "vertical",
  role: "presentation",
  value: "profile",
});

// @ts-expect-error Tabs owns its generated children.
acceptProps({ children: "Bypass", items: [] });

// @ts-expect-error Raw HTML conflicts with generated children.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" }, items: [] });

// @ts-expect-error Root element replacement bypasses generated children.
acceptProps({ items: [], render: <section /> });

// @ts-expect-error The primitive root slot is Compose-owned.
acceptProps({ "data-slot": "bypass", items: [] });

// @ts-expect-error Orientation marker is derived from orientation.
acceptProps({ "data-orientation": "horizontal", items: [] });

// @ts-expect-error Activation direction is primitive state.
acceptProps({ "data-activation-direction": "left", items: [] });
