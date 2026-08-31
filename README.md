<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/logo-dark.svg">
    <img alt="easy/shadcn" src="./.github/logo-light.svg" width="96">
  </picture>
</p>

<h1 align="center">easy/shadcn</h1>

<p align="center"><em>the easy way to shadcn.</em></p>

<p align="center">
  Flat-prop wrappers over <a href="https://ui.shadcn.com">shadcn/ui</a>: nested children collapse into one tag, and the data-driven components — Table, Select, Combobox, Date Picker, Menu, Choice Group — ship <strong>antd-grade DX</strong> on the shadcn base.
  <br/>
  Installed through the shadcn CLI, so the code lands in your repo and the primitive is always one import away.
</p>

<p align="center">
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="https://easy-shadcn.vercel.app">Website</a> ·
  <a href="https://easy-shadcn.vercel.app/docs">Docs</a> ·
  <a href="https://easy-shadcn.vercel.app/preview">Preview</a>
</p>

---

## Quickstart

```sh
# 1. configure the registry once
pnpm dlx shadcn@latest init

# 2. install any component
pnpm dlx shadcn@latest add @easy-shadcn/card
```

See the [installation guide](https://easy-shadcn.vercel.app/docs/installation) for the full setup, including the namespace alias and the alternative URL form.

Every wrapper trades a nested ladder for flat props. Card, before and after:

```tsx
// shadcn primitive — nested children
<Card>
  <CardHeader>
    <CardTitle>Team plan</CardTitle>
    <CardDescription>Billed monthly</CardDescription>
    <CardAction><Button size="sm">Upgrade</Button></CardAction>
  </CardHeader>
  <CardContent>Everything in Pro, plus SSO.</CardContent>
  <CardFooter>$30 / user / month</CardFooter>
</Card>

// easy-shadcn — one tag, flat props
<Card
  title="Team plan"
  description="Billed monthly"
  action={<Button size="sm">Upgrade</Button>}
  footer="$30 / user / month"
>
  Everything in Pro, plus SSO.
</Card>
```

## Components

The six data-driven components lead the list: **Table**, **Select**, **Combobox**, **Date Picker**, **Menu**, and **Choice Group** own real state — selection tallies, async races, nested navigation, and single / multiple / range logic — and aim for the capability surface of their antd equivalent, still shipped as copy-in registry source.

| Component | What it collapses | Install |
|-----------|-------------------|---------|
| **Table** | `columns` + `dataSource` + `rowKey` replace hand-built `<thead>` / `<tbody>` markup, with built-in loading / empty / caption states and row selection (controlled or uncontrolled, indeterminate select-all, per-row gating) | `@easy-shadcn/table` |
| **Select** | Dropdown, searchable, multi-select chips and async / server-side-filtered loading in one `items` / `loadItems`-driven component | `@easy-shadcn/select` |
| **Combobox** | An always-searchable, single-select autocomplete preset over Select | `@easy-shadcn/combobox` |
| **Date Picker** | Single / multiple / range under one `mode` prop, with an optional typed-input trigger and min / max / disabled-date bounds | `@easy-shadcn/date-picker` |
| **Menu** | Persistent navigation from one recursive item tree, including links, actions, submenus, groups, selection, open state, and three layout modes | `@easy-shadcn/menu` |
| **Choice Group** | One items/value API for single or multiple selection rendered as radio, checkbox, or toggle controls | `@easy-shadcn/choice-group` |
| **Card** | `<CardHeader><CardTitle>…` ladders into flat `title` / `description` / `action` / `footer` props | `@easy-shadcn/card` |
| **Empty** | Empty root / header / media / title / description / content nesting into flat optional slots with fixed primitive order | `@easy-shadcn/empty` |
| **Tabs** | A whole `<TabsList>` + repeated triggers into an `items={…}` array of `{ value, trigger, content }` | `@easy-shadcn/tabs` |
| **Accordion** | The repeated `<AccordionItem><AccordionTrigger>…<AccordionContent>…` triple into an `items={…}` array of `{ value, trigger, content }`, single or multiple open | `@easy-shadcn/accordion` |
| **Breadcrumb** | Hand-nested `<BreadcrumbList>` / `<BreadcrumbItem>` / `<BreadcrumbLink>` / `<BreadcrumbSeparator>` markup into an `items={…}` array, with auto current-page and `maxItems` ellipsis | `@easy-shadcn/breadcrumb` |
| **Tooltip** | The `<TooltipProvider>` / `<Tooltip>` / `<TooltipTrigger>` / `<TooltipContent>` nest into one `children` trigger plus a `content` prop | `@easy-shadcn/tooltip` |
| **Popover** | The base-ui Popover parts into one `children` trigger plus `title` / `description` / `content` / `footer` slots | `@easy-shadcn/popover` |
| **Context Menu** | Right-click / long-press trigger plus flat actions, with primitive-owned coordinates, focus, keyboard behavior and dismissal | `@easy-shadcn/context-menu` |
| **Radio Group** *(legacy)* | Soft-deprecated compatibility wrapper; use Choice Group for new work | `@easy-shadcn/radio-group` |
| **Checkbox Group** *(legacy)* | Soft-deprecated compatibility wrapper; use Choice Group for new work | `@easy-shadcn/checkbox-group` |
| **Field** | Label, control, description, a required marker and validation messages into one form-field wrapper (accepts React Hook Form / Zod error arrays) | `@easy-shadcn/field` |
| **Input Group** | InputGroup root / addon / input nesting into one native input contract with flat logical start and end addon slots | `@easy-shadcn/input-group` |
| **Input OTP** | One real OTP input into generated indexed slots with optional uniform groups and separators | `@easy-shadcn/input-otp` |
| **Avatar** | Avatar root / image / fallback / badge nesting into one component with a required fallback and optional image or badge | `@easy-shadcn/avatar` |
| **Switch** | Switch control plus explicit label and description wiring into one component while preserving primitive state, events, and native form behavior | `@easy-shadcn/switch` |
| **Pagination** | Item totals, client-controlled / uncontrolled changes, genuine route links, and compact boundary / sibling windows over shadcn Pagination primitives | `@easy-shadcn/pagination` |
| **Carousel** | Ordered slide data into a named shadcn / Embla carousel with primitive-owned scrolling, controls, plugins, and API | `@easy-shadcn/carousel` |
| **Progress** | Progress label / value / track / indicator composition into a labeled fixed 0–100 percentage bar with determinate and indeterminate states | `@easy-shadcn/progress` |
| **Toast** | One global notification queue with callable status, id upsert, update, close, action, and Promise lifecycle helpers | `@easy-shadcn/toast` |
| **Slider** | A visible accessible label, live scalar value and form-ready single thumb over the shadcn Slider primitive | `@easy-shadcn/slider` |
| **Sheet** | A conventional side panel with flat trigger / title / description / content / footer slots, native dialog lifecycle, and a scroll-safe body | `@easy-shadcn/sheet` |
| **Async Button** | The manual `useState` loading dance for any `onClick` returning a Promise | `@easy-shadcn/async-button` |
| **Alert** | `<AlertTitle>` / `<AlertDescription>` / `<AlertAction>` nesting into flat `icon` / `title` / `description` / `action` props | `@easy-shadcn/alert` |
| **Alert Dialog** | A confirm / cancel dialog with `title` / `description` slots, async handlers, a destructive variant and controlled or uncontrolled open state | `@easy-shadcn/alert-dialog` |
| **Modal** | Imperative `alert` / `confirm` helpers plus a composable Modal on top of shadcn Dialog | `@easy-shadcn/modal` |
| **Calendar** | Native month / year dropdowns into a three-view (days / months / years) button-grid navigation | `@easy-shadcn/calendar` |

### Hooks

| Hook | What it does | Install |
|------|--------------|---------|
| **useDelayLoading** | Adds a minimum visible duration to a loading state, so spinners don't flash on fast operations | `@easy-shadcn/use-delay-loading` |
| **useSelectItems** | Turns a flat `SelectItem[]` into the lookups and default `contains` filter a Select-like UI needs | `@easy-shadcn/use-select-items` |
| **useSelectLoader** | Async options loader with eager or server-side-filter modes, `AbortController`, debounce and a selected-item cache | `@easy-shadcn/use-select-loader` |

## Design Philosophy

easy-shadcn is a **compose layer** over shadcn/ui — installed through the CLI, so every component lands in your repo as ordinary source you own and can patch. Three rules keep it honest:

- **Thin wrappers stay thin; state-machine components go deep.** A wrapper like Card or Tabs exists only to fold a recurring nested pattern into flat props — rebuilding the missing case on the primitive costs a dozen lines, so the API stays minimal. Table, Select, Combobox, Date Picker, Menu, and Choice Group own real state or cross-presentation adapters; rewriting that by hand is costly, so they carry an obligation to approach the capability surface of their antd equivalent.
- **The onboarding slope is frozen.** Total prop counts may grow without limit, but the number of props you must understand to run the *first* use case never moves. Table is always `columns` + `dataSource` + `rowKey`; Select is always `items` + `value` / `onValueChange`. A new prop is admissible only if someone who never uses it stays unaware it exists.
- **The primitive door is unlocked.** No render props, no slot objects, no "insert a node between A and B" escape hatches. Need the last stretch of flexibility? Drop down to `components/ui/*` — the compose layer never grows a second API door to get you there.

Read the [full design notes](./AGENTS.md#component-design-philosophy) and [ADR-0004](./docs/adr/0004-props-vocabulary.md) for the reasoning behind each rule.

## Status

🚧 easy-shadcn is in active early development. The compose-layer rules above are stable; the component catalogue grows deliberately.

## License

MIT © Simon
