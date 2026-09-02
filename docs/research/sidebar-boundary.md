# Sidebar product boundary

Snapshot: 2026-09-02

## Question

Does shadcn Sidebar justify a Compose owner, and where should its Interface stop
across provider state, responsive layout, collapse modes, mobile Sheet,
keyboard invocation, persistence, navigation data, and Primitive composition?

## Primary-source baseline

- shadcn describes Sidebar as a provider plus a responsive panel, header,
  scrollable content, groups, menu rows, footer, rail, inset, and trigger. The
  documented composition is deliberately broad and compound rather than one
  flat task Interface
  ([official structure](https://ui.shadcn.com/docs/components/base/sidebar#structure)).
- `SidebarProvider` exposes the standard desktop controlled triplet
  `open` / `defaultOpen` / `onOpenChange`; `useSidebar` additionally exposes an
  independent `openMobile`, the 768 px mobile decision, and one responsive
  `toggleSidebar`
  ([provider docs](https://ui.shadcn.com/docs/components/base/sidebar#sidebarprovider),
  [hook docs](https://ui.shadcn.com/docs/components/base/sidebar#usesidebar)).
- The official source keeps desktop and mobile state separately. The desktop
  boolean derives `expanded | collapsed`; the toggle changes `openMobile` on
  mobile and desktop `open` otherwise
  ([official source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sidebar.tsx#L25-L140)).
- The responsive decision is a fixed `window.matchMedia` check below 768 px.
  This is not a Base UI state primitive and is not configurable independently
  from the source's `md:*` layout classes
  ([official mobile hook](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/hooks/use-mobile.ts#L1-L18),
  [official Sidebar layout source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sidebar.tsx#L141-L238)).
- On mobile, every collapsible mode except `none` swaps the desktop panel for a
  controlled shadcn `Sheet`; `side` is preserved and the same child tree moves
  into the Sheet. `none` returns the non-collapsible panel before the mobile
  branch
  ([official source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sidebar.tsx#L141-L238)).
- The Base-style shadcn Sheet is built on `@base-ui/react/dialog`. Base UI
  supplies modal Dialog state, focus, portal, backdrop, and dismissal semantics;
  it does not supply the Sidebar provider, breakpoint, layout, collapse model,
  or navigation tree
  ([official shadcn Sheet source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sheet.tsx#L1-L123),
  [Base UI Dialog docs](https://base-ui.com/react/components/dialog#anatomy)).
- The Base-style Sidebar also imports Base UI's `mergeProps` and `useRender`
  utilities for polymorphic leaf elements. Those utilities merge props and
  render elements; they do not own Sidebar state. There is no Base UI Sidebar
  primitive in Base UI's official component inventory
  ([official Sidebar imports](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sidebar.tsx#L1-L24),
  [Base UI components](https://base-ui.com/react/components/dialog)).
- Desktop `setOpen` writes `sidebar_state=<boolean>` with a seven-day lifetime,
  including controlled updates. The same source initializes from
  `defaultOpen`; it does not read that cookie. Therefore restoration is a
  caller/server concern, not a complete persistence facility supplied by the
  provider
  ([official source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sidebar.tsx#L25-L102)).
- The provider always registers global Mod+B. The key is fixed to `b`; the
  listener does not exclude editable targets. The official docs expose the
  shortcut as a source constant, not a provider prop
  ([official keyboard docs](https://ui.shadcn.com/docs/components/base/sidebar#keyboard-shortcut),
  [official source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sidebar.tsx#L84-L102)).
- The panel's documented variants are `sidebar | floating | inset`; collapse
  modes are `offcanvas | icon | none`; side is `left | right`. `inset` requires
  a matching main-content inset
  ([official Sidebar props](https://ui.shadcn.com/docs/components/base/sidebar#sidebar)).
- Official navigation is intentionally compositional. It supports groups,
  group actions, link/button rendering, active rows, row actions, badges,
  skeletons, and nested submenus, while collapsible groups require a separate
  Collapsible composition
  ([official group docs](https://ui.shadcn.com/docs/components/base/sidebar#sidebargroup),
  [official menu button docs](https://ui.shadcn.com/docs/components/base/sidebar#sidebarmenubutton),
  [official menu action docs](https://ui.shadcn.com/docs/components/base/sidebar#sidebarmenuaction),
  [official submenu docs](https://ui.shadcn.com/docs/components/base/sidebar#sidebarmenusub)).
- The official registry treats Sidebar as a styled multi-dependency UI item
  with Button, Separator, Sheet, Tooltip, CSS variables, and an installed
  source file. This is copy-in composition, not a separately versioned Sidebar
  runtime
  ([official registry example](https://ui.shadcn.com/docs/registry/examples#registryui)).

## What the Primitive actually owns

The Primitive already earns substantial implementation depth:

- one provider and context for independent desktop/mobile visibility;
- controlled/uncontrolled desktop open state and a derived collapse state;
- one responsive toggle path shared by keyboard, trigger, and rail;
- desktop gap/container coordination for side, variant, and collapse mode;
- a mobile modal Sheet adapter;
- collapsed-item Tooltip support and state/data markers for styling;
- the fixed global shortcut and desktop cookie write.

It does **not** own route matching, current-route derivation, SPA router
adapters, cookie restoration, localStorage, a configurable persistence key, a
configurable shortcut, or a stable data model for application navigation.
Those omissions are visible in the provider and navigation source rather than
inferred from catalog names
([official provider source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sidebar.tsx#L25-L140),
[official menu source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sidebar.tsx#L437-L689)).

## Deletion test

A Compose module that re-exports `SidebarProvider`, `SidebarContent`,
`SidebarGroup`, `SidebarMenuButton`, and the other official parts fails. Its
Interface would be almost as large as the 24-export Primitive implementation,
and deletion would only change import paths.

A bounded responsive navigation shell passes. Deleting that module makes each
caller rebuild provider placement, desktop/sidebar/inset coordination,
responsive Sheet behavior, breakpoint transition cleanup, trigger ownership,
navigation projection, mobile close-on-navigation, and preservation of
navigation state while the Primitive swaps renderers. That work is repeated
behavior and accessibility wiring, not styling sugar.

## Product decision

Ship one state-machine Compose owner named `Sidebar`. It owns the **responsive
application navigation shell**, not every visual part named Sidebar upstream.
It embeds the official provider, panel, header/content/footer structure, and
inset. It projects a finite `SidebarItem[]` navigation model through the
official Sidebar menu parts with ordinary navigation semantics.

Expose two main entries only:

1. `Sidebar` — provider + responsive panel + navigation + main inset.
2. `SidebarTrigger` — a placeable, ownership-safe toggle control for use inside
   `content`.

Do not export a second Compose provider or `useSidebar`. Those would expose the
Primitive's full context as a second state Interface. Custom providers,
imperative mobile control, and structurally custom triggers are Primitive
cases.

## Recommended Interface

The sketch is normative about ownership and concepts, not final syntax for
native prop inheritance:

```tsx
import type { ClassValue } from "clsx";
import type { ReactNode } from "react";
export interface SidebarProps {
  // Frozen base case: the navigation model and the main pane.
  items: SidebarItem[];
  content: ReactNode;

  // Sidebar-local content slots. No xxxProps bags.
  header?: ReactNode;
  footer?: ReactNode;

  // Sidebar-local single-selection and expansion seams.
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  openKeys?: string[];
  defaultOpenKeys?: string[];
  onOpenKeysChange?: (openKeys: string[]) => void;
  onSelect?: (key: string, item: SidebarLeafItem) => void;

  // Desktop collapse preference; mobile overlay remains independent/internal.
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  dir?: "ltr" | "rtl";
  navigationLabel?: string;

  className?: ClassValue;
  headerClassName?: ClassValue;
  navigationClassName?: ClassValue;
  footerClassName?: ClassValue;
  insetClassName?: ClassValue;
}

export interface SidebarTriggerProps {
  className?: ClassValue;
  label?: string;
}
```

Base usage requires two props and one placeable control:

```tsx
<Sidebar
  items={items}
  content={
    <>
      <header>
        <SidebarTrigger />
      </header>
      <Dashboard />
    </>
  }
/>
```

The first demo must not introduce controlled state, custom variants,
persistence setup, or class overrides. Freeze its concepts at `items`,
`content`, and trigger placement.

## State and behavior contract

### Provider and desktop state

- `Sidebar` hides `SidebarProvider`; callers cannot misorder provider, panel,
  and inset.
- `open` / `defaultOpen` / `onOpenChange` mean desktop expanded/collapsed
  preference, matching the Primitive reference frame. Controlled and
  uncontrolled behavior must follow the repository's standard controlled
  triplet.
- Compose fixes `collapsible="offcanvas"`. The collapsed desktop gap becomes
  zero, while the same trigger controls the mobile Sheet.
- Exactly one collapse-enabled Compose Sidebar is supported per document. The
  official provider installs one global Mod+B listener and uses one fixed
  cookie name, so multiple owners would race and collide
  ([official source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sidebar.tsx#L25-L102)).

### Responsive and mobile state

- Keep the official 768 px breakpoint. A public breakpoint prop would desync
  JavaScript, `md:*` CSS, and Sheet selection unless the whole Primitive were
  forked.
- Mobile overlay state stays separate from desktop collapse preference. Closing
  the Sheet must not collapse desktop, and reopening desktop must not open the
  Sheet.
- When the viewport becomes desktop, clear stale `openMobile`; resizing back to
  mobile must not resurrect a previously open overlay. This cleanup is Compose
  behavior missing from the official provider.
- Selecting an enabled navigation leaf updates internal selection and requests
  mobile Sheet closure before `onValueChange` and `onSelect`. Submenu toggles do
  not close it.
- Keep selection and submenu-open state above the Primitive's desktop/Sheet
  renderer switch so a breakpoint change does not reset the navigation task.
- Mobile uses the official Sheet/Dialog focus, dismissal, and modal semantics;
  Compose must not implement a second drawer state machine
  ([official mobile branch](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sidebar.tsx#L169-L193),
  [Base UI controlled Dialog state](https://base-ui.com/react/components/dialog#state)).

### Collapse modes and layout

- Preserve all three official variants and both sides. Fix collapse to the
  coherent responsive application-shell path: `collapsible="offcanvas"`.
  `icon` needs a stronger icon-only metadata and tooltip contract across every
  row; `none` bypasses the official mobile Sheet branch entirely. Both remain
  Primitive cases. Defaults are `side="left"`, `variant="sidebar"`, and
  `defaultOpen=true`.
- Always generate `SidebarInset` for `content`. This makes `variant="inset"`
  valid without a second composition rule and remains a plain main region for
  other variants.
- `header` and `footer` are opaque content slots. Their wrapper classes are the
  only Compose styling seams; no `headerProps` / `footerProps`.
- `SidebarTrigger` owns its button element, toggle handler, accessible label,
  icon, slot/state markers, and responsive target. Type and runtime seams must
  reject `children`, raw HTML, role/ARIA replacement, element replacement, and
  `onClick`. `className` and a plain-text `label` remain caller-owned.

### Keyboard

- Preserve the Primitive's fixed Mod+B behavior. Do not add a `hotkey`,
  `shortcut`, or `keyboardShortcut` prop that cannot actually disable or
  reconfigure the provider listener.
- The trigger remains necessary for touch and discoverability. The first demo
  must show it even though the desktop shortcut exists.
- Applications that need editable-target suppression, a different chord, or
  several independent sidebars must use/fork the Primitive. Compose must not
  claim support it cannot enforce.

### Persistence

- Do not add localStorage. It would create a second source of truth beside the
  Primitive's unconditional cookie write.
- Do not add `persist`, `storageKey`, `cookieName`, or an adapter seam. The
  installed Primitive fixes the cookie name and lifetime, so those props would
  be false configurability.
- Document the real contract: desktop changes mirror to the seven-day
  `sidebar_state` cookie; restoration is opt-in by reading that cookie outside
  the client Compose module and passing the result as `defaultOpen` or `open`.
- Alternative persistence belongs behind controlled `open` /
  `onOpenChange`. The Primitive will still mirror the compatibility cookie;
  consumers that must avoid that write need a local Primitive fork.

### Navigation and route ownership

- Use a finite `SidebarItem[]` model with leaves, submenus, groups, and
  separators. Groups and submenus use `items`, matching the repository's list
  vocabulary; no item kind accepts `children`.
- Do not reuse the `Menu` renderer. Its `role="menu"`, roving focus, arrow-key
  dispatcher, popup modes, and `children`-based tree describe an application
  command menu. Sidebar is a navigation landmark containing ordinary anchors
  and buttons, so browser link and tab semantics stay intact.
- Sidebar exposes only single `value` and `openKeys` controlled triplets plus
  `onSelect`; it has no presentation mode or multiple selection.
- `value` is the current navigation key. Sidebar never imports Next.js routing,
  reads `location`, matches pathnames, prefetches routes, or assumes that
  `href` completed navigation. Router state remains caller-owned.
- `header` and `footer` cover workspace switchers, account menus, branding, and
  stable actions without contaminating the navigation item model.
- Non-interactive trailing metadata may use Menu's existing `extra`. Separate
  row actions, custom link elements, arbitrary group collapse composition,
  skeleton recipes, and mixed content blocks remain Primitive cases.

## Explicit exclusions

Do not expose:

- the full upstream Sidebar compound export list;
- `children`, render props, `slots`, or arbitrary insertion points;
- `providerProps`, `sheetProps`, `menuProps`, `triggerProps`, or generic props
  bags;
- independent public mobile controlled state;
- persistence configuration or localStorage;
- shortcut configuration;
- breakpoint configuration;
- automatic route matching or a framework router adapter;
- resizable width/drag state: the current `SidebarRail` toggles rather than
  resizes, despite the high-level docs calling it a resize handle
  ([official rail source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/sidebar.tsx#L270-L289));
- per-row interactive actions, arbitrary badges, or loading skeleton schemas.

These cases use `components/ui/sidebar` composition after the Primitive is
installed with the shadcn CLI. The Compose owner must not re-export those
primitives through a second namespace.

## Why this Interface is deep

Two entries hide provider ordering, two visibility channels, responsive
renderer selection, desktop gap/inset coordination, mobile dismissal,
breakpoint cleanup, a fixed global shortcut, navigation state continuity, and
mobile close-on-selection. Callers learn one data tree, one main-content slot,
and one trigger placement.

The seam also preserves locality:

- navigation behavior stays in Sidebar's bounded navigation projection;
- responsive shell behavior stays in `Sidebar`;
- modal accessibility stays in Sheet/Base UI Dialog;
- route and persistence adapters stay in the application;
- heterogeneous structure stays in the Primitive.

This is materially deeper than a flattened copy of the official 24-part
component, and it keeps the Primitive escape cost explicit rather than hiding
it behind passthrough props.

## Recommendation

Move Sidebar from `Deferred` to a high-value Compose state-machine owner, with
the responsive navigation shell above as the frozen product boundary. Install
the official Sidebar Primitive only through shadcn CLI; keep
`components/ui/**` untouched afterward. Implement and test the two-entry
Interface vertically. Do not broaden it until a concrete caller proves that
the Primitive escape repeats enough behavior to pass the deletion test.
