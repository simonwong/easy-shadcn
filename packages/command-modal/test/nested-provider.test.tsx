import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { create, show } from "../src/actions";
import { __getDispatchStackSize, Provider } from "../src/context";
import { useModal } from "../src/useModal";

const NO_PROVIDER_ERROR = /Provider/;

/**
 * Regression tests for C1: multiple Provider instances must not share a
 * single dispatch slot. Scoped actions dispatched inside a given Provider
 * subtree must only update that Provider's state, never a sibling/ancestor's.
 */
describe("nested Providers", () => {
  it("scoped show via useModal dispatches to the enclosing Provider only", async () => {
    const OuterModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="outer-modal">outer</div>;
    });

    const InnerModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="inner-modal">inner</div>;
    });

    const OuterTrigger = () => {
      const modal = useModal("outer-id");
      return (
        <button
          data-testid="outer-trigger"
          onClick={() => modal.show()}
          type="button"
        >
          show outer
        </button>
      );
    };

    const InnerTrigger = () => {
      const modal = useModal("inner-id");
      return (
        <button
          data-testid="inner-trigger"
          onClick={() => modal.show()}
          type="button"
        >
          show inner
        </button>
      );
    };

    render(
      <Provider>
        <OuterModal id="outer-id" />
        <OuterTrigger />
        <Provider>
          <InnerModal id="inner-id" />
          <InnerTrigger />
        </Provider>
      </Provider>
    );

    // Trigger from outer subtree — must show outer modal only.
    fireEvent.click(screen.getByTestId("outer-trigger"));
    await waitFor(() => {
      expect(screen.getByTestId("outer-modal")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("inner-modal")).not.toBeInTheDocument();

    // Trigger from inner subtree — must show inner modal only (outer still visible).
    fireEvent.click(screen.getByTestId("inner-trigger"));
    await waitFor(() => {
      expect(screen.getByTestId("inner-modal")).toBeInTheDocument();
    });
    expect(screen.getByTestId("outer-modal")).toBeInTheDocument();
  });

  it("scoped hide via useModal only affects the enclosing Provider", async () => {
    const SharedModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid={`shared-${modal.id}`}>{modal.id}</div>;
    });

    const Trigger = ({
      dataTestId,
      action,
    }: {
      dataTestId: string;
      action: "show" | "hide";
    }) => {
      const modal = useModal("shared");
      return (
        <button
          data-testid={dataTestId}
          onClick={() => modal[action]()}
          type="button"
        >
          {action}
        </button>
      );
    };

    render(
      <Provider>
        <SharedModal id="shared" />
        <Trigger action="show" dataTestId="outer-show" />
        <Trigger action="hide" dataTestId="outer-hide" />
        <Provider>
          <SharedModal id="shared" />
          <Trigger action="show" dataTestId="inner-show" />
          <Trigger action="hide" dataTestId="inner-hide" />
        </Provider>
      </Provider>
    );

    fireEvent.click(screen.getByTestId("outer-show"));
    fireEvent.click(screen.getByTestId("inner-show"));
    await waitFor(() => {
      expect(screen.getAllByTestId("shared-shared")).toHaveLength(2);
    });

    // Hide only in outer — inner must still be visible.
    fireEvent.click(screen.getByTestId("outer-hide"));
    await waitFor(() => {
      expect(screen.getAllByTestId("shared-shared")).toHaveLength(1);
    });
  });
});

