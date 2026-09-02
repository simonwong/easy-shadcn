import type { SidebarItem, SidebarProps, SidebarTriggerProps } from "./sidebar";

declare const acceptSidebar: (props: SidebarProps) => undefined;
declare const acceptTrigger: (props: SidebarTriggerProps) => undefined;
declare const acceptItem: (item: SidebarItem) => undefined;

acceptSidebar({
  content: <main>Dashboard</main>,
  defaultOpenKeys: ["team"],
  defaultValue: "overview",
  footer: <span>Account</span>,
  header: <strong>Acme</strong>,
  items: [
    { href: "/overview", key: "overview", label: "Overview" },
    {
      items: [{ key: "members", label: "Members" }],
      key: "team",
      label: "Team",
      type: "submenu",
    },
  ],
  onOpenKeysChange: (_keys) => undefined,
  onValueChange: (_value) => undefined,
});
acceptTrigger({ className: "trigger", label: "Open navigation" });

// @ts-expect-error Compose owns the provider and sidebar child tree.
acceptSidebar({ children: <div />, content: <main />, items: [] });
// @ts-expect-error The Compose component fixes offcanvas collapse behavior.
acceptSidebar({ collapsible: "icon", content: <main />, items: [] });
// @ts-expect-error Mobile sheet state remains internal.
acceptSidebar({ content: <main />, items: [], mobileOpen: true });
// @ts-expect-error Root clicks are not part of the Compose API.
acceptSidebar({ content: <main />, items: [], onClick: () => undefined });
// @ts-expect-error Breakpoint policy belongs to the Primitive.
acceptSidebar({ breakpoint: 640, content: <main />, items: [] });
// @ts-expect-error Shortcut policy belongs to the Primitive.
acceptSidebar({ content: <main />, hotkey: "k", items: [] });
// @ts-expect-error Menu primitive props are not a Compose escape hatch.
acceptSidebar({ content: <main />, items: [], menuProps: {} });
// @ts-expect-error Persistence policy belongs to the Primitive.
acceptSidebar({ content: <main />, items: [], persist: false });
// @ts-expect-error Provider primitive props are not a Compose escape hatch.
acceptSidebar({ content: <main />, items: [], providerProps: {} });
// @ts-expect-error Render replacement bypasses the finite shell.
acceptSidebar({ content: <main />, items: [], render: <aside /> });
// @ts-expect-error Sheet primitive props are not a Compose escape hatch.
acceptSidebar({ content: <main />, items: [], sheetProps: {} });
// @ts-expect-error Slot maps are forbidden by the Compose contract.
acceptSidebar({ content: <main />, items: [], slots: {} });
// @ts-expect-error Storage keys belong to application restoration logic.
acceptSidebar({ content: <main />, items: [], storageKey: "sidebar" });
acceptSidebar({
  content: <main />,
  // @ts-expect-error Raw HTML cannot replace Compose-owned structure.
  dangerouslySetInnerHTML: { __html: "replace" },
  items: [],
});

// @ts-expect-error Trigger children are fixed by the primitive.
acceptTrigger({ children: "Replace" });
// @ts-expect-error Trigger click behavior is owned by the sidebar context.
acceptTrigger({ onClick: () => undefined });
// @ts-expect-error Trigger element replacement bypasses the adapter.
acceptTrigger({ render: <a href="/">Replace</a> });
// @ts-expect-error Use label rather than bypassing the trigger label adapter.
acceptTrigger({ "aria-label": "Replace" });

// @ts-expect-error Item content uses label rather than children.
acceptItem({ children: "Replace", key: "account", label: "Account" });
// @ts-expect-error Item handlers are owned by the Sidebar selection contract.
acceptItem({ key: "account", label: "Account", onClick: () => undefined });

acceptItem({
  items: [
    {
      items: [{ key: "leaf", label: "Leaf" }],
      key: "nested",
      // @ts-expect-error Groups cannot contain groups.
      type: "group",
    },
  ],
  key: "root",
  type: "group",
});
acceptItem({
  items: [
    {
      key: "divider",
      // @ts-expect-error Submenus cannot contain separators.
      type: "separator",
    },
  ],
  key: "account",
  label: "Account",
  type: "submenu",
});
// @ts-expect-error Submenu navigation is expressed by child leaf href values.
acceptItem({
  href: "/account",
  items: [{ key: "profile", label: "Profile" }],
  key: "account",
  label: "Account",
  type: "submenu",
});
