import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  NavigationMenu,
  type NavigationMenuItem,
  type NavigationMenuProps,
} from "./navigation-menu";

const items: NavigationMenuItem[] = [
  {
    value: "products",
    trigger: "Products",
    items: [
      {
        value: "overview",
        content: "Overview",
        href: "#overview",
        active: true,
      },
      {
        value: "automation",
        content: "Automation",
        href: "#automation",
        description: "Connect your tools",
      },
    ],
  },
  {
    value: "resources",
    trigger: "Resources",
    items: [{ value: "docs", content: "Documentation", href: "#docs" }],
  },
  {
    value: "pricing",
    content: "Pricing",
    href: "#pricing",
    target: "_blank",
    rel: "noopener",
  },
];

async function open(name = "Products") {
  const trigger = screen.getByRole("button", { name });
  fireEvent.click(trigger);
  await waitFor(() =>
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
  );
  return trigger;
}

describe("NavigationMenu", () => {
  it("renders a named navigation landmark, native links and no command roles", () => {
    const ref = createRef<HTMLElement>();
    render(<NavigationMenu aria-label="Website" items={items} ref={ref} />);
    expect(ref.current).toBe(
      screen.getByRole("navigation", { name: "Website" })
    );
    const link = screen.getByRole("link", { name: "Pricing" });
    expect(link.getAttribute("href")).toBe("#pricing");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener");
    expect(screen.queryByRole("menubar")).toBeNull();
    expect(screen.queryByRole("menuitem")).toBeNull();
    expect(screen.queryByRole("link", { name: "Overview" })).toBeNull();
  });

  it("keeps route-active state separate from the open panel", async () => {
    render(<NavigationMenu defaultValue="products" items={items} />);
    const link = await screen.findByRole("link", { name: "Overview" });
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(
      screen.getByRole("link", { name: "Pricing" }).hasAttribute("aria-current")
    ).toBe(false);
    expect(screen.getByText("Connect your tools")).toBeTruthy();
    await open("Resources");
    expect(
      await screen.findByRole("link", { name: "Documentation" })
    ).toBeTruthy();
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Overview" })).toBeNull()
    );
  });

  it("closes on same-page link clicks without preventing native navigation", async () => {
    const onValueChange = vi.fn();
    render(<NavigationMenu items={items} onValueChange={onValueChange} />);
    await open();
    const link = await screen.findByRole("link", { name: "Overview" });
    expect(fireEvent.click(link)).toBe(true);
    expect(onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({
        reason: "link-press",
        cancel: expect.any(Function),
      })
    );
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Overview" })).toBeNull()
    );
  });

  it("preserves modified link clicks", async () => {
    render(<NavigationMenu items={items} />);
    await open();
    const link = await screen.findByRole("link", { name: "Overview" });
    expect(fireEvent.click(link, { ctrlKey: true, metaKey: true })).toBe(true);
    expect(link.getAttribute("href")).toBe("#overview");
  });

  it("allows a controlled parent to refuse and then accept opening", async () => {
    const onValueChange = vi.fn();
    const view = render(
      <NavigationMenu
        items={items}
        onValueChange={onValueChange}
        value={null}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Products" }));
    expect(onValueChange).toHaveBeenCalledWith(
      "products",
      expect.objectContaining({ cancel: expect.any(Function) })
    );
    expect(screen.queryByRole("link", { name: "Overview" })).toBeNull();
    view.rerender(
      <NavigationMenu
        items={items}
        onValueChange={onValueChange}
        value="products"
      />
    );
    expect(await screen.findByRole("link", { name: "Overview" })).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "Overview" }));
    expect(onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: "link-press" })
    );
    expect(
      screen
        .getByRole("button", { name: "Products" })
        .getAttribute("aria-expanded")
    ).toBe("true");
    view.rerender(
      <NavigationMenu
        items={items}
        onValueChange={onValueChange}
        value={null}
      />
    );
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Overview" })).toBeNull()
    );
  });

  it("preserves cancellation for uncontrolled closing", async () => {
    render(
      <NavigationMenu
        items={items}
        onValueChange={(value, details) => {
          if (value === null) {
            details.cancel();
          }
        }}
      />
    );
    await open();
    fireEvent.click(await screen.findByRole("link", { name: "Overview" }));
    expect(
      screen
        .getByRole("button", { name: "Products" })
        .getAttribute("aria-expanded")
    ).toBe("true");
  });

  it("delegates arrow navigation and Escape focus restoration", async () => {
    render(<NavigationMenu items={items} />);
    const products = screen.getByRole("button", { name: "Products" });
    act(() => products.focus());
    fireEvent.keyDown(products, { key: "ArrowRight" });
    const resources = screen.getByRole("button", { name: "Resources" });
    await waitFor(() => expect(document.activeElement).toBe(resources));
    fireEvent.keyDown(resources, { key: "ArrowDown" });
    const link = await screen.findByRole("link", { name: "Documentation" });
    await waitFor(() => expect(document.activeElement).toBe(link));
    fireEvent.keyDown(link, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Documentation" })).toBeNull()
    );
    await waitFor(() => expect(document.activeElement).toBe(resources));
  });

  it("supports empty lists and preserves class overrides", async () => {
    const view = render(<NavigationMenu items={[]} />);
    expect(screen.getByRole("navigation")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    view.rerender(
      <NavigationMenu
        className="root"
        contentClassName="panel"
        items={[
          {
            value: "empty",
            trigger: "Empty",
            items: [],
            triggerClassName: "local-trigger",
          },
        ]}
        listClassName="list"
        triggerClassName="global-trigger"
      />
    );
    const trigger = await open("Empty");
    expect(trigger.className).toContain("local-trigger");
    expect(trigger.className).toContain("global-trigger");
    expect(
      screen.getByRole("navigation", { name: "Main navigation" }).className
    ).toContain("root");
    expect(document.querySelector(".panel")).toBeTruthy();
  });

  it("ignores untyped root and link overrides", async () => {
    const unsafe = {
      items: [
        {
          value: "products",
          trigger: "Products",
          items: [
            {
              value: "overview",
              content: "Overview",
              href: "#overview",
              active: true,
              children: "Forged",
              render: <button type="button">Forged</button>,
              closeOnClick: false,
              "aria-current": "false",
              "data-active": "false",
              dangerouslySetInnerHTML: { __html: "Forged" },
            },
          ],
        },
      ],
      role: "menubar",
      children: "Forged",
      render: <div />,
      "data-slot": "forged",
      dangerouslySetInnerHTML: { __html: "Forged" },
    } as unknown as NavigationMenuProps;
    render(<NavigationMenu {...unsafe} />);
    expect(screen.getByRole("navigation").getAttribute("data-slot")).toBe(
      "navigation-menu"
    );
    await open();
    const link = await screen.findByRole("link", { name: "Overview" });
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(screen.queryByText("Forged")).toBeNull();
    fireEvent.click(link);
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Overview" })).toBeNull()
    );
  });
});
