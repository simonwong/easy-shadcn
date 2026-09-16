import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Menubar, type MenubarItem, type MenubarProps } from "./menubar";

const forgedPattern = /Forged/;

function renderMenu(items: MenubarItem[], props: Partial<MenubarProps> = {}) {
  return render(
    <Menubar items={[{ key: "file", trigger: "File", items }]} {...props} />
  );
}

async function openMenu(name = "File") {
  const trigger = screen.getByRole("menuitem", { name });
  act(() => trigger.focus());
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  const menu = await screen.findByRole("menu", { name });
  await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
  return menu;
}

describe("Menubar", () => {
  it("renders an accessible bar and opens named native menu items", async () => {
    const ref = createRef<HTMLDivElement>();
    renderMenu([{ key: "new", content: "New document" }], {
      "aria-label": "Document commands",
      ref,
    });
    expect(ref.current).toBe(
      screen.getByRole("menubar", { name: "Document commands" })
    );
    expect(screen.queryByRole("menu")).toBeNull();
    const menu = await openMenu();
    expect(menu.getAttribute("aria-labelledby")).toBe(
      screen.getByRole("menuitem", { name: "File" }).id
    );
    expect(
      within(menu).getByRole("menuitem", { name: "New document" })
    ).toBeTruthy();
  });

  it("dispatches an action once, closes, and does not submit a form", async () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Menubar
          items={[
            {
              key: "file",
              trigger: "File",
              items: [{ key: "new", content: "New", onClick }],
            },
          ]}
        />
      </form>
    );
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "New" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("preserves the primitive action cancellation event", async () => {
    renderMenu([
      {
        key: "stay",
        content: "Stay",
        onClick: (event) => event.preventBaseUIHandler(),
      },
    ]);
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Stay" }));
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("supports empty bars and empty menus", async () => {
    const view = render(<Menubar items={[]} />);
    expect(screen.getByRole("menubar")).toBeTruthy();
    expect(screen.queryByRole("menuitem")).toBeNull();
    view.rerender(
      <Menubar items={[{ key: "file", trigger: "File", items: [] }]} />
    );
    expect(within(await openMenu()).queryByRole("menuitem")).toBeNull();
  });

  it("disables the whole bar through the primitive", () => {
    renderMenu([{ key: "new", content: "New" }], { disabled: true });
    fireEvent.click(screen.getByRole("menuitem", { name: "File" }));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("disables individual menus and actions", async () => {
    const onClick = vi.fn();
    render(
      <Menubar
        items={[
          { key: "edit", trigger: "Edit", disabled: true, items: [] },
          {
            key: "file",
            trigger: "File",
            items: [{ key: "new", content: "New", disabled: true, onClick }],
          },
        ]}
      />
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(screen.queryByRole("menu")).toBeNull();
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "New" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("switches menus and keeps only one popup open", async () => {
    render(
      <Menubar
        items={[
          {
            key: "file",
            trigger: "File",
            items: [{ key: "new", content: "New" }],
          },
          {
            key: "edit",
            trigger: "Edit",
            items: [{ key: "undo", content: "Undo" }],
          },
        ]}
      />
    );
    await openMenu();
    await openMenu("Edit");
    await waitFor(() =>
      expect(screen.queryByRole("menuitem", { name: "New" })).toBeNull()
    );
    expect(screen.getAllByRole("menu")).toHaveLength(1);
    expect(screen.getByRole("menuitem", { name: "Undo" })).toBeTruthy();
  });

  it("delegates top-level keyboard movement and Escape focus return", async () => {
    render(
      <Menubar
        items={[
          {
            key: "file",
            trigger: "File",
            items: [{ key: "new", content: "New" }],
          },
          {
            key: "edit",
            trigger: "Edit",
            items: [{ key: "undo", content: "Undo" }],
          },
        ]}
      />
    );
    const file = screen.getByRole("menuitem", { name: "File" });
    act(() => file.focus());
    fireEvent.keyDown(file, { key: "ArrowRight" });
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    await waitFor(() => expect(document.activeElement).toBe(edit));
    fireEvent.keyDown(edit, { key: "ArrowDown" });
    await screen.findByRole("menu");
    const undo = screen.getByRole("menuitem", { name: "Undo" });
    await waitFor(() => expect(document.activeElement).toBe(undo));
    fireEvent.keyDown(undo, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(edit));
  });

  it("renders labeled groups, separators, and nested actions", async () => {
    const onClick = vi.fn();
    renderMenu([
      {
        key: "group",
        type: "group",
        content: "Document",
        items: [{ key: "new", content: "New" }],
      },
      { key: "divider", type: "separator" },
      {
        key: "export",
        type: "submenu",
        content: "Export",
        items: [{ key: "pdf", content: "PDF", onClick }],
      },
    ]);
    await openMenu();
    expect(screen.getByRole("group", { name: "Document" })).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();
    const exportItem = screen.getByRole("menuitem", { name: "Export" });
    act(() => exportItem.focus());
    fireEvent.keyDown(exportItem, { key: "ArrowRight" });
    const pdf = await screen.findByRole("menuitem", { name: "PDF" });
    await waitFor(() => expect(document.activeElement).toBe(pdf));
    fireEvent.keyDown(pdf, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("does not open a disabled submenu", async () => {
    renderMenu([
      {
        key: "export",
        type: "submenu",
        content: "Export",
        disabled: true,
        items: [{ key: "pdf", content: "PDF" }],
      },
    ]);
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Export" }));
    expect(screen.queryByRole("menuitem", { name: "PDF" })).toBeNull();
  });

  it("keeps checkbox changes controlled and preserves exact cancellable details", async () => {
    const onCheckedChange = vi.fn();
    const item: MenubarItem = {
      key: "ruler",
      type: "checkbox",
      content: "Ruler",
      checked: false,
      onCheckedChange,
    };
    const view = renderMenu([item]);
    await openMenu();
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Ruler" }));
    expect(onCheckedChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ cancel: expect.any(Function) })
    );
    expect(
      screen.getByRole("menuitemcheckbox").getAttribute("aria-checked")
    ).toBe("false");
    view.rerender(
      <Menubar
        items={[
          { key: "file", trigger: "File", items: [{ ...item, checked: true }] },
        ]}
      />
    );
    expect(
      screen.getByRole("menuitemcheckbox").getAttribute("aria-checked")
    ).toBe("true");
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("retains accepted checkbox and radio settings after closing and reopening", async () => {
    function Settings() {
      const [checked, setChecked] = useState(false);
      const [value, setValue] = useState("light");
      return (
        <Menubar
          items={[
            {
              key: "view",
              trigger: "File",
              items: [
                {
                  key: "ruler",
                  type: "checkbox",
                  content: "Ruler",
                  checked,
                  onCheckedChange: setChecked,
                },
                {
                  key: "theme",
                  type: "radio-group",
                  content: "Theme",
                  value,
                  onValueChange: setValue,
                  items: [
                    { value: "light", content: "Light" },
                    { value: "dark", content: "Dark" },
                  ],
                },
              ],
            },
          ]}
        />
      );
    }
    render(<Settings />);
    await openMenu();
    fireEvent.click(screen.getByRole("menuitemcheckbox"));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    expect(screen.getByRole("menu")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("menuitemradio", { name: "Dark" }), {
      key: "Escape",
    });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await openMenu();
    expect(
      screen.getByRole("menuitemcheckbox").getAttribute("aria-checked")
    ).toBe("true");
    expect(
      screen
        .getByRole("menuitemradio", { name: "Dark" })
        .getAttribute("aria-checked")
    ).toBe("true");
    expect(
      screen
        .getByRole("menuitemradio", { name: "Light" })
        .getAttribute("aria-checked")
    ).toBe("false");
  });

  it("does not change a controlled radio value when its parent refuses", async () => {
    const onValueChange = vi.fn();
    renderMenu([
      {
        key: "theme",
        type: "radio-group",
        content: "Theme",
        value: "light",
        onValueChange,
        items: [
          { value: "light", content: "Light" },
          { value: "dark", content: "Dark" },
        ],
      },
    ]);
    await openMenu();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    expect(onValueChange).toHaveBeenCalledWith(
      "dark",
      expect.objectContaining({ cancel: expect.any(Function) })
    );
    expect(
      screen
        .getByRole("menuitemradio", { name: "Light" })
        .getAttribute("aria-checked")
    ).toBe("true");
    expect(
      screen
        .getByRole("menuitemradio", { name: "Dark" })
        .getAttribute("aria-checked")
    ).toBe("false");
  });

  it("honors disabled checkbox, radio group, and radio option state", async () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    renderMenu([
      {
        key: "ruler",
        type: "checkbox",
        content: "Ruler",
        checked: false,
        disabled: true,
        onCheckedChange,
      },
      {
        key: "theme",
        type: "radio-group",
        content: "Theme",
        value: "",
        disabled: true,
        onValueChange,
        items: [{ value: "dark", content: "Dark" }],
      },
      {
        key: "zoom",
        type: "radio-group",
        content: "Zoom",
        value: "",
        onValueChange,
        items: [{ value: "fit", content: "Fit", disabled: true }],
      },
    ]);
    await openMenu();
    fireEvent.click(screen.getByRole("menuitemcheckbox"));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Fit" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps decoration out of action names and merges classes", async () => {
    renderMenu(
      [
        {
          key: "delete",
          content: "Delete",
          variant: "destructive",
          icon: <span>Icon</span>,
          shortcut: "⌘D",
          itemClassName: "per-item rounded-xl",
        },
      ],
      {
        className: "bar",
        contentClassName: "popup",
        itemClassName: "all-items rounded-md",
        triggerClassName: "trigger",
      }
    );
    expect(screen.getByRole("menubar").className).toContain("bar");
    expect(screen.getByRole("menuitem", { name: "File" }).className).toContain(
      "trigger"
    );
    const popup = await openMenu();
    expect(popup.className).toContain("popup");
    const item = screen.getByRole("menuitem", { name: "Delete" });
    expect(item.className).toContain("per-item");
    expect(item.className).toContain("all-items");
    expect(item.className).toContain("rounded-xl");
    expect(item.getAttribute("data-variant")).toBe("destructive");
    expect(screen.getByText("⌘D").getAttribute("aria-hidden")).toBe("true");
  });

  it("ignores untyped structural overrides and prop bags", async () => {
    const unsafe = {
      children: "Forged child",
      role: "listbox",
      render: <a href="#forged">Forged root</a>,
      dangerouslySetInnerHTML: { __html: "Forged html" },
      "data-slot": "forged",
      orientation: "vertical",
      items: [
        {
          key: "file",
          trigger: "File",
          triggerProps: { disabled: true },
          items: [
            {
              key: "new",
              content: "New",
              render: <div>Forged item</div>,
              role: "option",
              children: "Forged descendant",
              itemProps: { disabled: true },
              closeOnClick: false,
            },
          ],
        },
      ],
    } as unknown as MenubarProps;
    render(<Menubar {...unsafe} />);
    expect(screen.getByRole("menubar").getAttribute("data-slot")).toBe(
      "menubar"
    );
    expect(screen.queryByText(forgedPattern)).toBeNull();
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "New" }));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });
});
