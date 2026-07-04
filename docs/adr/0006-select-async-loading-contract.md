# Select async loading is an abortable single-flight with a bounded selected-label cache

`Select`'s `loadItems` covers two async shapes — eager (load once, then filter client-side) and server-side (refetch per query). Both must survive out-of-order responses, and neither may drop the labels of already-selected values when a narrower server response no longer contains them. `registry/hooks/use-select-loader.ts` owns this as a self-contained state machine; `select.tsx` (and, by delegation, `combobox.tsx`) only renders what it returns.

## Decision

- **Single-flight via `AbortController`.** Every new fetch aborts the in-flight one; any resolved or rejected response whose signal is already aborted is dropped, so only the latest request can mutate the visible items. On unmount the controller is aborted and the debounce timer cleared.
- **Stale-clear on fetch start.** Starting a request immediately empties the visible list and shows loading, so a slow server cannot leave a stale option set on screen under a newer query.
- **Two trigger shapes.** Eager mode (`serverSideFilter: false`) loads exactly once — at mount or first open, per `loadOn` — then filters locally. Server-side mode (`serverSideFilter: true`) refetches on open and on every debounced query change (`debounceMs`, default 250; the first empty-query open fires with zero delay). Closing the popup in server-side mode resets the "has loaded" latch so reopening refetches the default list.
- **Bounded selected-label cache.** A `value → SelectItem` cache is populated ONLY from items the loader has actually returned. The displayed collection is the latest response plus any selected item missing from it but present in the cache, so chips and the trigger label stay stable while the user searches a narrower slice. The cache never fabricates a label for a controlled value that has never appeared in a response — that value falls back to its raw string until it loads.
- **Errors are surfaced, not swallowed.** A non-abort rejection sets an error the component renders together with a retry action; abort rejections are ignored silently.

## Consequences

- Race correctness is a property of the loader, not the component: `select.tsx` and `combobox.tsx` inherit it unchanged, and it is tested by asserting observable output (visible items, the loading flag, preserved chip labels) rather than internal refs.
- "Only cache what the loader returned" is a deliberate honesty boundary — it trades the ability to display a label for an unknown selected value against ever showing a guessed or wrong one.
- The prop names (`loadItems` / `loadOn` / `serverSideFilter` / `debounceMs` / `loadingMessage` / `errorMessage`) are the async vocabulary fixed in [ADR-0004](0004-props-vocabulary.md); this ADR records the behaviour behind those names.
