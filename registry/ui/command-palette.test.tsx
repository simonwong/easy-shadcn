import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { type ComponentProps, createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommandPalette, type CommandPaletteProps } from "./command-palette";

const FORGED_TEXT_PATTERN = /Forged/;
const MAC_PLATFORM_PATTERN = /Mac/;

const baseItems: ComponentProps<typeof CommandPalette>["items"] = [
  {
    label: "Create project",
    onSelect: vi.fn(),
    value: "create-project",
  },
  {
    headingClassName: "workspace-heading",
    items: [
      {
        description: "Pull the latest workspace data",
        icon: <span>Sync icon</span>,
        keywords: ["refresh", "pull"],
        label: "Sync workspace",
        onSelect: vi.fn(),
        shortcut: "⌘S",
        value: "sync-workspace",
      },
    ],
    label: "Workspace",
    type: "group",
    value: "workspace",
  },
];

const getPlatformModifier = () =>
  MAC_PLATFORM_PATTERN.test(navigator.platform)
    ? { metaKey: true }
    : { ctrlKey: true };

const openWithHotkey = () => {
  fireEvent.keyDown(document, { key: "k", ...getPlatformModifier() });
};

const deferred = () => {
  let reject!: (error: unknown) => void;
  let resolve!: () => void;
  const promise = new Promise<void>((promiseResolve, promiseReject) => {
    reject = promiseReject;
    resolve = promiseResolve;
  });
  return { promise, reject, resolve };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CommandPalette", () => {
  it("opens the items-only base case with Mod+K and renders a named grouped palette", async () => {
    render(<CommandPalette items={baseItems} />);

    expect(screen.queryByRole("dialog")).toBeNull();
    openWithHotkey();

    const dialog = await screen.findByRole("dialog", {
      name: "Command palette",
    });
    const input = screen.getByRole("combobox", { name: "Search commands" });
    expect(dialog).toBeTruthy();
    expect(screen.getByText("Search for a command to run.")).toBeTruthy();
    expect(
      document.getElementById(dialog.getAttribute("aria-describedby") ?? "")
        ?.textContent
    ).toBe("Search for a command to run.");
    expect(input.getAttribute("placeholder")).toBe(
      "Type a command or search..."
    );
    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });

    const create = screen.getByRole("option", { name: "Create project" });
    const sync = screen.getByRole("option", { name: "Sync workspace" });
    expect(create).toBeTruthy();
    expect(screen.getByText("Workspace").className).toContain(
      "workspace-heading"
    );
    const descriptionId = sync.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId ?? "")?.textContent).toBe(
      "Pull the latest workspace data"
    );
    expect(
      sync
        .querySelector('[data-slot="command-palette-icon"]')
        ?.getAttribute("aria-hidden")
    ).toBe("true");
    expect(
      sync
        .querySelector('[data-slot="command-palette-shortcut"]')
        ?.getAttribute("aria-hidden")
    ).toBe("true");
  });

  it("keeps falsy content nodes and generates an opaque description id", async () => {
    render(
      <CommandPalette
        items={[
          {
            description: 0,
            icon: 0,
            label: "Create project",
            onSelect: vi.fn(),
            shortcut: 0,
            value: "create project",
          },
        ]}
      />
    );
    openWithHotkey();

    const action = await screen.findByRole("option", {
      name: "Create project",
    });
    const descriptionId = action.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    expect(descriptionId).not.toContain("create project");
    expect(document.getElementById(descriptionId ?? "")?.textContent).toBe("0");
    expect(
      action.querySelector('[data-slot="command-palette-icon"]')?.textContent
    ).toBe("0");
    expect(
      action.querySelector('[data-slot="command-palette-shortcut"]')
        ?.textContent
    ).toBe("0");
  });

  it("executes one synchronous action and closes after success", async () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CommandPalette
        items={[{ label: "Create project", onSelect, value: "create" }]}
        onOpenChange={onOpenChange}
      />
    );
    openWithHotkey();
    const action = await screen.findByRole("option", {
      name: "Create project",
    });

    fireEvent.click(action);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it.each([
    {
      items: [{ label: "Blank", onSelect: vi.fn(), value: "  " }],
      message: "non-empty",
      name: "blank action values",
    },
    {
      items: [
        { label: "One", onSelect: vi.fn(), value: "duplicate" },
        { label: "Two", onSelect: vi.fn(), value: "duplicate" },
      ],
      message: "duplicate",
      name: "duplicate action values",
    },
    {
      items: [
        { label: "One", onSelect: vi.fn(), value: "duplicate" },
        {
          items: [],
          label: "Group",
          type: "group" as const,
          value: "duplicate",
        },
      ],
      message: "duplicate",
      name: "duplicate action and group values",
    },
    {
      items: [
        {
          items: [
            { label: "One", onSelect: vi.fn(), value: "duplicate" },
            { label: "Two", onSelect: vi.fn(), value: "duplicate" },
          ],
          label: "Group",
          type: "group" as const,
          value: "group",
        },
      ],
      message: "duplicate",
      name: "duplicate values inside a group",
    },
    {
      items: [
        {
          items: [],
          label: "Group",
          type: "group" as const,
          value: " ",
        },
      ],
      message: "non-empty",
      name: "blank group values",
    },
  ])("fails fast for $name", ({ items, message }) => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() =>
      render(
        <CommandPalette
          items={items as ComponentProps<typeof CommandPalette>["items"]}
        />
      )
    ).toThrow(message);
  });

  it("composes an optional caller trigger and restores focus after Escape", async () => {
    const onClick = vi.fn();
    const triggerRef = createRef<HTMLButtonElement>();
    render(
      <CommandPalette
        hotkey={false}
        items={baseItems}
        trigger={
          <button
            aria-label="Open workspace commands"
            id="workspace-trigger"
            onClick={onClick}
            ref={triggerRef}
            type="button"
          >
            Commands
          </button>
        }
      />
    );
    const trigger = screen.getByRole("button", {
      name: "Open workspace commands",
    });

    expect(trigger.id).toBe("workspace-trigger");
    expect(triggerRef.current).toBe(trigger);
    fireEvent.click(trigger);

    expect(onClick).toHaveBeenCalledTimes(1);
    const input = await screen.findByRole("combobox", {
      name: "Search commands",
    });
    fireEvent.keyDown(input, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("keeps a disabled trigger closed", () => {
    render(
      <CommandPalette
        hotkey={false}
        items={baseItems}
        trigger={
          <button disabled type="button">
            Commands
          </button>
        }
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Commands" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("composes callback trigger refs", () => {
    const ref = vi.fn<(node: HTMLButtonElement | null) => void>();
    const view = render(
      <CommandPalette
        hotkey={false}
        items={baseItems}
        trigger={
          <button ref={ref} type="button">
            Commands
          </button>
        }
      />
    );

    expect(ref).toHaveBeenCalledWith(
      screen.getByRole("button", { name: "Commands" })
    );
    view.unmount();
    expect(ref).toHaveBeenLastCalledWith(null);
  });

  it("filters by value, label, and keywords and hides empty groups", () => {
    render(<CommandPalette defaultOpen hotkey={false} items={baseItems} />);
    const input = screen.getByRole("combobox", { name: "Search commands" });

    fireEvent.change(input, { target: { value: "create-project" } });
    expect(screen.getByRole("option", { name: "Create project" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Sync workspace" })).toBeNull();
    expect(screen.queryByRole("group", { name: "Workspace" })).toBeNull();

    fireEvent.change(input, { target: { value: "Sync workspace" } });
    expect(screen.getByRole("option", { name: "Sync workspace" })).toBeTruthy();

    fireEvent.change(input, { target: { value: "refresh" } });
    expect(screen.getByRole("option", { name: "Sync workspace" })).toBeTruthy();
  });

  it("keeps disabled actions visible and searchable but inactive", () => {
    const onSelect = vi.fn();
    render(
      <CommandPalette
        defaultOpen
        hotkey={false}
        items={[
          {
            disabled: true,
            keywords: ["locked"],
            label: "Delete project",
            onSelect,
            value: "delete",
          },
        ]}
      />
    );
    const input = screen.getByRole("combobox", { name: "Search commands" });
    fireEvent.change(input, { target: { value: "locked" } });
    const action = screen.getByRole("option", { name: "Delete project" });

    expect(action.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(action);
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("executes the active action with Enter", async () => {
    const onSelect = vi.fn();
    render(
      <CommandPalette
        defaultOpen
        hotkey={false}
        items={[{ label: "Create project", onSelect, value: "create" }]}
      />
    );

    fireEvent.keyDown(
      screen.getByRole("combobox", { name: "Search commands" }),
      { key: "Enter" }
    );

    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it.each([
    { expected: "Second action", loop: true },
    { expected: "First action", loop: false },
  ])("delegates loop=$loop keyboard wrapping", ({ expected, loop }) => {
    render(
      <CommandPalette
        defaultOpen
        hotkey={false}
        items={[
          { label: "First action", onSelect: vi.fn(), value: "first" },
          { label: "Second action", onSelect: vi.fn(), value: "second" },
        ]}
        loop={loop}
      />
    );
    const input = screen.getByRole("combobox", { name: "Search commands" });

    fireEvent.keyDown(input, { key: "ArrowUp" });

    expect(
      screen
        .getByRole("option", { name: expected })
        .getAttribute("aria-selected")
    ).toBe("true");
  });

  it("merges copy and ClassValue customization without changing structure", () => {
    render(
      <CommandPalette
        className={["surface-x", { active: true }]}
        defaultOpen
        description="Find a workspace command."
        emptyClassName="empty-x"
        emptyMessage="Nothing matched."
        groupClassName="group-x"
        headingClassName="heading-x"
        hotkey={false}
        inputClassName="input-x"
        inputLabel="Find commands"
        itemClassName="item-x"
        items={baseItems}
        listClassName="list-x"
        placeholder="Search workspace..."
        shortcutClassName="shortcut-x"
        title="Workspace commands"
      />
    );

    expect(
      screen.getByRole("dialog", { name: "Workspace commands" }).className
    ).toContain("surface-x");
    expect(
      screen.getByRole("combobox", { name: "Find commands" }).className
    ).toContain("input-x");
    expect(screen.getByRole("listbox").className).toContain("list-x");
    expect(
      screen.getByRole("option", { name: "Create project" }).className
    ).toContain("item-x");
    expect(screen.getByText("Workspace").className).toContain("heading-x");
    expect(
      document.querySelector('[data-slot="command-group"]')?.className
    ).toContain("group-x");
    expect(
      document.querySelector('[data-slot="command-palette-shortcut"]')
        ?.className
    ).toContain("shortcut-x");

    fireEvent.change(screen.getByRole("combobox", { name: "Find commands" }), {
      target: { value: "no-match" },
    });
    expect(screen.getByText("Nothing matched.").className).toContain("empty-x");
  });

  it("owns generated structure, handlers, and derived pending state at runtime", () => {
    const pending = deferred();
    const hostileClick = vi.fn();
    const onSelect = vi.fn(() => pending.promise);
    const hostileProps = {
      "aria-modal": "false",
      children: <span>Forged root child</span>,
      commandProps: { role: "tree" },
      dangerouslySetInnerHTML: { __html: "Forged root HTML" },
      defaultOpen: true,
      dialogProps: { role: "alertdialog" },
      filter: () => 0,
      inputProps: { disabled: false },
      itemProps: { role: "button" },
      items: [
        {
          "aria-busy": "false",
          "aria-disabled": "false",
          "aria-selected": "false",
          children: <span>Forged item child</span>,
          "data-disabled": "false",
          "data-selected": "false",
          "data-slot": "forged-item",
          dangerouslySetInnerHTML: { __html: "Forged item HTML" },
          label: "Run safe command",
          onClick: hostileClick,
          onSelect,
          render: <button type="button">Forged item render</button>,
          role: "button",
          value: "safe-command",
        },
        {
          "aria-label": "Forged group name",
          children: <span>Forged group child</span>,
          "data-slot": "forged-group",
          dangerouslySetInnerHTML: { __html: "Forged group HTML" },
          items: [
            {
              label: "Other safe command",
              onSelect: vi.fn(),
              value: "other-command",
            },
          ],
          label: "Safe group",
          render: <section>Forged group render</section>,
          role: "tree",
          type: "group",
          value: "safe-group",
        },
      ],
      listProps: { "aria-busy": false },
      render: <section>Forged root render</section>,
      role: "alertdialog",
      rootProps: { children: "Forged" },
      shouldFilter: false,
      slots: { item: "Forged" },
      value: "forged-query",
    } as unknown as CommandPaletteProps;
    render(<CommandPalette {...hostileProps} />);

    const dialog = screen.getByRole("dialog", { name: "Command palette" });
    const item = screen.getByRole("option", { name: "Run safe command" });
    const group = screen.getByRole("group", { name: "Safe group" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(item.getAttribute("data-slot")).toBe("command-item");
    expect(group).toBeTruthy();
    expect(document.querySelector('[data-slot="command-group"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="forged-group"]')).toBeNull();
    expect(screen.queryByText(FORGED_TEXT_PATTERN)).toBeNull();

    fireEvent.click(item);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(hostileClick).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox").getAttribute("aria-busy")).toBe("true");
    expect(item.getAttribute("aria-disabled")).toBe("true");
    expect(
      screen
        .getByRole("combobox", { name: "Search commands" })
        .hasAttribute("disabled")
    ).toBe(true);
  });

  it.each([
    { event: { altKey: true }, name: "Alt" },
    { event: { repeat: true }, name: "repeat" },
    { event: { isComposing: true }, name: "IME" },
    { event: { shiftKey: true }, name: "Shift" },
  ])("ignores $name-modified hotkeys", ({ event }) => {
    render(<CommandPalette items={baseItems} />);

    fireEvent.keyDown(document, {
      key: "k",
      ...getPlatformModifier(),
      ...event,
    });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("ignores already prevented hotkeys", () => {
    render(<CommandPalette items={baseItems} />);
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "k",
      ...getPlatformModifier(),
    });
    event.preventDefault();

    document.dispatchEvent(event);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it.each([
    "input",
    "textarea",
    "select",
    "contenteditable",
  ])("does not hijack Mod+K from %s editing targets", (kind) => {
    render(<CommandPalette items={baseItems} />);
    let target: HTMLElement;
    if (kind === "textarea") {
      target = document.createElement("textarea");
    } else if (kind === "select") {
      target = document.createElement("select");
    } else if (kind === "contenteditable") {
      target = document.createElement("div");
      target.setAttribute("contenteditable", "true");
    } else {
      target = document.createElement("input");
    }
    document.body.append(target);

    fireEvent.keyDown(target, { key: "k", ...getPlatformModifier() });

    expect(screen.queryByRole("dialog")).toBeNull();
    target.remove();
  });

  it("disables and cleans up the global hotkey listener", () => {
    const disabled = render(
      <CommandPalette hotkey={false} items={baseItems} />
    );
    openWithHotkey();
    expect(screen.queryByRole("dialog")).toBeNull();
    disabled.unmount();

    const enabled = render(<CommandPalette items={baseItems} />);
    enabled.unmount();
    openWithHotkey();

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it.each([
    { accepted: { metaKey: true }, platform: "MacIntel" },
    { accepted: { ctrlKey: true }, platform: "Linux x86_64" },
  ])("uses only the platform Mod key on $platform", ({
    accepted,
    platform,
  }) => {
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue(platform);
    render(<CommandPalette items={baseItems} />);
    const rejected =
      "metaKey" in accepted ? { ctrlKey: true } : { metaKey: true };

    fireEvent.keyDown(document, { key: "k", ...rejected });
    fireEvent.keyDown(document, { ctrlKey: true, key: "k", metaKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.keyDown(document, { key: "k", ...accepted });
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("treats open as authoritative over defaultOpen", () => {
    render(<CommandPalette defaultOpen items={baseItems} open={false} />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("preserves query when a controlled parent refuses close", async () => {
    const onOpenChange = vi.fn();
    const view = render(
      <CommandPalette
        hotkey={false}
        items={baseItems}
        onOpenChange={onOpenChange}
        open
      />
    );
    const input = screen.getByRole("combobox", { name: "Search commands" });
    fireEvent.change(input, { target: { value: "refresh" } });

    fireEvent.keyDown(input, { key: "Escape" });

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("refresh");

    view.rerender(
      <CommandPalette
        hotkey={false}
        items={baseItems}
        onOpenChange={onOpenChange}
        open={false}
      />
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    view.rerender(
      <CommandPalette
        hotkey={false}
        items={baseItems}
        onOpenChange={onOpenChange}
        open
      />
    );

    expect(
      (
        screen.getByRole("combobox", {
          name: "Search commands",
        }) as HTMLInputElement
      ).value
    ).toBe("");
  });

  it("unlocks after synchronous success when a controlled parent refuses close", () => {
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <CommandPalette
        hotkey={false}
        items={[{ label: "Save project", onSelect, value: "save" }]}
        onOpenChange={onOpenChange}
        open
      />
    );
    const input = screen.getByRole("combobox", { name: "Search commands" });
    fireEvent.change(input, { target: { value: "save" } });

    fireEvent.click(screen.getByRole("option", { name: "Save project" }));
    fireEvent.click(screen.getByRole("option", { name: "Save project" }));

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenNthCalledWith(1, false);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("save");
  });

  it("locks every action synchronously and exposes pending semantics", async () => {
    const pending = deferred();
    const run = vi.fn(() => pending.promise);
    const other = vi.fn();
    render(
      <CommandPalette
        defaultOpen
        hotkey={false}
        items={[
          { label: "Run import", onSelect: run, value: "run" },
          { label: "Other command", onSelect: other, value: "other" },
        ]}
        loadingClassName="loading-x"
        loadingMessage={<span>Import running</span>}
      />
    );
    const runItem = screen.getByRole("option", { name: "Run import" });

    fireEvent.click(runItem);
    fireEvent.click(runItem);
    fireEvent.click(screen.getByRole("option", { name: "Other command" }));

    expect(run).toHaveBeenCalledTimes(1);
    expect(other).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox").getAttribute("aria-busy")).toBe("true");
    expect(
      screen
        .getByRole("combobox", { name: "Search commands" })
        .hasAttribute("disabled")
    ).toBe(true);
    for (const item of screen.getAllByRole("option")) {
      expect(item.getAttribute("aria-disabled")).toBe("true");
    }
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("Import running");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.className).toContain("loading-x");
    expect(screen.getByRole("listbox").contains(status)).toBe(false);
    expect(
      runItem
        .querySelector('[data-slot="command-palette-spinner"]')
        ?.getAttribute("aria-hidden")
    ).toBe("true");

    await act(async () => pending.resolve());
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("keeps query, reports a synchronous throw, refocuses, and retries", async () => {
    const onSelect = vi
      .fn<() => void>()
      .mockImplementationOnce(() => {
        throw new Error("sync failure");
      })
      .mockImplementationOnce(() => undefined);
    render(
      <CommandPalette
        defaultOpen
        errorClassName="error-x"
        errorMessage={<span>Could not run</span>}
        hotkey={false}
        items={[
          {
            keywords: ["retry"],
            label: "Retry command",
            onSelect,
            value: "retry-command",
          },
        ]}
      />
    );
    const input = screen.getByRole("combobox", { name: "Search commands" });
    fireEvent.change(input, { target: { value: "retry" } });

    fireEvent.click(screen.getByRole("option", { name: "Retry command" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Could not run");
    expect(alert.className).toContain("error-x");
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("retry");
    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });

    fireEvent.click(screen.getByRole("option", { name: "Retry command" }));
    expect(onSelect).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("keeps a rejected action open and retryable", async () => {
    const failed = deferred();
    const onSelect = vi
      .fn<() => PromiseLike<void> | void>()
      .mockImplementationOnce(() => failed.promise)
      .mockImplementationOnce(() => undefined);
    render(
      <CommandPalette
        defaultOpen
        hotkey={false}
        items={[{ label: "Publish project", onSelect, value: "publish" }]}
      />
    );
    const input = screen.getByRole("combobox", { name: "Search commands" });
    fireEvent.click(screen.getByRole("option", { name: "Publish project" }));

    await act(async () => failed.reject(new Error("network")));

    expect(screen.getByRole("alert").textContent).toBe(
      "Command failed. Try again."
    );
    expect(screen.getByRole("listbox").hasAttribute("aria-busy")).toBe(false);
    expect(input.hasAttribute("disabled")).toBe(false);
    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });

    fireEvent.click(screen.getByRole("option", { name: "Publish project" }));
    expect(onSelect).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("remounts the alert for consecutive synchronous failures", () => {
    const onSelect = vi.fn(() => {
      throw new Error("failure");
    });
    render(
      <CommandPalette
        defaultOpen
        hotkey={false}
        items={[{ label: "Fail command", onSelect, value: "fail" }]}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "Fail command" }));
    const firstAlert = screen.getByRole("alert");
    fireEvent.click(screen.getByRole("option", { name: "Fail command" }));

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("alert")).not.toBe(firstAlert);
  });

  it("assimilates custom PromiseLike actions", async () => {
    const onSelect = vi.fn(
      () =>
        ({
          // biome-ignore lint/suspicious/noThenProperty: verifies PromiseLike assimilation.
          then: (resolve: () => void) => resolve(),
        }) as PromiseLike<void>
    );
    render(
      <CommandPalette
        defaultOpen
        hotkey={false}
        items={[{ label: "Thenable command", onSelect, value: "thenable" }]}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "Thenable command" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("turns a throwing then getter into a retryable error", async () => {
    // biome-ignore lint/suspicious/noThenProperty: verifies a hostile PromiseLike getter.
    const hostileThenable = Object.defineProperty({}, "then", {
      get: () => {
        throw new Error("then getter failure");
      },
    }) as PromiseLike<void>;
    render(
      <CommandPalette
        defaultOpen
        hotkey={false}
        items={[
          {
            label: "Hostile thenable",
            onSelect: () => hostileThenable,
            value: "hostile-thenable",
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("option", { name: "Hostile thenable" }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen
        .getByRole("combobox", { name: "Search commands" })
        .hasAttribute("disabled")
    ).toBe(false);
  });

  it("keeps error after a refused close and clears it after actual close", async () => {
    const onOpenChange = vi.fn();
    const view = render(
      <CommandPalette
        hotkey={false}
        items={[
          {
            keywords: ["retry"],
            label: "Fail command",
            onSelect: () => {
              throw new Error("failure");
            },
            value: "fail",
          },
        ]}
        onOpenChange={onOpenChange}
        open
      />
    );
    const input = screen.getByRole("combobox", { name: "Search commands" });
    fireEvent.change(input, { target: { value: "retry" } });
    fireEvent.click(screen.getByRole("option", { name: "Fail command" }));
    expect(screen.getByRole("alert")).toBeTruthy();

    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(screen.getByRole("alert")).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("retry");

    view.rerender(
      <CommandPalette
        hotkey={false}
        items={[]}
        onOpenChange={onOpenChange}
        open={false}
      />
    );
    view.rerender(
      <CommandPalette
        hotkey={false}
        items={[]}
        onOpenChange={onOpenChange}
        open
      />
    );
    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      (
        screen.getByRole("combobox", {
          name: "Search commands",
        }) as HTMLInputElement
      ).value
    ).toBe("");
  });

  it("unlocks after async success when a controlled parent refuses close", async () => {
    const pending = deferred();
    const onOpenChange = vi.fn();
    const onSelect = vi
      .fn<() => PromiseLike<void> | void>()
      .mockImplementationOnce(() => pending.promise)
      .mockImplementationOnce(() => undefined);
    render(
      <CommandPalette
        hotkey={false}
        items={[{ label: "Save project", onSelect, value: "save" }]}
        onOpenChange={onOpenChange}
        open
      />
    );
    const input = screen.getByRole("combobox", { name: "Search commands" });
    fireEvent.change(input, { target: { value: "save" } });
    fireEvent.click(screen.getByRole("option", { name: "Save project" }));

    await act(async () => pending.resolve());
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.queryByRole("status")).toBeNull();
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("save");

    fireEvent.click(screen.getByRole("option", { name: "Save project" }));
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it.each([
    "fulfill",
    "reject",
  ])("ignores stale %s after actual close and lets the new session continue", async (settlement) => {
    const stale = deferred();
    const current = deferred();
    const onOpenChange = vi.fn();
    const onSelect = vi
      .fn<() => PromiseLike<void>>()
      .mockImplementationOnce(() => stale.promise)
      .mockImplementationOnce(() => current.promise);
    const view = render(
      <CommandPalette
        hotkey={false}
        items={[{ label: "Sync project", onSelect, value: "sync" }]}
        onOpenChange={onOpenChange}
        open
      />
    );
    fireEvent.click(screen.getByRole("option", { name: "Sync project" }));
    expect(screen.getByRole("listbox").getAttribute("aria-busy")).toBe("true");

    view.rerender(
      <CommandPalette
        hotkey={false}
        items={[{ label: "Sync project", onSelect, value: "sync" }]}
        onOpenChange={onOpenChange}
        open={false}
      />
    );
    view.rerender(
      <CommandPalette
        hotkey={false}
        items={[{ label: "Sync project", onSelect, value: "sync" }]}
        onOpenChange={onOpenChange}
        open
      />
    );
    fireEvent.click(screen.getByRole("option", { name: "Sync project" }));
    expect(onSelect).toHaveBeenCalledTimes(2);

    await act(() => {
      if (settlement === "fulfill") {
        stale.resolve();
      } else {
        stale.reject(new Error("stale"));
      }
    });

    expect(screen.getByRole("listbox").getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    await act(async () => current.reject(new Error("current")));
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("dismisses pending work, reopens unlocked, and ignores settlement after unmount", async () => {
    const stale = deferred();
    const current = deferred();
    const onOpenChange = vi.fn();
    const onSelect = vi
      .fn<() => PromiseLike<void>>()
      .mockImplementationOnce(() => stale.promise)
      .mockImplementationOnce(() => current.promise);
    const view = render(
      <CommandPalette
        defaultOpen
        items={[{ label: "Sync project", onSelect, value: "sync" }]}
        onOpenChange={onOpenChange}
      />
    );
    fireEvent.click(screen.getByRole("option", { name: "Sync project" }));
    fireEvent.keyDown(
      screen.getByRole("combobox", { name: "Search commands" }),
      { key: "Escape" }
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    openWithHotkey();
    fireEvent.click(
      await screen.findByRole("option", { name: "Sync project" })
    );
    expect(onSelect).toHaveBeenCalledTimes(2);

    const closeRequests = onOpenChange.mock.calls.filter(
      ([nextOpen]) => nextOpen === false
    ).length;
    view.unmount();
    await act(() => {
      stale.resolve();
      current.resolve();
    });
    expect(
      onOpenChange.mock.calls.filter(([nextOpen]) => nextOpen === false)
    ).toHaveLength(closeRequests);
  });
});
