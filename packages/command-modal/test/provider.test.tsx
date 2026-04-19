import { act, render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it, vi } from "vitest";
import { create, register, show } from "../src/actions";
import { CommandModalContext, Provider } from "../src/context";
import { useModal } from "../src/useModal";

describe("Provider", () => {
  describe("basic rendering", () => {
    it("should render children correctly", () => {
      render(
        <Provider>
          <div data-testid="child">Child Content</div>
        </Provider>
      );

      expect(screen.getByTestId("child")).toHaveTextContent("Child Content");
    });

    it("should provide CommandModalContext", () => {
      const ContextConsumer = () => {
        const context = useContext(CommandModalContext);
        return <div data-testid="context">{JSON.stringify(context)}</div>;
      };

      render(
        <Provider>
          <ContextConsumer />
        </Provider>
      );

      expect(screen.getByTestId("context")).toHaveTextContent("{}");
    });

    it("should update context when modal is shown", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal">Modal</div>;
      });

      const ContextConsumer = () => {
        const context = useContext(CommandModalContext);
        return (
          <div data-testid="context-keys">{Object.keys(context).join(",")}</div>
        );
      };

      render(
        <Provider>
          <TestModal id="context-test" />
          <ContextConsumer />
        </Provider>
      );

      expect(screen.getByTestId("context-keys")).toHaveTextContent("");

      act(() => {
        show("context-test");
      });

      await waitFor(() => {
        expect(screen.getByTestId("context-keys")).toHaveTextContent(
          "context-test"
        );
      });
    });
  });

  describe("CommandModalPlaceholder", () => {
    it("should auto-mount registered modals when shown", async () => {
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="auto-mounted">Auto Mounted Modal</div>;
      });

      register("auto-mount-test", TestModal);

      render(
        <Provider>
          <div />
        </Provider>
      );

      expect(screen.queryByTestId("auto-mounted")).not.toBeInTheDocument();

      act(() => {
        show("auto-mount-test");
      });

      await waitFor(() => {
        expect(screen.getByTestId("auto-mounted")).toBeInTheDocument();
      });
    });

    it("should render multiple registered modals", async () => {
      const TestModal1 = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal-1">Modal 1</div>;
      });

      const TestModal2 = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal-2">Modal 2</div>;
      });

      register("multi-1", TestModal1);
      register("multi-2", TestModal2);

      render(
        <Provider>
          <div />
        </Provider>
      );

      act(() => {
        show("multi-1");
        show("multi-2");
      });

      await waitFor(() => {
        expect(screen.getByTestId("modal-1")).toBeInTheDocument();
        expect(screen.getByTestId("modal-2")).toBeInTheDocument();
      });
    });

    it("should log warning for unregistered modal ID", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Manually trigger the state to have an unknown modal ID
      // This simulates calling show with an ID that's not registered
      const UnknownModalTrigger = () => {
        const context = useContext(CommandModalContext);
        return null;
      };

      render(
        <Provider>
          <UnknownModalTrigger />
        </Provider>
      );

      // Directly show a non-registered, non-mounted modal
      act(() => {
        show("unknown-modal-id");
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("No modal found for id: unknown-modal-id")
        );
      });

      consoleSpy.mockRestore();
    });

    it("should not warn for already mounted modals (JSX declared)", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="jsx-modal">JSX Modal</div>;
      });

      render(
        <Provider>
          <TestModal id="jsx-declared" />
        </Provider>
      );

      act(() => {
        show("jsx-declared");
      });

      await waitFor(() => {
        expect(screen.getByTestId("jsx-modal")).toBeInTheDocument();
      });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("multiple providers", () => {
    it("should work with nested providers", () => {
      render(
        <Provider>
          <div data-testid="outer">
            <Provider>
              <div data-testid="inner">Inner</div>
            </Provider>
          </div>
        </Provider>
      );

      expect(screen.getByTestId("outer")).toBeInTheDocument();
      expect(screen.getByTestId("inner")).toBeInTheDocument();
    });
  });
});
