import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox, type CheckboxProps } from "./checkbox";

const queryCheckboxInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type="checkbox"]');

describe("Checkbox", () => {
  it("renders a labeled uncontrolled option and toggles exactly once", () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Accept terms" onCheckedChange={onCheckedChange} />);

    const control = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(control.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(control);

    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("toggles exactly once from its explicit label and reuses caller ids", () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Checkbox
        id="terms-checkbox"
        label="Accept terms"
        onCheckedChange={onCheckedChange}
      />
    );

    const control = screen.getByRole("checkbox", { name: "Accept terms" });
    const input = queryCheckboxInput(container);
    const label = screen.getByText("Accept terms").closest("label");

    expect(input?.id).toBe("terms-checkbox");
    expect(label?.htmlFor).toBe("terms-checkbox");

    fireEvent.click(screen.getByText("Accept terms"));

    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledOnce();
  });

  it("uses defaultChecked for an uncontrolled round trip", () => {
    render(<Checkbox defaultChecked label="Selected" />);

    const control = screen.getByRole("checkbox", { name: "Selected" });
    expect(control.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
  });

  it("announces its description and toggles exactly once from it", () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        description="You can change this later"
        label="Email updates"
        onCheckedChange={onCheckedChange}
      />
    );

    const control = screen.getByRole("checkbox", { name: "Email updates" });
    const description = screen.getByText("You can change this later");

    expect(control.getAttribute("aria-describedby")).toBe(description.id);

    fireEvent.click(description);

    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledOnce();
  });

  it("merges external ARIA references after internal ids without duplicates", () => {
    render(
      <>
        <span id="external-label">External name</span>
        <span id="external-description">External details</span>
        <Checkbox
          aria-describedby={" external-description\nexternal-description  "}
          aria-labelledby={" external-label\texternal-label  "}
          description="Internal details"
          label="Internal name"
        />
      </>
    );

    const control = screen.getByRole("checkbox", {
      name: "Internal name External name",
    });
    const label = screen.getByText("Internal name");
    const description = screen.getByText("Internal details");

    expect(control.getAttribute("aria-labelledby")).toBe(
      `${label.id} external-label`
    );
    expect(control.getAttribute("aria-describedby")).toBe(
      `${description.id} external-description`
    );
  });

  it("keeps valid falsy content and omits nullish or boolean content", () => {
    render(
      <>
        <span id="external-only">External only</span>
        <Checkbox
          aria-labelledby="external-only"
          description={false}
          label={null}
        />
        <Checkbox description="" label={0} />
        <Checkbox aria-label="Description only" description="Details" label />
      </>
    );

    const absentControl = screen.getByRole("checkbox", {
      name: "External only",
    });
    const zeroControl = screen.getByRole("checkbox", { name: "0" });
    const descriptionOnlyControl = screen.getByRole("checkbox", {
      name: "Description only",
    });
    const zeroLabel = zeroControl.parentElement?.querySelector("label");
    const zeroSlots = zeroLabel?.querySelectorAll("span");

    expect(absentControl.getAttribute("aria-labelledby")).toBe("external-only");
    expect(absentControl.hasAttribute("aria-describedby")).toBe(false);
    expect(absentControl.parentElement?.querySelector("label")).toBeNull();
    expect(zeroSlots).toHaveLength(2);
    expect(zeroSlots?.[0].textContent).toBe("0");
    expect(zeroSlots?.[1].textContent).toBe("");
    expect(descriptionOnlyControl.getAttribute("aria-labelledby")).toBe("");
  });

  it("generates unique ids that stay stable across rerenders", () => {
    const { rerender } = render(
      <>
        <Checkbox label="First" />
        <Checkbox label="Second" />
      </>
    );
    const firstId = screen.getByRole("checkbox", { name: "First" })
      .nextElementSibling?.id;
    const secondId = screen.getByRole("checkbox", { name: "Second" })
      .nextElementSibling?.id;

    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);

    rerender(
      <>
        <Checkbox label={<span>First</span>} />
        <Checkbox label="Second" />
      </>
    );

    expect(
      screen.getByRole("checkbox", { name: "First" }).nextElementSibling?.id
    ).toBe(firstId);
  });

  it("requests controlled changes without mutating before a rerender", () => {
    const onCheckedChange = vi.fn();
    const { container, rerender } = render(
      <Checkbox
        checked={false}
        label="Controlled"
        onCheckedChange={onCheckedChange}
      />
    );
    const control = screen.getByRole("checkbox", { name: "Controlled" });
    const input = queryCheckboxInput(container);

    fireEvent.click(control);

    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(input?.checked).toBe(false);

    rerender(
      <Checkbox checked label="Controlled" onCheckedChange={onCheckedChange} />
    );

    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(input?.checked).toBe(true);
  });

  it("reports a requested change but preserves state when details cancel", () => {
    const onCheckedChange = vi.fn((_checked, details) => {
      details.cancel();
    });
    const { container } = render(
      <form data-testid="cancel-form">
        <Checkbox
          label="Cancelable"
          name="choice"
          onCheckedChange={onCheckedChange}
          uncheckedValue="off"
        />
      </form>
    );
    const control = screen.getByRole("checkbox", { name: "Cancelable" });
    const input = queryCheckboxInput(container);

    fireEvent.click(control);

    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(input?.checked).toBe(false);
    expect(
      new FormData(screen.getByTestId("cancel-form") as HTMLFormElement).get(
        "choice"
      )
    ).toBe("off");
  });

  it("forwards root integration props and supports Base UI event cancellation", () => {
    const onCheckedChange = vi.fn();
    const onClick = vi.fn((event) => {
      event.preventBaseUIHandler();
    });
    render(
      <Checkbox
        data-testid="integrated-checkbox"
        label="Integrated"
        onCheckedChange={onCheckedChange}
        onClick={onClick}
        style={{ opacity: 0.5 }}
      />
    );
    const control = screen.getByTestId("integrated-checkbox");

    fireEvent.click(control);

    expect(control.style.opacity).toBe("0.5");
    expect(onClick).toHaveBeenCalledOnce();
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("does not treat DOM preventDefault as Base UI cancellation", () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        label="DOM default"
        onCheckedChange={onCheckedChange}
        onClick={(event) => {
          event.preventDefault();
        }}
      />
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "DOM default" }));

    expect(onCheckedChange).toHaveBeenCalledOnce();
  });

  it("keeps primitive semantics when untyped callers pass owned props", () => {
    const unsafeProps = {
      "aria-checked": "mixed",
      "data-slot": "forged",
      indeterminate: true,
      role: "switch",
    } as unknown as CheckboxProps;
    const { container } = render(<Checkbox {...unsafeProps} label="Owned" />);
    const control = container.querySelector<HTMLElement>("[aria-checked]");

    expect(control?.getAttribute("role")).toBe("checkbox");
    expect(control?.getAttribute("aria-checked")).toBe("false");
    expect(control?.getAttribute("data-slot")).toBe("checkbox");
    expect(control?.hasAttribute("data-indeterminate")).toBe(false);
  });

  it("toggles exactly once with Space on the visible control", () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Keyboard" onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("checkbox", { name: "Keyboard" });

    control.focus();
    fireEvent.keyDown(control, { key: " " });
    fireEvent.keyUp(control, { key: " " });

    expect(document.activeElement).toBe(control);
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(control.getAttribute("aria-checked")).toBe("true");
  });

  it("blocks control, content, and keyboard interaction when disabled", () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Checkbox
        description="Cannot change"
        disabled
        label="Disabled"
        onCheckedChange={onCheckedChange}
      />
    );
    const control = screen.getByRole("checkbox", { name: "Disabled" });
    const input = queryCheckboxInput(container);

    fireEvent.click(control);
    fireEvent.click(screen.getByText("Disabled"));
    fireEvent.click(screen.getByText("Cannot change"));
    fireEvent.keyDown(control, { key: " " });
    fireEvent.keyUp(control, { key: " " });

    expect(control.getAttribute("aria-disabled")).toBe("true");
    expect(input?.disabled).toBe(true);
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("blocks changes when read-only without disabling the hidden input", () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Checkbox
        description="Managed elsewhere"
        label="Read only"
        onCheckedChange={onCheckedChange}
        readOnly
      />
    );
    const control = screen.getByRole("checkbox", { name: "Read only" });
    const input = queryCheckboxInput(container);

    fireEvent.click(control);
    fireEvent.click(screen.getByText("Read only"));
    fireEvent.click(screen.getByText("Managed elsewhere"));
    fireEvent.keyDown(control, { key: " " });
    fireEvent.keyUp(control, { key: " " });

    expect(control.getAttribute("aria-readonly")).toBe("true");
    expect(input?.disabled).toBe(false);
    expect(input?.hasAttribute("readonly")).toBe(false);
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("preserves checked and unchecked native form values", () => {
    render(
      <form data-testid="preferences-form">
        <Checkbox
          label="Digest"
          name="digest"
          uncheckedValue="off"
          value="on"
        />
      </form>
    );
    const form = screen.getByTestId("preferences-form") as HTMLFormElement;
    const control = screen.getByRole("checkbox", { name: "Digest" });

    expect(new FormData(form).get("digest")).toBe("off");

    fireEvent.click(control);

    expect(new FormData(form).get("digest")).toBe("on");
  });

  it("associates with an external form and delegates required validity", () => {
    const { container } = render(
      <>
        <form data-testid="external-form" id="external-form" />
        <Checkbox
          form="external-form"
          label="Consent"
          name="consent"
          required
          value="accepted"
        />
      </>
    );
    const form = screen.getByTestId("external-form") as HTMLFormElement;
    const input = queryCheckboxInput(container);

    expect(input?.form).toBe(form);
    expect(input?.checkValidity()).toBe(false);

    fireEvent.click(screen.getByRole("checkbox", { name: "Consent" }));

    expect(input?.checkValidity()).toBe(true);
    expect(new FormData(form).get("consent")).toBe("accepted");
  });

  it("keeps the primitive disabled form-submission contract", () => {
    render(
      <form data-testid="disabled-form">
        <Checkbox
          defaultChecked
          disabled
          label="Checked disabled"
          name="checked"
          value="yes"
        />
        <Checkbox
          disabled
          label="Unchecked disabled"
          name="unchecked"
          uncheckedValue="no"
        />
      </form>
    );
    const data = new FormData(
      screen.getByTestId("disabled-form") as HTMLFormElement
    );

    expect(data.get("checked")).toBeNull();
    expect(data.get("unchecked")).toBe("no");
  });

  it("exposes distinct refs for the visible control and hidden input", () => {
    const controlRef = createRef<HTMLElement>();
    const inputRef = createRef<HTMLInputElement>();
    render(
      <Checkbox
        inputRef={inputRef}
        label="Referenced"
        ref={controlRef}
        required
        uncheckedValue="off"
      />
    );

    expect(controlRef.current).toBe(
      screen.getByRole("checkbox", { name: "Referenced" })
    );
    expect(inputRef.current?.matches('input[type="checkbox"]')).toBe(true);
    expect(inputRef.current).not.toBe(controlRef.current);
    expect(inputRef.current?.checkValidity()).toBe(false);

    controlRef.current?.focus();
    expect(document.activeElement).toBe(controlRef.current);
  });

  it("forwards each class override to only its owned visual part", () => {
    const { container } = render(
      <Checkbox
        className="control-x"
        description="Description"
        descriptionClassName="description-x"
        label="Label"
        labelClassName="label-x"
        optionClassName="option-x"
      />
    );
    const control = screen.getByRole("checkbox", { name: "Label" });
    const option = container.firstElementChild;

    expect(control.className).toContain("control-x");
    expect(option?.className).toContain("option-x");
    expect(screen.getByText("Label").className).toContain("label-x");
    expect(screen.getByText("Description").className).toContain(
      "description-x"
    );
    expect(option?.className).not.toContain("control-x");
  });
});
