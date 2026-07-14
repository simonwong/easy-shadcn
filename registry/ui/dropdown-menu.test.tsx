import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { DropdownMenu } from "./dropdown-menu";

const baseItems: ComponentProps<typeof DropdownMenu>["items"] = [
  { content: "Edit", value: "edit" },
  { content: "Duplicate", value: "duplicate" },
];
const forgedTextPattern = /Forged/;

const renderMenu = (props: Partial<ComponentProps<typeof DropdownMenu>> = {}) =>
  render(
    <DropdownMenu
      items={baseItems}
      trigger={<button type="button">Actions</button>}
      {...props}
    />
  );

describe("DropdownMenu", () => {
  it("opens one flat action list from the composed trigger", async () => {
    renderMenu();

    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Actions" }));

    await waitFor(() => {
      expect(screen.getByRole("menu")).toBeTruthy();
    });
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent)
    ).toEqual(["Edit", "Duplicate"]);
  });

  it("uses defaultOpen only as the initial uncontrolled state", async () => {
    renderMenu({ defaultOpen: true });

    expect(screen.getByRole("menu")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Actions" }));

    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("keeps visibility controlled by open", async () => {
    const onOpenChange = vi.fn();
    const view = renderMenu({ onOpenChange, open: false });

    fireEvent.click(screen.getByRole("button", { name: "Actions" }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    });
    expect(screen.queryByRole("menu")).toBeNull();

    view.rerender(
      <DropdownMenu
        items={baseItems}
        onOpenChange={onOpenChange}
        open
        trigger={<button type="button">Actions</button>}
      />
    );

    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("preserves primitive open-change event details", async () => {
    const onOpenChange = vi.fn();
    renderMenu({ onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: "Actions" }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledTimes(1);
    });
    const [nextOpen, details] = onOpenChange.mock.calls[0];
    expect(nextOpen).toBe(true);
    expect(details.reason).toBe("trigger-press");
    expect(typeof details.cancel).toBe("function");
  });

  it("activates an action with the primitive event and dismisses normally", async () => {
    let currentTarget: EventTarget | null = null;
    let hasBaseUiControl = false;
    const onClick = vi.fn((event) => {
      currentTarget = event.currentTarget;
      hasBaseUiControl = typeof event.preventBaseUIHandler === "function";
    });
    renderMenu({
      items: [{ content: "Edit", onClick, value: "edit" }],
    });
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    const item = await screen.findByRole("menuitem", { name: "Edit" });

    fireEvent.click(item);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(currentTarget).toBe(item);
    expect(hasBaseUiControl).toBe(true);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("delegates Arrow, Home, and End roving focus", async () => {
    renderMenu({
      items: [
        { content: "Edit", value: "edit" },
        { content: "Duplicate", value: "duplicate" },
        { content: "Archive", value: "archive" },
      ],
    });
    const trigger = screen.getByRole("button", { name: "Actions" });

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    const edit = await screen.findByRole("menuitem", { name: "Edit" });
    const duplicate = screen.getByRole("menuitem", { name: "Duplicate" });
    const archive = screen.getByRole("menuitem", { name: "Archive" });
    await waitFor(() => {
      expect(document.activeElement).toBe(edit);
    });

    fireEvent.keyDown(edit, { key: "ArrowDown" });
    expect(document.activeElement).toBe(duplicate);

    fireEvent.keyDown(duplicate, { key: "End" });
    expect(document.activeElement).toBe(archive);

    fireEvent.keyDown(archive, { key: "Home" });
    expect(document.activeElement).toBe(edit);
  });

  it.each([
    "Enter",
    " ",
  ])("activates the focused action with %s", async (key) => {
    const onClick = vi.fn();
    renderMenu({
      items: [{ content: "Edit", onClick, value: "edit" }],
    });
    const trigger = screen.getByRole("button", { name: "Actions" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const item = await screen.findByRole("menuitem", { name: "Edit" });
    await waitFor(() => {
      expect(document.activeElement).toBe(item);
    });

    fireEvent.keyDown(item, { key });
    fireEvent.keyUp(item, { key });

    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("dismisses with Escape and restores focus to the trigger", async () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const item = await screen.findByRole("menuitem", { name: "Edit" });
    await waitFor(() => {
      expect(document.activeElement).toBe(item);
    });

    fireEvent.keyDown(item, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("uses visible content for accessible names and typeahead", async () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Actions" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const duplicate = await screen.findByRole("menuitem", {
      name: "Duplicate",
    });
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    await waitFor(() => {
      expect(document.activeElement).toBe(edit);
    });

    fireEvent.keyDown(edit, { key: "d" });

    expect(document.activeElement).toBe(duplicate);
  });

  it("keeps a disabled menu closed for pointer and keyboard input", () => {
    const onOpenChange = vi.fn();
    renderMenu({ disabled: true, onOpenChange });
    const trigger = screen.getByRole("button", { name: "Actions" });

    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("keeps disabled actions visible but inactive for pointer and keyboard", async () => {
    const onDisabledClick = vi.fn();
    renderMenu({
      items: [
        { content: "Edit", value: "edit" },
        {
          content: "Duplicate",
          disabled: true,
          onClick: onDisabledClick,
          value: "duplicate",
        },
      ],
    });
    const trigger = screen.getByRole("button", { name: "Actions" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const edit = await screen.findByRole("menuitem", { name: "Edit" });
    const disabledItem = screen.getByRole("menuitem", { name: "Duplicate" });

    expect(disabledItem.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(disabledItem);
    expect(onDisabledClick).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeTruthy();

    await waitFor(() => {
      expect(document.activeElement).toBe(edit);
    });
    fireEvent.keyDown(edit, { key: "ArrowDown" });
    expect(document.activeElement).toBe(disabledItem);
    fireEvent.keyDown(disabledItem, { key: "Enter" });
    fireEvent.keyDown(disabledItem, { key: " " });
    fireEvent.keyUp(disabledItem, { key: " " });
    expect(onDisabledClick).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("renders decorative icons before content and shortcuts after it", () => {
    renderMenu({
      defaultOpen: true,
      items: [
        {
          content: "Edit",
          icon: <span>Decorative edit icon</span>,
          shortcut: "⌘E",
          value: "edit",
        },
      ],
    });

    const item = screen.getByRole("menuitem", { name: "Edit" });
    const icon = item.querySelector('[data-slot="dropdown-menu-item-icon"]');
    const shortcut = item.querySelector('[data-slot="dropdown-menu-shortcut"]');
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    expect(icon?.textContent).toBe("Decorative edit icon");
    expect(shortcut?.textContent).toBe("⌘E");
    expect(Array.from(item.children)).toEqual([icon, shortcut]);
    expect(item.textContent).toBe("Decorative edit iconEdit⌘E");
  });

  it("maps default, destructive, and inset presentation states", () => {
    renderMenu({
      defaultOpen: true,
      items: [
        { content: "Edit", value: "edit" },
        { content: "Delete", value: "delete", variant: "destructive" },
        { content: "Indented", inset: true, value: "indented" },
      ],
    });

    const edit = screen.getByRole("menuitem", { name: "Edit" });
    const remove = screen.getByRole("menuitem", { name: "Delete" });
    const inset = screen.getByRole("menuitem", { name: "Indented" });
    expect(edit.getAttribute("data-variant")).toBe("default");
    expect(edit.hasAttribute("data-inset")).toBe(false);
    expect(remove.getAttribute("data-variant")).toBe("destructive");
    expect(inset.hasAttribute("data-inset")).toBe(true);
  });

  it("overrides the documented content placement defaults", async () => {
    renderMenu({
      align: "end",
      side: "top",
      sideOffset: 9,
    });
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));

    const content = await screen.findByRole("menu");
    expect(content.getAttribute("data-align")).toBe("end");
    expect(content.getAttribute("data-side")).toBe("top");
    const positioner = content.closest('[role="presentation"][data-side]');
    await waitFor(() => {
      expect(positioner?.getAttribute("style")).toContain("9px");
    });
  });

  it("normalizes and merges content, item, and shortcut ClassValue hooks", () => {
    renderMenu({
      contentClassName: ["content-x", { "content-on": true }],
      defaultOpen: true,
      itemClassName: ["global-item", false],
      items: [
        { content: "Edit", shortcut: "⌘E", value: "edit" },
        {
          content: "Delete",
          itemClassName: ["per-item", { active: true }],
          shortcut: "⌫",
          value: "delete",
        },
      ],
      shortcutClassName: ["shortcut-x", { "shortcut-on": true }],
    });

    const content = screen.getByRole("menu");
    expect(content.className).toContain("content-x");
    expect(content.className).toContain("content-on");
    expect(content.className).toContain("rounded-lg");

    const edit = screen.getByRole("menuitem", { name: "Edit" });
    const remove = screen.getByRole("menuitem", { name: "Delete" });
    expect(edit.className).toContain("global-item");
    expect(edit.className).toContain("rounded-md");
    expect(remove.className.indexOf("global-item")).toBeLessThan(
      remove.className.indexOf("per-item")
    );
    expect(remove.className).toContain("active");

    const shortcuts = document.querySelectorAll(
      '[data-slot="dropdown-menu-shortcut"]'
    );
    expect(shortcuts).toHaveLength(2);
    for (const shortcut of shortcuts) {
      expect(shortcut.className).toContain("shortcut-x");
      expect(shortcut.className).toContain("shortcut-on");
      expect(shortcut.className).toContain("tracking-widest");
    }
  });

  it("keeps the default placement and accepts an empty action list", async () => {
    renderMenu({ items: [] });
    fireEvent.click(screen.getByRole("button", { name: "Actions" }));

    const content = await screen.findByRole("menu");
    expect(content.getAttribute("data-align")).toBe("start");
    expect(content.getAttribute("data-side")).toBe("bottom");
    expect(screen.queryAllByRole("menuitem")).toHaveLength(0);
    const positioner = content.closest('[role="presentation"][data-side]');
    await waitFor(() => {
      expect(positioner?.getAttribute("style")).toContain("4px");
    });
  });

  it("ignores untyped structural and prop-bag escape attempts", () => {
    const forgedClick = vi.fn();
    const unsafeProps = {
      "data-slot": "forged-root",
      children: <div>Forged root child</div>,
      contentProps: { id: "forged-content" },
      id: "forged-root",
      items: [
        {
          "data-slot": "forged-item",
          children: "Forged item child",
          content: "Safe action",
          id: "forged-item",
          itemProps: { onClick: forgedClick },
          label: "Forged typeahead label",
          render: <button type="button">Forged item render</button>,
          role: "option",
          value: "safe",
        },
      ],
      portalProps: { children: <div>Forged portal child</div> },
      positionerProps: {
        align: "end",
        children: <div>Forged positioner child</div>,
        side: "top",
      },
      render: <button type="button">Forged root render</button>,
      rootProps: { open: false },
      slots: { content: "Forged slot" },
      trigger: <button type="button">Safe trigger</button>,
      triggerProps: { disabled: true },
    } as unknown as ComponentProps<typeof DropdownMenu>;

    render(<DropdownMenu {...unsafeProps} defaultOpen />);

    const trigger = screen.getByRole("button", { name: "Safe trigger" });
    const content = screen.getByRole("menu");
    const item = screen.getByRole("menuitem", { name: "Safe action" });
    expect((trigger as HTMLButtonElement).disabled).toBe(false);
    expect(content.id).not.toBe("forged-content");
    expect(content.getAttribute("data-align")).toBe("start");
    expect(content.getAttribute("data-side")).toBe("bottom");
    expect(item.getAttribute("data-slot")).toBe("dropdown-menu-item");
    expect(item.id).not.toBe("forged-item");
    expect(screen.queryByText(forgedTextPattern)).toBeNull();

    fireEvent.click(item);
    expect(forgedClick).not.toHaveBeenCalled();
  });
});
