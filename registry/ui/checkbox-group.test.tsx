import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CheckboxGroup, type CheckboxGroupItem } from "./checkbox-group";

const baseItems: CheckboxGroupItem[] = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
  { label: "Option C", value: "c" },
];

const box = (name: string) => screen.getByRole("checkbox", { name });

const LABEL_ID_PATTERN = /-0-label$/;
const DESCRIPTION_ID_PATTERN = /-0-description$/;

describe("CheckboxGroup", () => {
  // Slice 1: skeleton + one complete interaction
  it("renders a checkbox for each item, named by its label", () => {
    render(<CheckboxGroup items={baseItems} />);

    expect(box("Option A")).toBeTruthy();
    expect(box("Option B")).toBeTruthy();
    expect(box("Option C")).toBeTruthy();
  });

  it("renders a description only when the item defines one", () => {
    render(
      <CheckboxGroup
        items={[
          { description: "The default plan", label: "Free", value: "free" },
          { label: "Pro", value: "pro" },
        ]}
      />
    );

    expect(screen.getByText("The default plan")).toBeTruthy();
    expect(box("Free").getAttribute("aria-describedby")).toBe(
      screen.getByText("The default plan").id
    );
    // An option without a description must not carry a dangling aria-describedby.
    expect(box("Pro").getAttribute("aria-describedby")).toBeNull();
  });

  it("renders the group root but no checkboxes for an empty array", () => {
    const { container } = render(<CheckboxGroup items={[]} />);

    const root = container.querySelector('[data-slot="checkbox-group"]');
    expect(root).not.toBeNull();
    expect(root?.childElementCount).toBe(0);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("toggles one checkbox on click without affecting others; a second click clears it (uncontrolled)", () => {
    render(<CheckboxGroup items={baseItems} />);

    expect(box("Option A").getAttribute("aria-checked")).toBe("false");

    fireEvent.click(box("Option A"));
    expect(box("Option A").getAttribute("aria-checked")).toBe("true");
    expect(box("Option B").getAttribute("aria-checked")).toBe("false");
    expect(box("Option C").getAttribute("aria-checked")).toBe("false");

    fireEvent.click(box("Option A"));
    expect(box("Option A").getAttribute("aria-checked")).toBe("false");
  });

  it("matches its rendered structure (snapshot)", () => {
    const { container } = render(
      <CheckboxGroup
        items={[{ description: "desc", label: "Only", value: "only" }]}
      />
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  // Slice 2: state modes
  it("honors defaultValue for the initial selection (uncontrolled)", () => {
    render(<CheckboxGroup defaultValue={["a", "c"]} items={baseItems} />);

    expect(box("Option A").getAttribute("aria-checked")).toBe("true");
    expect(box("Option B").getAttribute("aria-checked")).toBe("false");
    expect(box("Option C").getAttribute("aria-checked")).toBe("true");
  });

  it("supports the controlled mode", () => {
    const onValueChange = vi.fn();
    render(
      <CheckboxGroup
        items={baseItems}
        onValueChange={onValueChange}
        value={["a"]}
      />
    );

    fireEvent.click(box("Option B"));

    expect(onValueChange).toHaveBeenCalledWith(["a", "b"], expect.anything());
    // Controlled: selection does not move until the value prop changes.
    expect(box("Option A").getAttribute("aria-checked")).toBe("true");
    expect(box("Option B").getAttribute("aria-checked")).toBe("false");
  });

  // Slice 3: disabled states
  it("disables every checkbox with the group disabled prop", () => {
    render(<CheckboxGroup disabled items={baseItems} />);

    fireEvent.click(box("Option A"));
    expect(box("Option A").getAttribute("aria-checked")).toBe("false");
  });

  it("keeps an item disabled when the group is disabled even if the item sets disabled:false", () => {
    render(
      <CheckboxGroup
        disabled
        items={[{ disabled: false, label: "Option A", value: "a" }]}
      />
    );

    const control = box("Option A");
    expect(
      control.matches('[disabled], [data-disabled], [aria-disabled="true"]')
    ).toBe(true);

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("disables a single item while the group stays enabled", () => {
    render(
      <CheckboxGroup
        items={[baseItems[0], { ...baseItems[1], disabled: true }]}
      />
    );

    const disabled = box("Option B");
    expect(
      disabled.matches('[disabled], [data-disabled], [aria-disabled="true"]')
    ).toBe(true);

    fireEvent.click(disabled);
    expect(disabled.getAttribute("aria-checked")).toBe("false");

    // The other item remains interactive.
    fireEvent.click(box("Option A"));
    expect(box("Option A").getAttribute("aria-checked")).toBe("true");
  });

  // Slice 4: styling and className merging
  it("merges root-level and per-item classNames on all four slots", () => {
    const items: CheckboxGroupItem[] = [
      {
        description: "with desc",
        descriptionClassName: "desc-item",
        itemClassName: "item-item",
        label: "Option A",
        labelClassName: "label-item",
        optionClassName: "option-item",
        value: "a",
      },
      baseItems[1],
    ];
    const { container } = render(
      <CheckboxGroup
        descriptionClassName="desc-root"
        itemClassName="item-root"
        items={items}
        labelClassName="label-root"
        optionClassName="option-root"
      />
    );

    const label = container.querySelector("label");
    expect(label?.className).toContain("option-root");
    expect(label?.className).toContain("option-item");
    // Per-item wins via cn() order.
    expect(label?.className.indexOf("option-root")).toBeLessThan(
      label?.className.indexOf("option-item") ?? -1
    );

    const control = box("Option A");
    expect(control.className).toContain("item-root");
    expect(control.className).toContain("item-item");

    expect(screen.getByText("Option A").className).toContain("label-root");
    expect(screen.getByText("Option A").className).toContain("label-item");
    expect(screen.getByText("with desc").className).toContain("desc-root");
    expect(screen.getByText("with desc").className).toContain("desc-item");
  });

  // Slice 5: accessibility and ID generation
  it("derives label and description ids from the index", () => {
    const { container } = render(
      <CheckboxGroup
        items={[
          { description: "Helper", label: "First", value: "first value" },
          { label: "Second", value: "second" },
        ]}
      />
    );

    const root = container.querySelector('[data-slot="checkbox-group"]');
    const labelledby = box("First").getAttribute("aria-labelledby");
    const describedby = box("First").getAttribute("aria-describedby");

    expect(labelledby).toMatch(LABEL_ID_PATTERN);
    expect(describedby).toMatch(DESCRIPTION_ID_PATTERN);
    expect(root?.querySelector(`#${labelledby}`)?.textContent).toBe("First");
    expect(root?.querySelector(`#${describedby}`)?.textContent).toBe("Helper");

    // A description-less item exposes no aria-describedby.
    expect(box("Second").getAttribute("aria-describedby")).toBeNull();
  });

  it("generates ids unique across component instances", () => {
    render(
      <>
        <CheckboxGroup items={[{ label: "One", value: "one" }]} />
        <CheckboxGroup items={[{ label: "Two", value: "two" }]} />
      </>
    );

    expect(box("One").getAttribute("aria-labelledby")).not.toBe(
      box("Two").getAttribute("aria-labelledby")
    );
  });

  // Slice 6: root element props delegation
  it("forwards className and native div props to the root", () => {
    const { container } = render(
      <CheckboxGroup
        className="root-x"
        data-testid="group"
        items={baseItems}
        style={{ gap: "1rem" }}
      />
    );

    const root = container.querySelector('[data-slot="checkbox-group"]');
    expect(root).toBe(screen.getByTestId("group"));
    expect(root?.className).toContain("root-x");
    // Baked layout is preserved alongside the forwarded className.
    expect(root?.className).toContain("grid");
    expect((root as HTMLElement).style.gap).toBe("1rem");
  });

  it("delegates id to the base-ui group root without crashing", () => {
    // base-ui's CheckboxGroup consumes `id` for field-control registration
    // rather than spreading it onto the root div (Group root delegation), so we
    // only assert it is accepted, not that it lands as a div attribute.
    const { container } = render(
      <CheckboxGroup id="my-group" items={baseItems} />
    );

    expect(
      container.querySelector('[data-slot="checkbox-group"]')
    ).not.toBeNull();
  });
});
