import { act, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { create, show } from "../src/actions";
import { Provider } from "../src/context";
import type {
  CommandModalConfig,
  CommandModalHandler,
  ModalPropsAdapter,
} from "../src/type";
import { useModal } from "../src/useModal";

describe("config", () => {
  describe("CommandModalConfigContext", () => {
    it("should use default adapter when no config is provided", async () => {
      let capturedModalProps: { open?: boolean } | undefined;

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
          <TestModal id="default-adapter-test" />
        </Provider>
      );

      act(() => {
        show("default-adapter-test");
      });

      await waitFor(() => {
        expect(capturedModalProps).toBeDefined();
        expect(capturedModalProps?.open).toBe(true);
      });
    });

    it("should use custom adapter when config is provided", async () => {
      // Custom adapter that returns different prop names
      const customAdapter: ModalPropsAdapter<{ isOpen: boolean }> = (
        handler: CommandModalHandler
      ) => ({
        isOpen: handler.visible,
      });

      const config: CommandModalConfig<{ isOpen: boolean }> = {
        modalPropsAdapter: customAdapter,
      };

      let capturedModalProps: { isOpen?: boolean } | undefined;

      const TestModal = create(() => {
        const modal = useModal();
        // With custom adapter, modalProps will have different structure
        capturedModalProps = modal.modalProps as unknown as { isOpen: boolean };
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal">Content</div>;
      });

      render(
        <Provider config={config as CommandModalConfig}>
          <TestModal id="custom-adapter-test" />
        </Provider>
      );

      act(() => {
        show("custom-adapter-test");
      });

      await waitFor(() => {
        expect(capturedModalProps).toBeDefined();
        expect(capturedModalProps?.isOpen).toBe(true);
      });
    });

    it("should pass handler to custom adapter correctly", async () => {
      const adapterSpy = vi.fn((handler: CommandModalHandler) => ({
        open: handler.visible,
        onOpenChange: () => {},
      }));

      const config: CommandModalConfig = {
        modalPropsAdapter: adapterSpy,
      };

      const TestModal = create(() => {
        const modal = useModal();
        // Access modalProps to trigger adapter call
        const _ = modal.modalProps;
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal">Content</div>;
      });

      render(
        <Provider config={config}>
          <TestModal id="adapter-spy-test" />
        </Provider>
      );

      act(() => {
        show("adapter-spy-test");
      });

      await waitFor(() => {
        expect(adapterSpy).toHaveBeenCalled();
        const lastCall = adapterSpy.mock.lastCall?.[0];
        expect(lastCall).toHaveProperty("id", "adapter-spy-test");
        expect(lastCall).toHaveProperty("visible", true);
        expect(lastCall).toHaveProperty("show");
        expect(lastCall).toHaveProperty("hide");
      });
    });

    it("should support multiple modals with the same custom adapter", async () => {
      let modal1Visible = false;
      let modal2Visible = false;

      const customAdapter: ModalPropsAdapter<{
        isVisible: boolean;
        toggle: () => void;
      }> = (handler: CommandModalHandler) => ({
        isVisible: handler.visible,
        toggle: () => {
          if (handler.visible) {
            handler.hide();
          } else {
            handler.show();
          }
        },
      });

      const config: CommandModalConfig<{
        isVisible: boolean;
        toggle: () => void;
      }> = {
        modalPropsAdapter: customAdapter,
      };

      const TestModal1 = create(() => {
        const modal = useModal();
        modal1Visible = modal.visible;
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal1">Modal 1</div>;
      });

      const TestModal2 = create(() => {
        const modal = useModal();
        modal2Visible = modal.visible;
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="modal2">Modal 2</div>;
      });

      render(
        <Provider config={config as CommandModalConfig}>
          <TestModal1 id="multi-modal-1" />
          <TestModal2 id="multi-modal-2" />
        </Provider>
      );

      act(() => {
        show("multi-modal-1");
      });

      await waitFor(() => {
        expect(modal1Visible).toBe(true);
        expect(modal2Visible).toBe(false);
      });

      act(() => {
        show("multi-modal-2");
      });

      await waitFor(() => {
        expect(modal1Visible).toBe(true);
        expect(modal2Visible).toBe(true);
      });
    });
  });
});
