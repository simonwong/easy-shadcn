# Next component candidates

Snapshot: 2026-09-16. Table filtering is paused. This note evaluates alternatives; it does not approve a new Compose API or change the coverage ledger.

## Recommendation

Menubar's implementation decision is recorded in [ADR-0020](../adr/0020-menubar-command-settings.md). The comparison below records the original candidate assessment. Navigation Menu now has a [thin-wrapper boundary](navigation-menu-boundary.md) and an [implementation contract](../../content/docs/components/navigation-menu.mdx).

There is no compelling small new Compose wrapper in the reviewed candidates. Keep quality automation as the immediate delivery. If another component is wanted, investigate **Menubar** first against a concrete editor-style command bar. Keep **Navigation Menu** deferred until a real site header establishes its layout and mobile requirements.

This recommendation follows the existing [coverage ledger](../compose-roadmap.md): Menubar and Navigation Menu are deferred research candidates, while base controls and layout primitives are deliberately not missing Compose work. The [API rules](../adr/0004-props-vocabulary.md) favor small interfaces for cheap-to-compose structures and require a meaningful behavior owner before expanding them.

## Candidate comparison

Effort and risk below are relative engineering judgments, not measured delivery estimates or evidence of consumer demand. Examples are illustrative.

| Candidate | Concrete use | Value of a Compose layer | Effort and risk | Disposition |
| --- | --- | --- | --- | --- |
| Menubar | A document editor's File / Edit / View menus, with Export actions and view settings. | Flatten repeated command-menu assembly while delegating popup and focus behavior to primitives. | Medium. Top-level menu switching, dismissal, disabled items, nested menus, and checkbox/radio state need an explicit boundary. | Best next research candidate if an editor consumer exists; no implementation commitment. |
| Navigation Menu | A public website's Products / Resources links and dropdown panels. | Flatten homogeneous links; less clear benefit for custom promotional panels. | Medium to high. Link composition, panel layout, responsive projection, and active-route ownership must remain understandable. | Continue to defer. A desktop link list alone does not establish a responsive header contract. |

### Menubar evidence and boundary

The official [shadcn Menubar](https://ui.shadcn.com/docs/components/base/menubar) exposes action menus, submenus, checkbox items, and radio groups. [Base UI's anatomy](https://base-ui.com/react/components/menubar) composes a Menubar around separate Menu roots. The [WAI-ARIA menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) specifies coordinated arrow-key movement, submenu entry, activation, and focus return. Consequently, a horizontal row of independent dropdowns is not sufficient evidence of correct Menubar behavior.

The existing [`Menu`](../../registry/ui/menu.tsx) owns persistent selected and expanded navigation state. [ADR-0011](../adr/0011-menu-navigation-state-model.md) expressly separates popup action behavior and allows a later shell to reuse vocabulary without reusing that behavior. A Menubar study should evaluate that vocabulary first, while keeping checkbox/radio command settings distinct from navigation selection. It should not copy Menu's renderer or add a second handwritten focus state machine merely to share an `items` prop.

### Navigation Menu evidence and boundary

The official [shadcn Navigation Menu](https://ui.shadcn.com/docs/components/base/navigation-menu) composes links, triggers, content panels, and an indicator; custom link components use primitive composition. That is a different contract from an application command bar. [WAI's disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) also distinguishes ordinary site navigation from the more demanding menu widget pattern.

The existing [Sidebar contract](../adr/0017-sidebar-responsive-navigation-shell.md) already covers one responsive application-navigation shell. A new Navigation Menu should prove a separate public-site task rather than duplicate that owner or claim arbitrary mega-menu and mobile-header coverage through a flat tree.

## Small enhancements checked

- **Select:** Search, multiple selection, clearing, remote loading, and retry already exist in the [public interface](../../content/docs/components/select.mdx). None is an unimplemented quick win. No additional API is proposed without a concrete unmet selection task.
- **Carousel:** Dots, thumbnails, custom controls, and alternate layouts are explicitly assigned to primitive composition in the [current documentation](../../content/docs/components/carousel.mdx). Embla remains the selection authority in the [implementation](../../registry/ui/carousel.tsx). Adding those features to Compose would reopen an intentional boundary rather than fill an accidental omission.

The same constraint applies to DropdownMenu groups, separators, and nested choices: its [documented primitive escape](../../content/docs/components/dropdown-menu.mdx) is intentional. This review does not promote them into a feature backlog.

## Evidence limits

This is a source and documentation review against the configured [Base UI shadcn style](../../components.json) and current official documentation. No candidate was implemented, installed, browser-tested, or validated with a consumer. Any selected candidate still needs a focused specification and the repository's component delivery workflow.
