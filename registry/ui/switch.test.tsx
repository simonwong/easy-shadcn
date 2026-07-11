import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  it("renders a labeled uncontrolled option and toggles exactly once", () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Switch label="Notifications" onCheckedChange={onCheckedChange} />
    );

    const control = screen.getByRole("switch", { name: "Notifications" });
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]'
    );
    const label = screen.getByText("Notifications").closest("label");

    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(input).not.toBeNull();
    expect(label?.htmlFor).toBe(input?.id);
    expect(control.closest("label")).toBeNull();

    fireEvent.click(control);

    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(input?.checked).toBe(true);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("toggles exactly once when its explicit label is clicked", () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Dark mode" onCheckedChange={onCheckedChange} />);

    const control = screen.getByRole("switch", { name: "Dark mode" });
    fireEvent.click(screen.getByText("Dark mode"));

    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it("uses defaultChecked for an uncontrolled round trip", () => {
    render(<Switch defaultChecked label="Availability" />);

    const control = screen.getByRole("switch", { name: "Availability" });
    expect(control.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
  });

  it("reuses caller input ids and generates unique ids per option", () => {
    const { container, rerender } = render(
      <>
        <Switch id="custom-switch" label="First" />
        <Switch label="Second" />
      </>
    );

    const inputs = container.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]'
    );
    const firstControl = screen.getByRole("switch", { name: "First" });
    const firstLabel = screen.getByText("First").closest("label");
    const secondLabel = screen.getByText("Second").closest("label");

    expect(inputs).toHaveLength(2);
    expect(inputs[0].id).toBe("custom-switch");
    expect(firstLabel?.htmlFor).toBe("custom-switch");
    expect(firstControl.id).not.toBe("custom-switch");
    expect(inputs[1].id).not.toBe("custom-switch");
    expect(secondLabel?.htmlFor).toBe(inputs[1].id);

    const initialIds = [...inputs].map((input) => input.id);
    rerender(
      <>
        <Switch id="custom-switch" label={<span>First</span>} />
        <Switch label="Second" />
      </>
    );

    expect(
      [
        ...container.querySelectorAll<HTMLInputElement>(
          'input[type="checkbox"]'
        ),
      ].map((input) => input.id)
    ).toEqual(initialIds);
  });

  it("describes the switch and toggles once from its description", () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        description="Receive a weekly summary"
        label="Email updates"
        onCheckedChange={onCheckedChange}
      />
    );

    const control = screen.getByRole("switch", { name: "Email updates" });
    const description = screen.getByText("Receive a weekly summary");

    expect(control.getAttribute("aria-describedby")).toBe(description.id);
    expect(description.closest("label")).toBe(
      screen.getByText("Email updates").closest("label")
    );

    fireEvent.click(description);

    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it("merges caller ARIA references after internal ids and removes duplicate tokens", () => {
    render(
      <>
        <span id="external-label">External name</span>
        <span id="external-description">External description</span>
        <Switch
          aria-describedby={" external-description\nexternal-description  "}
          aria-labelledby={" external-label\texternal-label  "}
          description="Internal description"
          label="Internal name"
        />
      </>
    );

    const control = screen.getByRole("switch", {
      name: "Internal name External name",
    });
    const label = screen.getByText("Internal name");
    const description = screen.getByText("Internal description");

    expect(control.getAttribute("aria-labelledby")).toBe(
      `${label.id} external-label`
    );
    expect(control.getAttribute("aria-describedby")).toBe(
      `${description.id} external-description`
    );
  });

  it("keeps zero and empty strings but omits nullish and boolean content", () => {
    render(
      <>
        <span id="external-only">External only</span>
        <Switch
          aria-labelledby="external-only"
          description={false}
          label={null}
        />
        <Switch description="" label={0} />
        <Switch aria-label="Description only" description="Details" label />
      </>
    );

    const absentControl = screen.getByRole("switch", {
      name: "External only",
    });
    const zeroControl = screen.getByRole("switch", { name: "0" });
    const descriptionOnlyControl = screen.getByRole("switch", {
      name: "Description only",
    });
    const zeroLabel = zeroControl.parentElement?.querySelector("label");
    const zeroSlots = zeroLabel?.querySelectorAll("span");
    const descriptionOnlyLabel =
      descriptionOnlyControl.parentElement?.querySelector("label");

    expect(absentControl.getAttribute("aria-labelledby")).toBe("external-only");
    expect(absentControl.hasAttribute("aria-describedby")).toBe(false);
    expect(absentControl.parentElement?.querySelector("label")).toBeNull();
    expect(zeroSlots).toHaveLength(2);
    expect(zeroSlots?.[0].textContent).toBe("0");
    expect(zeroSlots?.[1].textContent).toBe("");
    expect(zeroControl.getAttribute("aria-labelledby")).toBe(zeroSlots?.[0].id);
    expect(zeroControl.getAttribute("aria-describedby")).toBe(
      zeroSlots?.[1].id
    );
    expect(descriptionOnlyLabel?.querySelectorAll("span")).toHaveLength(1);
    expect(descriptionOnlyControl.getAttribute("aria-labelledby")).toBe("");
  });

  it("requests controlled changes without mutating before the caller rerenders", () => {
    const onCheckedChange = vi.fn();
    const { container, rerender } = render(
      <Switch
        checked={false}
        label="Controlled"
        onCheckedChange={onCheckedChange}
      />
    );
    const control = screen.getByRole("switch", { name: "Controlled" });
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]'
    );

    fireEvent.click(control);

    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(input?.checked).toBe(false);

    rerender(
      <Switch checked label="Controlled" onCheckedChange={onCheckedChange} />
    );

    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(input?.checked).toBe(true);
  });

  it("lets root click handlers cancel only through preventBaseUIHandler", () => {
    const onCheckedChange = vi.fn();
    const onClick = vi.fn((event) => {
      event.preventBaseUIHandler();
    });
    render(
      <form data-testid="root-cancel-form">
        <Switch
          label="Cancelable click"
          name="root-cancel"
          onCheckedChange={onCheckedChange}
          onClick={onClick}
          uncheckedValue="off"
        />
      </form>
    );

    const control = screen.getByRole("switch", { name: "Cancelable click" });
    fireEvent.click(control);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(
      new FormData(
        screen.getByTestId("root-cancel-form") as HTMLFormElement
      ).get("root-cancel")
    ).toBe("off");
  });

  it("does not treat DOM preventDefault as Base UI cancellation", () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        label="DOM default"
        onCheckedChange={onCheckedChange}
        onClick={(event) => {
          event.preventDefault();
        }}
      />
    );

    const control = screen.getByRole("switch", { name: "DOM default" });
    fireEvent.click(control);

    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(control.getAttribute("aria-checked")).toBe("true");
  });

  it("reports a requested change but preserves state when details cancel", () => {
    const onCheckedChange = vi.fn((_checked, details) => {
      details.cancel();
    });
    const { container } = render(
      <form data-testid="change-cancel-form">
        <Switch
          label="Cancelable change"
          name="change-cancel"
          onCheckedChange={onCheckedChange}
          uncheckedValue="off"
        />
      </form>
    );
    const control = screen.getByRole("switch", { name: "Cancelable change" });
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]'
    );

    fireEvent.click(control);

    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(input?.checked).toBe(false);
    expect(
      new FormData(
        screen.getByTestId("change-cancel-form") as HTMLFormElement
      ).get("change-cancel")
    ).toBe("off");
  });

  it("toggles exactly once with Space on the visible control", () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Keyboard" onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch", { name: "Keyboard" });

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
      <Switch
        description="Cannot change"
        disabled
        label="Disabled"
        onCheckedChange={onCheckedChange}
      />
    );
    const control = screen.getByRole("switch", { name: "Disabled" });
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]'
    );

    fireEvent.click(control);
    fireEvent.click(screen.getByText("Disabled"));
    fireEvent.click(screen.getByText("Cannot change"));
    fireEvent.keyDown(control, { key: " " });
    fireEvent.keyUp(control, { key: " " });

    expect(control.getAttribute("aria-disabled")).toBe("true");
    expect(control.hasAttribute("data-disabled")).toBe(true);
    expect(input?.disabled).toBe(true);
    expect(input?.checked).toBe(false);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("blocks all interaction when read-only without claiming native readonly", () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Switch
        description="Managed elsewhere"
        label="Read only"
        onCheckedChange={onCheckedChange}
        readOnly
      />
    );
    const control = screen.getByRole("switch", { name: "Read only" });
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]'
    );

    fireEvent.click(control);
    fireEvent.click(screen.getByText("Read only"));
    fireEvent.click(screen.getByText("Managed elsewhere"));
    fireEvent.keyDown(control, { key: " " });
    fireEvent.keyUp(control, { key: " " });

    expect(control.getAttribute("aria-readonly")).toBe("true");
    expect(control.hasAttribute("data-readonly")).toBe(true);
    expect(input?.readOnly).toBe(false);
    expect(input?.disabled).toBe(false);
    expect(input?.checked).toBe(false);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("submits checked and unchecked values inside or outside its form", () => {
    const { container } = render(
      <>
        <form id="external-form" />
        <Switch
          defaultChecked
          form="external-form"
          label="External form"
          name="external"
          uncheckedValue="external-off"
          value="external-on"
        />
        <form data-testid="inline-form">
          <Switch
            label="Inline form"
            name="inline"
            uncheckedValue="inline-off"
            value="inline-on"
          />
        </form>
      </>
    );
    const externalForm =
      container.querySelector<HTMLFormElement>("#external-form");
    const inlineForm = screen.getByTestId("inline-form") as HTMLFormElement;

    expect(new FormData(externalForm ?? undefined).get("external")).toBe(
      "external-on"
    );
    expect(new FormData(inlineForm).get("inline")).toBe("inline-off");

    fireEvent.click(screen.getByRole("switch", { name: "External form" }));
    fireEvent.click(screen.getByRole("switch", { name: "Inline form" }));

    expect(new FormData(externalForm ?? undefined).get("external")).toBe(
      "external-off"
    );
    expect(new FormData(inlineForm).get("inline")).toBe("inline-on");
  });

  it("delegates required native validity to the checkbox input", () => {
    const { container } = render(<Switch label="Required" required />);
    const control = screen.getByRole("switch", { name: "Required" });
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]'
    );

    expect(input?.required).toBe(true);
    expect(input?.checkValidity()).toBe(false);

    fireEvent.click(control);

    expect(input?.checkValidity()).toBe(true);
  });

  it("preserves the primitive disabled submission asymmetry", () => {
    render(
      <form data-testid="disabled-form">
        <Switch
          defaultChecked
          disabled
          label="Disabled checked"
          name="checked"
          value="on"
        />
        <Switch
          disabled
          label="Disabled unchecked"
          name="unchecked"
          uncheckedValue="off"
        />
      </form>
    );
    const data = new FormData(
      screen.getByTestId("disabled-form") as HTMLFormElement
    );

    expect(data.has("checked")).toBe(false);
    expect(data.get("unchecked")).toBe("off");
  });

  it("forwards root and input refs to their distinct primitive targets", () => {
    const rootRef = createRef<HTMLElement>();
    const inputRef = createRef<HTMLInputElement>();
    const { container } = render(
      <Switch
        inputRef={inputRef}
        label="References"
        name="references"
        ref={rootRef}
        uncheckedValue="off"
      />
    );
    const control = screen.getByRole("switch", { name: "References" });
    const uncheckedInput = container.querySelector<HTMLInputElement>(
      'input[type="hidden"]'
    );

    expect(rootRef.current).toBe(control);
    expect(rootRef.current?.tagName).toBe("SPAN");
    expect(inputRef.current?.type).toBe("checkbox");
    expect(inputRef.current).not.toBe(uncheckedInput);
  });

  it("keeps primitive props and every class hook on its owned element", () => {
    const onPointerDown = vi.fn();
    render(
      <Switch
        className="control-class"
        data-owner="control"
        description="Class details"
        descriptionClassName="description-class"
        label="Classes"
        labelClassName="label-class"
        onPointerDown={onPointerDown}
        optionClassName="option-class"
        size="sm"
        style={{ opacity: 0.5 }}
      />
    );
    const control = screen.getByRole("switch", { name: "Classes" });
    const option = control.parentElement;
    const label = screen.getByText("Classes");
    const description = screen.getByText("Class details");

    fireEvent.pointerDown(control);

    expect(control.classList.contains("control-class")).toBe(true);
    expect(control.getAttribute("data-owner")).toBe("control");
    expect(control.getAttribute("data-size")).toBe("sm");
    expect(control.style.opacity).toBe("0.5");
    expect(option?.classList.contains("option-class")).toBe(true);
    expect(option?.hasAttribute("data-owner")).toBe(false);
    expect(option?.getAttribute("style")).toBeNull();
    expect(label.classList.contains("label-class")).toBe(true);
    expect(description.classList.contains("description-class")).toBe(true);
    expect(control.closest("label")).toBeNull();
    expect(onPointerDown).toHaveBeenCalledOnce();
  });
});
