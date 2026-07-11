import { fireEvent, render, screen } from "@testing-library/react";
import type {
  ChangeEvent,
  FormEvent,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "./field";
import { InputGroup } from "./input-group";

const input = (name: string) =>
  screen.getByRole("textbox", { name }) as HTMLInputElement;

describe("InputGroup", () => {
  it("renders the minimum native input path without addon wrappers", () => {
    const { container } = render(
      <InputGroup aria-label="Username" placeholder="Enter a username" />
    );

    const root = screen.getByRole("group");
    const control = input("Username");

    expect(root.querySelectorAll("input")).toHaveLength(1);
    expect(control.getAttribute("placeholder")).toBe("Enter a username");
    expect(
      container.querySelectorAll('[data-slot="input-group-addon"]')
    ).toHaveLength(0);
  });

  it("keeps root and input class ownership separate", () => {
    const { container } = render(
      <InputGroup
        aria-label="Styled input"
        className={["root-x", false]}
        endAddon="End"
        endAddonClassName={["end-x", undefined]}
        inputClassName={["input-x", null]}
        startAddon="Start"
        startAddonClassName={["start-x", false]}
      />
    );

    const root = container.querySelector(
      '[data-slot="input-group"]'
    ) as HTMLElement;
    const control = input("Styled input");
    const start = container.querySelector(
      '[data-align="inline-start"]'
    ) as HTMLElement;
    const end = container.querySelector(
      '[data-align="inline-end"]'
    ) as HTMLElement;

    expect(root.className).toContain("root-x");
    expect(root.className).not.toContain("input-x");
    expect(root.className).not.toContain("start-x");
    expect(root.className).not.toContain("end-x");
    expect(control.className).toContain("input-x");
    expect(control.className).not.toContain("root-x");
    expect(control.className).not.toContain("start-x");
    expect(control.className).not.toContain("end-x");
    expect(start.className).toContain("start-x");
    expect(start.className).not.toContain("root-x");
    expect(start.className).not.toContain("input-x");
    expect(start.className).not.toContain("end-x");
    expect(end.className).toContain("end-x");
    expect(end.className).not.toContain("root-x");
    expect(end.className).not.toContain("input-x");
    expect(end.className).not.toContain("start-x");
  });

  it("forwards native attributes, styling, and events to the input", () => {
    let clickTarget: EventTarget | null = null;
    let focusTarget: EventTarget | null = null;
    let inputTarget: EventTarget | null = null;
    let keyTarget: EventTarget | null = null;
    const onClick = vi.fn((event: ReactMouseEvent<HTMLInputElement>) => {
      clickTarget = event.currentTarget;
    });
    const onKeyDown = vi.fn((event: ReactKeyboardEvent<HTMLInputElement>) => {
      keyTarget = event.currentTarget;
    });
    const onFocus = vi.fn((event: ReactFocusEvent<HTMLInputElement>) => {
      focusTarget = event.currentTarget;
    });
    const onInput = vi.fn((event: FormEvent<HTMLInputElement>) => {
      inputTarget = event.currentTarget;
    });
    render(
      <InputGroup
        aria-describedby="username-hint"
        aria-label="Native input"
        data-track="username"
        name="username"
        onClick={onClick}
        onFocus={onFocus}
        onInput={onInput}
        onKeyDown={onKeyDown}
        required
        style={{ letterSpacing: "2px" }}
      />
    );

    const root = screen.getByRole("group");
    const control = input("Native input");

    expect(control.getAttribute("aria-describedby")).toBe("username-hint");
    expect(control.getAttribute("data-track")).toBe("username");
    expect(control.getAttribute("name")).toBe("username");
    expect(control.required).toBe(true);
    expect(control.style.letterSpacing).toBe("2px");
    expect(root.getAttribute("aria-describedby")).toBeNull();
    expect(root.getAttribute("data-track")).toBeNull();
    expect(root.getAttribute("style")).toBeNull();

    fireEvent.focus(control);
    fireEvent.input(control, { target: { value: "Ada" } });
    fireEvent.keyDown(control, { key: "Enter" });
    fireEvent.click(control);

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(focusTarget).toBe(control);
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(inputTarget).toBe(control);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(keyTarget).toBe(control);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(clickTarget).toBe(control);
  });

  it("preserves controlled and uncontrolled native input behavior", () => {
    let changeTarget: EventTarget | null = null;
    const onChange = vi.fn((event: ChangeEvent<HTMLInputElement>) => {
      changeTarget = event.currentTarget;
    });
    const controlled = render(
      <InputGroup aria-label="Controlled" onChange={onChange} value="first" />
    );
    const controlledInput = input("Controlled") as HTMLInputElement;

    fireEvent.change(controlledInput, { target: { value: "second" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(changeTarget).toBe(controlledInput);
    expect(controlledInput.value).toBe("first");

    controlled.rerender(
      <InputGroup aria-label="Controlled" onChange={onChange} value="second" />
    );
    expect(controlledInput.value).toBe("second");
    controlled.unmount();

    render(<InputGroup aria-label="Uncontrolled" defaultValue="initial" />);
    const uncontrolledInput = input("Uncontrolled") as HTMLInputElement;
    fireEvent.change(uncontrolledInput, { target: { value: "edited" } });
    expect(uncontrolledInput.value).toBe("edited");
  });

  it("forwards object and callback refs to real input elements", () => {
    const objectRef = createRef<HTMLInputElement>();
    let callbackNode: HTMLInputElement | null = null;

    render(
      <>
        <InputGroup aria-label="Object ref" ref={objectRef} />
        <InputGroup
          aria-label="Callback ref"
          ref={(node) => {
            callbackNode = node;
          }}
        />
      </>
    );

    expect(objectRef.current).toBe(input("Object ref"));
    expect(objectRef.current?.tagName).toBe("INPUT");
    expect(callbackNode).toBe(input("Callback ref"));
  });

  it("renders logical addons in fixed order with isolated classes", () => {
    const { container } = render(
      <InputGroup
        aria-label="Domain"
        endAddon=".com"
        endAddonClassName={["end-x", false]}
        startAddon="https://"
        startAddonClassName={["start-x", null]}
      />
    );

    const root = container.querySelector(
      '[data-slot="input-group"]'
    ) as HTMLElement;
    const control = input("Domain");
    const start = container.querySelector('[data-align="inline-start"]');
    const end = container.querySelector('[data-align="inline-end"]');

    expect(start?.textContent).toBe("https://");
    expect(end?.textContent).toBe(".com");
    expect(start?.className).toContain("start-x");
    expect(start?.className).not.toContain("end-x");
    expect(end?.className).toContain("end-x");
    expect(end?.className).not.toContain("start-x");
    expect(Array.from(root.children)).toEqual([start, control, end]);

    const composeAttributes = [
      "inputclassname",
      "startaddon",
      "startaddonclassname",
      "endaddon",
      "endaddonclassname",
    ];
    for (const element of [root, control, start, end]) {
      for (const attribute of composeAttributes) {
        expect(element?.getAttribute(attribute)).toBeNull();
      }
    }
  });

  it("follows React node presence rules for addon wrappers", () => {
    const { container, rerender } = render(
      <InputGroup aria-label="Falsy addons" endAddon="" startAddon={0} />
    );

    const addons = container.querySelectorAll(
      '[data-slot="input-group-addon"]'
    );
    expect(addons).toHaveLength(2);
    expect(addons[0].textContent).toBe("0");
    expect(addons[1].textContent).toBe("");

    rerender(
      <InputGroup
        aria-label="Absent addons"
        endAddon={true}
        startAddon={null}
      />
    );
    expect(
      container.querySelectorAll('[data-slot="input-group-addon"]')
    ).toHaveLength(0);
  });

  it("focuses the input when a non-button addon area is clicked", () => {
    const { container } = render(
      <InputGroup aria-label="Amount" endAddon="USD" startAddon="$" />
    );
    const control = input("Amount");
    const start = container.querySelector(
      '[data-align="inline-start"]'
    ) as HTMLElement;
    const end = container.querySelector(
      '[data-align="inline-end"]'
    ) as HTMLElement;

    fireEvent.click(start);
    expect(document.activeElement).toBe(control);

    (control as HTMLInputElement).blur();
    fireEvent.click(end);
    expect(document.activeElement).toBe(control);
  });

  it("leaves addon button focus and events under caller ownership", () => {
    const onButtonClick = vi.fn();
    const onInputClick = vi.fn();
    render(
      <InputGroup
        aria-label="Invitee"
        endAddon={
          <button onClick={onButtonClick} type="button">
            Invite
          </button>
        }
        onClick={onInputClick}
      />
    );

    const control = input("Invitee");
    const button = screen.getByRole("button", { name: "Invite" });
    button.focus();
    fireEvent.click(button);

    expect(onButtonClick).toHaveBeenCalledTimes(1);
    expect(onInputClick).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(button);
    expect(document.activeElement).not.toBe(control);
  });

  it("keeps Field-generated label and aria wiring on the input", () => {
    const { container } = render(
      <Field
        description="Used for account notices."
        error="Email is required."
        label="Email"
      >
        <InputGroup type="email" />
      </Field>
    );

    const control = screen.getByLabelText("Email") as HTMLInputElement;
    const root = container.querySelector(
      '[data-slot="input-group"]'
    ) as HTMLElement;
    const label = container.querySelector('[data-slot="field-label"]');
    const description = screen.getByText("Used for account notices.");
    const error = screen.getByRole("alert");

    expect(label?.getAttribute("for")).toBe(control.id);
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.getAttribute("aria-describedby")?.split(" ")).toEqual(
      expect.arrayContaining([description.id, error.id])
    );
    expect(root.getAttribute("id")).toBeNull();
    expect(root.getAttribute("aria-describedby")).toBeNull();
    expect(root.getAttribute("aria-invalid")).toBeNull();
  });

  it("preserves explicit Field control attributes", () => {
    render(
      <Field description="Generated description" label="Account">
        <InputGroup
          aria-describedby="custom-description"
          aria-invalid="grammar"
          id="custom-account"
        />
      </Field>
    );

    const control = input("Account");
    expect(control.id).toBe("custom-account");
    expect(control.getAttribute("aria-describedby")).toBe("custom-description");
    expect(control.getAttribute("aria-invalid")).toBe("grammar");
  });

  it("participates in native forms through the real input", () => {
    const { container } = render(
      <form id="profile-form">
        <InputGroup
          aria-label="Display name"
          defaultValue="Ada"
          name="displayName"
          readOnly
          required
        />
      </form>
    );

    const control = input("Display name") as HTMLInputElement;
    const form = container.querySelector("form") as HTMLFormElement;
    const data = new FormData(form);

    expect(control.readOnly).toBe(true);
    expect(control.required).toBe(true);
    expect(data.get("displayName")).toBe("Ada");
  });
});
