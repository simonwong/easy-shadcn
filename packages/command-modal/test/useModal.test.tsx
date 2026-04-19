import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { create, register, show } from "../src/actions";
import { Provider } from "../src/context";
import { useModal, useModalHolder } from "../src/useModal";

describe("useModal", () => {
  describe("without arguments (inside modal context)", () => {
    it("should get modal handler from context", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        return (
          <div data-testid="modal">
            <span data-testid="id">{modal.id}</span>
            <span data-testid="visible">{modal.visible.toString()}</span>
          </div>
        );
      });

      render(
        <Provider>
          <TestModal id="context-modal" />
        </Provider>
      );

      act(() => {
        show("context-modal");
      });

      await waitFor(() => {
        expect(screen.getByTestId("id")).toHaveTextContent("context-modal");
        expect(screen.getByTestId("visible")).toHaveTextContent("true");
      });
    });

    it("should throw error when used outside modal context", () => {
      const TestComponent = () => {
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
  });

  describe("with string ID", () => {
    it("should get modal handler by ID", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal">Modal Content</div>;
      });

      const ControlComponent = () => {
        const modal = useModal("controlled-modal");
        return (
          <button data-testid="show-btn" onClick={() => modal.show()}>
            Show
          </button>
        );
      };

      render(
        <Provider>
          <TestModal id="controlled-modal" />
          <ControlComponent />
        </Provider>
      );

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("show-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });
    });

    it("should pass args when showing", async () => {
      const TestModal = create<{ message: string }>(({ message }) => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal">{message || modal.args?.message}</div>;
      });

      const ControlComponent = () => {
        const modal = useModal("args-modal");
        return (
          <button
            data-testid="show-btn"
            onClick={() => modal.show({ message: "Hello from args" })}
          >
            Show
          </button>
        );
      };

      render(
        <Provider>
          <TestModal id="args-modal" />
          <ControlComponent />
        </Provider>
      );

      fireEvent.click(screen.getByTestId("show-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toHaveTextContent(
          "Hello from args"
        );
      });
    });
  });

  describe("with component", () => {
    it("should auto-register component", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal">Auto Registered</div>;
      });

      const ControlComponent = () => {
        const modal = useModal(TestModal);
        return (
          <button data-testid="show-btn" onClick={() => modal.show()}>
            Show
          </button>
        );
      };

      render(
        <Provider>
          <ControlComponent />
        </Provider>
      );

      fireEvent.click(screen.getByTestId("show-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });
    });
  });

  describe("handler methods", () => {
    it("should have show method that returns promise", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        return (
          <div>
            <button
              data-testid="resolve-btn"
              onClick={() => modal.resolve("resolved-value")}
            >
              Resolve
            </button>
          </div>
        );
      });

      let resolvedValue: unknown;

      const ControlComponent = () => {
        const modal = useModal("promise-modal");
        return (
          <button
            data-testid="show-btn"
            onClick={async () => {
              resolvedValue = await modal.show();
            }}
          >
            Show
          </button>
        );
      };

      render(
        <Provider>
          <TestModal id="promise-modal" />
          <ControlComponent />
        </Provider>
      );

      fireEvent.click(screen.getByTestId("show-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("resolve-btn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("resolve-btn"));

      await waitFor(() => {
        expect(resolvedValue).toBe("resolved-value");
      });
    });

    it("should have hide method that hides modal", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal">Visible</div>;
      });

      const ControlComponent = () => {
        const modal = useModal("hide-modal");
        return (
          <>
            <button data-testid="show-btn" onClick={() => modal.show()}>
              Show
            </button>
            <button data-testid="hide-btn" onClick={() => modal.hide()}>
              Hide
            </button>
          </>
        );
      };

      render(
        <Provider>
          <TestModal id="hide-modal" />
          <ControlComponent />
        </Provider>
      );

      fireEvent.click(screen.getByTestId("show-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("hide-btn"));

      await waitFor(() => {
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
      });
    });

    it("should have resolve method that resolves show promise", async () => {
      let showPromise: Promise<unknown>;
      let resolvedValue: unknown;

      const TestModal = create(() => {
        const modal = useModal();
        return (
          <button
            data-testid="resolve-btn"
            onClick={() => modal.resolve("test-value")}
          >
            Resolve
          </button>
        );
      });

      const ControlComponent = () => {
        const modal = useModal("resolve-modal");
        return (
          <button
            data-testid="show-btn"
            onClick={() => {
              showPromise = modal.show();
              showPromise.then((v) => {
                resolvedValue = v;
              });
            }}
          >
            Show
          </button>
        );
      };

      render(
        <Provider>
          <TestModal id="resolve-modal" />
          <ControlComponent />
        </Provider>
      );

      fireEvent.click(screen.getByTestId("show-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("resolve-btn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("resolve-btn"));

      await waitFor(() => {
        expect(resolvedValue).toBe("test-value");
      });
    });

    it("should have reject method that rejects show promise", async () => {
      let rejectedValue: unknown;

      const TestModal = create(() => {
        const modal = useModal();
        return (
          <button
            data-testid="reject-btn"
            onClick={() => modal.reject("error-value")}
          >
            Reject
          </button>
        );
      });

      const ControlComponent = () => {
        const modal = useModal("reject-modal");
        return (
          <button
            data-testid="show-btn"
            onClick={() => {
              modal.show().catch((v) => {
                rejectedValue = v;
              });
            }}
          >
            Show
          </button>
        );
      };

      render(
        <Provider>
          <TestModal id="reject-modal" />
          <ControlComponent />
        </Provider>
      );

      fireEvent.click(screen.getByTestId("show-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("reject-btn")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("reject-btn"));

      await waitFor(() => {
        expect(rejectedValue).toBe("error-value");
      });
    });

    it("should have remove method", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        return <div data-testid="modal">Content</div>;
      });

      const ControlComponent = () => {
        const modal = useModal("remove-modal");
        return (
          <>
            <button data-testid="show-btn" onClick={() => modal.show()}>
              Show
            </button>
            <button data-testid="remove-btn" onClick={() => modal.remove()}>
              Remove
            </button>
          </>
        );
      };

      render(
        <Provider>
          <TestModal id="remove-modal" />
          <ControlComponent />
        </Provider>
      );

      fireEvent.click(screen.getByTestId("show-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("remove-btn"));

      await waitFor(() => {
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("modalProps", () => {
    it("should return correct modalProps object", async () => {
      let capturedModalProps: ReturnType<typeof useModal>["modalProps"];

      const TestModal = create(() => {
        const modal = useModal();
        capturedModalProps = modal.modalProps;
        return <div data-testid="modal">Content</div>;
      });

      render(
        <Provider>
          <TestModal id="modalprops-test" />
        </Provider>
      );

      act(() => {
        show("modalprops-test");
      });

      await waitFor(() => {
        expect(capturedModalProps).toBeDefined();
        expect(capturedModalProps.open).toBe(true);
        expect(typeof capturedModalProps.onOpenChange).toBe("function");
        expect(typeof capturedModalProps.afterClose).toBe("function");
      });
    });
  });
});

describe("useModalHolder", () => {
  it("should return handler and Holder component", () => {
    const TestModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="holder-modal">Holder Modal</div>;
    });

    register("holder-test", TestModal);

    const HolderTest = () => {
      const [handler, Holder] = useModalHolder("holder-test");
      return (
        <>
          <button data-testid="show-btn" onClick={() => handler.show()}>
            Show
          </button>
          <Holder />
        </>
      );
    };

    render(
      <Provider>
        <HolderTest />
      </Provider>
    );

    expect(screen.queryByTestId("holder-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("show-btn"));

    // Note: The ModalHolder creates its own internal ID, so the modal should show
    // This test validates the basic structure works
  });
});
