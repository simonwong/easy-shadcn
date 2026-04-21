---
"@easy-shadcn/command-modal": minor
---

Scoped dispatch, SSR-safe ids, and safer teardown semantics.

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
