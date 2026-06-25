import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

const baseItems: BreadcrumbItem[] = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { label: "Accordion" },
];

const sep = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-slot="breadcrumb-separator"]'));

describe("Breadcrumb", () => {
  it("renders earlier items as links and the last item as the current page", () => {
    render(<Breadcrumb items={baseItems} />);

    // Note: BreadcrumbPage also has role="link", so assert tagName === "A" to
    // prove these are real anchors and not the current-page span.
    const home = screen.getByRole("link", { name: "Home" });
    expect(home.tagName).toBe("A");
    expect(home.getAttribute("href")).toBe("/");
    expect(
      screen.getByRole("link", { name: "Docs" }).getAttribute("href")
    ).toBe("/docs");

    const current = screen.getByText("Accordion");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.tagName).not.toBe("A");
  });

  it("renders a non-current item without href as plain text", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Plain" },
          { href: "/docs", label: "Docs" },
          { label: "Leaf" },
        ]}
      />
    );

    expect(screen.queryByRole("link", { name: "Plain" })).toBeNull();
    expect(screen.getByText("Plain")).toBeTruthy();
  });

  it("supports a custom ReactNode label without href", () => {
    render(
      <Breadcrumb items={[{ label: <em>Custom</em> }, { label: "End" }]} />
    );

    expect(screen.getByText("Custom")).toBeTruthy();
  });

  it("keeps keys unique for multiple href-less ReactNode labels", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {
      // Swallow React's potential duplicate-key warning so we can assert on it.
    });

    render(
      <Breadcrumb
        items={[
          { label: <em>Alpha</em> },
          { label: <em>Beta</em> },
          { label: <em>Gamma</em> },
        ]}
      />
    );

    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByText("Beta")).toBeTruthy();
    expect(screen.getByText("Gamma")).toBeTruthy();

    const keyWarning = errorSpy.mock.calls.some((call) =>
      String(call[0]).includes("same key")
    );
    expect(keyWarning).toBe(false);

    errorSpy.mockRestore();
  });

  it("treats an explicit current item as the page and stops the last from auto-currenting", () => {
    render(
      <Breadcrumb
        items={[
          { href: "/", label: "Home" },
          { current: true, href: "/docs", label: "Docs" },
          { href: "/docs/leaf", label: "Leaf" },
        ]}
      />
    );

    expect(screen.getByText("Docs").getAttribute("aria-current")).toBe("page");
    // Last item is a real link because another item is explicitly current.
    expect(
      screen.getByRole("link", { name: "Leaf" }).getAttribute("href")
    ).toBe("/docs/leaf");
  });

  it("lets current:false on the last item opt out of the current page", () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { href: "/", label: "Home" },
          { current: false, label: "Tail" },
        ]}
      />
    );

    expect(container.querySelector('[aria-current="page"]')).toBeNull();
    expect(screen.getByText("Tail")).toBeTruthy();
  });

  it("renders the current page as a span, never an anchor, even with href", () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { href: "/", label: "Home" },
          { href: "/now", label: "Now" },
        ]}
      />
    );

    const current = screen.getByText("Now");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.tagName).not.toBe("A");
    // The current item must not leak a second anchor carrying its href.
    expect(current.hasAttribute("href")).toBe(false);
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });

  it("interleaves separators between items", () => {
    const { container } = render(<Breadcrumb items={baseItems} />);

    expect(sep(container)).toHaveLength(2);
  });

  it("overrides the separator content", () => {
    const { container } = render(
      <Breadcrumb items={baseItems} separator="/" />
    );

    const separators = sep(container);
    expect(separators).toHaveLength(2);
    for (const s of separators) {
      expect(s.textContent).toBe("/");
    }
  });

  const longTrail: BreadcrumbItem[] = [
    { href: "/a", label: "A" },
    { href: "/b", label: "B" },
    { href: "/c", label: "C" },
    { href: "/d", label: "D" },
    { label: "E" },
  ];

  it("collapses long trails into first item, ellipsis, and last item", () => {
    const { container } = render(<Breadcrumb items={longTrail} maxItems={2} />);

    expect(
      container.querySelector('[data-slot="breadcrumb-ellipsis"]')
    ).not.toBeNull();
    expect(screen.getByText("A")).toBeTruthy();
    expect(screen.getByText("E")).toBeTruthy();
    expect(screen.queryByText("B")).toBeNull();
    expect(screen.queryByText("C")).toBeNull();
    expect(screen.queryByText("D")).toBeNull();
    // A | … | E => the ellipsis is flanked by a separator on each side.
    expect(sep(container)).toHaveLength(2);
  });

  it("keeps the last maxItems-1 items when collapsed", () => {
    render(<Breadcrumb items={longTrail} maxItems={3} />);

    // first + last (maxItems - 1) => A, D, E
    expect(screen.getByText("A")).toBeTruthy();
    expect(screen.getByText("D")).toBeTruthy();
    expect(screen.getByText("E")).toBeTruthy();
    expect(screen.queryByText("B")).toBeNull();
    expect(screen.queryByText("C")).toBeNull();
  });

  it("does not collapse when items are within maxItems", () => {
    const { container } = render(<Breadcrumb items={baseItems} maxItems={3} />);

    expect(
      container.querySelector('[data-slot="breadcrumb-ellipsis"]')
    ).toBeNull();
    expect(screen.getByText("Docs")).toBeTruthy();
  });

  it("applies className overrides to every slot", () => {
    const { container } = render(
      <Breadcrumb
        itemClassName="item-cls"
        items={baseItems}
        linkClassName="link-cls"
        listClassName="list-cls"
        pageClassName="page-cls"
        separatorClassName="sep-cls"
      />
    );

    expect(
      container.querySelector('[data-slot="breadcrumb-list"]')?.className
    ).toContain("list-cls");
    expect(
      container.querySelector('[data-slot="breadcrumb-item"]')?.className
    ).toContain("item-cls");
    expect(screen.getByRole("link", { name: "Home" }).className).toContain(
      "link-cls"
    );
    expect(screen.getByText("Accordion").className).toContain("page-cls");
    expect(sep(container)[0]?.className).toContain("sep-cls");
  });

  it("forwards nav props and renders an empty list without crashing", () => {
    const { container } = render(<Breadcrumb aria-label="trail" items={[]} />);

    const nav = container.querySelector('[data-slot="breadcrumb"]');
    expect(nav?.getAttribute("aria-label")).toBe("trail");
    expect(
      container.querySelector('[data-slot="breadcrumb-list"]')
    ).not.toBeNull();
    expect(container.querySelector('[data-slot="breadcrumb-item"]')).toBeNull();
  });
});
