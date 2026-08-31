# Popover uses separate click and hover adapters behind one Interface

Popover and Hover Card present the same rich positioned-content task, but they do not share the same trigger semantics. A caller changing from editable click content to a supplemental link preview should keep the content slots, positioning vocabulary, and controlled-open wiring without manually replacing the whole primitive tree.

## Decision

`Popover` is the sole Compose owner. Its default `interaction="click"` branch preserves the existing shadcn Popover adapter and API. `interaction="hover"` selects shadcn Hover Card, backed by Base UI Preview Card, and adds `delay` and `closeDelay`. The discriminated type prevents hover delays from leaking into click mode and prevents click-only `disabled` from pretending to be Preview Card behavior.

Both branches expose the same trigger, title, description, content, footer, positioning, and open-state vocabulary. They keep separate primitive implementations rather than simulating hover with Popover mouse handlers. The hover adapter owns its internal trigger id so controlled and initially open states need no extra caller concept.

Hover mode is for a link preview that mirrors its destination. Its content must not be unique or essential because touch and screen-reader users cannot depend on hover previews. Tooltip remains a separate capability with concise, non-interactive descriptive content. Hover Card receives no independent Compose registry entry.

## Alternatives rejected

- Separate `Popover` and `HoverCard` Compose components would make a trigger-policy change require an import and API migration despite their identical task-level content model.
- One Popover primitive with custom mouse events would duplicate delay, safe-polygon, focus, dismissal, and controlled-state behavior already owned by Preview Card.
- Merging Tooltip would erase its different content, accessibility, and interaction contract.

## Consequences

Existing click usage remains unchanged. Changing to a hover/focus preview adds one explicit discriminator while preserving content and positioning props. The registry installs both official primitives, but consumers choose one stable Compose owner.
