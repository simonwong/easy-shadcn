# Sidebar owns one responsive navigation shell

The shadcn Sidebar Primitive is deliberately compound. A working application shell still repeats provider placement, desktop panel and main-inset coordination, mobile Sheet behavior, navigation projection, selection state, submenu state, and mobile close-on-navigation.

## Decision

`Sidebar` is the Compose owner of one responsive application navigation shell. Its frozen base case has three concepts: `items`, `content`, and a placed `SidebarTrigger`. It hides the provider and exports no context hook.

The owner fixes `collapsible="offcanvas"`, preserves the Primitive's `left | right` sides and `sidebar | floating | inset` variants, and always generates `SidebarInset` as the main region. The official 768 px breakpoint, Mod+B shortcut, seven-day `sidebar_state` cookie write, and Base UI Dialog-backed mobile Sheet remain Primitive behavior. Compose clears stale mobile-open state after entering desktop and closes the mobile Sheet before selection callbacks run.

Navigation uses a finite `SidebarItem[]` model: leaves, submenus, groups, and separators. Groups and submenus use `items`; no item accepts `children`. Leaves remain ordinary anchors or buttons inside a named `nav`. `value` and `openKeys` each use the standard controlled triplet. Keys are non-empty and unique across the whole tree.

`SidebarTrigger` owns its button, icon, toggle handler, accessible-label adapter, and structural attributes. `Sidebar` owns the provider, responsive renderer, navigation structure, mobile state, and collapse mode. Both type and runtime seams reject conflicting children, raw HTML, roles, handlers, slot markers, element replacement, and public mobile state.

## Alternatives rejected

- Re-exporting the upstream compound parts fails the deletion test; it changes import paths without removing repeated assembly.
- Reusing Compose `Menu` gives navigation links application-menu semantics: `role="menu"`, roving focus, arrow-key dispatch, popup modes, and a `children` tree. Sidebar keeps normal landmark, link, and tab behavior.
- Exposing `collapsible="icon"` needs a complete icon-only row and tooltip contract. Exposing `collapsible="none"` would silently bypass the mobile Sheet. Both use the Primitive.
- Configurable breakpoints, shortcuts, cookie keys, restoration, route matching, mobile control, row actions, and arbitrary insertion points would promise authority the installed Primitive does not provide.

## Consequences

The common responsive shell is short to consume but deep to delete. Header and footer stay opaque content slots with class seams only. Route derivation and cookie restoration stay application-owned. Composition-heavy layouts, several independent sidebars, custom mobile behavior, icon collapse, non-collapsible panels, and custom keyboard or persistence policy use `components/ui/sidebar` directly.
