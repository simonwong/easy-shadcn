// jsdom lacks PointerEvent; base-ui Checkbox dispatches one on click.
// A MouseEvent-shaped polyfill is enough for the bubbling click forwarder.
if (typeof globalThis.PointerEvent === "undefined") {
  // biome-ignore lint/suspicious/noExplicitAny: minimal jsdom shim
  (globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {};
}

// cmdk observes its list height; jsdom has no layout or ResizeObserver.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    disconnect() {
      // jsdom has no layout work to disconnect.
    }

    observe() {
      // jsdom has no layout changes to observe.
    }

    unobserve() {
      // jsdom has no layout target to unobserve.
    }
  };
}

if (typeof HTMLElement.prototype.scrollIntoView === "undefined") {
  HTMLElement.prototype.scrollIntoView = () => undefined;
}
