import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Menu, type MenuItem, type MenuProps } from "./menu";

const items: MenuItem[] = [
  { key: "overview", label: "Overview" },
  { key: "reports", label: "Reports" },
];

describe("Menu", () => {
  it("renders an items-driven vertical navigation menu", () => {
    render(<Menu aria-label="Workspace" items={items} />);

    const menu = screen.getByRole("menu", { name: "Workspace" });
    expect(menu.dataset.mode).toBe("vertical");
    expect(screen.getByRole("menuitem", { name: "Overview" }).tabIndex).toBe(0);
    expect(screen.getByRole("menuitem", { name: "Reports" }).tabIndex).toBe(-1);
  });

  it("selects one leaf through the public value seam", () => {
    const onValueChange = vi.fn();
    render(
      <Menu items={items} onValueChange={onValueChange} value="overview" />
    );

    const overview = screen.getByRole("menuitem", { name: "Overview" });
    const reports = screen.getByRole("menuitem", { name: "Reports" });
    expect(overview.dataset.selected).toBe("true");

    fireEvent.click(reports);

    expect(onValueChange).toHaveBeenCalledWith("reports");
    expect(overview.dataset.selected).toBe("true");
    expect(reports.dataset.selected).toBe("false");
  });

  it("opens and closes an inline submenu through open keys", () => {
    const onOpenKeysChange = vi.fn();
    render(
      <Menu
        items={[
          {
            children: [{ key: "members", label: "Members" }],
            key: "team",
            label: "Team",
          },
        ]}
        mode="inline"
        onOpenKeysChange={onOpenKeysChange}
      />
    );

    const trigger = screen.getByRole("menuitem", { name: "Team" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("menuitem", { name: "Members" })).toBeNull();

    fireEvent.click(trigger);

    expect(onOpenKeysChange).toHaveBeenLastCalledWith(["team"]);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("menuitem", { name: "Members" })).toBeTruthy();

    fireEvent.click(trigger);
    expect(onOpenKeysChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole("menuitem", { name: "Members" })).toBeNull();
  });

  it("supports uncontrolled and multiple selection without changing the items model", () => {
    const onValueChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <Menu
        defaultValue={["overview"]}
        items={items}
        multiple
        onSelect={onSelect}
        onValueChange={onValueChange}
      />
    );

    const overview = screen.getByRole("menuitem", { name: "Overview" });
    const reports = screen.getByRole("menuitem", { name: "Reports" });
    fireEvent.click(reports);
    expect(onValueChange).toHaveBeenLastCalledWith(["overview", "reports"]);
    expect(reports.dataset.selected).toBe("true");
    expect(onSelect).toHaveBeenLastCalledWith("reports", items[1]);

    fireEvent.click(overview);
    expect(onValueChange).toHaveBeenLastCalledWith(["reports"]);
    expect(overview.dataset.selected).toBe("false");
  });

  it("can dispatch actions without owning selection", () => {
    const onSelect = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Menu
        items={items}
        onSelect={onSelect}
        onValueChange={onValueChange}
        selectable={false}
      />
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "Reports" }));

    expect(onSelect).toHaveBeenCalledWith("reports", items[1]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders links, groups, separators, extras, and disabled leaves", () => {
    const onSelect = vi.fn();
    render(
      <Menu
        items={[
          {
            children: [
              {
                extra: "⌘K",
                href: "/search",
                key: "search",
                label: "Search",
                rel: "noreferrer",
                target: "_blank",
              },
              { disabled: true, href: "/admin", key: "admin", label: "Admin" },
            ],
            key: "workspace",
            label: "Workspace",
            type: "group",
          },
          { key: "divider", type: "separator" },
        ]}
        onSelect={onSelect}
      />
    );

    const search = screen.getByRole("menuitem", { name: "Search ⌘K" });
    expect(search.getAttribute("href")).toBe("/search");
    expect(search.getAttribute("target")).toBe("_blank");
    expect(search.getAttribute("rel")).toBe("noreferrer");
    fireEvent.click(search);
    expect(onSelect).toHaveBeenCalledWith(
      "search",
      expect.objectContaining({ key: "search" })
    );
    expect(screen.getByText("Workspace")).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();

    const admin = screen.getByRole("menuitem", { name: "Admin" });
    expect(admin.getAttribute("aria-disabled")).toBe("true");
    expect(admin.getAttribute("href")).toBeNull();
    fireEvent.click(admin);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("keeps open state controlled", () => {
    const onOpenKeysChange = vi.fn();
    render(
      <Menu
        items={[
          {
            children: [{ key: "members", label: "Members" }],
            key: "team",
            label: "Team",
          },
        ]}
        onOpenKeysChange={onOpenKeysChange}
        openKeys={[]}
      />
    );

    const trigger = screen.getByRole("menuitem", { name: "Team" });
    fireEvent.click(trigger);

    expect(onOpenKeysChange).toHaveBeenCalledWith(["team"]);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("menuitem", { name: "Members" })).toBeNull();
  });

  it("closes popup submenus after leaf selection and outside pointer down", () => {
    const nestedItems: MenuItem[] = [
      {
        children: [{ key: "members", label: "Members" }],
        key: "team",
        label: "Team",
      },
    ];
    const onOpenKeysChange = vi.fn();
    const view = render(
      <Menu
        defaultOpenKeys={["team"]}
        items={nestedItems}
        onOpenKeysChange={onOpenKeysChange}
      />
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "Members" }));
    expect(onOpenKeysChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole("menuitem", { name: "Members" })).toBeNull();

    view.rerender(
      <Menu
        defaultOpenKeys={["team"]}
        items={nestedItems}
        key="fresh"
        onOpenKeysChange={onOpenKeysChange}
      />
    );
    fireEvent.pointerDown(document.body);
    expect(onOpenKeysChange).toHaveBeenLastCalledWith([]);
  });

  it("moves focus with Home and End", () => {
    render(<Menu items={items} />);
    const overview = screen.getByRole("menuitem", { name: "Overview" });
    const reports = screen.getByRole("menuitem", { name: "Reports" });

    act(() => overview.focus());
    expect(overview.tabIndex).toBe(0);
    fireEvent.keyDown(overview, { key: "End" });
    expect(document.activeElement).toBe(reports);
    expect(reports.tabIndex).toBe(0);

    fireEvent.keyDown(reports, { key: "Home" });
    expect(document.activeElement).toBe(overview);
  });

  it("opens a submenu from the keyboard and returns focus on Escape", async () => {
    render(
      <Menu
        items={[
          {
            children: [{ key: "members", label: "Members" }],
            key: "team",
            label: "Team",
          },
        ]}
      />
    );
    const trigger = screen.getByRole("menuitem", { name: "Team" });
    act(() => trigger.focus());

    fireEvent.keyDown(trigger, { key: "ArrowRight" });

    const child = await screen.findByRole("menuitem", { name: "Members" });
    await waitFor(() => expect(document.activeElement).toBe(child));
    fireEvent.keyDown(child, { key: "Escape" });

    expect(screen.queryByRole("menuitem", { name: "Members" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("uses horizontal submenu keys and vertical relative focus", async () => {
    render(
      <Menu
        defaultValue="members"
        items={[
          {
            children: [{ key: "members", label: "Members" }],
            icon: <span data-testid="team-icon" />,
            key: "team",
            label: "Team",
          },
          { key: "settings", label: "Settings" },
        ]}
        mode="horizontal"
      />
    );
    const trigger = screen.getByRole("menuitem", { name: "Team" });
    const settings = screen.getByRole("menuitem", { name: "Settings" });
    expect(screen.getByTestId("team-icon")).toBeTruthy();
    expect(trigger.className).toContain("bg-accent");

    act(() => trigger.focus());
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const child = await screen.findByRole("menuitem", { name: "Members" });
    await waitFor(() => expect(document.activeElement).toBe(child));

    fireEvent.keyDown(child, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(trigger);
    expect(screen.queryByRole("menuitem", { name: "Members" })).toBeNull();

    fireEvent.keyDown(trigger, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(settings);
    fireEvent.keyDown(settings, { key: "ArrowUp" });
    expect(document.activeElement).toBe(trigger);
  });

  it("honors a prevented root keyboard handler", () => {
    const onKeyDown = vi.fn((event) => event.preventDefault());
    render(<Menu items={items} onKeyDown={onKeyDown} />);
    const overview = screen.getByRole("menuitem", { name: "Overview" });
    const reports = screen.getByRole("menuitem", { name: "Reports" });
    act(() => overview.focus());

    fireEvent.keyDown(overview, { key: "ArrowDown" });

    expect(onKeyDown).toHaveBeenCalled();
    expect(document.activeElement).not.toBe(reports);
  });

  it("owns generated root structure, role, orientation, and mode", () => {
    const nativeOnChange = vi.fn();
    const hostileProps = {
      "aria-orientation": "horizontal",
      children: "Forged child",
      "data-mode": "forged",
      dangerouslySetInnerHTML: { __html: "Forged HTML" },
      onChange: nativeOnChange,
      role: "listbox",
    } as unknown as MenuProps;
    const unsafeProps = {
      ...hostileProps,
      "aria-label": "Workspace",
      "data-slot": "custom-menu",
      "data-testid": "menu-root",
      items,
      mode: "vertical",
    } as unknown as MenuProps;

    expect(() => {
      render(<Menu {...unsafeProps} />);
    }).not.toThrow();

    const root = screen.getByTestId("menu-root");
    expect(root.tagName).toBe("UL");
    expect(root.getAttribute("role")).toBe("menu");
    expect(root.getAttribute("aria-orientation")).toBe("vertical");
    expect(root.getAttribute("data-mode")).toBe("vertical");
    expect(root.getAttribute("data-slot")).toBe("custom-menu");
    expect(screen.getByRole("menuitem", { name: "Overview" })).toBeTruthy();
    expect(document.body.textContent).not.toContain("Forged");

    fireEvent.change(root);
    expect(nativeOnChange).not.toHaveBeenCalled();
  });

  it("merges object and callback refs without breaking keyboard routing", () => {
    const objectRef = createRef<HTMLUListElement>();
    const callbackNodes: (HTMLUListElement | null)[] = [];
    const onKeyDown = vi.fn();
    const view = render(
      <>
        <Menu aria-label="Object menu" items={items} ref={objectRef} />
        <Menu
          aria-label="Callback menu"
          items={items}
          onKeyDown={onKeyDown}
          ref={(node) => {
            callbackNodes.push(node);
          }}
        />
      </>
    );

    const objectMenu = screen.getByRole("menu", { name: "Object menu" });
    const callbackMenu = screen.getByRole("menu", { name: "Callback menu" });
    expect(objectRef.current).toBe(objectMenu);
    expect(callbackNodes.at(-1)).toBe(callbackMenu);
    const mountedCallbackCount = callbackNodes.length;

    const overview = screen.getAllByRole("menuitem", {
      name: "Overview",
    })[1];
    const reports = screen.getAllByRole("menuitem", { name: "Reports" })[1];
    act(() => overview.focus());
    fireEvent.keyDown(overview, { key: "ArrowDown" });
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(reports);
    fireEvent.click(reports);
    expect(callbackNodes).toHaveLength(mountedCallbackCount);

    view.unmount();
    expect(objectRef.current).toBeNull();
    expect(callbackNodes.at(-1)).toBeNull();
    expect(callbackNodes).toHaveLength(mountedCallbackCount + 1);
  });
});
