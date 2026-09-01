# Toast exposes a stable facade over the Base UI manager

The repository uses shadcn's `base-nova` style. Its current Toast primitive is built on Base UI and already owns the difficult notification state: queue limits, timers, id upserts, updates, close transitions, Promise races, live-region announcements, focus movement, stacking, and swipe dismissal. The deprecated Radix Toast recommendation to use Sonner does not apply to this Base UI project.

## Decision

`Toast` mounts one application-wide Base UI provider and renderer. A callable `toast` facade exposes add, status helpers, update, close, and Promise transitions while keeping title mapping and status names stable. The facade delegates queue state to Base UI; it does not duplicate the store.

Actions use `action.label` and `action.onClick`. `actionButtonProps` omits the Compose-owned element, role/disabled semantics, primitive slot, label, raw HTML, and click keys at the type boundary; the runtime adapter discards injected values for the same keys. A successful action closes its notification; `event.preventDefault()` keeps it open. Promise state React nodes consistently map to the title, while object states explicitly name `title` and optional notification fields. Promise transitions delegate to Base UI's manager so resolver failures and close/update races retain the primitive's tested lifecycle.

The Compose owner is one global queue. Scoped managers, anchored notifications, custom rendering, arbitrary data, and primitive-part styling remain Primitive escape paths.

## Alternatives rejected

- Re-exporting shadcn's manager unchanged leaves caller-facing action ownership and Promise message placement coupled to the upstream manager shape, providing almost no Compose value.
- A Sonner wrapper adds a second notification dependency and follows guidance for the Radix implementation rather than this repository's Base UI foundation.
- A custom store would duplicate timing, race, focus, accessibility, stack, and gesture behavior already owned by Base UI.

## Consequences

The first use requires mounting `<Toast />` once and calling `toast(message)`. Status, update, action, and Promise behavior deepen that same Interface without adding setup concepts. Base UI remains the lifecycle owner, so upstream primitive updates can improve behavior without changing the Compose facade.
