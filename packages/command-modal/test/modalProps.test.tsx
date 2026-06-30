import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it, vi } from "vitest";
import { create, hide, show } from "../src/actions";
import { hideModalCallbacks } from "../src/constants";
import { CommandModalContext, Provider } from "../src/context";
import type { ShadCNModalProps } from "../src/type";
import { createModalProps, useModal } from "../src/useModal";
import { makeHandler } from "./test-utils";

describe("modalProps", () => {
  describe("open property", () => {
    it("should return open=true when modal is visible", () => {
      const result = createModalProps(makeHandler({ visible: true }));

      expect(result.open).toBe(true);
    });

    it("should return open=false when modal is not visible", () => {
      const result = createModalProps(makeHandler({ visible: false }));

      expect(result.open).toBe(false);
    });
  });

  describe("onOpenChange callback", () => {
    it("should call show() when onOpenChange(true) is called", () => {
      const showMock = vi.fn();
      const result = createModalProps(makeHandler({ show: showMock }));

      result.onOpenChange?.(true);

      expect(showMock).toHaveBeenCalled();
    });

    it("should call hide() when onOpenChange(false) is called", () => {
      const hideMock = vi.fn();
      const result = createModalProps(
        makeHandler({ visible: true, hide: hideMock })
      );

      result.onOpenChange?.(false);

      expect(hideMock).toHaveBeenCalled();
    });
  });

  describe("onOpenChangeComplete callback", () => {
    it("should call resolveHide() when onOpenChangeComplete(false) is called", () => {
      const resolveHideMock = vi.fn();
      const result = createModalProps(
        makeHandler({ resolveHide: resolveHideMock })
      );

      result.onOpenChangeComplete?.(false);

      expect(resolveHideMock).toHaveBeenCalled();
    });

    it("should call remove() on close-complete when keepMounted is false", () => {
      const removeMock = vi.fn();
      const result = createModalProps(makeHandler({ remove: removeMock }));

      result.onOpenChangeComplete?.(false);

      expect(removeMock).toHaveBeenCalled();
    });

    it("should NOT call remove() on close-complete when keepMounted is true", () => {
      const removeMock = vi.fn();
      const result = createModalProps(
        makeHandler({ keepMounted: true, remove: removeMock })
      );

      result.onOpenChangeComplete?.(false);

      expect(removeMock).not.toHaveBeenCalled();
    });

    it("should be a no-op on open-complete — Base UI also fires this on open", () => {
      const resolveHideMock = vi.fn();
      const removeMock = vi.fn();
      const result = createModalProps(
        makeHandler({ resolveHide: resolveHideMock, remove: removeMock })
      );

      result.onOpenChangeComplete?.(true);

      expect(resolveHideMock).not.toHaveBeenCalled();
      expect(removeMock).not.toHaveBeenCalled();
    });
  });

  describe("integration with useModal.modalProps", () => {
    it("should have same behavior as standalone modalProps function", async () => {
      let capturedModalProps: ReturnType<typeof createModalProps> | undefined;

      const TestModal = create(() => {
        const modal = useModal();
        capturedModalProps = modal.modalProps;
        if (!modal.visible) {
          return null;
        }
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

        if (!props.open) {
          return null;
        }

        return (
          <div data-testid="dialog">
            <button
              data-testid="close-btn"
              onClick={() => {
                props.onOpenChange?.(false);
                props.onOpenChangeComplete?.(false);
              }}
              type="button"
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
        if (!open) {
          return null;
        }
        return (
          <div data-testid="dialog-root">
            <button
              data-testid="dialog-overlay"
              onClick={() => onOpenChange?.(false)}
              type="button"
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

    it("removes the reducer entry end-to-end when the dialog fires onOpenChangeComplete (no leak)", async () => {
      // The precise leak signal lives in the reducer, not the promise stores:
      // hide() keeps the entry as `{ visible: false }`, only remove() deletes
      // it. A probe reads the reducer state so the test can tell them apart.
      let reducerState: Record<string, { visible?: boolean } | undefined> = {};
      const Probe: React.FC = () => {
        reducerState = useContext(CommandModalContext);
        return null;
      };

      // A Base-UI-shaped dialog: it reads `onOpenChangeComplete` and fires it
      // once its close transition finishes. If the adapter ever stops emitting
      // that prop (e.g. reverting to antd's `afterClose`), this dialog gets
      // `undefined` here, only `onOpenChange → hide()` runs, and the reducer
      // entry lingers `visible:false` forever — the leak this guards against.
      const Dialog: React.FC<
        ShadCNModalProps & { children?: React.ReactNode }
      > = ({ open, onOpenChange, onOpenChangeComplete, children }) => {
        if (!open) {
          return null;
        }
        return (
          <div data-testid="leak-dialog">
            {children}
            <button
              data-testid="leak-close"
              onClick={() => {
                onOpenChange?.(false);
                onOpenChangeComplete?.(false);
              }}
              type="button"
            />
          </div>
        );
      };

      const TestModal = create(() => {
        const modal = useModal();
        return (
          <Dialog {...modal.modalProps}>
            <div data-testid="leak-content">Content</div>
          </Dialog>
        );
      });

      render(
        <Provider>
          <Probe />
          <TestModal id="leak-test" />
        </Provider>
      );

      act(() => {
        show("leak-test");
      });

      await waitFor(() => {
        expect(screen.getByTestId("leak-dialog")).toBeInTheDocument();
        expect(reducerState["leak-test"]?.visible).toBe(true);
      });

      fireEvent.click(screen.getByTestId("leak-close"));

      await waitFor(() => {
        expect(screen.queryByTestId("leak-dialog")).not.toBeInTheDocument();
        // remove() must delete the reducer entry. With the old afterClose
        // wiring a raw Dialog only fired hide(), leaving the entry behind.
        expect(reducerState["leak-test"]).toBeUndefined();
      });
    });
  });
});
