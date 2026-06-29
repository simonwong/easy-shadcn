# Context

## Domain language

- **Compose layer**: The `registry/ui/*` components that wrap shadcn primitives with flat props.
- **Primitive**: The raw `components/ui/*` shadcn components with full composition freedom.
- **Command-modal**: The imperative modal state-management library in `packages/command-modal/`.
- **Handler**: The object `useModal()` returns — the modal's live state (`visible`, `args`, …) plus the imperative verbs (`show`, `hide`, `remove`, `resolve`, `reject`, `resolveHide`). The unit an Adapter consumes.
- **Adapter** (`ModalPropsAdapter`): A pure function mapping a Handler to the prop shape one modal UI library expects (e.g. shadcn `{ open, onOpenChange }`, antd `{ open, onCancel, afterClose }`). The single seam by which command-modal stays UI-library-agnostic.
- **First-class adapter**: An adapter the library ships, types, and supports. Scope: **shadcn** (default) and **antd v6**. Everything else is a BYO adapter.
- **BYO adapter**: A user-supplied Adapter. Supported by the type system (must be fully type-safe to author and consume) but not shipped or maintained by the library.
- **Resolution value** (result): The value a modal hands back to whoever opened it when it completes — what `await show(Modal)` settles with, set via `modal.resolve(value)`. Distinct from a **dismissal** (hide/remove/unregister without an explicit resolve), which settles the promise with `undefined`.

## Key decisions

- Dual-layer architecture: primitives (`components/ui/*`) + Compose layer (`registry/ui/*`)
- 80/20 rule: Compose layer serves 80% of common use cases
- `components/ui/**` is read-only, only modified via shadcn CLI
- command-modal's only UI-library coupling is the Adapter seam; the core stays UI-agnostic. First-class targets are shadcn + antd v6; other libraries are typed-but-BYO. See [ADR-0001](docs/adr/0001-adapter-seam-and-typed-factory.md).
- A modal's resolve (result) type is carried on `create<Props, Result>`, not at the `show()` call site. See [ADR-0002](docs/adr/0002-resolve-type-on-create.md).
