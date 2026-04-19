import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { create } from "../src/actions";
import {
  ALREADY_MOUNTED,
  hideModalCallbacks,
  MODAL_REGISTRY,
  modalCallbacks,
} from "../src/constants";
import { Provider } from "../src/context";
import { useModal } from "../src/useModal";

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
};

/**
 * Mock Dialog component that simulates shadcn Dialog behavior.
 */
export const MockDialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  afterClose?: () => void;
  children?: ReactNode;
  testId?: string;
}> = ({ open, onOpenChange, afterClose, children, testId }) => {
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
          afterClose?.();
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
        afterClose={modal.modalProps.afterClose}
        onOpenChange={modal.modalProps.onOpenChange}
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
