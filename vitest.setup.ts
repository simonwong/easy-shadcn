// jsdom lacks PointerEvent; base-ui Checkbox dispatches one on click.
// A MouseEvent-shaped polyfill is enough for the bubbling click forwarder.
if (typeof globalThis.PointerEvent === "undefined") {
  // biome-ignore lint/suspicious/noExplicitAny: minimal jsdom shim
  (globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {};
}
