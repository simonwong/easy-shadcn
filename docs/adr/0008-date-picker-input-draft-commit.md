# DatePicker's manual input is a single-mode draft with a commit lifecycle where the calendar and Escape win

DatePicker keeps the calendar, popover, and value plumbing; the only genuinely stateful extra is `withInput` — a text field whose in-progress text is a *draft* committed on well-defined events. Getting the draft lifecycle right — which gesture commits, which discards, and who wins when the input and the calendar race — is the whole design.

## Decision

- **`withInput` is single-mode only**, enforced both in the type (`multiple` / `range` accept `withInput?: false`) and at runtime (`withInput = mode === "single" && props.withInput === true`). A single date has one unambiguous formatted string; multi and range would need separator conventions and partial-state parsing beyond the Compose scope.
- **Typed text is a draft, not the value.** The input renders `draft ?? display`, and the field's `onChange` only sets the draft. A commit runs `parse(draft, format, …, { locale })` and updates the real value ONLY when the draft is empty (⇒ commit `undefined`) or parses to a valid date that is not blocked by `minDate` / `maxDate` / `disabledDates`. Invalid or blocked drafts are discarded silently (no `onChange`), and every commit path clears the draft. Typed input is thus held to the same day constraints as the calendar — there is no keyboard bypass of a forbidden day.
- **Three commit gestures, two deliberate exceptions.** Enter and blur (focus leaving the whole picker plus popover) commit the draft. Closing the popover commits a pending draft exactly once — EXCEPT Escape, which discards it ("abandon my edit"). The **calendar wins over a pending blur**: clicking a day blurs the input first, so blur/close commits are suppressed while focus lands back inside the picker (outside-press cancellation plus a pointer-down latch), letting the day click be the selection.
- **Auto-close is asymmetric.** Committing a defined date in single mode closes the popover; multiple and range stay open, since those selections usually need more clicks. The single-mode close path guards on the popover being open and not already closing, so `onOpenChange(false)` fires exactly once per close.
- **Controlled/uncontrolled is decided by `value` presence** (mirroring Select and Table), including `value={undefined}` as an empty controlled field; `defaultValue` is read once and never resynced.

## Consequences

- The only cancel gesture (Escape) is non-destructive; every other close preserves a valid edit, matching form-field intuition.
- The draft lifecycle — commit on Enter / blur / close, discard on Escape / invalid, calendar-wins — is the component's real test surface. The mode plumbing itself is delegated to `Calendar` / react-day-picker, whose `mode` naming alignment is recorded in [ADR-0004](0004-props-vocabulary.md).
