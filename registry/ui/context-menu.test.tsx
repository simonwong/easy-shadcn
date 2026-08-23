import {
  act,
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createRef } from "react";
// @ts-expect-error The runtime client entry exists; this repo does not hoist its peer-only types package.
import { hydrateRoot } from "react-dom/client";
// @ts-expect-error The runtime server entry exists; this repo does not hoist its peer-only types package.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ContextMenu } from "./context-menu";

const baseItems = [
  { content: "Edit", value: "edit" },
  { content: "Duplicate", value: "duplicate" },
];

const renderMenu = (
  props: Partial<React.ComponentProps<typeof ContextMenu>> = {}
) =>
  render(
    <ContextMenu
      items={baseItems}
      trigger={<button type="button">File actions</button>}
      {...props}
    />
  );

const openWithContextMenu = (trigger: Element, x = 80, y = 40) => {
  const event = createEvent.contextMenu(trigger, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  });

  fireEvent(trigger, event);
  return event;
};

describe("ContextMenu", () => {
  it("opens one flat action list from the composed trigger", async () => {
    const { container } = renderMenu();
    const trigger = screen.getByRole("button", { name: "File actions" });

    expect(screen.queryByRole("menu")).toBeNull();

    const event = openWithContextMenu(trigger);

    expect(event.defaultPrevented).toBe(true);
    expect(await screen.findByRole("menu")).toBeTruthy();
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent)
    ).toEqual(["Edit", "Duplicate"]);
    expect(Array.from(container.querySelectorAll("button"))).toEqual([trigger]);
  });

  it("allows an empty action list", async () => {
    renderMenu({ items: [] });

    openWithContextMenu(screen.getByRole("button", { name: "File actions" }));

    expect(await screen.findByRole("menu")).toBeTruthy();
    expect(screen.queryAllByRole("menuitem")).toHaveLength(0);
  });

  it("server-renders one closed trigger and hydrates before portal use", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const element = (
      <ContextMenu
        items={baseItems}
        trigger={<button type="button">Hydrated actions</button>}
      />
    );
    const html = renderToStaticMarkup(element);
    const host = document.createElement("div");
    host.innerHTML = html;
    document.body.append(host);

    expect(host.querySelectorAll("button")).toHaveLength(1);
    expect(host.querySelector('[role="menu"]')).toBeNull();

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(() => {
      root = hydrateRoot(host, element);
    });

    const trigger = host.querySelector("button");
    expect(trigger).toBeTruthy();
    openWithContextMenu(trigger as HTMLButtonElement);

    expect(await screen.findByRole("menu")).toBeTruthy();
    expect(consoleError).not.toHaveBeenCalled();

    await act(() => {
      root?.unmount();
    });
    consoleError.mockRestore();
  });

  it("renders item state, decoration, and class ownership", async () => {
    renderMenu({
      contentClassName: "content-x",
      itemClassName: "global-item-x px-3",
      items: [
        {
          content: "Delete",
          icon: <svg aria-label="Ignored icon" data-testid="delete-icon" />,
          inset: true,
          itemClassName: "specific-item-x px-5",
          shortcut: "⌘D",
          value: "delete",
          variant: "destructive",
        },
        { content: "Archive", disabled: true, value: "archive" },
      ],
      shortcutClassName: "shortcut-x",
    });

    openWithContextMenu(screen.getByRole("button", { name: "File actions" }));

    const popup = await screen.findByRole("menu");
    const deleteItem = screen.getByRole("menuitem", { name: "Delete" });
    const archiveItem = screen.getByRole("menuitem", { name: "Archive" });
    const icon = within(deleteItem).getByTestId("delete-icon").parentElement;
    const shortcut = within(deleteItem).getByText("⌘D");

    expect(popup.classList).toContain("content-x");
    expect(deleteItem.dataset.variant).toBe("destructive");
    expect(deleteItem.hasAttribute("data-inset")).toBe(true);
    expect(archiveItem.dataset.variant).toBe("default");
    expect(archiveItem.hasAttribute("data-inset")).toBe(false);
    expect(archiveItem.getAttribute("aria-disabled")).toBe("true");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    expect(shortcut.getAttribute("aria-hidden")).toBe("true");
    expect(shortcut.classList).toContain("shortcut-x");

    const classes = Array.from(deleteItem.classList);
    expect(classes.indexOf("relative")).toBeLessThan(
      classes.indexOf("global-item-x")
    );
    expect(classes.indexOf("global-item-x")).toBeLessThan(
      classes.indexOf("specific-item-x")
    );
    expect(archiveItem.classList).toContain("global-item-x");
    expect(archiveItem.classList).not.toContain("specific-item-x");
    expect(deleteItem.classList).toContain("px-5");
    expect(deleteItem.classList).not.toContain("px-3");
    expect(deleteItem.classList).not.toContain("px-1.5");
    expect(archiveItem.classList).toContain("px-3");
    expect(archiveItem.classList).not.toContain("px-5");
    expect(archiveItem.classList).not.toContain("px-1.5");
    expect(popup.classList).not.toContain("global-item-x");
    expect(deleteItem.classList).not.toContain("content-x");
  });

  it("preserves the exact item event and primitive dismissal", async () => {
    let canPreventBaseUI = false;
    let currentTarget: EventTarget | null = null;
    const onClick = vi.fn((event) => {
      canPreventBaseUI = typeof event.preventBaseUIHandler === "function";
      currentTarget = event.currentTarget;
    });
    renderMenu({ items: [{ content: "Edit", onClick, value: "edit" }] });
    openWithContextMenu(screen.getByRole("button", { name: "File actions" }));
    const item = await screen.findByRole("menuitem", { name: "Edit" });

    fireEvent.click(item);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(currentTarget).toBe(item);
    expect(canPreventBaseUI).toBe(true);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("keeps disabled items inactive without dismissing", async () => {
    const onClick = vi.fn();
    renderMenu({
      items: [
        { content: "Edit", value: "edit" },
        { content: "Archive", disabled: true, onClick, value: "archive" },
      ],
    });
    openWithContextMenu(screen.getByRole("button", { name: "File actions" }));
    const item = await screen.findByRole("menuitem", { name: "Archive" });

    fireEvent.click(item);

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it.each([
    "Enter",
    " ",
  ])("keeps a roving-focused disabled item inactive with %s", async (key) => {
    const onClick = vi.fn();
    renderMenu({
      items: [
        { content: "Edit", value: "edit" },
        { content: "Archive", disabled: true, onClick, value: "archive" },
      ],
    });
    openWithContextMenu(screen.getByRole("button", { name: "File actions" }));
    const menu = await screen.findByRole("menu");
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    const archive = screen.getByRole("menuitem", { name: "Archive" });
    await waitFor(() => {
      expect(document.activeElement).toBe(menu);
    });

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(edit);
    fireEvent.keyDown(edit, { key: "ArrowDown" });
    expect(document.activeElement).toBe(archive);
    fireEvent.keyDown(archive, { key });
    fireEvent.keyUp(archive, { key });

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(document.activeElement).toBe(archive);
  });

  it("follows the latest item order, state, and handler", async () => {
    const staleHandler = vi.fn();
    const latestHandler = vi.fn();
    const view = renderMenu({
      items: [
        { content: "Edit", onClick: staleHandler, value: "edit" },
        { content: "Archive", value: "archive" },
      ],
    });
    openWithContextMenu(screen.getByRole("button", { name: "File actions" }));
    await screen.findByRole("menu");
    expect(
      screen
        .getByRole("menuitem", { name: "Edit" })
        .getAttribute("aria-disabled")
    ).toBeNull();

    view.rerender(
      <ContextMenu
        items={[
          { content: "Duplicate", value: "duplicate" },
          {
            content: "Edit renamed",
            disabled: true,
            onClick: latestHandler,
            value: "edit",
          },
        ]}
        trigger={<button type="button">File actions</button>}
      />
    );

    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent)
    ).toEqual(["Duplicate", "Edit renamed"]);
    const disabledEdit = screen.getByRole("menuitem", {
      name: "Edit renamed",
    });
    expect(disabledEdit.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(disabledEdit);
    expect(latestHandler).not.toHaveBeenCalled();
    expect(staleHandler).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeTruthy();

    view.rerender(
      <ContextMenu
        items={[
          { content: "Duplicate", value: "duplicate" },
          {
            content: "Edit renamed",
            disabled: false,
            onClick: latestHandler,
            value: "edit",
          },
        ]}
        trigger={<button type="button">File actions</button>}
      />
    );
    const enabledEdit = screen.getByRole("menuitem", {
      name: "Edit renamed",
    });
    expect(enabledEdit.getAttribute("aria-disabled")).toBeNull();
    fireEvent.click(enabledEdit);
    expect(latestHandler).toHaveBeenCalledTimes(1);
    expect(staleHandler).not.toHaveBeenCalled();
  });

  it("preserves exact controlled open and close requests", async () => {
    const onOpenChange = vi.fn();
    const view = renderMenu({ onOpenChange, open: false });
    const trigger = screen.getByRole("button", { name: "File actions" });

    const invocation = openWithContextMenu(trigger, 120, 64);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledTimes(1);
    });
    expect(invocation.defaultPrevented).toBe(true);
    expect(screen.queryByRole("menu")).toBeNull();
    const [requestedOpen, openDetails] = onOpenChange.mock.calls[0];
    expect(requestedOpen).toBe(true);
    expect(openDetails.reason).toBe("trigger-press");
    expect(typeof openDetails.cancel).toBe("function");
    expect(typeof openDetails.allowPropagation).toBe("function");

    view.rerender(
      <ContextMenu
        items={baseItems}
        onOpenChange={onOpenChange}
        open
        trigger={<button type="button">File actions</button>}
      />
    );
    const item = await screen.findByRole("menuitem", { name: "Edit" });
    fireEvent.click(item);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledTimes(2);
    });
    const [requestedClose, closeDetails] = onOpenChange.mock.calls[1];
    expect(requestedClose).toBe(false);
    expect(closeDetails.reason).toBe("item-press");
    expect(screen.getByRole("menu")).toBeTruthy();

    view.rerender(
      <ContextMenu
        items={baseItems}
        onOpenChange={onOpenChange}
        open={false}
        trigger={<button type="button">File actions</button>}
      />
    );
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("keeps an accepted controlled menu mounted until Escape is accepted", async () => {
    const onOpenChange = vi.fn();
    const view = renderMenu({ onOpenChange, open: false });
    const trigger = screen.getByRole("button", { name: "File actions" });

    openWithContextMenu(trigger, 120, 64);
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledTimes(1);
    });
    view.rerender(
      <ContextMenu
        items={baseItems}
        onOpenChange={onOpenChange}
        open
        trigger={<button type="button">File actions</button>}
      />
    );
    const popup = await screen.findByRole("menu");

    fireEvent.keyDown(popup, { key: "Escape" });

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledTimes(2);
    });
    expect(onOpenChange.mock.calls[1][0]).toBe(false);
    expect(onOpenChange.mock.calls[1][1].reason).toBe("escape-key");
    expect(screen.getByRole("menu")).toBe(popup);

    view.rerender(
      <ContextMenu
        items={baseItems}
        onOpenChange={onOpenChange}
        open={false}
        trigger={<button type="button">File actions</button>}
      />
    );
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("restores native pointer and keyboard context menus when disabled", () => {
    const onClick = vi.fn();
    const onContextMenu = vi.fn();
    const onKeyDown = vi.fn();
    const onOpenChange = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const { container } = render(
      <ContextMenu
        disabled
        items={baseItems}
        onOpenChange={onOpenChange}
        trigger={
          <button
            aria-describedby="trigger-help"
            className="trigger-x"
            onClick={onClick}
            onContextMenu={onContextMenu}
            onKeyDown={onKeyDown}
            ref={ref}
            style={{ color: "red" }}
            tabIndex={-1}
            type="button"
          >
            Disabled actions
          </button>
        }
      />
    );
    const trigger = screen.getByRole("button", { name: "Disabled actions" });

    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "F10", shiftKey: true });
    const pointerEvent = openWithContextMenu(trigger, 40, 20);
    trigger.focus();
    const keyboardEvent = openWithContextMenu(trigger, 0, 0);

    expect(pointerEvent.defaultPrevented).toBe(false);
    expect(keyboardEvent.defaultPrevented).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onContextMenu).toHaveBeenCalledTimes(2);
    expect(trigger.getAttribute("aria-describedby")).toBe("trigger-help");
    expect(trigger.classList).toContain("trigger-x");
    expect(trigger.style.color).toBe("red");
    expect(trigger.tabIndex).toBe(-1);
    expect(document.activeElement).toBe(trigger);
    expect(ref.current).toBe(trigger);
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });

  it("delegates keyboard entry, navigation, and typeahead", async () => {
    const onKeyDown = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const { container } = render(
      <ContextMenu
        items={[
          { content: "Edit", value: "edit" },
          { content: "Archive", disabled: true, value: "archive" },
          { content: "Duplicate", value: "duplicate" },
        ]}
        trigger={
          <button
            aria-label="Keyboard file actions"
            onKeyDown={onKeyDown}
            ref={ref}
            type="button"
          />
        }
      />
    );
    const trigger = screen.getByRole("button", {
      name: "Keyboard file actions",
    });
    trigger.focus();

    fireEvent.keyDown(trigger, { key: "F10", shiftKey: true });
    expect(screen.queryByRole("menu")).toBeNull();
    openWithContextMenu(trigger, 0, 0);

    const menu = await screen.findByRole("menu");
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    const archive = screen.getByRole("menuitem", { name: "Archive" });
    const duplicate = screen.getByRole("menuitem", { name: "Duplicate" });
    await waitFor(() => {
      expect(document.activeElement).toBe(menu);
    });

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(edit);
    fireEvent.keyDown(edit, { key: "ArrowDown" });
    expect(document.activeElement).toBe(archive);
    fireEvent.keyDown(archive, { key: "ArrowDown" });
    expect(document.activeElement).toBe(duplicate);
    fireEvent.keyDown(duplicate, { key: "Home" });
    expect(document.activeElement).toBe(edit);
    fireEvent.keyDown(edit, { key: "End" });
    expect(document.activeElement).toBe(duplicate);
    fireEvent.keyDown(duplicate, { key: "Home" });
    expect(document.activeElement).toBe(edit);
    fireEvent.keyDown(edit, { key: "d" });
    await waitFor(() => {
      expect(document.activeElement).toBe(duplicate);
    });

    expect(onKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: "F10", shiftKey: true })
    );
    expect(ref.current).toBe(trigger);
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });

  it.each([
    "Enter",
    " ",
  ])("activates from the keyboard with %s and restores focus", async (key) => {
    const onClick = vi.fn();
    renderMenu({ items: [{ content: "Edit", onClick, value: "edit" }] });
    const trigger = screen.getByRole("button", { name: "File actions" });
    trigger.focus();
    openWithContextMenu(trigger, 0, 0);
    const menu = await screen.findByRole("menu");
    const item = await screen.findByRole("menuitem", { name: "Edit" });
    await waitFor(() => {
      expect(document.activeElement).toBe(menu);
    });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(item);

    fireEvent.keyDown(item, { key });
    fireEvent.keyUp(item, { key });

    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("dismisses with Escape and restores the caller focus target", async () => {
    const onClick = vi.fn();
    renderMenu({ items: [{ content: "Edit", onClick, value: "edit" }] });
    const trigger = screen.getByRole("button", { name: "File actions" });
    trigger.focus();
    openWithContextMenu(trigger, 0, 0);
    const menu = await screen.findByRole("menu");
    const item = await screen.findByRole("menuitem", { name: "Edit" });
    await waitFor(() => {
      expect(document.activeElement).toBe(menu);
    });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(item);

    fireEvent.keyDown(item, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("delegates short taps, moved touches, and long presses", () => {
    vi.useFakeTimers();
    try {
      const onOpenChange = vi.fn();
      renderMenu({ onOpenChange, open: false });
      const trigger = screen.getByRole("button", { name: "File actions" });
      const firstTouch = { clientX: 32, clientY: 24, identifier: 1 };

      fireEvent.touchStart(trigger, { touches: [firstTouch] });
      act(() => vi.advanceTimersByTime(499));
      expect(onOpenChange).not.toHaveBeenCalled();
      fireEvent.touchEnd(trigger, {
        changedTouches: [firstTouch],
        touches: [],
      });
      act(() => vi.advanceTimersByTime(1));
      expect(onOpenChange).not.toHaveBeenCalled();

      fireEvent.touchStart(trigger, { touches: [firstTouch] });
      fireEvent.touchMove(trigger, {
        touches: [{ ...firstTouch, clientX: 43 }],
      });
      act(() => vi.advanceTimersByTime(500));
      expect(onOpenChange).not.toHaveBeenCalled();

      fireEvent.touchStart(trigger, { touches: [firstTouch] });
      act(() => vi.advanceTimersByTime(500));
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange.mock.calls[0][0]).toBe(true);
      expect(onOpenChange.mock.calls[0][1].reason).toBe("trigger-press");
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps disabled long presses on the native path", () => {
    vi.useFakeTimers();
    try {
      const onOpenChange = vi.fn();
      renderMenu({ disabled: true, onOpenChange, open: false });
      const trigger = screen.getByRole("button", { name: "File actions" });

      fireEvent.touchStart(trigger, {
        touches: [{ clientX: 32, clientY: 24, identifier: 1 }],
      });
      act(() => vi.advanceTimersByTime(500));

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.queryByRole("menu")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("routes the locked positioning props to the primitive", async () => {
    const clientHeight = Object.getOwnPropertyDescriptor(
      document.documentElement,
      "clientHeight"
    );
    const clientWidth = Object.getOwnPropertyDescriptor(
      document.documentElement,
      "clientWidth"
    );
    Object.defineProperties(document.documentElement, {
      clientHeight: { configurable: true, value: 768 },
      clientWidth: { configurable: true, value: 1024 },
    });
    const view = renderMenu({ align: "end", side: "left", sideOffset: 12 });

    openWithContextMenu(
      screen.getByRole("button", { name: "File actions" }),
      160,
      96
    );

    const popup = await screen.findByRole("menu");
    await waitFor(() => {
      expect(popup.dataset.align).toBe("end");
      expect(popup.dataset.side).toBe("left");
    });
    expect(popup.parentElement?.style.transform).toBe("translate(148px, 92px)");

    view.unmount();
    if (clientHeight) {
      Object.defineProperty(
        document.documentElement,
        "clientHeight",
        clientHeight
      );
    } else {
      Reflect.deleteProperty(document.documentElement, "clientHeight");
    }
    if (clientWidth) {
      Object.defineProperty(
        document.documentElement,
        "clientWidth",
        clientWidth
      );
    } else {
      Reflect.deleteProperty(document.documentElement, "clientWidth");
    }
  });

  it("reuses one portal and removes it after dismissal", async () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "File actions" });

    openWithContextMenu(trigger, 40, 30);
    await screen.findByRole("menu");
    const firstPortal = document.querySelector("[data-base-ui-portal]");
    expect(firstPortal).toBeTruthy();

    openWithContextMenu(trigger, 180, 120);
    await waitFor(() => {
      const portals = document.querySelectorAll("[data-base-ui-portal]");
      expect(portals).toHaveLength(1);
      expect(portals[0]).toBe(firstPortal);
    });

    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    await waitFor(() => {
      expect(document.querySelector("[data-base-ui-portal]")).toBeNull();
    });
  });
});
