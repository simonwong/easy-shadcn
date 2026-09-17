# Navigation Menu: a finite website navigation list

Research date: 2026-09-17. The implemented thin-wrapper contract is documented in [Navigation Menu](../../content/docs/components/navigation-menu.mdx). This note records its scope rationale; it does not specify a collapsed responsive header.

## Recommendation

Use a small `NavigationMenu` that flattens ordinary links and one level of dropdown links. Its first use case requires only `items`. Keep route matching in the application and popup interaction in Base UI. A complete responsive site header requires a separate decision about the logo, mobile disclosure, actions, breakpoint, and focus behavior.

The benefit is repeated navigation assembly: one named navigation landmark, a list of direct links or triggers, one consistent dropdown link layout, and primitive-owned popup/focus behavior. It is not a new route store. This is a thin wrapper under [ADR-0004](../adr/0004-props-vocabulary.md), so custom layouts must remain easy to compose from the primitive.

## Verified local consumer

- The [homepage masthead](../../app/page.tsx) contains Docs, Preview, and GitHub links. It has no dropdown panels to simplify.
- The [documentation layout](../../app/docs/layout.tsx) and [preview layout](../../app/preview/layout.tsx) already use Fumadocs navigation through [shared layout configuration](../../app/layout.config.tsx).
- [Sidebar](../adr/0017-sidebar-responsive-navigation-shell.md) owns application navigation and a mobile Sheet. [Menubar](../adr/0020-menubar-command-settings.md) owns application commands. Neither is the owner of public-site dropdown links.

Consequently, replacing this site's existing navigation is not justified by the code examined. Products / Solutions / Resources is an illustrative evaluation scenario, not evidence of an existing consumer requirement.

## Illustrative first use case

```tsx
<NavigationMenu
  items={[
    {
      value: "products",
      trigger: "Products",
      items: [
        { value: "overview", content: "Overview", href: "/products" },
        { value: "automation", content: "Automation", href: "/products/automation" },
      ],
    },
    {
      value: "resources",
      trigger: "Resources",
      items: [
        { value: "docs", content: "Documentation", href: "/docs" },
        { value: "guides", content: "Guides", href: "/guides" },
      ],
    },
    { value: "pricing", content: "Pricing", href: "/pricing" },
  ]}
/>
```

The proposed top-level union has two shapes: a direct link (`value`, `content`, `href`) or a dropdown (`value`, `trigger`, `items`). Dropdown children are homogeneous links, never another dropdown. Type declarations must reject combining a navigable `href` with a dropdown trigger. Users needing a category overview place an explicit Overview link inside its panel.

## State and ownership

| Concept | Proposed owner and contract |
| --- | --- |
| Entry identity | Stable string `value`, aligned with NavigationMenu.Item. Top-level values are unique; child values are unique within their list. |
| Expanded panel | Primitive `value` / `defaultValue` / `onValueChange`, narrowed to `string \| null` if exposed. This value identifies a dropdown, not the current page. Preserve native event details and cancellation. |
| Current page | Optional link `active`, set by the application. The primitive derives `aria-current="page"`. No pathname parsing, prefix matching, or selected-value callback. |
| Navigation | Ordinary anchors with `href`, optional `target` / `rel`. Preserve modifier-click and native link behavior. Set primitive `closeOnClick` to `true` so same-page navigation also dismisses the panel, subject to controlled state and native change cancellation. Do not invent a fetch/router layer. |
| Text | Non-interactive `content` / `trigger`; an optional child-link `description` can cover a repeated two-line layout. No interactive descendants or arbitrary panel content. |
| Styling | `className`, `listClassName`, `triggerClassName`, `contentClassName`, and `linkClassName` only where a real generated element exists. Content slots do not gain prop bags. |
| Generated structure | Compose fixes descendants, root semantics, popup wiring, and state markers. Protect them through types and runtime allowlists. |

The installed Base UI version is 1.4.0. Its root `value` controls the expanded item, while Link `active` controls current-page semantics. The supporting official-source and version analysis is recorded separately in [primary-source findings](navigation-menu-primary-sources.md).

Closing after link activation is a Compose recommendation, overriding the primitive's `false` default. It does not prevent the anchor's default navigation or install a custom navigation handler; controlled applications can still refuse the popup-state change.

## Mobile decision

Two different scopes must not be conflated:

1. **The same navigation on a narrow screen.** Short top-level labels remain visible and open dropdown links by touch. Popup width, collision handling, zoom, long labels, focus visibility, and edge-of-screen triggers require browser checks. No hamburger menu is implied.
2. **A collapsed site header.** A menu trigger opens a mobile panel containing the navigation. This adds disclosure state, desktop/mobile transitions, focus return, scroll/dismissal policy, and header layout ownership. It is not supplied merely by flattening NavigationMenu's compound markup.

The recommended initial technical scope is the first. If the intended consumer requires the second, revise the specification around that concrete header before implementation. Do not advertise general responsive-header coverage from a narrow-screen dropdown test.

## Deliberate exclusions

Mega-menu promotional cards, arbitrary columns, recursive submenus, action items, disabled anchors, logos, account controls, search, sticky behavior, hamburger/Sheet state, configurable breakpoints, automatic route matching, and framework-specific link adapters are outside this initial recommendation. Native links are an explicit trade-off: consumers needing Next.js Link or another router's link composition use the primitive until a repeated integration requirement justifies a typed seam.

## Acceptance surface for implementation

- Prove actual reduction in caller markup with direct links and two dropdowns, without hiding a second state machine in the application.
- Install shadcn's Navigation Menu only through the CLI; implement the wrapper under `registry/ui` and keep the basic demo limited to `items`.
- Test native link behavior, current-page marking, dropdown switching/closing, focus return, keyboard traversal, and controlled popup refusal/cancellation if that optional interface ships.
- Reject root/child replacement, raw HTML, forged state markers, invalid link/dropdown combinations, and nested dropdown input at the type and relevant runtime seams.
- Check pointer and touch input, keyboard-only use, a narrow viewport, long labels, and zoom in a real browser. Validate popup containment and absence of hidden-but-focusable navigation.
- Regenerate registry output, install into a freshly initialized consumer, and run its typecheck/build alongside repository tests and production build.

The research itself included no primitive installation or runtime validation. The implementation uses the narrow-screen dropdown scope described above; a collapsed header requires a separate consumer specification.

## Implementation verification

Verification snapshot: 2026-09-17.

- Repository: nine focused Navigation Menu tests and all 823 root tests passed. TypeScript, targeted lint, package builds, and the documentation production build passed.
- Distribution: a separately initialized Vite/base-nova project installed the generated registry item through the shadcn CLI. Its TypeScript and production build passed with Base UI 1.8.0; the repository remains on 1.4.0.
- Browser: keyboard entry, Tab traversal through popup links, Escape focus return, real CDP touch activation, same-page link dismissal, 320px and 393px viewports, long labels, a scrollable 30-link panel, and 200% root text sizing were checked. At 320px, the popup occupied x=16 through x=304 with no document overflow. At 393px with doubled text size, collision handling kept the long popup within the viewport. Text sizing is not a claim of native browser zoom or screen-reader coverage.
- Accessibility limit: axe-core 4.12.1 reports `aria-hidden-focus` on two Base UI-generated focus guards while a popup is open, on both tested dependency versions. Keyboard traversal reached the next real control correctly. Automated contrast checks also reported incomplete results requiring manual assessment. This is not a clean accessibility certification; no primitive files were hand-edited to suppress the findings.
