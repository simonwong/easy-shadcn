import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { vi } from "vitest";
import { create } from "../src/actions";
import {
  ALREADY_MOUNTED,
  hideModalCallbacks,
  MODAL_REGISTRY,
  modalCallbacks,
} from "../src/constants";
import {
  __resetDispatchStack,
  __resetMultipleProvidersWarning,
  Provider,
} from "../src/context";
import type { CommandModalHandler } from "../src/type";
import { useModal } from "../src/useModal";

/**
 * Build a fully-stubbed `CommandModalHandler` for unit-testing adapters in
 * isolation. Every method is a `vi.fn()`; override any field as needed.
 */
export const makeHandler = (
  overrides: Partial<CommandModalHandler> = {}
): CommandModalHandler => ({
  id: "test",
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

/**
 * Reset all global registries and callbacks.
 * Should be called in beforeEach to ensure test isolation.
 */
export const resetRegistry = () => {
  Object.keys(MODAL_REGISTRY).forEach((key) => delete MODAL_REGISTRY[key]);
  Object.keys(ALREADY_MOUNTED).forEach((key) => delete ALREADY_MOUNTED[key]);
  Object.keys(modalCallbacks).forEach((key) => delete modalCallbacks[key]);
  Object.keys(hideModalCallbacks).forEach(
    (key) => delete hideModalCallbacks[key]
  );
  __resetMultipleProvidersWarning();
  __resetDispatchStack();
};

/**
 * Mock Dialog component that simulates shadcn Dialog behavior.
 */
export const MockDialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  children?: ReactNode;
  testId?: string;
}> = ({ open, onOpenChange, onOpenChangeComplete, children, testId }) => {
  if (!open) {
    return null;
  }
  return (
    <div data-open={open} data-testid={testId || "mock-dialog"}>
      {children}
      <button
        data-testid="close-btn"
        onClick={() => {
          onOpenChange?.(false);
          // Simulate Base UI firing the post-close-transition hook.
          onOpenChangeComplete?.(false);
        }}
      >
        Close
      </button>
    </div>
  );
};

/**
 * Create a test modal component with mock dialog behavior.
 */
export const createTestModal = (testId: string) => {
  const TestModalInner: React.FC<{
    onResolve?: (value: unknown) => void;
    onReject?: (value: unknown) => void;
  }> = ({ onResolve, onReject }) => {
    const modal = useModal();
    return (
      <MockDialog
        onOpenChange={modal.modalProps.onOpenChange}
        onOpenChangeComplete={modal.modalProps.onOpenChangeComplete}
        open={modal.visible}
        testId={testId}
      >
        <div data-testid={`${testId}-content`}>Modal Content</div>
        <button
          data-testid="resolve-btn"
          onClick={() => {
            modal.resolve(onResolve ? onResolve("resolved") : "resolved");
            modal.hide();
          }}
        >
          Resolve
        </button>
        <button
          data-testid="reject-btn"
          onClick={() => {
            modal.reject(onReject ? onReject("rejected") : "rejected");
            modal.hide();
          }}
        >
          Reject
        </button>
      </MockDialog>
    );
  };

  return create(TestModalInner);
};

/**
 * Wrapper component that provides CommandModal context.
 */
const AllTheProviders: React.FC<{ children: ReactNode }> = ({ children }) => (
  <Provider>{children}</Provider>
);

/**
 * Custom render function that wraps component with Provider.
 */
export const renderWithProvider = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

/**
 * Create a simple modal component for basic tests.
 */
export const createSimpleTestModal = (testId: string) => {
  const SimpleModal: React.FC = () => {
    const modal = useModal();
    if (!modal.visible) {
      return null;
    }
    return <div data-testid={testId}>Simple Modal</div>;
  };
  return create(SimpleModal);
};

/**
 * Wait for a condition to be true (with timeout).
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 1000
): Promise<void> => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};
