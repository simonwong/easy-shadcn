import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { create, hide, show } from "../src/actions";
import { hideModalCallbacks } from "../src/constants";
import { Provider } from "../src/context";
import type { CommandModalHandler } from "../src/type";
import { createModalProps as modalProps, useModal } from "../src/useModal";

describe("modalProps", () => {
  describe("open property", () => {
    it("should return open=true when modal is visible", () => {
      const mockHandler: CommandModalHandler = {
        id: "test",
        visible: true,
        keepMounted: false,
        show: vi.fn(),
        hide: vi.fn(),
        resolve: vi.fn(),
        reject: vi.fn(),
        remove: vi.fn(),
        resolveHide: vi.fn(),
      };

      const result = modalProps(mockHandler);

      expect(result.open).toBe(true);
    });

    it("should return open=false when modal is not visible", () => {
      const mockHandler: CommandModalHandler = {
        id: "test",
        visible: false,
        keepMounted: false,
        show: vi.fn(),
        hide: vi.fn(),
        resolve: vi.fn(),
        reject: vi.fn(),
        remove: vi.fn(),
        resolveHide: vi.fn(),
      };

      const result = modalProps(mockHandler);

      expect(result.open).toBe(false);
    });
  });

  describe("onOpenChange callback", () => {
    it("should call show() when onOpenChange(true) is called", () => {
      const showMock = vi.fn();
      const mockHandler: CommandModalHandler = {
        id: "test",
        visible: false,
        keepMounted: false,
        show: showMock,
        hide: vi.fn(),
        resolve: vi.fn(),
        reject: vi.fn(),
        remove: vi.fn(),
        resolveHide: vi.fn(),
      };

      const result = modalProps(mockHandler);
      result.onOpenChange?.(true);

      expect(showMock).toHaveBeenCalled();
    });

    it("should call hide() when onOpenChange(false) is called", () => {
      const hideMock = vi.fn();
      const mockHandler: CommandModalHandler = {
        id: "test",
        visible: true,
        keepMounted: false,
        show: vi.fn(),
        hide: hideMock,
        resolve: vi.fn(),
        reject: vi.fn(),
        remove: vi.fn(),
        resolveHide: vi.fn(),
      };

      const result = modalProps(mockHandler);
      result.onOpenChange?.(false);

      expect(hideMock).toHaveBeenCalled();
    });
  });

  describe("afterClose callback", () => {
    it("should call resolveHide() when afterClose is called", () => {
      const resolveHideMock = vi.fn();
      const mockHandler: CommandModalHandler = {
        id: "test",
        visible: false,
        keepMounted: false,
        show: vi.fn(),
        hide: vi.fn(),
        resolve: vi.fn(),
        reject: vi.fn(),
        remove: vi.fn(),
        resolveHide: resolveHideMock,
      };

      const result = modalProps(mockHandler);
      result.afterClose?.();

      expect(resolveHideMock).toHaveBeenCalled();
    });

    it("should call remove() when afterClose is called and keepMounted is false", () => {
      const removeMock = vi.fn();
      const mockHandler: CommandModalHandler = {
        id: "test",
        visible: false,
        keepMounted: false,
        show: vi.fn(),
        hide: vi.fn(),
        resolve: vi.fn(),
        reject: vi.fn(),
        remove: removeMock,
        resolveHide: vi.fn(),
      };

      const result = modalProps(mockHandler);
      result.afterClose?.();

      expect(removeMock).toHaveBeenCalled();
    });

    it("should NOT call remove() when afterClose is called and keepMounted is true", () => {
      const removeMock = vi.fn();
      const mockHandler: CommandModalHandler = {
        id: "test",
        visible: false,
        keepMounted: true,
        show: vi.fn(),
        hide: vi.fn(),
        resolve: vi.fn(),
        reject: vi.fn(),
        remove: removeMock,
        resolveHide: vi.fn(),
      };

      const result = modalProps(mockHandler);
      result.afterClose?.();

      expect(removeMock).not.toHaveBeenCalled();
    });
  });

  describe("integration with useModal.modalProps", () => {
    it("should have same behavior as standalone modalProps function", async () => {
      let capturedModalProps: ReturnType<typeof modalProps> | undefined;

      const TestModal = create(() => {
        const modal = useModal();
        capturedModalProps = modal.modalProps;
        if (!modal.visible) return null;
        return <div data-testid="modal">Content</div>;
      });

      render(
        <Provider>
          <TestModal id="integration-test" />
        </Provider>
      );

      act(() => {
        show("integration-test");
      });

      await waitFor(() => {
        expect(capturedModalProps).toBeDefined();
        expect(capturedModalProps?.open).toBe(true);
      });

      // Test onOpenChange(false)
      act(() => {
        capturedModalProps?.onOpenChange?.(false);
      });

      await waitFor(() => {
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
      });
    });

    it("should handle full dialog lifecycle with modalProps", async () => {
      let hidePromiseResolved = false;

      const TestModal = create(() => {
        const modal = useModal();
        const props = modal.modalProps;

        if (!props.open) return null;

        return (
          <div data-testid="dialog">
            <button
              data-testid="close-btn"
              onClick={() => {
                props.onOpenChange?.(false);
                props.afterClose?.();
              }}
            >
              Close
            </button>
          </div>
        );
      });

      render(
        <Provider>
          <TestModal id="lifecycle-test" />
        </Provider>
      );

      // Show modal and get hide promise
      let hidePromise: Promise<unknown>;
      act(() => {
        show("lifecycle-test");
      });

      await waitFor(() => {
        expect(screen.getByTestId("dialog")).toBeInTheDocument();
      });

      act(() => {
        hidePromise = hide("lifecycle-test");
        hidePromise.then(() => {
          hidePromiseResolved = true;
        });
      });

      // Manually trigger afterClose (simulating animation complete)
      await waitFor(() => {
        expect(hideModalCallbacks["lifecycle-test"]).toBeDefined();
      });

      // Resolve the hide callback
      act(() => {
        hideModalCallbacks["lifecycle-test"]?.resolve();
      });

      await waitFor(() => {
        expect(hidePromiseResolved).toBe(true);
      });
    });
  });

  describe("with shadcn Dialog simulation", () => {
    it("should work with Dialog-like component", async () => {
      const Dialog: React.FC<{
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
        children?: React.ReactNode;
      }> = ({ open, onOpenChange, children }) => {
        if (!open) return null;
        return (
          <div data-testid="dialog-root">
            <div
              data-testid="dialog-overlay"
              onClick={() => onOpenChange?.(false)}
            />
            <div data-testid="dialog-content">{children}</div>
          </div>
        );
      };

      const TestModal = create(() => {
        const modal = useModal();
        return (
          <Dialog {...modal.modalProps}>
            <div data-testid="modal-content">Modal Content</div>
          </Dialog>
        );
      });

      render(
        <Provider>
          <TestModal id="dialog-test" />
        </Provider>
      );

      expect(screen.queryByTestId("dialog-root")).not.toBeInTheDocument();

      act(() => {
        show("dialog-test");
      });

      await waitFor(() => {
        expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
        expect(screen.getByTestId("modal-content")).toBeInTheDocument();
      });

      // Click overlay to close
      fireEvent.click(screen.getByTestId("dialog-overlay"));

      await waitFor(() => {
        expect(screen.queryByTestId("dialog-root")).not.toBeInTheDocument();
      });
    });
  });
});
