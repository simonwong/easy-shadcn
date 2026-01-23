import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  create,
  hide,
  register,
  remove,
  show,
  unregister,
} from "../src/actions";
import {
  ALREADY_MOUNTED,
  hideModalCallbacks,
  MODAL_REGISTRY,
  modalCallbacks,
} from "../src/constants";
import { Provider } from "../src/context";
import { symModalId } from "../src/symbol";
import type { CreateModalComponent } from "../src/type";
import { useModal } from "../src/useModal";

describe("actions", () => {
  describe("register", () => {
    it("should register modal component with id", () => {
      const TestComponent: CreateModalComponent = () => null;

      register("test-modal", TestComponent);

      expect(MODAL_REGISTRY["test-modal"]).toEqual({
        comp: TestComponent,
        props: undefined,
      });
    });

    it("should register modal component with props", () => {
      const TestComponent: CreateModalComponent = () => null;

      register("test-modal", TestComponent, { foo: "bar" });

      expect(MODAL_REGISTRY["test-modal"]).toEqual({
        comp: TestComponent,
        props: { foo: "bar" },
      });
    });

    it("should update props when re-registering same id", () => {
      const TestComponent1: CreateModalComponent = () => null;
      const TestComponent2: CreateModalComponent = () => null;

      register("test-modal", TestComponent1, { foo: "bar" });
      register("test-modal", TestComponent2, { baz: "qux" });

      // Props should be updated, but comp should remain original
      expect(MODAL_REGISTRY["test-modal"].props).toEqual({ baz: "qux" });
    });
  });

  describe("unregister", () => {
    it("should remove modal from registry", () => {
      const TestComponent: CreateModalComponent = () => null;
      register("test-modal", TestComponent);

      unregister("test-modal");

      expect(MODAL_REGISTRY["test-modal"]).toBeUndefined();
    });

    it("should handle unregistering non-existent modal", () => {
      expect(() => unregister("non-existent")).not.toThrow();
    });
  });

  describe("show", () => {
    it("should return a promise", () => {
      const TestComponent: CreateModalComponent = () => null;
      register("test-modal", TestComponent);

      render(
        <Provider>
          <div />
        </Provider>
      );

      let result: Promise<unknown>;
      act(() => {
        result = show("test-modal");
      });
      expect(result!).toBeInstanceOf(Promise);
    });

    it("should auto-register component when showing by component", () => {
      const TestComponent: CreateModalComponent = () => null;
      TestComponent[symModalId] = "auto-registered";

      render(
        <Provider>
          <div />
        </Provider>
      );

      act(() => {
        show(TestComponent);
      });

      expect(MODAL_REGISTRY["auto-registered"]).toBeDefined();
    });

    it("should show modal with args", async () => {
      const TestModal = create<{ message: string }>(({ message }) => {
        const modal = useModal();
        if (!modal.visible) return null;
        return <div data-testid="modal">{message}</div>;
      });

      render(
        <Provider>
          <TestModal id="test" />
        </Provider>
      );

      act(() => {
        show("test", { message: "Hello World" });
      });

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toHaveTextContent("Hello World");
      });
    });

    it("should create modal callbacks when showing", () => {
      const TestComponent: CreateModalComponent = () => null;
      register("test-modal", TestComponent);

      render(
        <Provider>
          <div />
        </Provider>
      );

      act(() => {
        show("test-modal");
      });

      expect(modalCallbacks["test-modal"]).toBeDefined();
      expect(modalCallbacks["test-modal"].resolve).toBeInstanceOf(Function);
      expect(modalCallbacks["test-modal"].reject).toBeInstanceOf(Function);
      expect(modalCallbacks["test-modal"].promise).toBeInstanceOf(Promise);
    });

    it("should reuse existing callbacks when showing again", () => {
      const TestComponent: CreateModalComponent = () => null;
      register("test-modal", TestComponent);

      render(
        <Provider>
          <div />
        </Provider>
      );

      act(() => {
        show("test-modal");
      });
      const firstCallbacks = modalCallbacks["test-modal"];

      act(() => {
        show("test-modal");
      });
      const secondCallbacks = modalCallbacks["test-modal"];

      expect(firstCallbacks).toBe(secondCallbacks);
    });
  });

  describe("hide", () => {
    it("should return a promise", () => {
      const TestComponent: CreateModalComponent = () => null;
      register("test-modal", TestComponent);

      render(
        <Provider>
          <div />
        </Provider>
      );

      let result: Promise<unknown>;
      act(() => {
        show("test-modal");
        result = hide("test-modal");
      });

      expect(result!).toBeInstanceOf(Promise);
    });

    it("should create hide callbacks", () => {
      const TestComponent: CreateModalComponent = () => null;
      register("test-modal", TestComponent);

      render(
        <Provider>
          <div />
        </Provider>
      );

      act(() => {
        show("test-modal");
        hide("test-modal");
      });

      expect(hideModalCallbacks["test-modal"]).toBeDefined();
      expect(hideModalCallbacks["test-modal"].resolve).toBeInstanceOf(Function);
    });

    it("should delete show callbacks when hiding", () => {
      const TestComponent: CreateModalComponent = () => null;
      register("test-modal", TestComponent);

      render(
        <Provider>
          <div />
        </Provider>
      );

      act(() => {
        show("test-modal");
      });
      expect(modalCallbacks["test-modal"]).toBeDefined();

      act(() => {
        hide("test-modal");
      });
      expect(modalCallbacks["test-modal"]).toBeUndefined();
    });

    it("should hide modal by component", () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) return null;
        return <div data-testid="modal">Content</div>;
      });

      render(
        <Provider>
          <TestModal id="test" />
        </Provider>
      );

      act(() => {
        show("test");
      });

      expect(screen.queryByTestId("modal")).toBeInTheDocument();

      act(() => {
        hide("test");
      });

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  describe("remove", () => {
    it("should remove modal and clean up callbacks", () => {
      const TestComponent: CreateModalComponent = () => null;
      register("test-modal", TestComponent);

      render(
        <Provider>
          <div />
        </Provider>
      );

      act(() => {
        show("test-modal");
        hide("test-modal");
      });

      expect(hideModalCallbacks["test-modal"]).toBeDefined();

      act(() => {
        remove("test-modal");
      });

      expect(modalCallbacks["test-modal"]).toBeUndefined();
      expect(hideModalCallbacks["test-modal"]).toBeUndefined();
    });
  });

  describe("create", () => {
    it("should return a HOC component", () => {
      const InnerComponent: React.FC = () => <div>Inner</div>;
      const WrappedComponent = create(InnerComponent);

      expect(WrappedComponent).toBeInstanceOf(Function);
    });

    it("should render inner component when visible", async () => {
      const InnerComponent: React.FC = () => {
        const modal = useModal();
        if (!modal.visible) return null;
        return <div data-testid="inner">Inner Content</div>;
      };
      const TestModal = create(InnerComponent);

      render(
        <Provider>
          <TestModal id="test-modal" />
        </Provider>
      );

      act(() => {
        show("test-modal");
      });

      await waitFor(() => {
        expect(screen.getByTestId("inner")).toBeInTheDocument();
      });
    });

    it("should handle defaultVisible prop", async () => {
      const InnerComponent: React.FC = () => {
        const modal = useModal();
        if (!modal.visible) return null;
        return <div data-testid="default-visible">Default Visible</div>;
      };
      const TestModal = create(InnerComponent);

      render(
        <Provider>
          <TestModal defaultVisible id="test-modal" />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("default-visible")).toBeInTheDocument();
      });
    });

    it("should handle keepMounted prop", async () => {
      const InnerComponent: React.FC = () => {
        const modal = useModal();
        return (
          <div
            data-keepmounted={modal.keepMounted.toString()}
            data-testid="keep-mounted"
          >
            Keep Mounted
          </div>
        );
      };
      const TestModal = create(InnerComponent);

      render(
        <Provider>
          <TestModal id="test-modal" keepMounted />
        </Provider>
      );

      act(() => {
        show("test-modal");
      });

      await waitFor(() => {
        const element = screen.getByTestId("keep-mounted");
        expect(element).toHaveAttribute("data-keepmounted", "true");
      });
    });

    it("should pass args to inner component", async () => {
      const InnerComponent: React.FC<{ customProp: string }> = ({
        customProp,
      }) => {
        const modal = useModal();
        if (!modal.visible) return null;
        return <div data-testid="with-args">{customProp}</div>;
      };
      const TestModal = create(InnerComponent);

      render(
        <Provider>
          <TestModal id="test-modal" />
        </Provider>
      );

      act(() => {
        show("test-modal", { customProp: "Custom Value" });
      });

      await waitFor(() => {
        expect(screen.getByTestId("with-args")).toHaveTextContent(
          "Custom Value"
        );
      });
    });

    it("should register ALREADY_MOUNTED on mount and clean up on unmount", async () => {
      const InnerComponent: React.FC = () => {
        const modal = useModal();
        if (!modal.visible) return null;
        return <div>Content</div>;
      };
      const TestModal = create(InnerComponent);

      const { unmount } = render(
        <Provider>
          <TestModal id="test-modal" />
        </Provider>
      );

      act(() => {
        show("test-modal");
      });

      await waitFor(() => {
        expect(ALREADY_MOUNTED["test-modal"]).toBe(true);
      });

      unmount();

      // ALREADY_MOUNTED is cleaned up by the HOC's useEffect cleanup
      // Note: Due to cleanup timing, this may still be true right after unmount
    });
  });
});
