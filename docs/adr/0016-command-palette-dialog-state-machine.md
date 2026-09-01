# Command Palette owns a Dialog-scoped action transaction

The shadcn Command Primitive supplies filtering, active-item navigation, groups, and an optional Dialog composition. A product command palette still repeats global invocation, open/query reset, action execution, pending feedback, error retry, and protection from Promises that settle after dismissal.

## Decision

`CommandPalette` is the canonical owner of searchable temporary actions. Its base case requires only static `items`. It fixes one Dialog, an internal query, the platform Mod+K chord, one-level groups, and a flat action model. Menu remains the owner of persistent selected and expanded navigation; Select remains the owner of form values.

Each open session is a UI transaction. Selecting an enabled action acquires a synchronous single-flight lock before invoking `onSelect`. Synchronous success or Promise fulfillment releases the lock and requests close. A throw or rejection releases the lock, keeps the query and Dialog open, remounts an alert, and restores input focus so the action can be retried.

Observed closure ends the UI transaction. It clears query, pending, and error state, releases the lock, and advances a session token. It does not claim to cancel the external side effect. A later fulfillment or rejection can finish outside the component, but its old token cannot close, lock, or report an error in a newer palette session.

The list stays mounted while an action is pending or failed. It owns derived busy and disabled semantics; status and alert live regions sit beside the list so the listbox contains only collection semantics. Controlled parents may refuse close requests: state resets only after the controlled `open` value actually becomes false.

## Alternatives rejected

- A thin `items` projection over Command fails the deletion test because every consumer still rebuilds global invocation and the async/error race.
- Reusing Menu would mix temporary action execution with persistent navigation selection and expansion.
- Reusing Modal or command-modal would couple a local Dialog transaction to an imperative global modal registry without removing Command-specific search and active-item work.
- AbortController or cancellation claims would overstate what arbitrary caller actions support. Closing only ends the UI transaction.
- Controlled query, custom ranking, remote search, nested pages, keep-open actions, and arbitrary slots would create a second Primitive API. Those cases use Command directly.

## Consequences

The first use stays `items` only while realistic grouped and asynchronous actions need no caller lifecycle state. Only one hotkey-enabled instance per document is supported. Multiple external side effects may overlap across separately opened sessions after an earlier one is dismissed, but actions never overlap inside one session.

Values must be non-empty and palette-wide unique. Built-in English copy, accessible names/descriptions, live regions, generated structure, activation handlers, and pending semantics are Compose-owned at type and runtime seams. The Primitive remains the escape hatch for composition-heavy or application-specific command interfaces.
