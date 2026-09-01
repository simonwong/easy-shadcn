import { fireEvent, render, screen } from "@testing-library/react";
import { type CSSProperties, createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  ChoiceGroup,
  type ChoiceGroupItem,
  type ChoiceGroupProps,
} from "./choice-group";

const items: ChoiceGroupItem[] = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
];

describe("ChoiceGroup", () => {
  it("defaults to a single radio group through the shared items seam", () => {
    const onValueChange = vi.fn();
    render(<ChoiceGroup items={items} onValueChange={onValueChange} />);

    const email = screen.getByRole("radio", { name: "Email" });
    const sms = screen.getByRole("radio", { name: "SMS" });
    expect(email.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(email);

    expect(email.getAttribute("aria-checked")).toBe("true");
    expect(sms.getAttribute("aria-checked")).toBe("false");
    expect(onValueChange).toHaveBeenCalledWith("email");
  });

  it("adapts multiple selection to checkbox presentation", () => {
    const onValueChange = vi.fn();
    render(
      <ChoiceGroup
        defaultValue={["email"]}
        items={items}
        onValueChange={onValueChange}
        selectionMode="multiple"
      />
    );

    const email = screen.getByRole("checkbox", { name: "Email" });
    const sms = screen.getByRole("checkbox", { name: "SMS" });
    expect(email.getAttribute("aria-checked")).toBe("true");
    expect(sms.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(sms);

    expect(onValueChange).toHaveBeenCalledWith(["email", "sms"]);
    expect(email.getAttribute("aria-checked")).toBe("true");
    expect(sms.getAttribute("aria-checked")).toBe("true");
  });

  it("adapts single selection to toggle array state, including empty", () => {
    const onValueChange = vi.fn();
    render(
      <ChoiceGroup
        defaultValue="email"
        items={items}
        onValueChange={onValueChange}
        presentation="toggle"
      />
    );

    const email = screen.getByRole("button", { name: "Email" });
    const sms = screen.getByRole("button", { name: "SMS" });
    expect(email.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(sms);
    expect(onValueChange).toHaveBeenLastCalledWith("sms");
    expect(sms.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(sms);
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
    expect(sms.getAttribute("aria-pressed")).toBe("false");
  });

  it("adapts multiple selection to toggle presentation and its visual props", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <ChoiceGroup
        defaultValue={["email"]}
        items={items}
        onValueChange={onValueChange}
        orientation="horizontal"
        presentation="toggle"
        selectionMode="multiple"
        size="sm"
        spacing={0}
        variant="outline"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "SMS" }));
    expect(onValueChange).toHaveBeenCalledWith(["email", "sms"]);

    const root = container.querySelector('[data-slot="toggle-group"]');
    expect(root?.getAttribute("data-multiple")).toBe("");
    expect(root?.getAttribute("data-orientation")).toBe("horizontal");
    expect(root?.getAttribute("data-size")).toBe("sm");
    expect(root?.getAttribute("data-spacing")).toBe("0");
    expect(root?.getAttribute("data-variant")).toBe("outline");
  });

  it("keeps each presentation controlled, including an empty single toggle", () => {
    const onRadioChange = vi.fn();
    const radioView = render(
      <ChoiceGroup items={items} onValueChange={onRadioChange} value="email" />
    );
    fireEvent.click(screen.getByRole("radio", { name: "SMS" }));
    expect(onRadioChange).toHaveBeenCalledWith("sms");
    expect(
      screen.getByRole("radio", { name: "Email" }).getAttribute("aria-checked")
    ).toBe("true");
    radioView.unmount();

    const onCheckboxChange = vi.fn();
    const checkboxView = render(
      <ChoiceGroup
        items={items}
        onValueChange={onCheckboxChange}
        selectionMode="multiple"
        value={["email"]}
      />
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "SMS" }));
    expect(onCheckboxChange).toHaveBeenCalledWith(["email", "sms"]);
    expect(
      screen.getByRole("checkbox", { name: "SMS" }).getAttribute("aria-checked")
    ).toBe("false");
    checkboxView.unmount();

    const onToggleChange = vi.fn();
    render(
      <ChoiceGroup
        items={items}
        onValueChange={onToggleChange}
        presentation="toggle"
        value={undefined}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Email" }));
    expect(onToggleChange).toHaveBeenCalledWith("email");
    expect(
      screen.getByRole("button", { name: "Email" }).getAttribute("aria-pressed")
    ).toBe("false");
  });

  it("merges labels, descriptions, aria names, and class slots", () => {
    const { container } = render(
      <ChoiceGroup
        className="root-class"
        controlClassName="control-root"
        data-testid="choices"
        descriptionClassName="description-root"
        items={[
          {
            ariaLabel: "Email notifications",
            controlClassName: "control-item",
            description: "Daily digest",
            descriptionClassName: "description-item",
            label: "Email",
            labelClassName: "label-item",
            optionClassName: "option-item",
            value: "email",
          },
        ]}
        labelClassName="label-root"
        optionClassName="option-root"
        style={{ gap: "1rem" }}
      />
    );

    const control = screen.getByRole("radio", {
      name: "Email notifications",
    });
    const description = screen.getByText("Daily digest");
    expect(control.getAttribute("aria-describedby")).toBe(description.id);
    expect(control.className).toContain("control-root");
    expect(control.className).toContain("control-item");
    expect(screen.getByText("Email").className).toContain("label-root");
    expect(screen.getByText("Email").className).toContain("label-item");
    expect(description.className).toContain("description-root");
    expect(description.className).toContain("description-item");
    expect(container.querySelector("label")?.className).toContain(
      "option-root"
    );
    expect(container.querySelector("label")?.className).toContain(
      "option-item"
    );
    expect(screen.getByTestId("choices").className).toContain("root-class");
    expect(screen.getByTestId("choices").getAttribute("style")).toContain(
      "gap: 1rem"
    );
  });

  it("combines group and item disabled state", () => {
    const view = render(
      <ChoiceGroup
        disabled
        items={[{ disabled: false, label: "Email", value: "email" }]}
        presentation="toggle"
      />
    );
    const groupDisabled = screen.getByRole("button", { name: "Email" });
    expect(groupDisabled.hasAttribute("disabled")).toBe(true);
    view.unmount();

    render(
      <ChoiceGroup
        items={[
          { label: "Email", value: "email" },
          { disabled: true, label: "SMS", value: "sms" },
        ]}
        selectionMode="multiple"
      />
    );
    expect(
      screen
        .getByRole("checkbox", { name: "SMS" })
        .matches('[disabled], [data-disabled], [aria-disabled="true"]')
    ).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", { name: "Email" }));
    expect(
      screen
        .getByRole("checkbox", { name: "Email" })
        .getAttribute("aria-checked")
    ).toBe("true");
  });

  it("renders an empty semantic group for every presentation", () => {
    const view = render(<ChoiceGroup aria-label="Empty" items={[]} />);
    expect(screen.getByRole("radiogroup", { name: "Empty" })).toBeTruthy();
    expect(screen.queryByRole("radio")).toBeNull();
    view.unmount();

    render(
      <ChoiceGroup
        aria-label="Empty toggles"
        items={[]}
        presentation="toggle"
      />
    );
    expect(screen.getByRole("group", { name: "Empty toggles" })).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps empty toggle values stable in uncontrolled and multiple modes", () => {
    const onSingleChange = vi.fn();
    const singleView = render(
      <ChoiceGroup
        items={items}
        onValueChange={onSingleChange}
        presentation="toggle"
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Email" }));
    expect(onSingleChange).toHaveBeenCalledWith("email");
    singleView.unmount();

    const onMultipleChange = vi.fn();
    render(
      <ChoiceGroup
        items={items}
        onValueChange={onMultipleChange}
        presentation="toggle"
        selectionMode="multiple"
        value={undefined}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "SMS" }));
    expect(onMultipleChange).toHaveBeenCalledWith(["sms"]);
  });

  it("connects custom names and descriptions in checkbox and toggle modes", () => {
    const checkboxView = render(
      <ChoiceGroup
        items={[
          {
            ariaLabel: "Email channel",
            description: "Daily digest",
            label: "Email",
            value: "email",
          },
        ]}
        selectionMode="multiple"
      />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Email channel" });
    expect(checkbox.getAttribute("aria-describedby")).toBe(
      screen.getByText("Daily digest").id
    );
    checkboxView.unmount();

    render(
      <ChoiceGroup
        items={[
          {
            ariaLabel: "Email toggle",
            description: "Daily digest",
            label: "Email",
            value: "email",
          },
        ]}
        presentation="toggle"
      />
    );
    const toggle = screen.getByRole("button", { name: "Email toggle" });
    expect(toggle.className).toContain("h-auto");
    expect(toggle.getAttribute("aria-describedby")).toBe(
      screen.getByText("Daily digest").id
    );
  });

  it.each([
    { expectedRole: "radiogroup", props: {} },
    {
      expectedRole: "group",
      props: { selectionMode: "multiple" as const },
    },
    {
      expectedRole: "group",
      props: { presentation: "toggle" as const },
    },
    {
      expectedRole: "group",
      props: {
        presentation: "toggle" as const,
        selectionMode: "multiple" as const,
      },
    },
  ])("owns the $expectedRole root structure and state markers for %#", ({
    expectedRole,
    props,
  }) => {
    const nativeOnChange = vi.fn();
    const hostileProps = {
      "aria-disabled": true,
      "aria-orientation": "vertical",
      children: "Forged child",
      "data-dirty": "",
      "data-disabled": "",
      "data-filled": "",
      "data-focused": "",
      "data-invalid": "",
      "data-multiple": "",
      "data-orientation": "vertical",
      "data-size": "lg",
      "data-spacing": "99",
      "data-touched": "",
      "data-valid": "",
      dangerouslySetInnerHTML: { __html: "Forged HTML" },
      onChange: nativeOnChange,
      render: <section>Forged render</section>,
      role: "listbox",
    } as unknown as ChoiceGroupProps;

    const unsafeProps = {
      ...hostileProps,
      ...props,
      "aria-label": "Channels",
      "data-testid": "choice-root",
      disabled: false,
      items,
      orientation: "horizontal",
    } as unknown as ChoiceGroupProps;

    expect(() => {
      render(<ChoiceGroup {...unsafeProps} />);
    }).not.toThrow();

    const root = screen.getByTestId("choice-root");
    expect(root.getAttribute("role")).toBe(expectedRole);
    expect(root.getAttribute("aria-disabled")).toBeNull();
    expect(root.getAttribute("aria-orientation")).toBe("horizontal");
    expect(root.getAttribute("data-disabled")).toBeNull();
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
    for (const attribute of [
      "data-dirty",
      "data-filled",
      "data-focused",
      "data-invalid",
      "data-touched",
      "data-valid",
    ]) {
      expect(root.getAttribute(attribute)).toBeNull();
    }
    expect(screen.getByText("Email")).toBeTruthy();
    expect(document.body.textContent).not.toContain("Forged");
    let control: HTMLElement;
    if (expectedRole === "radiogroup") {
      control = screen.getByRole("radio", { name: "Email" });
    } else if (props.presentation === "toggle") {
      control = screen.getByRole("button", { name: "Email" });
    } else {
      control = screen.getByRole("checkbox", { name: "Email" });
    }
    fireEvent.click(control);
    expect(nativeOnChange).not.toHaveBeenCalled();
  });

  it("preserves root refs and safe events while protecting toggle style state", () => {
    const ref = createRef<HTMLDivElement>();
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <ChoiceGroup
        items={items}
        onClick={onClick}
        onKeyDown={onKeyDown}
        orientation="vertical"
        presentation="toggle"
        ref={ref}
        selectionMode="multiple"
        size="sm"
        spacing={4}
        style={{ "--gap": 99, color: "red" } as CSSProperties}
        variant="outline"
      />
    );

    const root = screen.getByRole("group");
    expect(ref.current).toBe(root);
    expect(root.getAttribute("data-multiple")).toBe("");
    expect(root.getAttribute("data-size")).toBe("sm");
    expect(root.getAttribute("data-spacing")).toBe("4");
    expect(root.getAttribute("data-variant")).toBe("outline");
    expect(root.style.getPropertyValue("--gap")).toBe("4");
    expect(root.style.color).toBe("red");

    fireEvent.click(root);
    fireEvent.keyDown(root, { key: "ArrowDown" });
    expect(onClick).toHaveBeenCalledOnce();
    expect(onKeyDown).toHaveBeenCalledOnce();
  });
});
