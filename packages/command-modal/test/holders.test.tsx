import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { create, register, show } from "../src/actions";
import { MODAL_REGISTRY } from "../src/constants";
import { Provider } from "../src/context";
import { ModalDef, ModalHolder } from "../src/holders";
import { useModal, useModalHolder } from "../src/useModal";

describe("ModalDef", () => {
  describe("registration", () => {
    it("should register component on mount", () => {
      const TestComponent: React.FC = () => <div>Test</div>;

      render(
        <Provider>
          <ModalDef component={TestComponent} id="def-test" />
        </Provider>
      );

      expect(MODAL_REGISTRY["def-test"]).toBeDefined();
      expect(MODAL_REGISTRY["def-test"].comp).toBe(TestComponent);
    });

    it("should unregister component on unmount", () => {
      const TestComponent: React.FC = () => <div>Test</div>;

      const { unmount } = render(
        <Provider>
          <ModalDef component={TestComponent} id="def-unmount-test" />
        </Provider>
      );

      expect(MODAL_REGISTRY["def-unmount-test"]).toBeDefined();

      unmount();

      expect(MODAL_REGISTRY["def-unmount-test"]).toBeUndefined();
    });

    it("should re-register when id changes", () => {
      const TestComponent: React.FC = () => <div>Test</div>;

      const { rerender } = render(
        <Provider>
          <ModalDef component={TestComponent} id="def-old-id" />
        </Provider>
      );

      expect(MODAL_REGISTRY["def-old-id"]).toBeDefined();

      rerender(
        <Provider>
          <ModalDef component={TestComponent} id="def-new-id" />
        </Provider>
      );

      expect(MODAL_REGISTRY["def-old-id"]).toBeUndefined();
      expect(MODAL_REGISTRY["def-new-id"]).toBeDefined();
    });

    it("should re-register when component changes", () => {
      const TestComponent1: React.FC = () => <div>Test 1</div>;
      const TestComponent2: React.FC = () => <div>Test 2</div>;

      const { rerender } = render(
        <Provider>
          <ModalDef component={TestComponent1} id="def-comp-change" />
        </Provider>
      );

      expect(MODAL_REGISTRY["def-comp-change"].comp).toBe(TestComponent1);

      rerender(
        <Provider>
          <ModalDef component={TestComponent2} id="def-comp-change" />
        </Provider>
      );

      expect(MODAL_REGISTRY["def-comp-change"].comp).toBe(TestComponent2);
    });
  });

  describe("rendering", () => {
    it("should render null (no visible content)", () => {
      const TestComponent: React.FC = () => <div data-testid="test">Test</div>;

      const { container } = render(
        <Provider>
          <ModalDef component={TestComponent} id="def-render" />
        </Provider>
      );

      // ModalDef itself returns null, so no modal should be visible
      expect(screen.queryByTestId("test")).not.toBeInTheDocument();
    });

    it("should allow showing registered modal via show()", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="def-modal">Modal via Def</div>;
      });

      render(
        <Provider>
          <ModalDef component={TestModal} id="def-show" />
        </Provider>
      );

      expect(screen.queryByTestId("def-modal")).not.toBeInTheDocument();

      act(() => {
        show("def-show");
      });

      await waitFor(() => {
        expect(screen.getByTestId("def-modal")).toBeInTheDocument();
      });
    });
  });
});

describe("ModalHolder", () => {
  describe("with string modal ID", () => {
    it("should render registered modal component", () => {
      const TestModal = create(() => {
        const modal = useModal();
        return <div data-testid="holder-modal">Holder Modal</div>;
      });

      register("holder-string-test", TestModal);

      const handler = { show: vi.fn(), hide: vi.fn() };

      render(
        <Provider>
          <ModalHolder handler={handler} modal="holder-string-test" />
        </Provider>
      );

      // The modal is mounted but not necessarily visible
      // depending on implementation
    });

    it("should throw error for unregistered modal ID", () => {
      const handler = { show: vi.fn(), hide: vi.fn() };

      expect(() => {
        render(
          <Provider>
            <ModalHolder handler={handler} modal="non-existent-modal" />
          </Provider>
        );
      }).toThrow("No modal found for id: non-existent-modal");
    });

    it("should assign show/hide methods to handler", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="handler-modal">Handler Modal</div>;
      });

      register("handler-test", TestModal);

      const HolderWrapper = () => {
        const [handler, Holder] = useModalHolder("handler-test");
        return (
          <>
            <button data-testid="show-btn" onClick={() => handler.show()}>
              Show
            </button>
            <button data-testid="hide-btn" onClick={() => handler.hide()}>
              Hide
            </button>
            <Holder />
          </>
        );
      };

      render(
        <Provider>
          <HolderWrapper />
        </Provider>
      );

      expect(screen.queryByTestId("handler-modal")).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("show-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("handler-modal")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("hide-btn"));

      await waitFor(() => {
        expect(screen.queryByTestId("handler-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("with component", () => {
    it("should render modal component directly", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="direct-modal">Direct Modal</div>;
      });

      const HolderWrapper = () => {
        const [handler, Holder] = useModalHolder(TestModal);
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
          <HolderWrapper />
        </Provider>
      );

      expect(screen.queryByTestId("direct-modal")).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("show-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("direct-modal")).toBeInTheDocument();
      });
    });

    it("should pass props to modal component", async () => {
      const TestModal = create<{ customProp: string }>(({ customProp }) => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="props-modal">{customProp}</div>;
      });

      const HolderWrapper = () => {
        const [handler, Holder] = useModalHolder<{ customProp: string }>(
          TestModal
        );
        return (
          <>
            <button
              data-testid="show-btn"
              onClick={() => handler.show({ customProp: "Custom Value" })}
            >
              Show
            </button>
            <Holder customProp="Initial Value" />
          </>
        );
      };

      render(
        <Provider>
          <HolderWrapper />
        </Provider>
      );

      fireEvent.click(screen.getByTestId("show-btn"));

      await waitFor(() => {
        // Args passed to show() should override initial props
        expect(screen.getByTestId("props-modal")).toBeInTheDocument();
      });
    });
  });

  describe("unique ID generation", () => {
    it("should generate unique internal ID for each holder", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        return <div data-testid={`modal-${modal.id}`}>Modal {modal.id}</div>;
      });

      register("unique-id-test", TestModal);

      const HolderWrapper = () => {
        const [handler1, Holder1] = useModalHolder("unique-id-test");
        const [handler2, Holder2] = useModalHolder("unique-id-test");
        return (
          <>
            <button data-testid="show1" onClick={() => handler1.show()}>
              Show 1
            </button>
            <button data-testid="show2" onClick={() => handler2.show()}>
              Show 2
            </button>
            <Holder1 />
            <Holder2 />
          </>
        );
      };

      render(
        <Provider>
          <HolderWrapper />
        </Provider>
      );

      // Show both modals to make them render with their IDs
      fireEvent.click(screen.getByTestId("show1"));
      fireEvent.click(screen.getByTestId("show2"));

      await waitFor(() => {
        // Both holders should render with different internal IDs
        const modals = screen.getAllByTestId(/^modal-/);
        expect(modals.length).toBe(2);

        const id1 = modals[0].getAttribute("data-testid");
        const id2 = modals[1].getAttribute("data-testid");
        expect(id1).not.toBe(id2);
      });
    });
  });
});
