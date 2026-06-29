# Adapter seam + typed factory for multi-UI-library support

command-modal must emit UI-library-specific modal props (shadcn the zero-config default, antd v6 first-class) while staying UI-agnostic and keeping the core zero-dependency. We keep a single **Adapter** seam (`handler → props`) and expose first-class typed support for non-default adapters through a `createCommandModal(adapter)` factory that returns a config-bound `{ Provider, useModal }` whose `modalProps` is typed to the adapter's return type — rather than threading a generic through `Provider`/`Context`/`useModal`.

**Why a factory, not threaded generics:** React context can't carry a value-level generic into `useModal()`'s return type, so capturing `TModalProps` at the factory's closure boundary is the only way to make `modalProps` type-safe without a per-call type annotation.

## Considered options

- **Thread `TModalProps` through Provider → Context → useModal** — rejected: `useContext` erases the generic; the bare `useModal()` can't recover the adapter type.
- **Ship owned mui/other adapters** — rejected: peer-dep + maintenance burden. Only **shadcn** and **antd v6** are first-class; everything else is typed-but-BYO.

## Consequences

- antd's adapter type is **hand-written** (`AntdModalProps = { open?, onCancel?, afterClose? }`, no `antd` import), mirroring the existing hand-written `ShadCNModalProps`, so the core keeps its "Zero dependencies" guarantee. The antd adapter ships at the `/antd` subpath export.
- **Each adapter emits its own UI library's real prop names.** This corrects the shadcn adapter, which previously emitted the antd-ism `afterClose`: it now emits Base UI's real post-close hook `onOpenChangeComplete?: (open: boolean) => void` (verified against `@base-ui/react@1.4.0`), so `<Dialog {...modal.modalProps}>` works on a raw Base UI dialog without leaking. `ShadCNModalProps` changes `afterClose → onOpenChangeComplete` — a breaking change shipped as a 0.x **minor** bump (0.2.0 → 0.3.0) per semver's 0.x convention.
- The package root still exports a shadcn-typed `useModal`. antd consumers must use the **factory's** `useModal` — mitigated by an app-local barrel that re-exports the factory output plus the root verbs, and a `no-restricted-imports` lint rule banning `useModal` from the package root.
- The factory's `useModal` is a **type-only reskin** of the base hook (the runtime adapter is already applied via the config context the factory's Provider injects); it must not re-wrap/re-run the adapter, which would double-invoke it and break memoization.
