import CommandModal from "@easy-shadcn/command-modal";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AlertModalHelper from "./alert-modal-helper";
import { AlertModal, Modal } from "./index";

const deferred = () => {
  let resolve!: () => void;
  let reject!: (err: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Modal", () => {
  it("renders title, description, body, and class overrides", () => {
    render(
      <Modal
        contentClassName="content-x"
        description="Modal description"
        headerClassName="header-x"
        open
        title="Modal title"
      >
        Modal body
      </Modal>
    );

    expect(screen.getByText("Modal title")).toBeTruthy();
    expect(screen.getByText("Modal description")).toBeTruthy();
    expect(screen.getByText("Modal body").className).toContain("content-x");
    expect(
      document.querySelector('[data-slot="dialog-header"]')?.className
    ).toContain("header-x");
  });

  it("renders no footer by default", () => {
    render(
      <Modal open title="No footer">
        Body
      </Modal>
    );

    expect(document.querySelector('[data-slot="dialog-footer"]')).toBeNull();
  });

  it("renders the flat confirm/cancel footer and closes after onConfirm resolves", async () => {
    const { promise, resolve } = deferred();
    const onConfirm = vi.fn(() => promise);
    const onOpenChange = vi.fn();

    render(
      <Modal onConfirm={onConfirm} onOpenChange={onOpenChange} open title="T">
        Body
      </Modal>
    );

    const ok = screen.getByRole("button", { name: "OK" });
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();

    fireEvent.click(ok);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();

    resolve();
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("stays open when onConfirm rejects", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {
      // silence expected error logging
    });
    const onOpenChange = vi.fn();

    render(
      <Modal
        onConfirm={() => Promise.reject(new Error("boom"))}
        onOpenChange={onOpenChange}
        open
        title="T"
      >
        Body
      </Modal>
    );

    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() => {
      expect(error).toHaveBeenCalled();
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("lets an explicit footer override the default confirm/cancel footer", () => {
    render(
      <Modal footer={<span>Custom footer</span>} onConfirm={vi.fn()} open>
        Body
      </Modal>
    );

    expect(screen.getByText("Custom footer")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "OK" })).toBeNull();
  });
});

describe("AlertModal", () => {
  it("closes after cancel and reports through onOpenChange", async () => {
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <AlertModal
        onCancel={onCancel}
        onOpenChange={onOpenChange}
        open
        title="Sure?"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("hides the cancel button with showCancel={false}", () => {
    render(<AlertModal open showCancel={false} title="Heads up" />);

    expect(screen.getByRole("button", { name: "OK" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });

  it("forwards confirmProps to the confirm button", () => {
    render(
      <AlertModal
        confirmProps={{ variant: "destructive" }}
        confirmText="Delete"
        open
        title="Delete?"
      />
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
  });
});

describe("AlertModal helpers", () => {
  it("confirm() resolves true on OK and cleans up its registry entry", async () => {
    const unregister = vi.spyOn(CommandModal, "unregister");
    render(<CommandModal.Provider>{null}</CommandModal.Provider>);

    let result: Promise<boolean>;
    act(() => {
      result = AlertModalHelper.confirm({ title: "Proceed?" });
    });

    fireEvent.click(await screen.findByRole("button", { name: "OK" }));

    await expect(result!).resolves.toBe(true);
    await waitFor(() => {
      expect(unregister).toHaveBeenCalledTimes(1);
    });
  });

  it("confirm() resolves false on cancel instead of rejecting", async () => {
    render(<CommandModal.Provider>{null}</CommandModal.Provider>);

    let result: Promise<boolean>;
    act(() => {
      result = AlertModalHelper.confirm({ title: "Proceed?" });
    });

    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));

    await expect(result!).resolves.toBe(false);
  });

  it("alert() renders a single OK button and resolves on confirm", async () => {
    render(<CommandModal.Provider>{null}</CommandModal.Provider>);

    let result: Promise<void>;
    act(() => {
      result = AlertModalHelper.alert({ title: "Saved" });
    });

    await screen.findByRole("button", { name: "OK" });
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await expect(result!).resolves.toBeUndefined();
  });

  it("chains the caller's afterClose instead of overwriting it", async () => {
    const afterClose = vi.fn();
    render(<CommandModal.Provider>{null}</CommandModal.Provider>);

    let result: Promise<void>;
    act(() => {
      result = AlertModalHelper.alert({ afterClose, title: "Saved" });
    });

    fireEvent.click(await screen.findByRole("button", { name: "OK" }));
    await result!;

    await waitFor(() => {
      expect(afterClose).toHaveBeenCalledTimes(1);
    });
  });
});
