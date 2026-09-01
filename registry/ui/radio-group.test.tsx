import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  RadioGroup,
  type RadioGroupItem,
  type RadioGroupProps,
} from "./radio-group";

const baseItems: RadioGroupItem[] = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
];

const radio = (name: string) => screen.getByRole("radio", { name });

describe("RadioGroup", () => {
  it("renders a radio for each item, named by its label", () => {
    render(<RadioGroup items={baseItems} />);

    expect(radio("Option A")).toBeTruthy();
    expect(radio("Option B")).toBeTruthy();
  });

  it("selects an option on click (uncontrolled)", () => {
    render(<RadioGroup items={baseItems} />);

    expect(radio("Option A").getAttribute("aria-checked")).toBe("false");

    fireEvent.click(radio("Option A"));

    expect(radio("Option A").getAttribute("aria-checked")).toBe("true");
    expect(radio("Option B").getAttribute("aria-checked")).toBe("false");
  });

  it("honors defaultValue for the initial selection", () => {
    render(<RadioGroup defaultValue="b" items={baseItems} />);

    expect(radio("Option B").getAttribute("aria-checked")).toBe("true");
  });

  it("supports the controlled mode", () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup items={baseItems} onValueChange={onValueChange} value="a" />
    );

    fireEvent.click(radio("Option B"));

    expect(onValueChange).toHaveBeenCalledWith("b", expect.anything());
    // Controlled: selection does not move until the value prop changes.
    expect(radio("Option A").getAttribute("aria-checked")).toBe("true");
    expect(radio("Option B").getAttribute("aria-checked")).toBe("false");
  });

  it("disables a single item", () => {
    const items: RadioGroupItem[] = [
      baseItems[0],
      { ...baseItems[1], disabled: true },
    ];
    render(<RadioGroup items={items} />);

    const disabled = radio("Option B");
    expect(
      disabled.matches('[disabled], [data-disabled], [aria-disabled="true"]')
    ).toBe(true);

    fireEvent.click(disabled);
    expect(disabled.getAttribute("aria-checked")).toBe("false");
  });

  it("disables every item with the group disabled prop", () => {
    render(<RadioGroup disabled items={baseItems} />);

    fireEvent.click(radio("Option A"));
    expect(radio("Option A").getAttribute("aria-checked")).toBe("false");
  });

  it("renders a description and associates it via aria-describedby", () => {
    render(
      <RadioGroup
        items={[
          { description: "The default plan", label: "Free", value: "free" },
          { label: "Pro", value: "pro" },
        ]}
      />
    );

    const description = screen.getByText("The default plan");
    expect(description).toBeTruthy();
    expect(radio("Free").getAttribute("aria-describedby")).toBe(description.id);
    // An option without a description must not carry a dangling aria-describedby.
    expect(radio("Pro").getAttribute("aria-describedby")).toBeNull();
  });

  it("merges root-level and per-item classNames", () => {
    const items: RadioGroupItem[] = [
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
      <RadioGroup
        descriptionClassName="desc-root"
        itemClassName="item-root"
        items={items}
        labelClassName="label-root"
        optionClassName="option-root"
      />
    );

    expect(container.querySelector("label")?.className).toContain(
      "option-root"
    );
    expect(container.querySelector("label")?.className).toContain(
      "option-item"
    );

    const control = radio("Option A");
    expect(control.className).toContain("item-root");
    expect(control.className).toContain("item-item");

    expect(screen.getByText("Option A").className).toContain("label-root");
    expect(screen.getByText("Option A").className).toContain("label-item");
    expect(screen.getByText("with desc").className).toContain("desc-root");
    expect(screen.getByText("with desc").className).toContain("desc-item");
  });

  it("renders the group but no radios for an empty array", () => {
    const { container } = render(<RadioGroup items={[]} />);

    expect(container.querySelector('[data-slot="radio-group"]')).not.toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("owns generated structure, role, ARIA state, and primitive markers", () => {
    const nativeOnChange = vi.fn();
    const hostileProps = {
      "aria-disabled": true,
      "aria-readonly": true,
      "aria-required": true,
      children: "Forged child",
      "data-dirty": "",
      "data-disabled": "",
      "data-filled": "",
      "data-focused": "",
      "data-invalid": "",
      "data-slot": "forged-radio-group",
      "data-touched": "",
      "data-valid": "",
      dangerouslySetInnerHTML: { __html: "Forged HTML" },
      onChange: nativeOnChange,
      render: <section>Forged render</section>,
      role: "listbox",
    } as unknown as RadioGroupProps;
    const rootRef = createRef<HTMLDivElement>();
    const inputRef = createRef<HTMLInputElement>();
    const onClick = vi.fn();
    const onValueChange = vi.fn();

    expect(() => {
      render(
        <RadioGroup
          {...hostileProps}
          aria-label="Plans"
          disabled={false}
          inputRef={inputRef}
          items={baseItems}
          onClick={onClick}
          onValueChange={onValueChange}
          readOnly={false}
          ref={rootRef}
          required={false}
        />
      );
    }).not.toThrow();

    const root = screen.getByRole("radiogroup", { name: "Plans" });
    expect(rootRef.current).toBe(root);
    expect(inputRef.current).not.toBeNull();
    expect(root.getAttribute("data-slot")).toBe("radio-group");
    expect(root.getAttribute("aria-disabled")).toBeNull();
    expect(root.getAttribute("aria-readonly")).toBeNull();
    expect(root.getAttribute("aria-required")).toBeNull();
    for (const attribute of [
      "data-dirty",
      "data-disabled",
      "data-filled",
      "data-focused",
      "data-invalid",
      "data-touched",
      "data-valid",
    ]) {
      expect(root.getAttribute(attribute)).toBeNull();
    }
    expect(document.body.textContent).not.toContain("Forged");

    fireEvent.click(radio("Option A"));
    expect(onClick).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenCalledWith("a", expect.anything());
    expect(nativeOnChange).not.toHaveBeenCalled();
  });
});
