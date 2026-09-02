import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SidebarProps, SidebarTriggerProps } from "./sidebar";
import { Sidebar, SidebarTrigger } from "./sidebar";

const PROJECTS_NAME = /Projects/;

const useViewport = (initialWidth: number) => {
  const listeners = new Set<() => void>();
  const setWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: width,
    });
    for (const listener of listeners) {
      listener();
    }
  };

  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: initialWidth,
  });
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    addEventListener: (_event: string, listener: () => void) => {
      listeners.add(listener);
    },
    dispatchEvent: vi.fn(),
    matches: window.innerWidth < 768,
    media: query,
    onchange: null,
    removeEventListener: (_event: string, listener: () => void) => {
      listeners.delete(listener);
    },
  }));

  return setWidth;
};

describe("Sidebar", () => {
  beforeEach(() => {
    useViewport(1280);
  });

  it("renders the items-driven navigation and main content shell", () => {
    render(
      <Sidebar
        content={
          <>
            <SidebarTrigger />
            <h1>Dashboard</h1>
          </>
        }
        items={[
          { href: "/overview", key: "overview", label: "Overview" },
          { key: "refresh", label: "Refresh" },
        ]}
      />
    );

    expect(
      screen.getByRole("navigation", { name: "Primary navigation" })
    ).not.toBeNull();
    expect(screen.getByRole("main").textContent).toContain("Dashboard");
    expect(
      screen.getByRole("link", { name: "Overview" }).getAttribute("href")
    ).toBe("/overview");
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Refresh" })
        .disabled
    ).toBe(false);
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Toggle sidebar",
      }).disabled
    ).toBe(false);
  });

  it("changes uncontrolled desktop collapse through the public trigger", () => {
    render(
      <Sidebar
        content={<SidebarTrigger />}
        items={[{ key: "overview", label: "Overview" }]}
      />
    );

    const panel = document.querySelector('[data-slot="sidebar"]');
    expect(panel?.getAttribute("data-state")).toBe("expanded");

    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));

    expect(panel?.getAttribute("data-state")).toBe("collapsed");
    expect(document.cookie).toContain("sidebar_state=false");
  });

  it("projects groups, separators, metadata, links, and buttons", () => {
    render(
      <Sidebar
        content={<SidebarTrigger />}
        items={[
          {
            items: [
              {
                extra: "12",
                href: "/projects",
                key: "projects",
                label: "Projects",
              },
              { key: "sync", label: "Sync" },
            ],
            key: "workspace",
            label: "Workspace",
            type: "group",
          },
          { key: "account-divider", type: "separator" },
          { href: "/account", key: "account", label: "Account" },
        ]}
      />
    );

    expect(screen.getByText("Workspace")).not.toBeNull();
    expect(screen.getByText("12")).not.toBeNull();
    expect(screen.getByRole("separator")).not.toBeNull();
    expect(screen.getByRole("link", { name: PROJECTS_NAME })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Sync" })).not.toBeNull();
  });

  it("selects enabled leaves before notifying the caller", () => {
    const order: string[] = [];
    const onSelect = vi.fn(() => order.push("select"));
    const onValueChange = vi.fn(() => order.push("value"));
    render(
      <Sidebar
        content={<SidebarTrigger />}
        items={[
          { key: "overview", label: "Overview" },
          { disabled: true, key: "billing", label: "Billing" },
        ]}
        onSelect={onSelect}
        onValueChange={onValueChange}
      />
    );

    const overview = screen.getByRole("button", { name: "Overview" });
    fireEvent.click(overview);

    expect(overview.hasAttribute("data-active")).toBe(true);
    expect(overview.getAttribute("aria-current")).toBe("page");
    expect(onValueChange).toHaveBeenCalledWith("overview");
    expect(onSelect).toHaveBeenCalledWith(
      "overview",
      expect.objectContaining({ key: "overview" })
    );
    expect(order).toEqual(["value", "select"]);

    fireEvent.click(screen.getByRole("button", { name: "Billing" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("keeps controlled selection authoritative", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Sidebar
        content={<SidebarTrigger />}
        defaultValue="reports"
        items={[
          { key: "overview", label: "Overview" },
          { key: "reports", label: "Reports" },
        ]}
        onValueChange={onValueChange}
        value="overview"
      />
    );

    const overview = screen.getByRole("button", { name: "Overview" });
    const reports = screen.getByRole("button", { name: "Reports" });
    fireEvent.click(reports);

    expect(onValueChange).toHaveBeenCalledWith("reports");
    expect(overview.hasAttribute("data-active")).toBe(true);
    expect(reports.hasAttribute("data-active")).toBe(false);

    rerender(
      <Sidebar
        content={<SidebarTrigger />}
        defaultValue="reports"
        items={[
          { key: "overview", label: "Overview" },
          { key: "reports", label: "Reports" },
        ]}
        onValueChange={onValueChange}
        value={undefined}
      />
    );

    expect(overview.hasAttribute("data-active")).toBe(false);
    expect(reports.hasAttribute("data-active")).toBe(false);
  });

  it("opens submenus and selects their leaves", () => {
    const onOpenKeysChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Sidebar
        content={<SidebarTrigger />}
        items={[
          {
            items: [
              { href: "/members", key: "members", label: "Members" },
              { key: "invite", label: "Invite" },
            ],
            key: "team",
            label: "Team",
            type: "submenu",
          },
        ]}
        onOpenKeysChange={onOpenKeysChange}
        onValueChange={onValueChange}
      />
    );

    const trigger = screen.getByRole("button", { name: "Team" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("link", { name: "Members" })).toBeNull();

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(onOpenKeysChange).toHaveBeenCalledWith(["team"]);
    fireEvent.click(screen.getByRole("button", { name: "Invite" }));
    expect(onValueChange).toHaveBeenCalledWith("invite");
  });

  it("keeps controlled submenu state authoritative", () => {
    const onOpenKeysChange = vi.fn();
    render(
      <Sidebar
        content={<SidebarTrigger />}
        items={[
          {
            items: [{ key: "profile", label: "Profile" }],
            key: "account",
            label: "Account",
            type: "submenu",
          },
        ]}
        onOpenKeysChange={onOpenKeysChange}
        openKeys={[]}
      />
    );

    const trigger = screen.getByRole("button", { name: "Account" });
    fireEvent.click(trigger);

    expect(onOpenKeysChange).toHaveBeenCalledWith(["account"]);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("button", { name: "Profile" })).toBeNull();
  });

  it("filters open state and callbacks to submenu keys", () => {
    const onOpenKeysChange = vi.fn();
    render(
      <Sidebar
        content={<SidebarTrigger />}
        items={[
          { key: "overview", label: "Overview" },
          {
            items: [{ key: "profile", label: "Profile" }],
            key: "account",
            label: "Account",
            type: "submenu",
          },
        ]}
        onOpenKeysChange={onOpenKeysChange}
        openKeys={["overview", "account", "missing"]}
      />
    );

    const trigger = screen.getByRole("button", { name: "Account" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(trigger);

    expect(onOpenKeysChange).toHaveBeenCalledWith([]);
  });

  it("honors default open submenu keys and drops non-submenu keys", () => {
    const onOpenKeysChange = vi.fn();
    render(
      <Sidebar
        content={<SidebarTrigger />}
        defaultOpenKeys={["overview", "account", "missing"]}
        items={[
          { key: "overview", label: "Overview" },
          {
            items: [{ key: "profile", label: "Profile" }],
            key: "account",
            label: "Account",
            type: "submenu",
          },
        ]}
        onOpenKeysChange={onOpenKeysChange}
      />
    );

    const trigger = screen.getByRole("button", { name: "Account" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: "Profile" })).not.toBeNull();

    fireEvent.click(trigger);
    expect(onOpenKeysChange).toHaveBeenCalledWith([]);
  });

  it("projects shell slots, direction, side, variant, and class seams", () => {
    render(
      <Sidebar
        className="shell-class"
        content={<SidebarTrigger />}
        contentClassName="content-class"
        dir="rtl"
        footer={<span>Signed in</span>}
        footerClassName="footer-class"
        header={<strong>Acme</strong>}
        headerClassName="header-class"
        insetClassName="inset-class"
        items={[{ key: "overview", label: "Overview" }]}
        navigationClassName="navigation-class"
        side="right"
        sidebarClassName="sidebar-class"
        variant="floating"
      />
    );

    expect(screen.getByText("Acme")).not.toBeNull();
    expect(screen.getByText("Signed in")).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-wrapper"]')?.className
    ).toContain("shell-class");
    expect(document.querySelector("nav")?.className).toContain(
      "navigation-class"
    );
    expect(
      document.querySelector('[data-slot="sidebar-header"]')?.className
    ).toContain("header-class");
    expect(
      document.querySelector('[data-slot="sidebar-footer"]')?.className
    ).toContain("footer-class");
    expect(
      document.querySelector('[data-slot="sidebar-inset"]')?.className
    ).toContain("inset-class");
    expect(document.querySelector(".content-class")).not.toBeNull();

    const panel = document.querySelector('[data-slot="sidebar"]');
    expect(panel?.getAttribute("data-side")).toBe("right");
    expect(panel?.getAttribute("data-variant")).toBe("floating");
    expect(
      document
        .querySelector('[data-slot="sidebar-wrapper"]')
        ?.getAttribute("dir")
    ).toBe("rtl");
    expect(
      document.querySelector('[data-slot="sidebar-container"]')?.className
    ).toContain("sidebar-class");
  });

  it("forwards every supported side and variant to the primitive", () => {
    const cases = [
      ["left", "sidebar"],
      ["left", "floating"],
      ["left", "inset"],
      ["right", "sidebar"],
      ["right", "floating"],
      ["right", "inset"],
    ] as const;

    for (const [side, variant] of cases) {
      const { unmount } = render(
        <Sidebar
          content={<SidebarTrigger />}
          items={[{ key: "overview", label: "Overview" }]}
          side={side}
          variant={variant}
        />
      );
      const panel = document.querySelector('[data-slot="sidebar"]');
      expect(panel?.getAttribute("data-side")).toBe(side);
      expect(panel?.getAttribute("data-variant")).toBe(variant);
      unmount();
    }
  });

  it("keeps controlled desktop collapse authoritative", () => {
    const onOpenChange = vi.fn();
    render(
      <Sidebar
        content={<SidebarTrigger />}
        items={[{ key: "overview", label: "Overview" }]}
        onOpenChange={onOpenChange}
        open
      />
    );

    const panel = document.querySelector('[data-slot="sidebar"]');
    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(panel?.getAttribute("data-state")).toBe("expanded");
  });

  it("closes the mobile sheet when an enabled leaf is selected", async () => {
    useViewport(375);
    const onSelect = vi.fn();
    render(
      <Sidebar
        content={<SidebarTrigger />}
        items={[{ key: "overview", label: "Overview" }]}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Overview" }));

    expect(onSelect).toHaveBeenCalledWith(
      "overview",
      expect.objectContaining({ key: "overview" })
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("keeps the mobile sheet open when a submenu toggles", async () => {
    useViewport(375);
    render(
      <Sidebar
        content={<SidebarTrigger />}
        items={[
          {
            items: [{ key: "members", label: "Members" }],
            key: "team",
            label: "Team",
            type: "submenu",
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Team" }));

    expect(screen.getByRole("dialog")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Members" })).not.toBeNull();
  });

  it("closes mobile state before a selection callback unmounts the shell", async () => {
    useViewport(375);

    const Harness = () => {
      const [mounted, setMounted] = useState(true);
      if (!mounted) {
        return <p>Unmounted</p>;
      }
      return (
        <Sidebar
          content={<SidebarTrigger />}
          items={[{ key: "overview", label: "Overview" }]}
          onValueChange={() => setMounted(false)}
        />
      );
    };

    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Overview" }));

    expect(screen.getByText("Unmounted")).not.toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("requests mobile close before a selection callback throws", async () => {
    useViewport(375);
    const failure = new Error("selection failed");
    const caughtErrors: unknown[] = [];
    const handleError = (event: ErrorEvent) => {
      if (event.error === failure) {
        caughtErrors.push(event.error);
        event.preventDefault();
      }
    };
    window.addEventListener("error", handleError);
    render(
      <Sidebar
        content={<SidebarTrigger />}
        items={[{ key: "overview", label: "Overview" }]}
        onValueChange={() => {
          throw failure;
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Overview" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(caughtErrors).toEqual([failure]);
    window.removeEventListener("error", handleError);
  });

  it("preserves selection and submenu state without reviving a stale mobile sheet", async () => {
    const setWidth = useViewport(375);
    render(
      <Sidebar
        content={<SidebarTrigger />}
        defaultOpenKeys={["team"]}
        items={[
          {
            items: [{ href: "#members", key: "members", label: "Members" }],
            key: "team",
            label: "Team",
            type: "submenu",
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("link", { name: "Members" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    act(() => setWidth(1280));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(
      screen.getByRole("button", { name: "Team" }).getAttribute("aria-expanded")
    ).toBe("true");
    expect(
      screen.getByRole("link", { name: "Members" }).getAttribute("aria-current")
    ).toBe("page");

    act(() => setWidth(375));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).not.toBeNull();
    });
    expect(
      screen.getByRole("button", { name: "Team" }).getAttribute("aria-expanded")
    ).toBe("true");
    expect(
      screen.getByRole("link", { name: "Members" }).getAttribute("aria-current")
    ).toBe("page");
  });

  it("rejects navigation shapes outside the finite item model", () => {
    expect(() =>
      render(
        <Sidebar
          content={<SidebarTrigger />}
          items={
            [
              {
                items: [
                  {
                    items: [{ key: "leaf", label: "Leaf" }],
                    key: "nested-group",
                    type: "group",
                  },
                ],
                key: "root-group",
                type: "group",
              },
            ] as unknown as SidebarProps["items"]
          }
        />
      )
    ).toThrow(
      'Sidebar group "root-group" accepts only items, submenus, and separators.'
    );

    expect(() =>
      render(
        <Sidebar
          content={<SidebarTrigger />}
          items={
            [
              {
                items: [{ key: "nested-separator", type: "separator" }],
                key: "root-submenu",
                label: "Root",
                type: "submenu",
              },
            ] as unknown as SidebarProps["items"]
          }
        />
      )
    ).toThrow('Sidebar submenu "root-submenu" accepts only leaf items.');
  });

  it("ignores hostile root and trigger props at runtime", () => {
    const hostileClick = vi.fn();
    const hostileRootProps = {
      "data-mobile": "true",
      "data-slot": "forged-sidebar",
      "data-state": "forged",
      breakpoint: 320,
      children: <span>Forged child</span>,
      collapsible: "none",
      dangerouslySetInnerHTML: { __html: "Forged HTML" },
      hotkey: "x",
      menuProps: { role: "menu" },
      mobileOpen: true,
      onClick: hostileClick,
      persist: false,
      providerProps: { role: "presentation" },
      render: <a href="/forged">Forged root render</a>,
      role: "presentation",
      sheetProps: { modal: false },
      slots: { root: "aside" },
      storageKey: "forged",
    } as unknown as SidebarProps;
    const hostileTriggerProps = {
      "aria-label": "Forged trigger",
      "aria-expanded": true,
      children: "Forged trigger child",
      "data-slot": "forged-trigger",
      dangerouslySetInnerHTML: { __html: "Forged trigger HTML" },
      onClick: hostileClick,
      render: <a href="/forged-trigger">Forged trigger render</a>,
      role: "link",
    } as unknown as SidebarTriggerProps;

    render(
      <Sidebar
        {...hostileRootProps}
        content={<SidebarTrigger {...hostileTriggerProps} label="Open nav" />}
        items={[{ key: "overview", label: "Overview" }]}
      />
    );

    const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]');
    const trigger = screen.getByRole("button", { name: "Open nav" });
    expect(wrapper?.getAttribute("role")).toBeNull();
    expect(document.querySelector('[data-slot="forged-sidebar"]')).toBeNull();
    expect(screen.queryByText("Forged child")).toBeNull();
    expect(screen.queryByText("Forged HTML")).toBeNull();
    expect(screen.queryByText("Forged root render")).toBeNull();
    expect(screen.queryByText("Forged trigger child")).toBeNull();
    expect(screen.queryByText("Forged trigger HTML")).toBeNull();
    expect(screen.queryByText("Forged trigger render")).toBeNull();
    expect(trigger.getAttribute("role")).toBeNull();
    expect(trigger.getAttribute("data-slot")).toBe("sidebar-trigger");
    expect(trigger.getAttribute("aria-expanded")).not.toBe("true");

    fireEvent.click(trigger);
    expect(hostileClick).not.toHaveBeenCalled();
    expect(
      document
        .querySelector('[data-slot="sidebar"]')
        ?.getAttribute("data-collapsible")
    ).toBe("offcanvas");
    expect(
      document
        .querySelector('[data-slot="sidebar"]')
        ?.getAttribute("data-state")
    ).not.toBe("forged");
  });

  it("rejects blank and duplicate keys across the navigation tree", () => {
    expect(() =>
      render(
        <Sidebar
          content={<SidebarTrigger />}
          items={[{ key: " ", label: "Broken" }]}
        />
      )
    ).toThrow('Sidebar item keys must be non-empty. Received " ".');

    expect(() =>
      render(
        <Sidebar
          content={<SidebarTrigger />}
          items={[
            {
              items: [{ key: "same", label: "Child" }],
              key: "same",
              label: "Group",
              type: "group",
            },
          ]}
        />
      )
    ).toThrow('Sidebar item keys must be unique. Received "same" twice.');
  });
});
