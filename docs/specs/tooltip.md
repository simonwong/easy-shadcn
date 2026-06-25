# Spec — Tooltip (Compose layer)

`registry/ui/tooltip.tsx`. Collapses shadcn base-ui Tooltip's six nested parts
(Provider / Root / Trigger / Portal / Positioner / Popup) into one drop-anywhere component.

## Ground truth (base-ui @1.4.0, components/ui/tooltip.tsx)
- `Tooltip.Root`: renders NO DOM. Props: `open`, `defaultOpen`, `onOpenChange(open, details)`,
  `disabled`, `trackCursorAxis`, ... NO `delay` on Root.
- `Tooltip.Provider`: shares delay/grouping. Props: `delay`, `closeDelay`, `timeout`. shadcn default `delay=0`.
- `Tooltip.Trigger`: renders a `<button>` by default; `render={element}` merges trigger behavior onto a child.
- shadcn `TooltipContent` = Portal + Positioner (`side`/`sideOffset`/`align`/`alignOffset`) + Popup (className).

## API
```ts
export interface TooltipProps
  extends Pick<ContentProps, "side" | "sideOffset" | "align" | "alignOffset">,
    Pick<RootProps, "open" | "defaultOpen" | "onOpenChange" | "disabled">,
    Pick<ProviderProps, "delay" | "closeDelay"> {
  children: ReactElement;   // the trigger element (becomes the trigger via render=)
  content: ReactNode;       // tooltip body
  contentClassName?: string; // class on the popup (TooltipContent)
}
```
- Self-contained: wraps its own `TooltipProvider` so `<Tooltip>` works without app-root setup.
- `children` must be a single element (DOM tag or forwardRef/render component) — it IS the trigger
  via `render={children}` (no extra wrapper → no button-in-button).
- Types Pick'd from the primitives to avoid drift. `delay` default follows shadcn Provider (0).

## Behavior / edge cases (tests)
1. Renders the trigger (children) as a button-roled element.
2. Closed by default → content not in the document.
3. `defaultOpen` / controlled `open` → content visible (in the portal).
4. `contentClassName` + `side` land on the popup.
5. `disabled` → tooltip never opens (even with defaultOpen? — disabled wins; assert closed).
6. Controlled `open=false` keeps it closed.

## Out of scope (→ primitives)
Cursor-following (`trackCursorAxis`), hoverable popup, imperative handle/actionsRef, payload render
functions, multiple triggers sharing one tooltip, rich interactive popups.

## Status
Pending implementation in `registry/ui/tooltip.tsx`.
