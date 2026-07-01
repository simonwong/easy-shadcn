# Spec — Alert Dialog (Compose layer)

`registry/ui/alert-dialog.tsx`. Flattens the shadcn base-ui AlertDialog compound parts
(Trigger/Content/Header/Title/Description/Footer + Cancel/Action) into one flat-prop component for
the 80% confirm-dialog case. Mirrors `registry/ui/card.tsx` (slot + `xxxClassName`) and — decisively
— `registry/ui/modal/alert-modal.tsx`, its already-shipped sibling.

`AlertDialog` is the zero-dependency declarative sibling of `AlertModal`: identical visual + prop
contract, but no `@easy-shadcn/command-modal` coupling. `AlertModal` lives under `modal/` because its
barrel `Object.assign`s it with the command-modal `alert()`/`confirm()` helper; `AlertDialog` is used
inline via `trigger` or controlled `open`. **Governing decision: mirror `alert-modal.tsx`'s proven API
exactly; do not diverge** (AGENTS.md rule 3 — naming alignment reduces memory cost). The only additions
vs. alert-modal are (a) `variant` destructive-confirm sugar and (b) formally extending `Root.Props`.

## Ground truth (base-ui @1.4.0, verified)
- `AlertDialogRoot.Props<Payload>` = `Omit<DialogRoot.Props, 'modal' | 'disablePointerDismissal' |
  'onOpenChange' | 'actionsRef' | 'handle'>` re-adding `onOpenChange`, `actionsRef`, `handle`.
  → **`modal` and `disablePointerDismissal` are hardwired**: always focus-trapped / scroll-locked, and
  **outside/pointer press never dismisses**.
- Inherited from `DialogRoot.Props`: `open?`, `defaultOpen?`, `onOpenChangeComplete?: (open: boolean)
  => void`.
- `onOpenChange?: (open: boolean, eventDetails: ChangeEventDetails) => void` — **two args**.
- Close reasons enum includes `escapeKey` → **Escape DOES close the dialog** (outsidePress cannot fire
  because pointer dismissal is off).
- shadcn wrappers: `AlertDialogContent` (Portal+Backdrop+Popup, `size?: 'default' | 'sm'`),
  `AlertDialogHeader` (grid; media slot ignored here), `AlertDialogTitle`, `AlertDialogDescription`,
  `AlertDialogFooter` (`border-t bg-muted/50` by default), `AlertDialogTrigger` (`render` prop).
- Confirm/cancel use **`AsyncButton`** (not `AlertDialogAction`/`Close`) so both can `await
  onConfirm/onCancel` then close programmatically — identical to alert-modal.

## API
```ts
export interface AlertDialogProps
  extends Omit<
    AlertDialogPrimitive.Root.Props,
    "children" | "onOpenChange" | "render"
  > {
  // Control — open / defaultOpen / onOpenChangeComplete / actionsRef / handle are INHERITED.
  // onOpenChange is narrowed (drops eventDetails); users needing it use the primitive.
  onOpenChange?: (open: boolean) => void;

  trigger?: ReactElement;                // uncontrolled trigger (optional)

  title?: ReactNode;                     // content slots (Card pattern)
  titleClassName?: ClassValue;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  headerClassName?: ClassValue;

  cancelText?: ReactNode;                // default "Cancel"
  confirmText?: ReactNode;               // default "OK"
  showCancel?: boolean;                  // default true
  onCancel?: () => void | Promise<void>;
  onConfirm?: () => void | Promise<void>;
  cancelProps?: ComponentProps<typeof AsyncButton>;
  confirmProps?: ComponentProps<typeof AsyncButton>;
  footer?: ReactNode;                    // full override — replaces the entire button row
  footerClassName?: ClassValue;

  variant?: "default" | "destructive";   // default "default" — confirm-button color sugar

  size?: "default" | "sm";               // → AlertDialogContent
  className?: ClassValue;                // → AlertDialogContent
}
```
- Extending `Root.Props` gives `open`, `defaultOpen`, `onOpenChangeComplete`, `actionsRef`, `handle`
  for free — all forwarded to the primitive `Root` via `...rootProps`. `size`/`className` are our own
  props, destructured out and sent to `AlertDialogContent` (Root renders no element).
