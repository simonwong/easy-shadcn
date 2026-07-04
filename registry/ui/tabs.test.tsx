import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tabs, type TabsItem } from "./tabs";

const baseItems: TabsItem[] = [
  { content: "First content", trigger: "First", value: "first" },
  { content: "Second content", trigger: "Second", value: "second" },
];

describe("Tabs", () => {
  it("renders triggers and shows the default tab content", () => {
    render(<Tabs defaultValue="first" items={baseItems} />);

    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByText("First content")).toBeTruthy();
    expect(screen.queryByText("Second content")).toBeNull();
  });

  it("switches content on trigger click", () => {
    render(<Tabs defaultValue="first" items={baseItems} />);

    fireEvent.click(screen.getByRole("tab", { name: "Second" }));

    expect(screen.getByText("Second content")).toBeTruthy();
    expect(screen.queryByText("First content")).toBeNull();
  });

  it("supports the controlled mode", () => {
    const onValueChange = vi.fn();
    render(
      <Tabs items={baseItems} onValueChange={onValueChange} value="first" />
    );

    fireEvent.click(screen.getByRole("tab", { name: "Second" }));

    expect(onValueChange).toHaveBeenCalledWith("second", expect.anything());
    // Controlled: content does not change until the value prop does.
    expect(screen.getByText("First content")).toBeTruthy();
  });

  it("disables a single item", () => {
    const items: TabsItem[] = [
      baseItems[0],
      { ...baseItems[1], disabled: true },
    ];
    render(<Tabs defaultValue="first" items={items} />);

    const disabledTab = screen.getByRole("tab", { name: "Second" });
    expect(
      disabledTab.matches('[disabled], [data-disabled], [aria-disabled="true"]')
    ).toBe(true);

    fireEvent.click(disabledTab);
    expect(screen.queryByText("Second content")).toBeNull();
  });

  it("keeps inactive panels mounted with the root-level keepMounted", () => {
    render(<Tabs defaultValue="first" items={baseItems} keepMounted />);

    expect(screen.getByText("Second content")).toBeTruthy();
  });

  it("lets an item override the root-level keepMounted", () => {
    const items: TabsItem[] = [
      baseItems[0],
      { ...baseItems[1], keepMounted: false },
    ];
    render(<Tabs defaultValue="first" items={items} keepMounted />);

    expect(screen.queryByText("Second content")).toBeNull();
  });

  it("renders no tab list for empty items", () => {
    const { container } = render(<Tabs items={[]} />);

    expect(container.querySelector('[data-slot="tabs-list"]')).toBeNull();
    expect(container.querySelector('[data-slot="tabs"]')).not.toBeNull();
  });

  it("forwards the variant to the tab list", () => {
    const { container } = render(
      <Tabs defaultValue="first" items={baseItems} variant="line" />
    );

    expect(
      container
        .querySelector('[data-slot="tabs-list"]')
        ?.getAttribute("data-variant")
    ).toBe("line");
  });

  it("merges root-level and per-item classNames", () => {
    const items: TabsItem[] = [
      {
        ...baseItems[0],
        contentClassName: "content-item",
        triggerClassName: "trigger-item",
      },
      baseItems[1],
    ];
    const { container } = render(
      <Tabs
        contentClassName="content-root"
        defaultValue="first"
        items={items}
        listClassName="list-root"
        triggerClassName="trigger-root"
      />
    );

    expect(
      container.querySelector('[data-slot="tabs-list"]')?.className
    ).toContain("list-root");

    const firstTrigger = screen.getByRole("tab", { name: "First" });
    expect(firstTrigger.className).toContain("trigger-root");
    expect(firstTrigger.className).toContain("trigger-item");

    const panel = container.querySelector('[data-slot="tabs-content"]');
    expect(panel?.className).toContain("content-root");
    expect(panel?.className).toContain("content-item");
  });
});
