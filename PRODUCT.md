# Product

<!-- impeccable:product-schema 1 -->

> Captured from repository evidence (CONTEXT.md, ADRs, docs site content, package manifests) without a user interview — the session ran in auto mode where structured questions were unavailable. Treat every line as well-evidenced but unconfirmed; correct any line and it becomes confirmed.

## Platform

web

## Users

- React developers already using shadcn/ui who want traditional component-library ergonomics (flat props, antd-like) instead of compound-component boilerplate.
- Developers who fork this repository to bootstrap their own shadcn-based component library, or copy individual components into their project.
- Teams building data-dense app/admin UI (Table, Select, Combobox, DatePicker, Modal are the flagship surfaces).
- AI coding agents are first-class consumers: shadcn MCP server integration, `/llms.txt`, `/llms-full.txt`, and `.md` endpoints exist specifically for them.

## Product Purpose

easy-shadcn makes shadcn/ui as simple and convenient to use as a classic component library, without giving up shadcn's copy-in ownership model. It has two deliverables:

1. **Compose component library** (`registry/ui/*`): flat-props wrappers over shadcn/ui primitives, distributed through the shadcn registry (copy-in, not npm) and documented on a Fumadocs site.
2. **`@easy-shadcn/command-modal`** (`packages/command-modal/`): an imperative, promise-based modal state-management library for React, published to npm.

Success means: a user installs one component with a single `shadcn add @easy-shadcn/<name>` command and is productive with 2–3 props, while advanced scenarios remain reachable without leaving the component.

## Positioning

- The Compose layer is the differentiator: flat props (`columns` + `dataSource` + `rowKey`) replace nested JSX, with a frozen base-case concept count — new capability may grow the API surface but never the cost of the first working example. Coverage targets float with escape cost: thin wrappers stay minimal (escape is ~a dozen lines), state-machine components (Table, Select, Combobox, DatePicker) are obligated to approach antd-level coverage because escape means rewriting hundreds of lines.
- Unlike antd/MUI, the components are copied into the user's repo — the user owns and can edit the code; primitives underneath stay pristine shadcn/ui as a permanent escape hatch.
- command-modal's only UI-library coupling is the typed **Adapter** seam (`ModalPropsAdapter`); the core stays UI-agnostic. First-class adapters: shadcn (default) and antd v6; everything else is typed-but-BYO. Modals return resolution values: `await show(Modal)` settles with what `modal.resolve(value)` was given. Inspired by @ebay/nice-modal-react, differentiated on full type safety and the adapter mechanism.

## Operating Context

- pnpm monorepo; docs site is Next.js 16 + Fumadocs + Tailwind v4, deployed at `https://easy-shadcn.vercel.app` (registry JSON served from `/r/{name}.json`).
- Install flow: user adds `"@easy-shadcn": "https://easy-shadcn.vercel.app/r/{name}.json"` to `components.json` registries once, then `pnpm dlx shadcn@latest add @easy-shadcn/<name>`; cross-component dependencies resolve through the same namespace. Updating means re-running `add --overwrite`.
- command-modal is built with tsdown (dual CJS+ESM), released via Changesets (`main`/`next` branches trigger CI publish).
- Repo language is mixed: user-facing docs are English; internal governance (AGENTS.md) is Chinese.

## Capabilities and Constraints

- ~26 Compose components (Accordion … Tooltip) plus hooks in `registry/hooks/`, each with docs and tests (Vitest; coverage thresholds lines/functions/statements 90%, branches 85%).
- Hard constraint: `components/ui/**` is read-only — only modified via `shadcn add` / `--overwrite`; all original work lives in `registry/`, `components/examples/`, `content/docs/`.
- No locale/i18n mechanism: built-in copy is English-only by design; localization is a consumer-side concern (props, edit-the-copy, or wrap-and-re-export).
- command-modal requires React >= 18 (uses `React.useId()`); core has zero runtime dependencies.
- Modal resolve (result) type is carried on `create<Props, Result>`, not at the `show()` call site (ADR-0002).

## Brand Commitments

- Name: **easy-shadcn**; npm scope / registry namespace: **@easy-shadcn** (a local `components.json` alias, not a globally registered namespace — renaming it breaks `registryDependencies`).
- Repository: `github.com/simonwong/easy-shadcn`; author Simon. command-modal license: MIT.
- Existing assets: `public/banner.png`, `app/icon.svg`.
- Voice: docs are plain, direct, English; honest about trade-offs ("Although this is not the best practice, it is simple").

## Evidence on Hand

- Live docs site with per-component pages and interactive examples (`components/examples/`, auto-indexed by `scripts/genarate-example-entry.mjs`).
- Registry output in `public/r/`; LLM-consumable docs at `/llms.txt`, `/llms-full.txt`, and per-page `.md`.
- No testimonials, customer logos, benchmarks, or usage metrics exist — future surfaces must not fabricate them.

## Product Principles

1. **Frozen entry slope, floating coverage**: the first-use concept count never grows; total capability may approach 100% where escape is expensive.
2. **The primitive is the escape hatch**: never trap the user — anything the Compose layer declines to cover is answered by "use the `components/ui/*` primitive", which stays pristine and resettable.
3. **Ownership is closed at the type level**: passthrough props (`xxxProps`, `getCheckboxProps`) `Omit` the keys the Compose layer owns; no `Record<string, unknown>` fallbacks, no runtime-only conventions.
4. **Copy-in means the consumer owns the code**: defaults and built-in text are part of the API; users edit their copy or wrap-and-re-export rather than waiting for upstream configuration features.
5. **One seam per integration**: external coupling is concentrated in typed seams (the modal Adapter; base-ui group-root delegation) so cores stay agnostic and swappable.
