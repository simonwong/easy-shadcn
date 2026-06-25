import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { create, hide, remove, show, unregister } from "../src/actions";
import { hideModalCallbacks } from "../src/constants";
import { Provider } from "../src/context";
import { ModalDef } from "../src/holders";
import { useModal } from "../src/useModal";

/**
 * Regression tests for I7 / I8.
 *
 * Before the fix:
 *   - hide(id) deletes modalCallbacks[id] without settling the promise
 *     returned by a prior show(id). Any `await show(...)` hangs forever.
 *   - remove(id) deletes hideModalCallbacks[id] without settling the promise
 *     returned by a prior hide(id). Any `await hide(...)` hangs forever.
 *
 * After the fix:
 *   - hide() resolves the pending show promise with `undefined`, then deletes.
 *   - remove() resolves the pending hide promise with `undefined`, then deletes.
 */

const TestModal = create(() => {
  const modal = useModal();
  if (!modal.visible) {
    return null;
  }
  return <div data-testid="settlement-modal">body</div>;
});

async function observeSettlement<T>(
  promise: Promise<T>
): Promise<{ settled: boolean; value?: T; reason?: unknown }> {
  let result: { settled: boolean; value?: T; reason?: unknown } = {
    settled: false,
  };
  promise.then(
    (value) => {
      result = { settled: true, value };
    },
    (reason) => {
      result = { settled: true, reason };
    }
  );
  // Allow the microtask queue to drain.
  await Promise.resolve();
  await Promise.resolve();
  return result;
}

describe("I7 — hide() settles the pending show() promise", () => {
  it("resolves the show() promise with undefined when hide() is called", async () => {
    render(
      <Provider>
        <TestModal id="i7-basic" />
      </Provider>
    );

    let showPromise!: Promise<unknown>;
    act(() => {
      showPromise = show("i7-basic");
    });

    act(() => {
      hide("i7-basic");
    });

    const outcome = await observeSettlement(showPromise);
    expect(outcome.settled).toBe(true);
    expect(outcome.value).toBeUndefined();
  });

  it("does not overwrite the value when the caller resolves via useModal().resolve() before hide()", async () => {
    // Real user flow: the modal component calls modal.resolve("custom") in
    // response to a user action, then hide() runs in afterClose. useModal's
    // resolveCallback deletes modalCallbacks[id] right after resolving, so by
    // the time hide() reaches its settleAndDelete the entry is already gone;
    // the outer promise must keep "custom" as its value.
    const ExplicitModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return (
        <button
          data-testid="resolve-custom"
          onClick={() => {
            modal.resolve("custom");
            modal.hide();
          }}
          type="button"
        >
          resolve
        </button>
      );
    });

    render(
      <Provider>
        <ExplicitModal id="i7-explicit" />
      </Provider>
    );

    let showPromise!: Promise<unknown>;
    act(() => {
      showPromise = show("i7-explicit");
    });

    act(() => {
      fireEvent.click(screen.getByTestId("resolve-custom"));
    });

    const outcome = await observeSettlement(showPromise);
    expect(outcome.settled).toBe(true);
    expect(outcome.value).toBe("custom");
  });
});

describe("I8 — remove() settles the pending hide() promise", () => {
  it("resolves the hide() promise with undefined when remove() is called", async () => {
    render(
      <Provider>
        <TestModal id="i8-basic" />
      </Provider>
    );

    act(() => {
      show("i8-basic");
    });

    let hidePromise!: Promise<unknown>;
    act(() => {
      hidePromise = hide("i8-basic");
    });

    act(() => {
      remove("i8-basic");
    });

    const outcome = await observeSettlement(hidePromise);
    expect(outcome.settled).toBe(true);
    expect(outcome.value).toBeUndefined();
  });

  it("also settles show() promise if remove() happens with an active show", async () => {
    // show() without hide() then remove() — both stores should clear and
    // any outstanding show promise should settle too.
    render(
      <Provider>
        <TestModal id="i8-active" />
      </Provider>
    );

    let showPromise!: Promise<unknown>;
    act(() => {
      showPromise = show("i8-active");
    });

    act(() => {
      remove("i8-active");
    });

    const outcome = await observeSettlement(showPromise);
    expect(outcome.settled).toBe(true);
    expect(outcome.value).toBeUndefined();
  });
});

describe("unregister() / ModalDef unmount also settles outstanding promises", () => {
  it("settles pending show() promise when top-level unregister runs", async () => {
    const { MODAL_REGISTRY } = await import("../src/constants");
    const UnregModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="unreg-modal">body</div>;
    });
    MODAL_REGISTRY["unreg-target"] = {
      comp: UnregModal,
      props: undefined,
    };

    render(
      <Provider>
        <div />
      </Provider>
    );

    let showPromise!: Promise<unknown>;
    act(() => {
      showPromise = show("unreg-target");
    });

    act(() => {
      unregister("unreg-target");
    });

    const outcome = await observeSettlement(showPromise);
    expect(outcome.settled).toBe(true);
    expect(outcome.value).toBeUndefined();
  });

  it("settles pending hide() promise when ModalDef unmounts", async () => {
    const DefModal = create(() => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="def-modal">body</div>;
    });

    const { unmount } = render(
      <Provider>
        <ModalDef component={DefModal} id="def-target" />
      </Provider>
    );

    act(() => {
      show("def-target");
    });

    let hidePromise!: Promise<unknown>;
    act(() => {
      hidePromise = hide("def-target");
    });

    unmount(); // ModalDef's cleanup runs unregisterWithDispatch

    const outcome = await observeSettlement(hidePromise);
    expect(outcome.settled).toBe(true);
    expect(outcome.value).toBeUndefined();
  });
});

/**
 * Regression: a hide promise belongs to exactly ONE close cycle.
 *
 * Before the fix, neither show() nor hide() settled a still-pending
 * hideModalCallbacks entry, so re-opening a keepMounted modal and closing it
 * again made the second hide() reuse the first cycle's promise — the first
 * awaiter then received the SECOND cycle's resolveHide value.
 */
describe("cross-cycle hide() promise isolation", () => {
  it("re-show + second hide() yields a fresh hide promise; the first hide is dismissed with undefined", async () => {
    render(
      <Provider>
        <TestModal id="cross-cycle" keepMounted />
      </Provider>
    );

    // Open, then close (hide #1) before its resolveHide fires.
    let hide1!: Promise<unknown>;
    act(() => {
      show("cross-cycle");
    });
    act(() => {
      hide1 = hide("cross-cycle");
    });

    // Reopen, then close again (hide #2).
    let hide2!: Promise<unknown>;
    act(() => {
      show("cross-cycle");
    });
    act(() => {
      hide2 = hide("cross-cycle");
    });

    // Each close cycle owns its own promise — the second hide must not reuse
    // the first cycle's deferred.
    expect(hide1).not.toBe(hide2);

    // The reopen already settled hide #1 as a dismissal.
    const firstOutcome = await observeSettlement(hide1);
    expect(firstOutcome.settled).toBe(true);
    expect(firstOutcome.value).toBeUndefined();

    // Only the current cycle's resolveHide value reaches hide #2.
    act(() => {
      hideModalCallbacks["cross-cycle"]?.resolve("second-close");
    });
    const secondOutcome = await observeSettlement(hide2);
    expect(secondOutcome.value).toBe("second-close");
  });
});
