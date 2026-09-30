import type { BreadcrumbProps } from "./breadcrumb";

declare const acceptProps: (props: BreadcrumbProps) => undefined;

acceptProps({
  "aria-label": "Breadcrumb trail",
  className: "root-x",
  items: [{ href: "/", label: "Home" }, { label: "Current" }],
  onClick: () => undefined,
  role: "navigation",
});

// @ts-expect-error Breadcrumb owns its generated list children.
acceptProps({ children: "Bypass", items: [] });

// @ts-expect-error Raw HTML conflicts with Compose-owned descendants.
acceptProps({ dangerouslySetInnerHTML: { __html: "Bypass" }, items: [] });

// @ts-expect-error The primitive root slot is Compose-owned.
acceptProps({ "data-slot": "bypass", items: [] });

acceptProps({
  className: ["root-x", { "root-y": true }],
  itemClassName: ["item-x"],
  items: [{ label: "Current" }],
  linkClassName: { "link-x": true },
  listClassName: ["list-x", false],
  pageClassName: ["page-x"],
  separatorClassName: ["separator-x"],
});
