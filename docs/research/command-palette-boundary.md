# Command Palette product boundary

Snapshot: 2026-09-02

## Question

Does the deferred shadcn Command capability justify a Compose owner, and where should its Interface stop relative to Menu, Select, Modal, and the Command Primitive?

## Primary-source baseline

- The [official shadcn Command documentation](https://ui.shadcn.com/docs/components/base/command) presents Command as an input plus filtered list, empty state, groups, items, separators, shortcut hints, and an optional Dialog composition.
- The [official shadcn Command source](https://ui.shadcn.com/r/styles/base-nova/command.json) is a styled projection over cmdk plus shadcn Dialog and Input Group primitives. It does not own a product action lifecycle.
- The [cmdk README](https://github.com/dip/cmdk) documents controlled search, custom filtering, grouped items, Dialog composition, keyboard selection, and nested pages. These are Primitive capabilities rather than a reason to mirror every option in Compose.
- The [official shadcn Sidebar documentation](https://ui.shadcn.com/docs/components/base/sidebar) shows a much broader provider, responsive shell, navigation structure, collapse, mobile, shortcut, and persistence surface. Sidebar remains a separate future boundary decision rather than the next bounded implementation.

## Deletion test

A wrapper that only maps `items` to `CommandItem` fails. Removing it adds little more than repeated JSX. A task-level palette passes: removing it makes each consumer rebuild global Mod+K invocation, Dialog/open/query coordination, grouped action projection, async single-flight, pending/error accessibility, controlled close refusal, and stale-Promise isolation.

The reusable product is therefore `CommandPalette`, not another exported Command component.

## Boundary

`CommandPalette` owns:

- one fixed Dialog and platform Mod+K listener;
- static flat actions plus one-level groups;
- internal query and actual-close reset;
- synchronous and Promise-like execution with a per-session single-flight lock;
- success-close, retryable failure, pending/error announcements, and input refocus;
- session tokens that ignore settlement after actual close;
- generated accessibility relationships and type/runtime ownership seams.

It does not own:

- persistent selection, expansion, links, or route navigation: use `Menu`;
- form values, chips, selected labels, or remote option loading: use `Select`;
- imperative modal registration: use `Modal` and command-modal;
- inline lists, custom ranking, controlled query, remote results, nested pages, separators, virtualization, or arbitrary composition: use the Command Primitive.

## Interface result

The base case is one required `items` field. Optional open control, one caller-owned trigger, a fixed boolean hotkey switch, loop behavior, copy, and presentation classes do not increase the concepts required for first use. Action values and group values share one non-empty unique identity space. Labels stay strings so search text and exact accessible names cannot diverge.

Async work is a UI transaction, not a cancellation abstraction. Closing unlocks the next session and invalidates old UI settlement while allowing the external side effect to finish. This distinction prevents both false cancellation claims and stale UI corruption.

## Recommendation

Ship Command as the high-value `CommandPalette` state-machine owner recorded in [ADR-0016](../adr/0016-command-palette-dialog-state-machine.md). Keep Sidebar, Menubar, and Navigation Menu as separate product decisions. Do not share Menu's item Interface merely because both surfaces render actions; their state and lifecycle owners differ.
