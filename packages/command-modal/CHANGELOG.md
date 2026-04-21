# @easy-shadcn/command-modal

## 0.1.0

### Minor Changes

- [#55](https://github.com/simonwong/easy-shadcn/pull/55) [`df456cb`](https://github.com/simonwong/easy-shadcn/commit/df456cbc70a405eb429503416747cbef38688222) Thanks [@simonwong](https://github.com/simonwong)! - Scoped dispatch, SSR-safe ids, and safer teardown semantics.

  **New**

  - `useCommandModalDispatch()` hook and `CommandModalDispatchContext` for
    scoped, deterministic dispatch from inside a `Provider` subtree. Prefer
    these over the module-level `show` / `hide` / `remove` helpers when
    multiple Providers may be mounted.
  - Dev-only warning when `show` / `hide` / `remove` is called while more
    than one `Provider` is mounted (routing target is unspecified in that
    case). Use `useModal()` or `useCommandModalDispatch()` in multi-Provider
    setups for deterministic routing.

  **Fixes**

  - `useModal().show()` / `.hide()` / `.remove()` now dispatch to the closest
    enclosing `Provider` via context, instead of a module-level singleton
    dispatch. Nested Providers, SSR, and concurrent rendering behave
    predictably.
  - `ModalHolder` auto-generated modal ids now use `React.useId()` (was a
    module-level monotonic counter) — SSR-safe and hydration-stable.
  - `getModalId(Component)` no longer mutates the component function to
    stash its id. The id is stored in an external `WeakMap`, so frozen
    component functions are supported and the function is safe to share
    across concurrent SSR requests.
  - `ModalHolder` installs `handler.show` / `handler.hide` in a layout
    effect instead of during render. Render-phase mutation violated React
    purity and was fragile under StrictMode / concurrent rendering.
  - `hide(modal)` settles any outstanding `show()` promise with `undefined`,
    and `remove(modal)` settles any outstanding `hide()` promise, so
    `await modal.show()` / `await modal.hide()` no longer hang when a modal
    is dismissed without an explicit `resolve()` / `reject()`.
  - `ModalHolder` now cleans up reducer state, promise callbacks, and the
    `ALREADY_MOUNTED` flag when it unmounts, fixing a leak in list layouts
    that repeatedly mount/unmount holders.
  - `Provider` memoizes its config context value so that an inline
    `config={{ ... }}` prop on a re-rendering parent no longer invalidates
    downstream `useModal` consumers.
  - `create()` HOC consolidates its `ALREADY_MOUNTED` effects, stops
    redispatching on every `args` change via the delayVisible effect, and
    re-runs `defaultVisible` when a long-lived HOC instance receives a new
    `id`.
  - `create()` HOC and the placeholder filter the reserved keys `id` /
    `defaultVisible` / `keepMounted` out of both show args and registered
    props before spreading into the inner component, so neither
    `show("x", { id: "hijack" })` nor `useModal(Component, { id: "hijack" })`
    can clobber the HOC's own id / lifecycle props.
  - `useModal(Component, args)` reads the latest `args` via ref, so the
    register-once effect is no longer re-scheduled on every render caused
    by a fresh inline `args` object.

  **Breaking**

  - Peer dependency bumped: `react: ">=18"` (was `">=17"`). The library now
    uses `React.useId()` to generate SSR-stable modal ids.
  - `src/symbol.ts` and the `symModalId` symbol are removed. They were not
    part of the public API (never re-exported from `index.ts`); this note is
    for users who imported from deep paths.

## 0.0.2

### Patch Changes

- [#48](https://github.com/simonwong/easy-shadcn/pull/48) [`d38e5cf`](https://github.com/simonwong/easy-shadcn/commit/d38e5cfd9b76e91e399bc33701969bac143f5761) Thanks [@simonwong](https://github.com/simonwong)! - migrate to tsdown, better output structure

- [#48](https://github.com/simonwong/easy-shadcn/pull/48) [`4781515`](https://github.com/simonwong/easy-shadcn/commit/4781515f3ce5760c09f4951098bcc63092b1beef) Thanks [@simonwong](https://github.com/simonwong)! - Integrated unit test

- [#50](https://github.com/simonwong/easy-shadcn/pull/50) [`884af57`](https://github.com/simonwong/easy-shadcn/commit/884af57534adb88f21ae192c68e699c8fc35ee84) Thanks [@simonwong](https://github.com/simonwong)! - add use client

- [#48](https://github.com/simonwong/easy-shadcn/pull/48) [`12e31b4`](https://github.com/simonwong/easy-shadcn/commit/12e31b4981980e6ca5e32c1d3a23d268ddd0c977) Thanks [@simonwong](https://github.com/simonwong)! - support both named export and default export

  **usage**:

  ```typescript
  // Named export
  import { create, useModal, Provider } from "@easy-shadcn/command-modal";

  // Default export
  import CommandModal from "@easy-shadcn/command-modal";

  // Namespace import
  import * as CommandModal from "@easy-shadcn/command-modal";
  ```

- [#48](https://github.com/simonwong/easy-shadcn/pull/48) [`ebd3fde`](https://github.com/simonwong/easy-shadcn/commit/ebd3fdee26e69329a837a23651de997a0b042644) Thanks [@simonwong](https://github.com/simonwong)! - change unique modal ID

## 0.0.1

### Features

- **Imperative Modal Management**: Introduced a Promise-based API to handle modals dynamically, eliminating the need for repetitive `useState` hooks in your components.
- **Shadcn UI Optimization**: Deep integration with Shadcn's `Dialog` components, providing specialized control over `Overlay` and stack management.
- **React 19 & TS 5.x Ready**: Fully compatible with the latest React 19 types, resolving previous `JSX` namespace conflicts.
- **Dual Format Support**: Ships with both ESM (`.mjs`) and CJS (`.js`) builds for seamless compatibility with Vite, Next.js (App Router), and legacy Node.js environments.

### Improvements

- **Full Type Safety**: Comprehensive TypeScript definitions with intelligent prop inference for `createModal`.
- **Lightweight & Tree-shakable**: Minimal footprint designed to work efficiently within the `@easy-shadcn` ecosystem.
- **Monorepo Integration**: Optimized for use within the `@easy-shadcn` workspace using `workspace:*` resolution.

### Credits

- Core logic inspired by the pioneering work of `@ebay/nice-modal-react`. Built with modern enhancements for the Shadcn community.
