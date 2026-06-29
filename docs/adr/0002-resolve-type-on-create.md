# Carry the modal's resolve (result) type on create()

`show(modal)` settles with the value passed to `modal.resolve(...)`, but TypeScript can't infer that result type from inside the modal body (inference flows through signatures, not function bodies, and `resolve` comes from a decoupled `useModal()` hook). The old `show<T, C>` overloads also degraded to the `modal: string` overload whenever `T` was given explicitly, because supplying one type argument failed overload ①'s two-parameter arity. We carry the optional resolve type `R` as a second type parameter on `create<Props, R>` (default `unknown`), so `show(Comp, args)` infers **both** the args and `Promise<R>` with zero explicit type arguments.

**Why definition-site, not call-site:** declaring `R` on `create` frees the call-site inference slot, so args-checking and a typed result coexist. The call-site form `show<R>(Comp)` can't do this — TypeScript has no partial type-argument inference, so pinning `R` stops the component (and thus the args) from being inferred. You get args **xor** result, never both.

## Consequences

- Typing a result requires writing `Props` explicitly too (`create<Props, R>`) — same no-partial-inference limitation. When you don't need a typed result, `create<Props>(Comp)` or `create(Comp)` behaves exactly as before (`R = unknown`).
- The body's no-arg `useModal().resolve` stays `unknown`-typed, so `R` is an author-declared contract surfaced to the **caller**, not enforced at the `resolve()` call site.
- Additive and non-breaking: existing `create<P>(Comp)` and untyped `show(Comp)` callers are unaffected. The string-id path keeps `show<T>(modal: string)` with explicit `T`, since a string id carries no component to infer from.
