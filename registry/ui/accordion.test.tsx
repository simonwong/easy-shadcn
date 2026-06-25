import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Accordion, type AccordionItem } from "./accordion";

const baseItems: AccordionItem[] = [
  { content: "First content", trigger: "First", value: "first" },
  { content: "Second content", trigger: "Second", value: "second" },
];

const trigger = (name: string) => screen.getByRole("button", { name });

describe("Accordion", () => {
  it("renders a trigger for every item", () => {
    render(<Accordion items={baseItems} />);

    expect(trigger("First")).toBeTruthy();
    expect(trigger("Second")).toBeTruthy();
  });

  it("starts collapsed and opens a panel on trigger click", () => {
    render(<Accordion items={baseItems} />);

    expect(screen.queryByText("First content")).toBeNull();

    fireEvent.click(trigger("First"));

    expect(trigger("First").getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("First content")).toBeTruthy();
  });

  it("collapses the open panel when another opens (single mode)", () => {
    render(<Accordion defaultValue={["first"]} items={baseItems} />);

    expect(trigger("First").getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(trigger("Second"));

    expect(trigger("Second").getAttribute("aria-expanded")).toBe("true");
    expect(trigger("First").getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps multiple panels open with the multiple prop", () => {
    render(<Accordion defaultValue={["first"]} items={baseItems} multiple />);

    fireEvent.click(trigger("Second"));

    expect(trigger("First").getAttribute("aria-expanded")).toBe("true");
    expect(trigger("Second").getAttribute("aria-expanded")).toBe("true");
  });

  it("honors defaultValue for the initially open panel", () => {
    render(<Accordion defaultValue={["second"]} items={baseItems} />);

    expect(trigger("Second").getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Second content")).toBeTruthy();
  });

  it("supports the controlled mode", () => {
    const onValueChange = vi.fn();
    render(
      <Accordion
        items={baseItems}
        onValueChange={onValueChange}
        value={["first"]}
      />
    );

    fireEvent.click(trigger("Second"));

    expect(onValueChange).toHaveBeenCalledWith(["second"], expect.anything());
    // Controlled: nothing changes until the value prop does.
    expect(trigger("First").getAttribute("aria-expanded")).toBe("true");
    expect(trigger("Second").getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Second content")).toBeNull();
  });

  it("toggles an open panel closed on re-click", () => {
    render(<Accordion defaultValue={["first"]} items={baseItems} multiple />);

    expect(trigger("First").getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(trigger("First"));

    expect(trigger("First").getAttribute("aria-expanded")).toBe("false");
  });

  it("disables a single item", () => {
    const items: AccordionItem[] = [
      baseItems[0],
      { ...baseItems[1], disabled: true },
    ];
    render(<Accordion items={items} />);

    const disabled = trigger("Second");
    expect(
      disabled.matches('[disabled], [data-disabled], [aria-disabled="true"]')
    ).toBe(true);

    fireEvent.click(disabled);
    expect(disabled.getAttribute("aria-expanded")).toBe("false");
  });

  it("disables every item with the root disabled prop", () => {
    render(<Accordion disabled items={baseItems} />);

    fireEvent.click(trigger("First"));
    expect(trigger("First").getAttribute("aria-expanded")).toBe("false");
  });

  it("merges root-level and per-item classNames", () => {
    const items: AccordionItem[] = [
      {
        ...baseItems[0],
        contentClassName: "content-item",
        itemClassName: "item-item",
        triggerClassName: "trigger-item",
      },
      baseItems[1],
    ];
    const { container } = render(
      <Accordion
        contentClassName="content-root"
        defaultValue={["first"]}
        itemClassName="item-root"
        items={items}
        triggerClassName="trigger-root"
      />
    );

    const firstTrigger = trigger("First");
    expect(firstTrigger.className).toContain("trigger-root");
    expect(firstTrigger.className).toContain("trigger-item");

    const item = container.querySelector('[data-slot="accordion-item"]');
    expect(item?.className).toContain("item-root");
    expect(item?.className).toContain("item-item");

    expect(container.querySelector(".content-root")).not.toBeNull();
    expect(container.querySelector(".content-item")).not.toBeNull();
  });

  it("renders the root but no items for an empty array", () => {
    const { container } = render(<Accordion items={[]} />);

    expect(container.querySelector('[data-slot="accordion"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="accordion-item"]')).toBeNull();
  });
});
