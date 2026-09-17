import type {
  NavigationMenuItem,
  NavigationMenuProps,
} from "./navigation-menu";

declare const props: (value: NavigationMenuProps) => void;
declare const item: (value: NavigationMenuItem) => void;

props({
  items: [],
  value: null,
  onValueChange: (value, details) => {
    const _value: string | null = value;
    details.cancel();
  },
});
item({ value: "docs", content: "Docs", href: "/docs", active: true });
item({
  value: "products",
  trigger: "Products",
  items: [{ value: "overview", content: "Overview", href: "/products" }],
});
// @ts-expect-error Items are the required entry point.
props({});
// @ts-expect-error Root structure is owned by Compose.
props({ items: [], children: "Bypass" });
// @ts-expect-error Root rendering is primitive-only.
props({ items: [], render: <div /> });
// @ts-expect-error Raw HTML cannot replace the navigation.
props({ items: [], dangerouslySetInnerHTML: { __html: "Bypass" } });
// @ts-expect-error The primitive owns roles.
props({ items: [], role: "menubar" });
// @ts-expect-error Open values are string identities.
props({ items: [], value: 1 });
// @ts-expect-error Link and disclosure are exclusive.
item({ value: "both", content: "Both", href: "/", trigger: "Both", items: [] });
item({
  value: "one",
  trigger: "One",
  // @ts-expect-error Nested dropdowns use the primitive.
  items: [{ value: "two", trigger: "Two", items: [] }],
});
// @ts-expect-error Links require a destination.
item({ value: "docs", content: "Docs" });
// @ts-expect-error Current page belongs to a link.
item({ value: "products", trigger: "Products", items: [], active: true });
item({
  value: "docs",
  content: "Docs",
  href: "/docs",
  // @ts-expect-error Arbitrary link handlers use the primitive.
  onClick: () => undefined,
});
// @ts-expect-error Link prop bags bypass ownership.
item({ value: "docs", content: "Docs", href: "/docs", linkProps: {} });
// @ts-expect-error Compose closes links consistently.
item({ value: "docs", content: "Docs", href: "/docs", closeOnClick: false });
