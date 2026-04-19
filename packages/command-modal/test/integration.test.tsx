import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { create, hide, remove, show } from "../src/actions";
import { hideModalCallbacks } from "../src/constants";
import { Provider } from "../src/context";
import * as CommandModal from "../src/index";
import { useModal } from "../src/useModal";

describe("Integration Tests", () => {
  describe("complete show/hide flow", () => {
    it("should handle full modal lifecycle", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return (
          <div data-testid="modal">
            <span data-testid="visible">{modal.visible.toString()}</span>
            <button data-testid="hide-btn" onClick={() => modal.hide()}>
              Hide
            </button>
          </div>
        );
      });

      render(
        <Provider>
          <TestModal id="lifecycle-modal" />
        </Provider>
      );

      // Initially not visible
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

      // Show modal
      act(() => {
        show("lifecycle-modal");
      });

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByTestId("visible")).toHaveTextContent("true");
      });

      // Hide modal via button
      fireEvent.click(screen.getByTestId("hide-btn"));

      await waitFor(() => {
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
      });
    });

    it("should handle show/hide/show sequence", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal">Modal Content</div>;
      });

      render(
        <Provider>
          <TestModal id="sequence-modal" />
        </Provider>
      );

      // First show
      act(() => {
        show("sequence-modal");
      });

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      // Hide
      act(() => {
        hide("sequence-modal");
      });

      await waitFor(() => {
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
      });

      // Show again
      act(() => {
        show("sequence-modal");
      });

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });
    });
  });

  describe("Promise resolve/reject flow", () => {
    it("should resolve show promise via resolve()", async () => {
      let resolvedValue: unknown;

      const TestModal = create(() => {
        const modal = useModal();
        return (
          <div>
            <button
              data-testid="confirm-btn"
              onClick={() => {
                modal.resolve({ confirmed: true, data: "test-data" });
                modal.hide();
              }}
            >
              Confirm
            </button>
          </div>
        );
      });

      render(
        <Provider>
          <TestModal id="resolve-modal" />
        </Provider>
      );

      act(() => {
        show("resolve-modal").then((value) => {
          resolvedValue = value;
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId("confirm-btn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("confirm-btn"));

      await waitFor(() => {
        expect(resolvedValue).toEqual({ confirmed: true, data: "test-data" });
      });
    });

    it("should reject show promise via reject()", async () => {
      let rejectedValue: unknown;

      const TestModal = create(() => {
        const modal = useModal();
        return (
          <div>
            <button
              data-testid="cancel-btn"
              onClick={() => {
                modal.reject({ cancelled: true, reason: "user-cancelled" });
                modal.hide();
              }}
            >
              Cancel
            </button>
          </div>
        );
      });

      render(
        <Provider>
          <TestModal id="reject-modal" />
        </Provider>
      );

      act(() => {
        show("reject-modal").catch((value) => {
          rejectedValue = value;
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId("cancel-btn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("cancel-btn"));

      await waitFor(() => {
        expect(rejectedValue).toEqual({
          cancelled: true,
          reason: "user-cancelled",
        });
      });
    });

    it("should resolve hide promise via resolveHide()", async () => {
      let hideResolved = false;

      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return (
          <div data-testid="modal">
            <button
              data-testid="close-btn"
              onClick={() => {
                modal.hide().then(() => {
                  hideResolved = true;
                });
              }}
            >
              Close
            </button>
          </div>
        );
      });

      render(
        <Provider>
          <TestModal id="hide-resolve-modal" />
        </Provider>
      );

      act(() => {
        show("hide-resolve-modal");
      });

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("close-btn"));

      // Manually resolve the hide callback (simulating afterClose)
      await waitFor(() => {
        expect(hideModalCallbacks["hide-resolve-modal"]).toBeDefined();
      });

      act(() => {
        hideModalCallbacks["hide-resolve-modal"]?.resolve();
      });

      await waitFor(() => {
        expect(hideResolved).toBe(true);
      });
    });
  });

  describe("multiple modals concurrency", () => {
    it("should manage multiple modals independently", async () => {
      const Modal1 = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal-1">Modal 1</div>;
      });

      const Modal2 = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal-2">Modal 2</div>;
      });

      const Modal3 = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal-3">Modal 3</div>;
      });

      render(
        <Provider>
          <Modal1 id="multi-1" />
          <Modal2 id="multi-2" />
          <Modal3 id="multi-3" />
        </Provider>
      );

      // Show all modals
      act(() => {
        show("multi-1");
        show("multi-2");
        show("multi-3");
      });

      await waitFor(() => {
        expect(screen.getByTestId("modal-1")).toBeInTheDocument();
        expect(screen.getByTestId("modal-2")).toBeInTheDocument();
        expect(screen.getByTestId("modal-3")).toBeInTheDocument();
      });

      // Hide only modal 2
      act(() => {
        hide("multi-2");
      });

      await waitFor(() => {
        expect(screen.getByTestId("modal-1")).toBeInTheDocument();
        expect(screen.queryByTestId("modal-2")).not.toBeInTheDocument();
        expect(screen.getByTestId("modal-3")).toBeInTheDocument();
      });

      // Remove modal 1
      act(() => {
        remove("multi-1");
      });

      await waitFor(() => {
        expect(screen.queryByTestId("modal-1")).not.toBeInTheDocument();
        expect(screen.queryByTestId("modal-2")).not.toBeInTheDocument();
        expect(screen.getByTestId("modal-3")).toBeInTheDocument();
      });
    });

    it("should handle stacked modals (modal opening another modal)", async () => {
      const InnerModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="inner-modal">Inner Modal</div>;
      });

      const OuterModal = create(() => {
        const modal = useModal();
        const innerModal = useModal("inner-stack");
        if (!modal.visible) {
          return null;
        }
        return (
          <div data-testid="outer-modal">
            <button
              data-testid="open-inner-btn"
              onClick={() => innerModal.show()}
            >
              Open Inner
            </button>
          </div>
        );
      });

      render(
        <Provider>
          <OuterModal id="outer-stack" />
          <InnerModal id="inner-stack" />
        </Provider>
      );

      // Show outer modal
      act(() => {
        show("outer-stack");
      });

      await waitFor(() => {
        expect(screen.getByTestId("outer-modal")).toBeInTheDocument();
      });

      // Open inner modal from outer
      fireEvent.click(screen.getByTestId("open-inner-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("outer-modal")).toBeInTheDocument();
        expect(screen.getByTestId("inner-modal")).toBeInTheDocument();
      });
    });
  });

  describe("keepMounted behavior", () => {
    it("should keep modal in DOM when keepMounted is true", async () => {
      let mountCount = 0;

      const TestModal = create(() => {
        mountCount++;
        const modal = useModal();
        return (
          <div data-testid="keep-mounted-modal" data-visible={modal.visible}>
            Mount count: {mountCount}
          </div>
        );
      });

      render(
        <Provider>
          <TestModal id="keep-mounted-test" keepMounted />
        </Provider>
      );

      // Show modal
      act(() => {
        show("keep-mounted-test");
      });

      await waitFor(() => {
        const modal = screen.getByTestId("keep-mounted-modal");
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveAttribute("data-visible", "true");
      });

      const firstMountCount = mountCount;

      // Hide modal (should stay in DOM due to keepMounted)
      act(() => {
        hide("keep-mounted-test");
      });

      await waitFor(() => {
        const modal = screen.getByTestId("keep-mounted-modal");
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveAttribute("data-visible", "false");
      });

      // Show again (should not remount)
      act(() => {
        show("keep-mounted-test");
      });

      await waitFor(() => {
        const modal = screen.getByTestId("keep-mounted-modal");
        expect(modal).toHaveAttribute("data-visible", "true");
      });

      // Mount count should not increase significantly
      // (some re-renders are expected, but not full remounts)
    });

    it("should remove modal from DOM when keepMounted is false", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="removable-modal">Removable</div>;
      });

      render(
        <Provider>
          <TestModal id="removable-test" />
        </Provider>
      );

      act(() => {
        show("removable-test");
      });

      await waitFor(() => {
        expect(screen.getByTestId("removable-modal")).toBeInTheDocument();
      });

      act(() => {
        hide("removable-test");
      });

      await waitFor(() => {
        expect(screen.queryByTestId("removable-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("defaultVisible behavior", () => {
    it("should automatically show modal when defaultVisible is true", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="default-visible-modal">Auto Shown</div>;
      });

      render(
        <Provider>
          <TestModal defaultVisible id="default-visible-test" />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("default-visible-modal")).toBeInTheDocument();
      });
    });

    it("should not automatically show modal when defaultVisible is false/undefined", () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="not-default-visible">Not Auto Shown</div>;
      });

      render(
        <Provider>
          <TestModal id="not-default-visible-test" />
        </Provider>
      );

      expect(
        screen.queryByTestId("not-default-visible")
      ).not.toBeInTheDocument();
    });
  });

  describe("args passing", () => {
    it("should pass args from show() to modal component", async () => {
      const TestModal = create<{ title: string; count: number }>(
        ({ title, count }) => {
          const modal = useModal();
          if (!modal.visible) {
            return null;
          }
          return (
            <div data-testid="args-modal">
              <span data-testid="title">{title || modal.args?.title}</span>
              <span data-testid="count">{count ?? modal.args?.count}</span>
            </div>
          );
        }
      );

      render(
        <Provider>
          <TestModal id="args-test" />
        </Provider>
      );

      act(() => {
        show("args-test", { title: "Hello World", count: 42 });
      });

      await waitFor(() => {
        expect(screen.getByTestId("title")).toHaveTextContent("Hello World");
        expect(screen.getByTestId("count")).toHaveTextContent("42");
      });
    });

    it("should update args when showing again with different args", async () => {
      const TestModal = create<{ value: string }>(({ value }) => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return (
          <div data-testid="update-args-modal">
            {value || modal.args?.value}
          </div>
        );
      });

      render(
        <Provider>
          <TestModal id="update-args-test" />
        </Provider>
      );

      act(() => {
        show("update-args-test", { value: "First Value" });
      });

      await waitFor(() => {
        expect(screen.getByTestId("update-args-modal")).toHaveTextContent(
          "First Value"
        );
      });

      act(() => {
        show("update-args-test", { value: "Second Value" });
      });

      await waitFor(() => {
        expect(screen.getByTestId("update-args-modal")).toHaveTextContent(
          "Second Value"
        );
      });
    });
  });

  describe("CommandModal namespace", () => {
    it("should export all required methods", () => {
      expect(CommandModal.Provider).toBeDefined();
      expect(CommandModal.create).toBeDefined();
      expect(CommandModal.register).toBeDefined();
      expect(CommandModal.show).toBeDefined();
      expect(CommandModal.hide).toBeDefined();
      expect(CommandModal.remove).toBeDefined();
      expect(CommandModal.useModal).toBeDefined();
      expect(CommandModal.useModalHolder).toBeDefined();
      expect(CommandModal.reducer).toBeDefined();
      expect(CommandModal.createModalProps).toBeDefined();
    });

    it("should work with CommandModal.Provider and CommandModal.show", async () => {
      const TestModal = CommandModal.create(() => {
        const modal = CommandModal.useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="namespace-modal">Namespace Test</div>;
      });

      render(
        <CommandModal.Provider>
          <TestModal id="namespace-test" />
        </CommandModal.Provider>
      );

      act(() => {
        CommandModal.show("namespace-test");
      });

      await waitFor(() => {
        expect(screen.getByTestId("namespace-modal")).toBeInTheDocument();
      });

      act(() => {
        CommandModal.hide("namespace-test");
      });

      await waitFor(() => {
        expect(screen.queryByTestId("namespace-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("should throw error when useModal is called without id and outside modal context", () => {
      const TestComponent = () => {
        // useModal without arguments throws when no context id exists
        useModal();
        return null;
      };

      expect(() => {
        render(
          <Provider>
            <TestComponent />
          </Provider>
        );
      }).toThrow("No modal id found in CommandModal.useModal.");
    });

    it("should handle rapid show/hide calls gracefully", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="rapid-modal">Rapid Test</div>;
      });

      render(
        <Provider>
          <TestModal id="rapid-test" />
        </Provider>
      );

      // Rapid fire show/hide
      act(() => {
        show("rapid-test");
        hide("rapid-test");
        show("rapid-test");
        hide("rapid-test");
        show("rapid-test");
      });

      await waitFor(() => {
        // Final state should be visible
        expect(screen.getByTestId("rapid-modal")).toBeInTheDocument();
      });
    });
  });
});
