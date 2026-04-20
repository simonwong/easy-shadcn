import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { create } from "../src/actions";
import {
  ALREADY_MOUNTED,
  hideModalCallbacks,
  modalCallbacks,
} from "../src/constants";
import { __getDispatchStackSize, Provider } from "../src/context";
import { useModal, useModalHolder } from "../src/useModal";

/**
 * Regression tests for C5: ModalHolder must clean up reducer state,
 * promise callbacks, and ALREADY_MOUNTED on unmount. Without cleanup,
 * list-style use (mount/unmount many rows) leaks a growing amount of
 * state per lifecycle.
 */
describe("ModalHolder cleanup on unmount", () => {
  const TestModal = create(() => {
    const modal = useModal();
    if (!modal.visible) {
      return null;
    }
    return <div data-testid="leak-modal">body</div>;
  });

  it("removes its reducer entry and callbacks when unmounted after show", () => {
    const HolderWrapper = () => {
      const [handler, Holder] = useModalHolder(TestModal);
      return (
        <>
          <button
            data-testid="leak-show"
            onClick={() => handler.show()}
            type="button"
          >
            show
          </button>
          <Holder />
        </>
      );
    };

    const callbacksBaseline = Object.keys(modalCallbacks).length;
    const hideBaseline = Object.keys(hideModalCallbacks).length;
    const mountedBaseline = Object.keys(ALREADY_MOUNTED).length;

    const { unmount } = render(
      <Provider>
        <HolderWrapper />
      </Provider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId("leak-show"));
    });

    // One show() on a brand-new holder writes exactly one new entry to
    // modalCallbacks; ALREADY_MOUNTED gets one new entry from the HOC.
    expect(Object.keys(modalCallbacks).length).toBe(callbacksBaseline + 1);

    unmount();

    // After unmount every per-id store must be back to the baseline — any
    // residual entry proves a leak.
    expect(Object.keys(modalCallbacks).length).toBe(callbacksBaseline);
    expect(Object.keys(hideModalCallbacks).length).toBe(hideBaseline);
    expect(Object.keys(ALREADY_MOUNTED).length).toBe(mountedBaseline);
  });

  it("pins the show-promise-leaks-on-unmount boundary (C5 vs I7)", async () => {
    // C5 tears down the holder's modalCallbacks on unmount. That closes the
    // memory leak but leaves any outer `await modal.show()` hanging, because
    // the resolver is deleted without settling. Settling the pending promise
    // is the job of I7. This test pins the current boundary so a future I7
    // change can flip the assertion to `.resolved`/`.rejected`.

    let capturedPromise: Promise<unknown> | undefined;

    const HolderWrapper = () => {
      const [handler, Holder] = useModalHolder(TestModal);
      return (
        <>
          <button
            data-testid="pending-show"
            onClick={() => {
              capturedPromise = handler.show();
            }}
            type="button"
          >
            show
          </button>
          <Holder />
        </>
      );
    };

    const { unmount } = render(
      <Provider>
        <HolderWrapper />
      </Provider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId("pending-show"));
    });
    expect(capturedPromise).toBeInstanceOf(Promise);

    unmount();

    // Current behaviour: promise stays pending forever. Assert the resolver
    // is gone AND that awaiting with a timeout does not observe a settlement.
    let settled = false;
    capturedPromise?.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      }
    );
    // Flush microtasks.
    await Promise.resolve();
    expect(settled).toBe(false);
  });

  it("does not leak callbacks when a keyed list re-mounts ModalHolder rapidly", () => {
    // Simulate a list where each row has its own ModalHolder. We repeatedly
    // remount rows under different keys — without cleanup, every remount
    // would permanently add a new entry to modalCallbacks / ALREADY_MOUNTED
    // since each Holder internally allocates a fresh getUid().

    const RowBody = () => {
      const [handler, Holder] = useModalHolder(TestModal);
      return (
        <>
          <button
            data-testid="row-show"
            onClick={() => handler.show()}
            type="button"
          >
            show row
          </button>
          <Holder />
        </>
      );
    };

    const baselineCallbacks = Object.keys(modalCallbacks).length;
    const baselineAlready = Object.keys(ALREADY_MOUNTED).length;

    const { rerender, unmount } = render(
      <Provider>
        <div key={0}>
          <RowBody />
        </div>
      </Provider>
    );

    for (let i = 0; i < 10; i++) {
      act(() => {
        fireEvent.click(screen.getByTestId("row-show"));
      });
      rerender(
        <Provider>
          <div key={i + 1}>
            <RowBody />
          </div>
        </Provider>
      );
    }

    unmount();

    // All per-row state should be gone now.
    expect(Object.keys(modalCallbacks).length).toBe(baselineCallbacks);
    expect(Object.keys(hideModalCallbacks).length).toBe(0);
    expect(Object.keys(ALREADY_MOUNTED).length).toBe(baselineAlready);
    expect(__getDispatchStackSize()).toBe(0);
  });
});
