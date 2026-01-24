import { describe, expect, it, vi } from "vitest";
import { shadcnModalAdapter } from "../src/adapters";
import type { CommandModalHandler } from "../src/type";

describe("adapters", () => {
  describe("shadcnModalAdapter", () => {
    const createMockHandler = (
      overrides?: Partial<CommandModalHandler>
    ): CommandModalHandler => ({
      id: "test-modal",
      visible: false,
      keepMounted: false,
      show: vi.fn(),
      hide: vi.fn(),
      resolve: vi.fn(),
      reject: vi.fn(),
      remove: vi.fn(),
      resolveHide: vi.fn(),
      ...overrides,
    });

    it("should return correct props structure", () => {
      const handler = createMockHandler();
      const props = shadcnModalAdapter(handler);

      expect(props).toHaveProperty("open");
      expect(props).toHaveProperty("onOpenChange");
      expect(props).toHaveProperty("afterClose");
    });

    it("should map visible to open property", () => {
      const visibleHandler = createMockHandler({ visible: true });
      const hiddenHandler = createMockHandler({ visible: false });

      expect(shadcnModalAdapter(visibleHandler).open).toBe(true);
      expect(shadcnModalAdapter(hiddenHandler).open).toBe(false);
    });

    it("should call show() when onOpenChange(true) is called", () => {
      const showMock = vi.fn();
      const handler = createMockHandler({ show: showMock });

      const props = shadcnModalAdapter(handler);
      props.onOpenChange?.(true);

      expect(showMock).toHaveBeenCalled();
    });

    it("should call hide() when onOpenChange(false) is called", () => {
      const hideMock = vi.fn();
      const handler = createMockHandler({ hide: hideMock });

      const props = shadcnModalAdapter(handler);
      props.onOpenChange?.(false);

      expect(hideMock).toHaveBeenCalled();
    });

    it("should call resolveHide() when afterClose is called", () => {
      const resolveHideMock = vi.fn();
      const handler = createMockHandler({ resolveHide: resolveHideMock });

      const props = shadcnModalAdapter(handler);
      props.afterClose?.();

      expect(resolveHideMock).toHaveBeenCalled();
    });

    it("should call remove() when afterClose is called and keepMounted is false", () => {
      const removeMock = vi.fn();
      const handler = createMockHandler({
        keepMounted: false,
        remove: removeMock,
      });

      const props = shadcnModalAdapter(handler);
      props.afterClose?.();

      expect(removeMock).toHaveBeenCalled();
    });

    it("should NOT call remove() when afterClose is called and keepMounted is true", () => {
      const removeMock = vi.fn();
      const handler = createMockHandler({
        keepMounted: true,
        remove: removeMock,
      });

      const props = shadcnModalAdapter(handler);
      props.afterClose?.();

      expect(removeMock).not.toHaveBeenCalled();
    });
  });
});
