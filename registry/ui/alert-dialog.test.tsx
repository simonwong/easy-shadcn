import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlertDialog } from "./alert-dialog";
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

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`);

describe("AlertDialog — core (Slice 1)", () => {
  it("renders title and description with data-slot attributes", () => {
    render(
      <AlertDialog
        defaultOpen
        description="Alert description"
        title="Alert title"
      />
    );

    expect(slot("alert-dialog-title")?.textContent).toBe("Alert title");
    expect(slot("alert-dialog-description")?.textContent).toBe(
      "Alert description"
    );
  });

  it("omits the header when neither title nor description is present", () => {
    render(<AlertDialog defaultOpen />);

    expect(slot("alert-dialog-header")).toBeNull();
    expect(screen.getByRole("button", { name: "OK" })).toBeTruthy();
  });

  it("renders 0 and empty string as valid slot content", () => {
    render(<AlertDialog defaultOpen description="" title={0} />);

    expect(slot("alert-dialog-header")).not.toBeNull();
    expect(slot("alert-dialog-title")?.textContent).toBe("0");
    expect(slot("alert-dialog-description")).not.toBeNull();
  });

  it("treats null/undefined/boolean title and description as absent", () => {
    render(<AlertDialog defaultOpen description={false} title={null} />);

    expect(slot("alert-dialog-header")).toBeNull();
  });

  it("always renders the confirm button", () => {
    render(<AlertDialog defaultOpen title="Heads up" />);

    expect(screen.getByRole("button", { name: "OK" })).toBeTruthy();
  });

  it("opens from the trigger and closes after confirm (uncontrolled)", async () => {
    const onOpenChange = vi.fn();
    render(
      <AlertDialog
        onOpenChange={onOpenChange}
        title="Confirm?"
        trigger={<AsyncButton>Open</AsyncButton>}
      />
    );

    expect(screen.queryByRole("button", { name: "OK" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("button", { name: "OK" });
    expect(onOpenChange).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("fires onConfirm before closing", async () => {
    const calls: string[] = [];
    const onConfirm = vi.fn(() => {
      calls.push("confirm");
    });
    const onOpenChange = vi.fn(() => {
      calls.push("close");
    });

    render(
      <AlertDialog
        defaultOpen
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        title="T"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(calls).toEqual(["confirm", "close"]);
  });

  it("stays open while an async onConfirm is pending and closes on resolve", async () => {
    const { promise, resolve } = deferred();
    const onConfirm = vi.fn(() => promise);
    const onOpenChange = vi.fn();

    render(
      <AlertDialog
        defaultOpen
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        title="T"
      />
    );

    const ok = screen.getByRole("button", { name: "OK" });
    fireEvent.click(ok);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(ok.getAttribute("aria-busy")).toBe("true");
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    resolve();
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("keeps the dialog open and retryable when onConfirm rejects", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {
      // silence expected rejection logging
    });
    const onOpenChange = vi.fn();
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(undefined);

    render(
      <AlertDialog
        defaultOpen
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        title="T"
      />
    );

    const ok = screen.getByRole("button", { name: "OK" });
    fireEvent.click(ok);
    await waitFor(() => {
      expect(error).toHaveBeenCalled();
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    // AsyncButton keeps a minimum visible loading window; wait for re-enable
    // before retrying so the second click is not swallowed while disabled.
    await waitFor(() => {
      expect(ok.getAttribute("aria-busy")).toBe("false");
    });
    fireEvent.click(ok);
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(onConfirm).toHaveBeenCalledTimes(2);

    error.mockRestore();
  });

  it("closes on Escape but not on outside/overlay click", async () => {
    const onOpenChange = vi.fn();
    render(
      <AlertDialog defaultOpen onOpenChange={onOpenChange} title="Heads up" />
    );

    const overlay = slot("alert-dialog-overlay");
    if (overlay) {
      fireEvent.pointerDown(overlay);
      fireEvent.click(overlay);
    }
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    fireEvent.keyDown(screen.getByRole("button", { name: "OK" }), {
      key: "Escape",
    });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("forwards className, size, and every slot className", () => {
    render(
      <AlertDialog
        className="root-x"
        defaultOpen
        description="Description"
        descriptionClassName="description-x"
        footerClassName="footer-x"
        headerClassName="header-x"
        size="sm"
        title="Title"
        titleClassName="title-x"
      />
    );

    expect(slot("alert-dialog-content")?.className).toContain("root-x");
    expect(slot("alert-dialog-content")?.getAttribute("data-size")).toBe("sm");
    expect(slot("alert-dialog-header")?.className).toContain("header-x");
    expect(slot("alert-dialog-title")?.className).toContain("title-x");
    expect(slot("alert-dialog-description")?.className).toContain(
      "description-x"
    );
    expect(slot("alert-dialog-footer")?.className).toContain("footer-x");
  });
});

describe("AlertDialog — controlled, cancel, defaults (Slice 2)", () => {
  it("shows the cancel button by default with the default label", () => {
    render(<AlertDialog defaultOpen title="T" />);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "OK" })).toBeTruthy();
  });

  it("hides the cancel button with showCancel={false}", () => {
    render(<AlertDialog defaultOpen showCancel={false} title="T" />);

    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    expect(screen.getByRole("button", { name: "OK" })).toBeTruthy();
  });

  it("overrides confirm and cancel labels", () => {
    render(
      <AlertDialog
        cancelText="Dismiss"
        confirmText="Delete"
        defaultOpen
        title="T"
      />
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
  });

  it("fires onCancel before closing and reports through onOpenChange", async () => {
    const calls: string[] = [];
    const onCancel = vi.fn(() => {
      calls.push("cancel");
    });
    const onOpenChange = vi.fn(() => {
      calls.push("close");
    });

    render(
      <AlertDialog
        defaultOpen
        onCancel={onCancel}
        onOpenChange={onOpenChange}
        title="T"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(["cancel", "close"]);
  });

  it("awaits an async onCancel before closing", async () => {
    const { promise, resolve } = deferred();
    const onCancel = vi.fn(() => promise);
    const onOpenChange = vi.fn();

    render(
      <AlertDialog
        defaultOpen
        onCancel={onCancel}
        onOpenChange={onOpenChange}
        title="T"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    resolve();
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("controlled: open prop drives visibility and confirm does not close on its own", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <AlertDialog onOpenChange={onOpenChange} open title="T" />
    );

    expect(screen.getByRole("button", { name: "OK" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    // Parent has not updated `open`, so the dialog stays open.
    expect(screen.getByRole("button", { name: "OK" })).toBeTruthy();

    rerender(
      <AlertDialog onOpenChange={onOpenChange} open={false} title="T" />
    );
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "OK" })).toBeNull();
    });
  });

  it("controlled: does not fall back to internal open state", () => {
    render(<AlertDialog onOpenChange={vi.fn()} open={false} title="T" />);

    expect(screen.queryByRole("button", { name: "OK" })).toBeNull();
  });
});

describe("AlertDialog — composition (Slice 3)", () => {
  it("footer replaces the entire confirm/cancel button row", () => {
    render(
      <AlertDialog
        cancelText="Cancel"
        confirmText="OK"
        defaultOpen
        footer={<span>Custom footer</span>}
        title="T"
      />
    );

    expect(screen.getByText("Custom footer")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "OK" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });

  it("variant='destructive' makes the confirm button destructive; cancel stays outline", () => {
    render(<AlertDialog defaultOpen title="T" variant="destructive" />);

    const confirm = screen.getByRole("button", { name: "OK" });
    const cancel = screen.getByRole("button", { name: "Cancel" });

    expect(confirm.className).toContain("bg-destructive/10");
    expect(cancel.className).toContain("border-border");
  });

  it("defaults the confirm button to the primary variant", () => {
    render(<AlertDialog defaultOpen title="T" />);

    expect(screen.getByRole("button", { name: "OK" }).className).toContain(
      "bg-primary"
    );
  });

  it("confirmProps.variant overrides the variant sugar", () => {
    render(
      <AlertDialog
        confirmProps={{ variant: "secondary" }}
        defaultOpen
        title="T"
        variant="destructive"
      />
    );

    const confirm = screen.getByRole("button", { name: "OK" });
    expect(confirm.className).toContain("bg-secondary");
    expect(confirm.className).not.toContain("bg-destructive/10");
  });

  it("cancelProps.variant overrides the default outline variant", () => {
    render(
      <AlertDialog
        cancelProps={{ variant: "secondary" }}
        defaultOpen
        title="T"
      />
    );

    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(cancel.className).toContain("bg-secondary");
    expect(cancel.className).not.toContain("border-border");
  });

  it("forwards confirmProps and cancelProps to their buttons", () => {
    render(
      <AlertDialog
        cancelProps={{ className: "cancel-x" }}
        confirmProps={{ className: "confirm-x" }}
        defaultOpen
        title="T"
      />
    );

    expect(screen.getByRole("button", { name: "OK" }).className).toContain(
      "confirm-x"
    );
    expect(screen.getByRole("button", { name: "Cancel" }).className).toContain(
      "cancel-x"
    );
  });

  it("keeps the confirm close wiring intact when legit confirmProps are passed", async () => {
    // ADR-0004 category 2: confirmProps Omits `onClick`/`children`, so external
    // props can't desync the dialog's own confirm + close logic.
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <AlertDialog
        confirmProps={{ variant: "outline" }}
        defaultOpen
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        title="T"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("keeps the cancel close wiring intact when legit cancelProps are passed", async () => {
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <AlertDialog
        cancelProps={{ className: "cancel-x" }}
        defaultOpen
        onCancel={onCancel}
        onOpenChange={onOpenChange}
        title="T"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("ignores a hostile confirmProps.onClick and preserves confirm + close wiring", async () => {
    const hostileClick = vi.fn();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    const hostileProps = {
      confirmProps: { onClick: hostileClick },
    } as unknown as Parameters<typeof AlertDialog>[0];

    render(
      <AlertDialog
        {...hostileProps}
        defaultOpen
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        title="T"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(hostileClick).not.toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("ignores hostile confirm label injection and preserves confirmText", () => {
    const hostileProps = {
      confirmProps: {
        "aria-disabled": "true",
        children: "Forged child",
        "data-slot": "forged-action",
        dangerouslySetInnerHTML: { __html: "<span>Forged HTML</span>" },
        nativeButton: false,
        render: <a href="/replace">Forged render</a>,
        role: "link",
      },
    } as unknown as Parameters<typeof AlertDialog>[0];

    expect(() => {
      render(
        <AlertDialog
          {...hostileProps}
          confirmText="Safe confirm"
          defaultOpen
          title="T"
        />
      );
    }).not.toThrow();
    const confirm = screen.getByRole("button", { name: "Safe confirm" });
    expect(confirm.tagName).toBe("BUTTON");
    expect(confirm.getAttribute("data-slot")).toBe("button");
    expect(confirm.getAttribute("role")).toBeNull();
    expect(confirm.getAttribute("aria-disabled")).toBeNull();
    expect(screen.queryByText("Forged child")).toBeNull();
    expect(screen.queryByText("Forged HTML")).toBeNull();
    expect(screen.queryByText("Forged render")).toBeNull();
  });

  it("ignores hostile cancel props and preserves cancel + close wiring", async () => {
    const hostileClick = vi.fn();
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    const hostileProps = {
      cancelProps: {
        children: "Forged child",
        dangerouslySetInnerHTML: { __html: "<span>Forged HTML</span>" },
        onClick: hostileClick,
      },
    } as unknown as Parameters<typeof AlertDialog>[0];

    render(
      <AlertDialog
        {...hostileProps}
        cancelText="Safe cancel"
        defaultOpen
        onCancel={onCancel}
        onOpenChange={onOpenChange}
        title="T"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Safe cancel" }));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(hostileClick).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Forged child")).toBeNull();
    expect(screen.queryByText("Forged HTML")).toBeNull();
  });
});
