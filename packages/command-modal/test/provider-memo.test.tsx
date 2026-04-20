import { act, render } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Provider } from "../src/context";
import type { CommandModalConfig } from "../src/type";
import { useModal } from "../src/useModal";

/**
 * Regression tests for C3: Provider's config context value must be memoized
 * so that a parent re-render that passes a fresh inline `config` object but
 * semantically unchanged `modalPropsAdapter` does not cause downstream
 * `useModal` consumers to rebuild their handler / modalProps references.
 */
describe("Provider config memoization (C3)", () => {
  it("keeps useModal handler reference stable when only parent state changes", () => {
    const handlerRefs: unknown[] = [];

    const stableAdapter: NonNullable<
      CommandModalConfig["modalPropsAdapter"]
    > = (handler) => ({
      open: handler.visible,
      onOpenChange: (open) => {
        if (open) {
          handler.show();
        } else {
          handler.hide();
        }
      },
      afterClose: handler.resolveHide,
    });

    const Consumer = () => {
      const modal = useModal("stable");
      handlerRefs.push(modal);
      return null;
    };

    let rerenderParent!: () => void;

    const Parent = () => {
      const [tick, setTick] = useState(0);
      rerenderParent = () => setTick((v) => v + 1);
      // Inline config object — new reference each parent render, but the
      // adapter reference (stableAdapter) is stable.
      return (
        <Provider config={{ modalPropsAdapter: stableAdapter }}>
          <Consumer />
          <span>{tick}</span>
        </Provider>
      );
    };

    render(<Parent />);
    // Capture the first render's reference length-agnostically so the test
    // keeps working if StrictMode is later enabled globally (which causes
    // each "logical render" to run twice).
    const first = handlerRefs.at(-1);
    const renderCountBefore = handlerRefs.length;

    act(() => {
      rerenderParent();
    });

    // Consumer rendered again (parent bumped tick) but with the same adapter
    // identity, so the useModal result must keep the same reference — no
    // cascading re-creation of the handler / modalProps object.
    expect(handlerRefs.length).toBeGreaterThan(renderCountBefore);
    expect(handlerRefs.at(-1)).toBe(first);
  });

  it("rebuilds handler when the modalPropsAdapter identity actually changes", () => {
    const handlerRefs: unknown[] = [];

    const adapterA: NonNullable<CommandModalConfig["modalPropsAdapter"]> = (
      handler
    ) => ({ open: handler.visible });
    const adapterB: NonNullable<CommandModalConfig["modalPropsAdapter"]> = (
      handler
    ) => ({ open: handler.visible });

    const Consumer = () => {
      const modal = useModal("ada");
      handlerRefs.push(modal);
      return null;
    };

    let rerenderParent!: (next: typeof adapterA) => void;

    const Parent = () => {
      // `useState(() => adapterA)` uses lazy init to STORE the function (without
      // invoking it). `setAdapter(() => next)` uses the updater form, which
      // returns `next` as the new state. Both forms are required because
      // React treats a function arg as "call me" unless wrapped this way.
      const [adapter, setAdapter] = useState(() => adapterA);
      rerenderParent = (next) => setAdapter(() => next);
      return (
        <Provider config={{ modalPropsAdapter: adapter }}>
          <Consumer />
        </Provider>
      );
    };

    render(<Parent />);
    const first = handlerRefs.at(-1);

    act(() => {
      rerenderParent(adapterB);
    });

    // Adapter identity changed — the handler/modalProps bundle must be fresh.
    expect(handlerRefs.at(-1)).not.toBe(first);
  });
});