describe("Provider dispatch registration lifecycle", () => {
  it("throws when top-level show is called with no Provider mounted", () => {
    // Ensure the stack is empty: no Provider rendered here.
    expect(() => show("no-provider-modal")).toThrow(NO_PROVIDER_ERROR);
  });

  it("re-registers dispatch after StrictMode double mount", async () => {
    const TestModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="strict-modal">strict</div>;
    });

    const { StrictMode } = await import("react");

    render(
      <StrictMode>
        <Provider>
          <TestModal id="strict-id" />
        </Provider>
      </StrictMode>
    );

    act(() => {
      show("strict-id");
    });

    await waitFor(() => {
      expect(screen.getByTestId("strict-modal")).toBeInTheDocument();
    });
  });

  it("warns when top-level show is used with multiple Providers mounted", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      // noop
    });

    const TestModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="multi-provider-modal">multi</div>;
    });

    render(
      <Provider>
        <TestModal id="multi-id" />
        <Provider>
          <div />
        </Provider>
      </Provider>
    );

    act(() => {
      show("multi-id");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Multiple")
    );

    consoleSpy.mockRestore();
  });

  it("drains the dispatch stack when Providers unmount", () => {
    // Explicit baseline — guards against cross-test leak regressions even if
    // the beforeEach hook ever stops resetting the stack.
    expect(__getDispatchStackSize()).toBe(0);

    const { unmount } = render(
      <Provider>
        <Provider>
          <div />
        </Provider>
      </Provider>
    );

    expect(__getDispatchStackSize()).toBe(2);

    unmount();

    expect(__getDispatchStackSize()).toBe(0);
  });

  it("throws on top-level show after the only Provider unmounts", () => {
    const { unmount } = render(
      <Provider>
        <div />
      </Provider>
    );

    unmount();

    expect(() => show("post-unmount-id")).toThrow(NO_PROVIDER_ERROR);
  });

  it("routes top-level show to the remaining Provider when a sibling unmounts", async () => {
    const SurvivingModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="surviving-modal">survivor</div>;
    });

    const WithSiblings = ({ showSibling }: { showSibling: boolean }) => (
      <>
        <Provider>
          <SurvivingModal id="surviving" />
        </Provider>
        {showSibling ? (
          <Provider>
            <div />
          </Provider>
        ) : null}
      </>
    );

    const { rerender } = render(<WithSiblings showSibling />);

    // Drop the second Provider.
    rerender(<WithSiblings showSibling={false} />);

    // Now exactly one Provider is mounted — top-level show must find it.
    act(() => {
      show("surviving");
    });

    await waitFor(() => {
      expect(screen.getByTestId("surviving-modal")).toBeInTheDocument();
    });
  });

  it("pins StrictMode multi-Provider top-level show routing as undefined-but-live", async () => {
    const { StrictMode } = await import("react");

    const OuterModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="strict-toplevel-outer">outer</div>;
    });

    const InnerModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="strict-toplevel-inner">inner</div>;
    });

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {
      // noop
    });

    render(
      <StrictMode>
        <Provider>
          <OuterModal id="strict-toplevel-shared-id" />
          <Provider>
            <InnerModal id="strict-toplevel-shared-id" />
          </Provider>
        </Provider>
      </StrictMode>
    );

    act(() => {
      show("strict-toplevel-shared-id");
    });

    // Contract: with multiple Providers mounted, top-level show() routes to
    // an unspecified Provider (see dispatchStack JSDoc for why this differs
    // between StrictMode dev and prod). We only assert that (a) one of the
    // two receives it, and (b) the multi-Provider warn fires.
    await waitFor(() => {
      const outer = screen.queryByTestId("strict-toplevel-outer");
      const inner = screen.queryByTestId("strict-toplevel-inner");
      expect(outer !== null || inner !== null).toBe(true);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Multiple")
    );
    consoleSpy.mockRestore();
  });

  it("keeps scoped dispatch via useModal correct under StrictMode with nested Providers", async () => {
    const { StrictMode } = await import("react");

    const OuterModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="strict-outer-modal">outer</div>;
    });

    const InnerModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="strict-inner-modal">inner</div>;
    });

    const OuterTrigger = () => {
      const modal = useModal("strict-outer-id");
      return (
        <button
          data-testid="strict-outer-trigger"
          onClick={() => modal.show()}
          type="button"
        >
          show outer
        </button>
      );
    };

    const InnerTrigger = () => {
      const modal = useModal("strict-inner-id");
      return (
        <button
          data-testid="strict-inner-trigger"
          onClick={() => modal.show()}
          type="button"
        >
          show inner
        </button>
      );
    };

    render(
      <StrictMode>
        <Provider>
          <OuterModal id="strict-outer-id" />
          <OuterTrigger />
          <Provider>
            <InnerModal id="strict-inner-id" />
            <InnerTrigger />
          </Provider>
        </Provider>
      </StrictMode>
    );

    fireEvent.click(screen.getByTestId("strict-outer-trigger"));
    await waitFor(() => {
      expect(screen.getByTestId("strict-outer-modal")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("strict-inner-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("strict-inner-trigger"));
    await waitFor(() => {
      expect(screen.getByTestId("strict-inner-modal")).toBeInTheDocument();
    });
    expect(screen.getByTestId("strict-outer-modal")).toBeInTheDocument();
  });
});
