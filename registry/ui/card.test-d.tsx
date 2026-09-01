import type { CardProps } from "./card";

declare const acceptProps: (props: CardProps) => undefined;

acceptProps({
  "aria-label": "Usage summary",
  children: "Body",
  className: "root-x",
  onClick: () => undefined,
  size: "sm",
  title: "Usage",
});

// @ts-expect-error Raw HTML conflicts with Compose-owned descendants.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" } });

// @ts-expect-error The primitive root slot is Compose-owned.
acceptProps({ "data-slot": "bypass" });

// @ts-expect-error The size marker is derived from size.
acceptProps({ "data-size": "sm" });
