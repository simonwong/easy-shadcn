import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
        <FieldError issues={[{ message: "Choose another username." }]} />
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
});
