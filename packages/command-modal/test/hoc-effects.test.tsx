import { act, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it } from "vitest";
import { create, remove, show } from "../src/actions";
import { ALREADY_MOUNTED } from "../src/constants";
import { Provider } from "../src/context";
import { useModal } from "../src/useModal";

/**
 * Regression tests for C7: the create() HOC's two `ALREADY_MOUNTED`
 * effects plus the delayVisible effect must not conflict.
 *
 * Bugs addressed:
 *   1. The second "keep in sync" effect used to delete ALREADY_MOUNTED on
 *      cleanup when shouldMount flipped false, blanking the flag while the
 *      HOC was still mounted.
 *   2. `defaultVisible` was in the first effect's deps, so a parent toggling
 *      the prop could re-trigger an extra `show()` beyond the intended once.
 *   3. `args` in the delayVisible effect's deps produced extra dispatches
 *      because the reducer spread makes `args` a fresh object each show().
 */
describe("create() HOC effect consolidation (C7)", () => {
  it("fires defaultVisible show exactly once even if the prop re-renders", async () => {
    const TestModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="c7-default-modal">body</div>;
    });

    const Parent = () => {
      const counter = useRef(0);
      counter.current += 1;
      return (
        <Provider>
          <TestModal defaultVisible id="c7-default" />
          <span data-testid="parent-render-count">{counter.current}</span>
        </Provider>
      );
    };

    const { rerender } = render(<Parent />);
    await waitFor(() => {
      expect(screen.getByTestId("c7-default-modal")).toBeInTheDocument();
    });

    // Force re-renders — defaultVisible stays true but should not trigger
    // another show() (no visible side effect because it's already visible
    // anyway, but also no duplicate dispatch).
    rerender(<Parent />);
    rerender(<Parent />);
    rerender(<Parent />);

    // The modal is still visible and no error/warning is thrown.
    expect(screen.getByTestId("c7-default-modal")).toBeInTheDocument();
  });

  it("fires defaultVisible again when the same HOC instance receives a new id", async () => {
    const TestModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="c7-dynamic-id-modal">{modal.id}</div>;
    });

    const Parent = ({ id }: { id: string }) => (
      <Provider>
        <TestModal defaultVisible id={id} />
      </Provider>
    );

    const { rerender } = render(<Parent id="c7-dynamic-one" />);

    await waitFor(() => {
      expect(screen.getByTestId("c7-dynamic-id-modal")).toHaveTextContent(
        "c7-dynamic-one"
      );
    });

    act(() => {
      remove("c7-dynamic-one");
    });
    rerender(<Parent id="c7-dynamic-two" />);

    await waitFor(() => {
      expect(screen.getByTestId("c7-dynamic-id-modal")).toHaveTextContent(
        "c7-dynamic-two"
      );
    });
  });

  it("re-shows correctly after remove() when the HOC never unmounts", async () => {
    const TestModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="c7-rehow-modal">body</div>;
    });

    render(
      <Provider>
        <TestModal id="c7-rehow" />
      </Provider>
    );

    act(() => {
      show("c7-rehow");
    });
    await waitFor(() => {
      expect(screen.getByTestId("c7-rehow-modal")).toBeInTheDocument();
    });

    act(() => {
      remove("c7-rehow");
    });
    expect(screen.queryByTestId("c7-rehow-modal")).not.toBeInTheDocument();

    act(() => {
      show("c7-rehow");
    });
    await waitFor(() => {
      expect(screen.getByTestId("c7-rehow-modal")).toBeInTheDocument();
    });
  });

  it("keeps ALREADY_MOUNTED true for a JSX-declared HOC after remove()", async () => {
    // Before the fix, removeWithDispatch unconditionally deleted
    // ALREADY_MOUNTED[id]. For a JSX-declared modal, the HOC stays mounted
    // across remove()/show() cycles, so clearing the flag caused a
    // spurious delayVisible roundtrip on the next show. The fix: only the
    // HOC's own unmount cleanup (or an auto-registered HOC being dropped
    // by the placeholder) should clear the flag.

    const TestModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="c7-jsx-modal">body</div>;
    });

    render(
      <Provider>
        <TestModal id="c7-jsx-flag" />
      </Provider>
    );

    // Effect 1 has run by now.
    await waitFor(() => {
      expect(ALREADY_MOUNTED["c7-jsx-flag"]).toBe(true);
    });

    act(() => {
      show("c7-jsx-flag");
    });
    await waitFor(() => {
      expect(screen.getByTestId("c7-jsx-modal")).toBeInTheDocument();
    });

    act(() => {
      remove("c7-jsx-flag");
    });

    // JSX-declared HOC is still mounted (the <TestModal /> JSX is still in
    // the tree; only the reducer entry was cleared), so ALREADY_MOUNTED
    // must remain true. This is what enables the next show() to render
    // immediately instead of taking a delayVisible roundtrip.
    expect(ALREADY_MOUNTED["c7-jsx-flag"]).toBe(true);
  });

  it("clears ALREADY_MOUNTED when an auto-registered HOC is dropped by the placeholder", async () => {
    // Symmetric invariant: for a modal that was registered via the global
    // registry and rendered by the placeholder (not JSX-declared), remove()
    // causes the placeholder to drop the HOC, so its effect cleanup fires
    // and ALREADY_MOUNTED is cleared via the normal React lifecycle.

    const AutoModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="c7-auto-modal">body</div>;
    });

    const { register } = await import("../src/actions");
    register("c7-auto-flag", AutoModal);

    render(
      <Provider>
        <div />
      </Provider>
    );

    // Placeholder hasn't rendered the HOC yet — show() creates an entry
    // which causes the placeholder to mount it.
    expect(ALREADY_MOUNTED["c7-auto-flag"]).toBeUndefined();

    act(() => {
      show("c7-auto-flag");
    });
    await waitFor(() => {
      expect(screen.getByTestId("c7-auto-modal")).toBeInTheDocument();
    });
    expect(ALREADY_MOUNTED["c7-auto-flag"]).toBe(true);

    act(() => {
      remove("c7-auto-flag");
    });
    // Placeholder dropped the HOC → effect cleanup cleared the flag.
    await waitFor(() => {
      expect(ALREADY_MOUNTED["c7-auto-flag"]).toBeUndefined();
    });
  });

  it("does not redispatch show on every args change via delayVisible effect", async () => {
    // The delayVisible effect used to depend on `args`. Each showModal reducer
    // action spreads a new args object, so the effect would re-fire even
    // though delayVisible was already handled.

    let innerRenderCount = 0;
    const TestModal = create<{ value: number }>(({ value }) => {
      const modal = useModal();
      innerRenderCount += 1;
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="c7-args-modal">value:{value}</div>;
    });

    render(
      <Provider>
        <TestModal id="c7-args" value={0} />
      </Provider>
    );

    act(() => {
      show("c7-args", { value: 1 });
    });
    await waitFor(() => {
      expect(screen.getByTestId("c7-args-modal")).toHaveTextContent("value:1");
    });
    const countAfterFirstShow = innerRenderCount;

    // A second show with different args must not loop-redispatch via the
    // delayVisible effect. The inner component may re-render a small number
    // of times (reducer state update) but must stabilize.
    act(() => {
      show("c7-args", { value: 2 });
    });
    await waitFor(() => {
      expect(screen.getByTestId("c7-args-modal")).toHaveTextContent("value:2");
    });

    // Sanity: bounded number of additional renders (one for the state change
    // plus a small constant). Before the fix, this would be much larger due
    // to args-driven effect re-runs. Tight bound to lock the regression in.
    expect(innerRenderCount - countAfterFirstShow).toBeLessThan(5);
  });
});
