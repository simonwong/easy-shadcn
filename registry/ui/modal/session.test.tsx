import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlertDialog } from "../alert-dialog";
import { AlertModal } from "./alert-modal";
import { Modal } from "./modal";

describe.each([
  Modal,
  AlertModal,
  AlertDialog,
])("dialog session isolation", (Component) => {
  it.each([
    "OK",
    "Cancel",
  ])("ignores old %s completion after reopening", async (label) => {
    let complete!: () => void;
    const pending = new Promise<void>((resolve) => {
      complete = resolve;
    });
    const onOpenChange = vi.fn();
    const props = {
      title: "Session",
      onConfirm: () => pending,
      onCancel: () => pending,
      onOpenChange,
    };
    const view = render(<Component {...props} open />);
    fireEvent.click(screen.getByRole("button", { name: label }));
    view.rerender(<Component {...props} open={false} />);
    view.rerender(<Component {...props} open />);
    onOpenChange.mockClear();
    await act(async () => {
      complete();
      await pending;
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
  it("ignores completion after unmount", async () => {
    let complete!: () => void;
    const pending = new Promise<void>((resolve) => {
      complete = resolve;
    });
    const onOpenChange = vi.fn();
    const view = render(
      <Component
        onConfirm={() => pending}
        onOpenChange={onOpenChange}
        open
        title="Session"
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    view.unmount();
    await act(async () => {
      complete();
      await pending;
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
