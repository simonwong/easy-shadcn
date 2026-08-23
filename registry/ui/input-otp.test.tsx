import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { createRef } from "react";
// @ts-expect-error The runtime server entry exists; this repo does not hoist its peer-only types package.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { InputOTP } from "./input-otp";

const slots = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-slot="input-otp-slot"]'));

const groups = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-slot="input-otp-group"]'));

const separators = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-slot="input-otp-separator"]'));

const input = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>(
    "[data-input-otp]"
  ) as HTMLInputElement;

const slotText = (container: HTMLElement) =>
  slots(container)
    .map((slot) => slot.textContent)
    .join("");

describe("InputOTP", () => {
  it.each([
    1, 6,
  ])("generates %i ordered slots inside one group", (maxLength) => {
    const { container } = render(<InputOTP maxLength={maxLength} />);

    expect(slots(container)).toHaveLength(maxLength);
    expect(groups(container)).toHaveLength(1);
    expect(separators(container)).toHaveLength(0);
    expect(container.querySelectorAll("input")).toHaveLength(1);
  });

  it.each([
    0,
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])("rejects invalid maxLength %s", (maxLength) => {
    expect(() => render(<InputOTP maxLength={maxLength} />)).toThrow(
      RangeError
    );
  });

  it.each([
    { expectedGroups: 6, expectedSeparators: 5, groupSize: 1 },
    { expectedGroups: 2, expectedSeparators: 1, groupSize: 3 },
    { expectedGroups: 1, expectedSeparators: 0, groupSize: 6 },
    { expectedGroups: 1, expectedSeparators: 0, groupSize: 7 },
  ])("groups six slots by $groupSize", ({
    expectedGroups,
    expectedSeparators,
    groupSize,
  }) => {
    const { container } = render(
      <InputOTP groupSize={groupSize} maxLength={6} />
    );

    expect(groups(container)).toHaveLength(expectedGroups);
    expect(separators(container)).toHaveLength(expectedSeparators);
    expect(slots(container)).toHaveLength(6);
  });

  it("renders a shorter final group without a trailing separator", () => {
    const { container } = render(
      <InputOTP groupSize={3} maxLength={7} value="1234567" />
    );

    expect(
      groups(container).map(
        (group) => group.querySelectorAll('[data-slot="input-otp-slot"]').length
      )
    ).toEqual([3, 3, 1]);
    expect(groups(container).map((group) => group.textContent)).toEqual([
      "123",
      "456",
      "7",
    ]);
    expect(separators(container)).toHaveLength(2);
  });

  it.each([
    0,
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])("falls back to one group for invalid groupSize %s", (groupSize) => {
    const { container } = render(
      <InputOTP groupSize={groupSize} maxLength={6} />
    );

    expect(groups(container)).toHaveLength(1);
    expect(separators(container)).toHaveLength(0);
  });

  it("updates groups and slots without stale structure", () => {
    const { container, rerender } = render(
      <InputOTP groupSize={3} maxLength={6} />
    );

    rerender(<InputOTP groupSize={2} maxLength={4} />);

    expect(slots(container)).toHaveLength(4);
    expect(groups(container)).toHaveLength(2);
    expect(separators(container)).toHaveLength(1);
  });

  it("preserves the controlled value lifecycle", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <InputOTP maxLength={6} onChange={onChange} value="12" />
    );

    fireEvent.change(input(container), { target: { value: "123" } });

    expect(onChange).toHaveBeenCalledWith("123");
    expect(slotText(container)).toBe("12");

    rerender(<InputOTP maxLength={6} onChange={onChange} value="123" />);
    expect(slotText(container)).toBe("123");
  });

  it("updates an uncontrolled default value", () => {
    // input-otp 1.5.0 manages defaultValue internally but also forwards it to
    // its controlled real input, which triggers a React 19 upstream warning.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { container } = render(<InputOTP defaultValue="12" maxLength={6} />);

    fireEvent.change(input(container), { target: { value: "123" } });

    expect(slotText(container)).toBe("123");
    consoleError.mockRestore();
  });

  it("fires onComplete when the value reaches maxLength", async () => {
    const onComplete = vi.fn();
    const { container } = render(
      <InputOTP maxLength={4} onComplete={onComplete} />
    );

    fireEvent.change(input(container), { target: { value: "123" } });
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.change(input(container), { target: { value: "1234" } });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith("1234");
    });
  });

  it("preserves disabled input behavior", () => {
    const { container } = render(<InputOTP disabled maxLength={4} />);
    const otpInput = input(container);

    expect(otpInput.disabled).toBe(true);
  });

  it("preserves pattern filtering and the accessible placeholder", () => {
    const onChange = vi.fn();
    const { container } = render(
      <InputOTP
        maxLength={4}
        onChange={onChange}
        pattern={REGEXP_ONLY_DIGITS}
        placeholder="••••"
      />
    );
    const otpInput = input(container);

    fireEvent.change(otpInput, { target: { value: "a" } });

    expect(onChange).not.toHaveBeenCalled();
    expect(otpInput.pattern).toBe(REGEXP_ONLY_DIGITS);
    expect(otpInput.getAttribute("aria-placeholder")).toBe("••••");
    expect(slotText(container)).toBe("");
  });

  it("transforms formatted paste through the upstream input seam", () => {
    const onChange = vi.fn();
    const { container } = render(
      <InputOTP
        maxLength={6}
        onChange={onChange}
        pasteTransformer={(pasted) => pasted.replace("-", "")}
      />
    );

    fireEvent.paste(input(container), {
      clipboardData: { getData: () => "123-456" },
    });

    expect(onChange).toHaveBeenCalledWith("123456");
    expect(slotText(container)).toBe("123456");
  });

  it("rejects pasted values that do not match pattern", () => {
    const onChange = vi.fn();
    const { container } = render(
      <InputOTP
        maxLength={4}
        onChange={onChange}
        pasteTransformer={(pasted) => pasted}
        pattern={REGEXP_ONLY_DIGITS}
      />
    );

    fireEvent.paste(input(container), {
      clipboardData: { getData: () => "12ab" },
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(slotText(container)).toBe("");
  });

  it("routes native, form, and upstream props to the real input", () => {
    const onMouseOver = vi.fn();
    const { container } = render(
      <InputOTP
        aria-label="Verification code"
        autoComplete="off"
        data-testid="otp-input"
        form="verify-form"
        inputMode="text"
        maxLength={4}
        name="code"
        onMouseOver={onMouseOver}
        required
        spellCheck
        textAlign="right"
      />
    );
    const otpInput = input(container);

    fireEvent.mouseOver(otpInput);

    expect(otpInput.getAttribute("aria-label")).toBe("Verification code");
    expect(otpInput.dataset.testid).toBe("otp-input");
    expect(otpInput.form?.id ?? otpInput.getAttribute("form")).toBe(
      "verify-form"
    );
    expect(otpInput.inputMode).toBe("text");
    expect(otpInput.name).toBe("code");
    expect(otpInput.required).toBe(true);
    expect(otpInput.getAttribute("spellcheck")).toBe("true");
    expect(otpInput.getAttribute("autocomplete")).toBe("off");
    expect(otpInput.style.textAlign).toBe("right");
    expect(onMouseOver).toHaveBeenCalledTimes(1);
  });

  it("forwards the ref to the focusable real input", () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<InputOTP maxLength={4} ref={ref} />);

    act(() => ref.current?.focus());

    expect(ref.current).toBe(input(container));
    expect(document.activeElement).toBe(ref.current);
    expect(
      slots(container).every((slot) => !slot.hasAttribute("tabindex"))
    ).toBe(true);
  });

  it("preserves no-script CSS and the injected-style nonce", () => {
    const noScriptCSSFallback = "[data-input-otp]{color:red}";
    const html = renderToStaticMarkup(
      <InputOTP
        maxLength={4}
        nonce="otp-nonce"
        noScriptCSSFallback={noScriptCSSFallback}
      />
    );
    document.getElementById("input-otp-style")?.remove();
    render(
      <InputOTP
        maxLength={4}
        nonce="otp-nonce"
        noScriptCSSFallback={noScriptCSSFallback}
      />
    );

    expect(html).toContain(noScriptCSSFallback);
    expect(document.getElementById("input-otp-style")?.nonce).toBe("otp-nonce");
  });

  it.each([
    true,
    "grammar" as const,
  ])("mirrors raw aria-invalid %s to the input and every slot", (ariaInvalid) => {
    const { container } = render(
      <InputOTP aria-invalid={ariaInvalid} maxLength={4} />
    );
    const expected = String(ariaInvalid);

    expect(input(container).getAttribute("aria-invalid")).toBe(expected);
    expect(
      slots(container).every(
        (slot) => slot.getAttribute("aria-invalid") === expected
      )
    ).toBe(true);
  });

  it("routes every class override to its owned element", () => {
    const { container } = render(
      <InputOTP
        className={["input-x", false]}
        containerClassName={["container-x", null]}
        groupClassName={["group-x", undefined]}
        groupSize={2}
        maxLength={4}
        separatorClassName="separator-x"
        slotClassName="slot-x"
      />
    );
    const otpInput = input(container);
    const visibleContainer = container.querySelector(
      "[data-input-otp-container]"
    );

    expect(otpInput.classList).toContain("input-x");
    expect(visibleContainer?.classList).toContain("container-x");
    expect(groups(container)).toHaveLength(2);
    expect(
      groups(container).every((group) => group.classList.contains("group-x"))
    ).toBe(true);
    expect(
      slots(container).every((slot) => slot.classList.contains("slot-x"))
    ).toBe(true);
    expect(separators(container)).toHaveLength(1);
    expect(separators(container)[0]?.classList).toContain("separator-x");
    expect(otpInput.classList).toContain("disabled:cursor-not-allowed");
    expect(visibleContainer?.classList).toContain("cn-input-otp");
    expect(groups(container)[0]?.classList).toContain("flex");
    expect(slots(container)[0]?.classList).toContain("relative");
    expect(separators(container)[0]?.classList).toContain("flex");

    const targets = [
      otpInput,
      visibleContainer,
      ...groups(container),
      ...slots(container),
      ...separators(container),
    ].filter((target): target is Element => target !== null);
    const ownership = new Map<string, Array<Element | null>>([
      ["input-x", [otpInput]],
      ["container-x", [visibleContainer]],
      ["group-x", groups(container)],
      ["slot-x", slots(container)],
      ["separator-x", separators(container)],
    ]);

    for (const [className, owners] of ownership) {
      const expectedOwners = owners.filter(
        (owner): owner is Element => owner !== null
      );

      expect(
        targets.filter((target) => target.classList.contains(className))
      ).toEqual(expectedOwners);
    }
  });

  it("does not create a separator for separatorClassName alone", () => {
    const { container } = render(
      <InputOTP maxLength={4} separatorClassName="separator-x" />
    );

    expect(separators(container)).toHaveLength(0);
  });
});