- `onOpenChange` narrowed to `(open: boolean) => void` (drops `eventDetails`) — matches alert-modal /
  Tabs / Accordion narrowing. Users needing `eventDetails` drop to the primitive.
- Reuse the exact `hasNode` helper from card.tsx for header omission.
- Controlled/uncontrolled mirrors alert-modal exactly: internal `useState(defaultOpen ?? false)`,
  `currentOpen = open === undefined ? internal : open`, `handleOpenChange` updates internal only when
  uncontrolled and always calls `onOpenChange`. Both buttons call `onConfirm`/`onCancel` then
  `close()`.
- **`footer` precedence:** when `footer` is a real node it **replaces the whole button row**;
  `cancelText`/`confirmText`/`showCancel`/`cancelProps`/`confirmProps`/`onCancel`/`onConfirm`/`variant`
  are ignored. Otherwise render the default `[cancel?] + confirm` row (confirm always present — an
  alert dialog with no action is out of scope).
- **`variant` sugar:** `variant="destructive"` → confirm button `variant="destructive"` (red);
  `variant="default"` → Button default (primary). Affects **only** the confirm button; cancel stays
  `outline`. Pure shorthand for `confirmProps={{ variant: "destructive" }}`; **explicit
  `confirmProps.variant` wins** (spread `confirmProps` after the derived variant):
  `confirmProps.variant ?? (variant === "destructive" ? "destructive" : undefined)`.
- **Async:** `onConfirm`/`onCancel` may return `Promise<void>`; the `AsyncButton` auto-shows a pending
  spinner, stays disabled, the dialog stays open until it settles, and a **rejection keeps it open
  (retryable)**. Controlled loading reachable via `confirmProps={{ loading }}` (no separate prop).
- `xxxProps` typed as `ComponentProps<typeof AsyncButton>` (the real slot component) — do NOT narrow to
  `Button` (would drop `loading`/`startIcon`/`endIcon`). Passing `onClick` replaces the built-in close
  handler (prefer `onCancel`/`onConfirm`).
- Class merging: every slot `cn(xxxClassName)`; `className`/`size` → `AlertDialogContent`.
- Naming: keep `confirmText`/`confirmProps`/`onConfirm` (not `action*`) for consistency with
  alert-modal — an intentional trade against primitive-terminology alignment.

## Behavior / edge cases (tests)
1. Renders title/description/confirm/cancel from flat props (query `data-slot` like card.test).
2. Header omitted when no title/description; `0` renders, `null`/`undefined`/booleans treated absent.
3. `showCancel={false}` hides cancel; confirm always present.
4. `cancelText`/`confirmText` defaults ("Cancel"/"OK") and overrides.
5. Uncontrolled + `trigger`: click trigger opens; click confirm closes; `onConfirm` fired.
6. Controlled: `open` + `onOpenChange`; clicking confirm fires `onOpenChange(false)` but stays open
   until the `open` prop changes.
7. Async retry: `onConfirm` returns a rejected Promise → confirm shows loading (`aria-busy`), dialog
   stays open; second click retries; on resolve, spinner stops and dialog closes.
8. `variant="destructive"` → confirm button has `variant="destructive"`; `confirmProps.variant`
   overrides it; cancel stays `outline`.
9. `footer` override replaces the button row (confirm/cancel absent).
10. Escape closes the dialog (asserting documented base-ui behavior; outside-click does not dismiss).
11. Every `xxxClassName` + `size` + `className` forwarded to its slot/content.

## Out of scope (→ use `components/ui/alert-dialog` primitives)
Media/icon header slot (`AlertDialogMedia`), 3+ actions, heterogeneous footer layouts beyond the
`footer` override, per-close-reason branching (`eventDetails`), and any need to re-enable pointer
dismissal or disable Escape (both hardwired by base-ui).

## Status
Not yet implemented. Target: `registry/ui/alert-dialog.tsx` (+ `alert-dialog.test.tsx`, 11 tests,
coverage gate lines/fns/stmts ≥90, branches ≥85), `content/docs/components/alert-dialog.mdx`,
`components/examples/alert-dialog-demo.tsx`, and a `registry.json` entry (depends only on the
`alert-dialog` primitive + `async-button`; **no** command-modal dependency).
