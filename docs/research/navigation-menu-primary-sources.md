# Navigation Menu primary-source boundary

Snapshot: 2026-09-17. Research only; this note defines no approved component API.

## Source and version boundary

The repository selects `base-nova` in [components.json](../../components.json), declares `@base-ui/react` as `^1.4.0` in [package.json](../../package.json), and resolves version **1.4.0** in [pnpm-lock.yaml](../../pnpm-lock.yaml). The installed package reports the same version. No `components/ui/navigation-menu.tsx` exists in this snapshot.

The [official shadcn Base UI page](https://ui.shadcn.com/docs/components/base/navigation-menu) documents links, dropdown triggers, content, and custom router links through primitive `render` composition. Its [current base template source](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/bases/base/ui/navigation-menu.tsx) automatically adds Portal, Positioner, Popup, and Viewport; callers ordinarily supply List, Item, Trigger, Content, and Link. This template is not an installed `base-nova` artifact; exact generated classes and exports still require inspection after a future CLI installation.

The [current Base UI documentation](https://base-ui.com/react/components/navigation-menu) displays version **1.8.0** and includes richer nested and responsive examples. Those examples do not establish compatibility with this repository's 1.4.0 dependency. Installed type declarations and source below are the compatibility baseline.

## Existing primitive ownership

| Concern | Verified installed 1.4.0 behavior | Compose implication |
| --- | --- | --- |
| Open popup | Root accepts `value`, `defaultValue`, and `onValueChange`; a nullish value closes the popup. It identifies an open item, not the current route. [Root types](../../node_modules/@base-ui/react/navigation-menu/root/NavigationMenuRoot.d.ts) | Preserve primitive naming; do not introduce route selection through Root `value`. |
| Current page | Link accepts `active`; source produces `aria-current="page"` when true. It performs no route matching. [Link types](../../node_modules/@base-ui/react/navigation-menu/link/NavigationMenuLink.d.ts), [Link source](../../node_modules/@base-ui/react/navigation-menu/link/NavigationMenuLink.js) | The caller supplies current-page state. Exact versus prefix matching belongs to the router or consumer. |
| Link activation | `closeOnClick` defaults to `false`. The primitive can clear Root value with reason `link-press` when enabled. [Link source](../../node_modules/@base-ui/react/navigation-menu/link/NavigationMenuLink.js) | Choose an explicit Compose default for client-side and same-page navigation; navigation alone does not guarantee dismissal. |
| Pointer interaction | Trigger combines hover and click; touch-generated hover changes are ignored. Root opening and closing delays default to 50 ms. [Trigger source](../../node_modules/@base-ui/react/navigation-menu/trigger/NavigationMenuTrigger.js), [Root types](../../node_modules/@base-ui/react/navigation-menu/root/NavigationMenuRoot.d.ts) | Reuse primitive input handling. Touch handling does not supply a compact mobile header. |
| Keyboard interaction | Top-level triggers set `tabIndex=0`; links leave their native tab stop intact. List adds directional navigation without looping; a horizontal trigger opens with ArrowDown. Focus guards coordinate portal tab order. [Trigger source](../../node_modules/@base-ui/react/navigation-menu/trigger/NavigationMenuTrigger.js), [List source](../../node_modules/@base-ui/react/navigation-menu/list/NavigationMenuList.js), [Link source](../../node_modules/@base-ui/react/navigation-menu/link/NavigationMenuLink.js) | Preserve native tabbing and primitive focus ownership. Do not reuse the Menubar command model. Exact browser behavior still needs runtime verification. |
| Content and positioning | Content moves into the shared viewport. Positioner owns anchor tracking, side/alignment, and collision options. [Content source](../../node_modules/@base-ui/react/navigation-menu/content/NavigationMenuContent.js), [Positioner source](../../node_modules/@base-ui/react/navigation-menu/positioner/NavigationMenuPositioner.js) | Do not add a second popup or positioning state machine. |

## Accessibility and responsive scope

The [WAI disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) uses navigation and list semantics rather than `menu`/`menubar` roles. Arrow keys are optional additions to ordinary Tab navigation. Escape closes the disclosure and returns focus to its button; moving focus outside closes it. WAI also calls out mobile and assistive-technology support gaps in illustrative examples, so source review is not accessibility certification.

The [Base UI large-menu guidance](https://base-ui.com/react/components/navigation-menu#large-menus) asks applications to choose compact layout or scrolling when content exceeds available height. The same page's nested inline example makes its own media-query choice. Neither the inspected Root interface nor shadcn template supplies a logo, hamburger button, breakpoint, drawer, or mobile navigation replacement. A responsive site header is therefore a separate composition decision, not a capability implied by the Navigation Menu name.

## Smallest candidate and remaining decisions

A plausible thin Compose wrapper maps one top-level `items` array to ordinary links or disclosure groups, with one homogeneous link list per group. Required content is link text and destination, or a trigger and its links. Optional descriptions and classes can remain presentation details. This saves repeated assembly; it does not establish a new state-machine capability or prove consumer demand.

Before an implementation contract is approved, resolve:

1. Which actual navigation structure needs dropdowns, and whether repeated assembly is substantial enough to justify the wrapper.
2. Whether a top-level item is exclusively a link or a disclosure. A section that both navigates and expands needs two distinct interactions and should not be silently squeezed into one button.
3. Whether mobile means a bounded row with usable dropdowns or an alternate hamburger/disclosure layout. Choose overflow and breakpoint behavior against actual labels and content.
4. Whether first-class router-link composition is required and what ownership-safe interface exposes it. Native `href` alone does not provide client-side routing.
5. Whether link clicks close by default, including same-page links and router transitions; keep route-active state separate from open-popup state.

Nested mega-menus, arbitrary panels, and a complete responsive header should remain consumer or primitive compositions unless a real use case changes that boundary. These are design inferences, not limitations imposed by Base UI.

## Evidence limits

Official documentation, upstream shadcn template, and installed package types/source were inspected. No dependency was installed or updated. No component, browser interaction, screen-reader behavior, responsive layout, or independent registry installation was tested. Local `node_modules` source links require dependencies installed from the recorded lockfile.
