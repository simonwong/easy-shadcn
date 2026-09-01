import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRef, Fragment } from "react";
import { describe, expect, it, vi } from "vitest";
import type { FieldProps } from "./field";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "./field";

const EMAIL_LABEL_RE = /Email/;

describe("Field", () => {
  it("renders label, control, description, and error", () => {
    const { container } = render(
      <Field
        description="Used for notifications."
        error="Email is required."
        htmlFor="email"
        label="Email"
        required
      >
        <input id="email" type="email" />
      </Field>
    );

    expect(screen.getByLabelText(EMAIL_LABEL_RE)).toBeTruthy();
    expect(screen.getByText("Used for notifications.")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Email is required.");

    const field = container.querySelector('[data-slot="field"]');
    expect(field?.getAttribute("data-invalid")).toBe("true");
    expect(field?.getAttribute("aria-invalid")).toBeNull();
  });

  it("uses invalid without requiring an error message", () => {
    const { container } = render(
      <Field invalid label="Name">
        <input />
      </Field>
    );

    const field = container.querySelector('[data-slot="field"]');
    expect(field?.getAttribute("data-invalid")).toBe("true");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("puts the control before text for horizontal fields", () => {
    const { container } = render(
      <Field
        description="Send a short weekly digest."
        htmlFor="summary"
        label="Weekly summary"
        orientation="horizontal"
      >
        <input id="summary" type="checkbox" />
      </Field>
    );

    const field = container.querySelector('[data-slot="field"]');
    expect(field?.firstElementChild?.getAttribute("type")).toBe("checkbox");
    expect(
      within(field as HTMLElement).getByText("Send a short weekly digest.")
    ).toBeTruthy();
  });

  it("preserves primitive-style composition when no flat slots are passed", () => {
    const { container } = render(
      <Field>
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <input id="username" />
        <FieldDescription>Choose a unique username.</FieldDescription>
        <FieldError errors={[{ message: "Choose another username." }]} />
      </Field>
    );

    const field = container.querySelector('[data-slot="field"]');
    expect(field?.children).toHaveLength(4);
    expect(field?.children[0].getAttribute("data-slot")).toBe("field-label");
    expect(field?.children[1].tagName).toBe("INPUT");
    expect(screen.getByRole("alert").textContent).toBe(
      "Choose another username."
    );
  });

  it("exports single-field content and title slots", () => {
    render(
      <Field orientation="horizontal">
        <input aria-label="Touch ID" type="checkbox" />
        <FieldContent>
          <FieldTitle>Enable Touch ID</FieldTitle>
          <FieldDescription>Unlock your device faster.</FieldDescription>
        </FieldContent>
      </Field>
    );

    expect(screen.getByLabelText("Touch ID")).toBeTruthy();
    expect(screen.getByText("Enable Touch ID")).toBeTruthy();
    expect(screen.getByText("Unlock your device faster.")).toBeTruthy();
  });

  it("auto-wires id, aria-describedby, and aria-invalid in flat mode", () => {
    const { container } = render(
      <Field
        description="Used for notifications."
        error="Email is required."
        label="Email"
      >
        <input type="email" />
      </Field>
    );

    const input = container.querySelector("input");
    const label = container.querySelector('[data-slot="field-label"]');
    const description = container.querySelector(
      '[data-slot="field-description"]'
    );
    const errorEl = screen.getByRole("alert");

    expect(input?.id).toBeTruthy();
    expect(label?.getAttribute("for")).toBe(input?.id);
    expect(input?.getAttribute("aria-invalid")).toBe("true");

    const describedBy = input?.getAttribute("aria-describedby")?.split(" ");
    expect(describedBy).toContain(description?.id);
    expect(describedBy).toContain(errorEl.id);
  });

  it("prefers explicit htmlFor and child id over the generated id", () => {
    const { container } = render(
      <Field label="Name">
        <input id="custom-name" />
      </Field>
    );

    expect(
      container.querySelector('[data-slot="field-label"]')?.getAttribute("for")
    ).toBe("custom-name");
    expect(container.querySelector("input")?.id).toBe("custom-name");
  });

  it("renders deduplicated message arrays from form libraries", () => {
    const { container } = render(
      <Field
        error={[
          { message: "Too short." },
          { message: "Too short." },
          { message: "Needs a digit." },
        ]}
        label="Password"
      >
        <input type="password" />
      </Field>
    );

    const items = screen.getByRole("alert").querySelectorAll("li");
    expect(items).toHaveLength(2);
    expect(
      container
        .querySelector('[data-slot="field"]')
        ?.getAttribute("data-invalid")
    ).toBe("true");
  });

  it("treats an array without messages as no error", () => {
    const { container } = render(
      <Field error={[undefined]} label="Password">
        <input type="password" />
      </Field>
    );

    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      container
        .querySelector('[data-slot="field"]')
        ?.getAttribute("data-invalid")
    ).toBeNull();
    expect(
      container.querySelector("input")?.getAttribute("aria-invalid")
    ).toBeNull();
  });

  it("does not inject wiring in composition mode", () => {
    const { container } = render(
      <Field>
        <input />
      </Field>
    );

    const input = container.querySelector("input");
    expect(input?.id).toBe("");
    expect(input?.getAttribute("aria-describedby")).toBeNull();
  });

  it("keeps composition children unwrapped when only marker props are set", () => {
    const { container } = render(
      <Field required>
        <input />
      </Field>
    );

    const field = container.querySelector('[data-slot="field"]');
    expect(field?.firstElementChild?.tagName).toBe("INPUT");
    expect(field?.querySelector('[data-slot="field-content"]')).toBeNull();
  });

  it("protects generated root structure and state from hostile props", () => {
    const hostileProps = {
      "aria-disabled": false,
      "aria-invalid": true,
      "data-disabled": "forged",
      "data-invalid": "forged",
      "data-orientation": "forged",
      "data-slot": "forged",
      dangerouslySetInnerHTML: { __html: "Forged HTML" },
      role: "presentation",
    } as unknown as FieldProps;

    expect(() => {
      render(
        <Field
          data-testid="owned-field"
          description="Account owner."
          disabled
          error="Email is required."
          invalid
          label="Email"
          orientation="vertical"
          {...hostileProps}
        >
          <input />
        </Field>
      );
    }).not.toThrow();

    const root = screen.getByTestId("owned-field");
    expect(root.getAttribute("role")).toBe("group");
    expect(root.getAttribute("data-slot")).toBe("field");
    expect(root.getAttribute("data-orientation")).toBe("vertical");
    expect(root.getAttribute("aria-disabled")).toBe("true");
    expect(root.getAttribute("aria-invalid")).toBeNull();
    expect(root.getAttribute("data-disabled")).toBe("true");
    expect(root.getAttribute("data-invalid")).toBe("true");
    expect(screen.getByText("Email")).toBeTruthy();
    expect(screen.getByText("Account owner.")).toBeTruthy();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(document.body.textContent).not.toContain("Forged HTML");
  });

  it("owns the control id and merges generated description references", () => {
    const { container } = render(
      <Field
        description="Account owner."
        error="Email is required."
        htmlFor="owned-email"
        label="Email"
      >
        <input
          aria-describedby=" external-help external-help "
          aria-invalid={false}
          id="caller-email"
        />
      </Field>
    );

    const control = container.querySelector("input");
    const label = container.querySelector('[data-slot="field-label"]');
    const description = container.querySelector(
      '[data-slot="field-description"]'
    );
    const error = screen.getByRole("alert");

    expect(control?.id).toBe("owned-email");
    expect(label?.getAttribute("for")).toBe("owned-email");
    expect(control?.getAttribute("aria-describedby")).toBe(
      `${description?.id} ${error.id} external-help`
    );
    expect(control?.getAttribute("aria-invalid")).toBe("true");
  });

  it("preserves caller control semantics when Field does not strengthen them", () => {
    const { container } = render(
      <Field label="Message">
        <input aria-invalid="grammar" id="caller-message" />
      </Field>
    );

    const control = container.querySelector("input");
    expect(control?.id).toBe("caller-message");
    expect(control?.getAttribute("aria-invalid")).toBe("grammar");
  });

  it("does not treat a Fragment as a wireable single control", () => {
    const { container } = render(
      <Field label="Grouped input">
        <Fragment key="control">
          <input />
        </Fragment>
      </Field>
    );

    expect(container.querySelector("input")?.id).toBe("");
    expect(
      container.querySelector('[data-slot="field-label"]')?.getAttribute("for")
    ).toBeNull();
  });

  it("preserves safe root props and composition-mode invalid state", () => {
    const ref = createRef<HTMLDivElement>();
    const onClick = vi.fn();
    render(
      <Field
        aria-describedby="field-help"
        data-testid="safe-field"
        data-trace="field-root"
        id="field-root"
        invalid
        onClick={onClick}
        ref={ref}
      >
        <FieldLabel htmlFor="safe-control">Safe control</FieldLabel>
        <input id="safe-control" />
      </Field>
    );

    const root = screen.getByTestId("safe-field");
    fireEvent.click(root);
    expect(ref.current).toBe(root);
    expect(onClick).toHaveBeenCalledOnce();
    expect(root.id).toBe("field-root");
    expect(root.getAttribute("aria-describedby")).toBe("field-help");
    expect(root.getAttribute("data-trace")).toBe("field-root");
    expect(root.getAttribute("data-invalid")).toBe("true");
    expect(root.children).toHaveLength(2);
  });
});
