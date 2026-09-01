import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toast, toast } from "./toast";

const renderToast = (props: Parameters<typeof Toast>[0] = {}) =>
  render(<Toast timeout={0} {...props} />);

afterEach(() => {
  act(() => toast.close());
});

describe("Toast", () => {
  it("renders one global notification viewport", () => {
    renderToast();

    expect(screen.getByRole("region", { name: "Notifications" })).toBeTruthy();
  });

  it("adds a title and description through the callable facade", async () => {
    renderToast();

    act(() => {
      toast("Event created", { description: "Sunday at 9:00 AM" });
    });

    expect(await screen.findByText("Event created")).toBeTruthy();
    expect(screen.getByText("Sunday at 9:00 AM")).toBeTruthy();
  });

  it.each([
    "success",
    "info",
    "warning",
    "error",
    "loading",
  ] as const)("creates a %s toast", async (type) => {
    renderToast();

    act(() => {
      toast[type](`${type} message`);
    });

    await screen.findByText(`${type} message`);
    expect(
      document.querySelector(`[data-slot="toast"][data-type="${type}"]`)
    ).not.toBeNull();
  });

  it("upserts an existing id instead of adding a duplicate", async () => {
    renderToast();

    act(() => {
      toast("Uploading", { id: "upload" });
      toast.success("Uploaded", { id: "upload" });
    });

    expect(await screen.findByText("Uploaded")).toBeTruthy();
    expect(screen.queryByText("Uploading")).toBeNull();
    expect(document.querySelectorAll('[data-slot="toast"]')).toHaveLength(1);
  });

  it("updates an existing toast", async () => {
    renderToast();
    let id = "";

    act(() => {
      id = toast.loading("Uploading");
    });
    await screen.findByText("Uploading");

    act(() => {
      toast.update(id, "Uploaded", { type: "success" });
    });

    expect(await screen.findByText("Uploaded")).toBeTruthy();
    expect(screen.queryByText("Uploading")).toBeNull();
  });

  it("closes one toast or all toasts", async () => {
    const onFirstClose = vi.fn();
    const onSecondClose = vi.fn();
    renderToast();
    let firstId = "";

    act(() => {
      firstId = toast("First", { onClose: onFirstClose });
      toast("Second", { onClose: onSecondClose });
    });
    await screen.findByText("Second");

    act(() => toast.close(firstId));
    expect(onFirstClose).toHaveBeenCalledTimes(1);
    expect(onSecondClose).not.toHaveBeenCalled();

    act(() => toast.close());
    expect(onSecondClose).toHaveBeenCalledTimes(1);
  });

  it("owns the action label and click wiring", async () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    const hostileClick = vi.fn();
    const hostileActionProps = {
      "aria-disabled": "true",
      children: "Replace",
      className: "undo-action",
      "data-slot": "forged-action",
      dangerouslySetInnerHTML: { __html: "Replace" },
      nativeButton: false,
      onClick: hostileClick,
      render: <a href="/replace">Replace render</a>,
      role: "link",
    } as never;
    renderToast();

    act(() => {
      toast("Draft saved", {
        action: { label: "Undo", onClick: onAction },
        actionButtonProps: hostileActionProps,
        onClose,
      });
    });

    const action = await screen.findByRole("button", { name: "Undo" });
    expect(action.tagName).toBe("BUTTON");
    expect(action.className).toContain("undo-action");
    expect(action.getAttribute("data-slot")).toBe("toast-action");
    expect(action.getAttribute("role")).toBeNull();
    expect(action.getAttribute("aria-disabled")).toBeNull();
    fireEvent.click(action);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(hostileClick).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Replace render")).toBeNull();
  });

  it("keeps an action toast open when the action prevents default", async () => {
    renderToast();

    act(() => {
      toast("Draft saved", {
        action: {
          label: "Keep",
          onClick: (event) => event.preventDefault(),
        },
      });
    });

    fireEvent.click(await screen.findByRole("button", { name: "Keep" }));

    expect(screen.getByText("Draft saved")).toBeTruthy();
    expect(
      document
        .querySelector('[data-slot="toast"]')
        ?.hasAttribute("data-ending-style")
    ).toBe(false);
  });

  it("moves a resolved promise from loading to success and preserves its value", async () => {
    renderToast();
    let resolve!: (value: { name: string }) => void;
    const pending = new Promise<{ name: string }>((done) => {
      resolve = done;
    });
    let tracked!: Promise<{ name: string }>;

    act(() => {
      tracked = toast.promise(pending, {
        error: "Failed",
        loading: "Creating event",
        success: (value) => ({
          description: value.name,
          title: "Event created",
        }),
      });
    });
    await screen.findByText("Creating event");

    await act(async () => {
      resolve({ name: "Design review" });
      await expect(tracked).resolves.toEqual({ name: "Design review" });
    });

    expect(await screen.findByText("Event created")).toBeTruthy();
    expect(screen.getByText("Design review")).toBeTruthy();
  });

  it("moves a rejected promise to error and preserves rejection", async () => {
    renderToast();
    let reject!: (reason: Error) => void;
    const pending = new Promise<never>((_resolve, fail) => {
      reject = fail;
    });
    let tracked!: Promise<never>;

    act(() => {
      tracked = toast.promise(pending, {
        error: (reason) => ({
          description: reason instanceof Error ? reason.message : "Unknown",
          title: "Create failed",
        }),
        loading: "Creating event",
        success: "Created",
      });
    });

    await act(async () => {
      reject(new Error("Network unavailable"));
      await expect(tracked).rejects.toThrow("Network unavailable");
    });

    await waitFor(() => {
      expect(screen.getByText("Create failed")).toBeTruthy();
    });
    expect(screen.getByText("Network unavailable")).toBeTruthy();
  });

  it("routes a success resolver failure through the error state", async () => {
    renderToast();
    let tracked!: Promise<string>;

    await act(async () => {
      tracked = toast.promise(Promise.resolve("saved"), {
        error: (reason) => ({
          description: reason instanceof Error ? reason.message : "Unknown",
          title: "Formatter failed",
        }),
        loading: "Saving",
        success: () => {
          throw new Error("Invalid success message");
        },
      });
      await expect(tracked).rejects.toThrow("Invalid success message");
    });

    expect(await screen.findByText("Formatter failed")).toBeTruthy();
    expect(screen.getByText("Invalid success message")).toBeTruthy();
  });
});
