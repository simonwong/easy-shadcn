<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./.github/logo-dark.svg">
    <img alt="easy/shadcn" src="./.github/logo-light.svg" width="96">
  </picture>
</p>

<h1 align="center">easy/shadcn</h1>

<p align="center"><em>the easy way to shadcn.</em></p>

<p align="center">
  Hand-stitched wrappers over <a href="https://ui.shadcn.com">shadcn/ui</a> that swap nested children for <strong>flat props</strong>.
  <br/>
  Eighty percent of your UI ships with one tag. The other twenty — drop down to the primitive.
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

## Components

| Component | What it collapses | Install |
|-----------|-------------------|---------|
| **Card** | `<CardHeader><CardTitle>…` ladders into flat `title` / `description` / `action` / `footer` props | `@easy-shadcn/card` |
| **Tabs** | A whole `<TabsList>` + repeated triggers into an `items={…}` array | `@easy-shadcn/tabs` |
| **Async Button** | Manual `useState` loading dance for any `onClick` returning a Promise | `@easy-shadcn/async-button` |
| **Modal** | Imperative `alert` / `confirm` helpers + a composable Modal on top of shadcn Dialog | `@easy-shadcn/modal` |
| **Calendar** | Native month/year dropdowns into a three-view button-grid navigation | `@easy-shadcn/calendar` |
| **Date Picker** | Single / multiple / range / inline-input variants under one component | `@easy-shadcn/date-picker` |

## Design Philosophy

easy-shadcn is a **compose layer** for shadcn/ui — never a replacement. The 80/20 rule is the only rule:

- **Flat props, not nested children.** One prop per slot. `<Card title="…" footer={…}>body</Card>` instead of a four-deep `<CardHeader><CardTitle>…` ladder.
- **Compose layer earns its way in.** A component only joins when it collapses a recurring shadcn pattern into something you'd type without thinking. Three copy-pastes is the threshold.
- **No render props. No slot objects.** Need the other 20%? Drop down to `components/ui/*` — the primitive door is unlocked. The compose layer never grows another API door.
- **Names align with primitives.** If shadcn calls it `TabsList`, the prop is `listClassName` — not a new vocabulary to learn.
- **Your code, your repo.** Installed through the shadcn CLI. Every component lives inside your project, fully owned and trivially patched. No black box.

Read the [full design notes](./AGENTS.md#component-design-philosophy) for the reasoning behind each rule.

## Status

🚧 easy-shadcn is in active early development. The compose-layer rules above are stable; the component catalogue is growing slowly on purpose.

## License

MIT © Simon
