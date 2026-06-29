---
"@easy-shadcn/command-modal": minor
---

Type-safe adapters, first-class antd, and a leak fix in the default shadcn adapter.

**New**

- `createCommandModal(adapter)` factory returns a config-bound
  `{ Provider, useModal }` whose `modalProps` is statically typed as the
  adapter's return type — antd / any-library consumers now get type-safe
  `modalProps` with no casts. shadcn stays the zero-config default at the
  package root. The factory's `useModal` is a type-only reskin of the same
  runtime hook, so it never re-runs the adapter or breaks memoization.
- Official **Ant Design v6** adapter: `antdModalProps` (and a hand-written,
  `antd`-import-free `AntdModalProps` type) exported from
  `@easy-shadcn/command-modal/antd`. The core entry stays zero-dependency.
- `create<Props, Result>` now carries the modal's resolve type. `show(Comp, args)`
  infers both the args and `Promise<Result>` with no explicit type argument — the
  old `show<T>(Comp)` form (which degraded to the string overload) is no longer
  needed.

**Fixes**

- `<Dialog {...modal.modalProps}>` no longer leaks. The default shadcn adapter
  emitted `afterClose` — an antd concept Base UI's Dialog doesn't read — so the
  modal was never removed after closing, leaking a reducer entry and a mounted
  HOC per show. It now emits Base UI's real `onOpenChangeComplete` hook, guarded
  on close, so the modal is removed once its close animation finishes.
- Removed the dead `CommandModalArgs` type (it collapsed to
  `Record<string, unknown>` for any `React.FC` and validated nothing) and the
  `Provider` JSDoc that imported a non-existent `antdModalAdapter`.

**Breaking**

- `ShadCNModalProps` / `createModalProps`: the `afterClose?: () => void` field is
  replaced by `onOpenChangeComplete?: (open: boolean) => void` (Base UI's real
  post-transition hook). Spreading `{...modal.modalProps}` onto a dialog is
  unaffected (and stops leaking); code that read `modalProps.afterClose` by hand
  should switch to `onOpenChangeComplete` (and guard on `open === false`).
