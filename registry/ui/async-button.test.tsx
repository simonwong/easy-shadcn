import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AsyncButton } from "./async-button";

const deferred = () => {
  let resolve!: () => void;
  let reject!: (err: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const getButton = () => screen.getByRole("button");

describe("AsyncButton", () => {
  it("enters the loading state while an async onClick is in flight", async () => {
    const { promise, resolve } = deferred();
    render(<AsyncButton onClick={() => promise}>Save</AsyncButton>);

    fireEvent.click(getButton());

    expect(getButton().getAttribute("aria-busy")).toBe("true");
    expect(getButton().hasAttribute("disabled")).toBe(true);

    resolve();
    await waitFor(() => {
      expect(getButton().getAttribute("aria-busy")).toBe("false");
    });
    expect(getButton().hasAttribute("disabled")).toBe(false);
  });

  it("does not enter the loading state for a sync onClick", () => {
    const onClick = vi.fn();
    render(<AsyncButton onClick={onClick}>Save</AsyncButton>);

    fireEvent.click(getButton());

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getButton().getAttribute("aria-busy")).toBe("false");
  });

  it("recovers from a rejected promise and logs the error", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {
      // silence expected error logging
    });
    const { promise, reject } = deferred();
    render(<AsyncButton onClick={() => promise}>Save</AsyncButton>);

    fireEvent.click(getButton());
    reject(new Error("boom"));

    await waitFor(() => {
      expect(getButton().getAttribute("aria-busy")).toBe("false");
    });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it("ignores a second click while the first promise is in flight", async () => {
    const { promise, resolve } = deferred();
    const onClick = vi.fn(() => promise);
    render(<AsyncButton onClick={onClick}>Save</AsyncButton>);

    const button = getButton();
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    resolve();
    await waitFor(() => {
      expect(getButton().getAttribute("aria-busy")).toBe("false");
    });
  });

  it("treats the controlled loading prop as the source of truth", async () => {
    const { rerender } = render(<AsyncButton loading>Save</AsyncButton>);

    expect(getButton().getAttribute("aria-busy")).toBe("true");
    expect(getButton().hasAttribute("disabled")).toBe(true);

    rerender(<AsyncButton loading={false}>Save</AsyncButton>);
    // The spinner stays for the anti-flash minDuration before hiding.
    await waitFor(() => {
      expect(getButton().getAttribute("aria-busy")).toBe("false");
    });
  });

  it("suppresses the auto loading when loading={false} is passed", () => {
    const { promise } = deferred();
    render(
      <AsyncButton loading={false} onClick={() => promise}>
        Save
      </AsyncButton>
    );

    fireEvent.click(getButton());

    expect(getButton().getAttribute("aria-busy")).toBe("false");
  });

  it("replaces children with the spinner for every icon-* size", () => {
    for (const size of ["icon", "icon-xs", "icon-sm", "icon-lg"] as const) {
      const { unmount } = render(
        <AsyncButton loading size={size}>
          <span data-testid="icon-child" />
        </AsyncButton>
      );

      expect(screen.queryByTestId("icon-child")).toBeNull();
      expect(getButton().querySelector("svg")).not.toBeNull();
      unmount();
    }
  });

  it("replaces startIcon with the spinner and keeps children visible", () => {
    render(
      <AsyncButton
        endIcon={<span data-testid="end-icon" />}
        loading
        startIcon={<span data-testid="start-icon" />}
      >
        Save
      </AsyncButton>
    );

    expect(screen.queryByTestId("start-icon")).toBeNull();
    expect(screen.getByTestId("end-icon")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("replaces endIcon with the spinner when startIcon is absent", () => {
    render(
      <AsyncButton endIcon={<span data-testid="end-icon" />} loading>
        Save
      </AsyncButton>
    );

    expect(screen.queryByTestId("end-icon")).toBeNull();
    expect(getButton().querySelector("svg")).not.toBeNull();
  });

  it("falls back to the blur overlay when no icon slot is available", () => {
    render(<AsyncButton loading>Save</AsyncButton>);

    const button = getButton();
    expect(button.className).toContain("relative");
    expect(button.querySelector('[class*="backdrop-blur"]')).not.toBeNull();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("keeps full opacity in every loading mode", () => {
    const loaded = render(
      <AsyncButton loading startIcon={<span />}>
        Save
      </AsyncButton>
    );
    expect(getButton().className).toContain("disabled:opacity-100");
    loaded.unmount();

    render(
      <AsyncButton disabled startIcon={<span />}>
        Save
      </AsyncButton>
    );
    expect(getButton().className).not.toContain("disabled:opacity-100");
  });

  it("hides the spinner from assistive technologies", () => {
    render(<AsyncButton loading>Save</AsyncButton>);

    for (const svg of getButton().querySelectorAll("svg")) {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("owns its button structure and derived busy state at runtime", () => {
    const hostileProps = {
      "aria-busy": "false",
      "aria-disabled": "false",
      "data-slot": "forged-button",
      dangerouslySetInnerHTML: { __html: "Replace" },
      nativeButton: false,
      render: <a href="/replace">Replace render</a>,
      role: "link",
    } as unknown as Parameters<typeof AsyncButton>[0];

    render(
      <AsyncButton loading {...hostileProps}>
        Save
      </AsyncButton>
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("data-slot")).toBe("button");
    expect(screen.queryByText("Replace")).toBeNull();
    expect(screen.queryByText("Replace render")).toBeNull();
  });
});
