import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { StrictMode, useState } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { create } from "../src/actions";
import { Provider } from "../src/context";
import type { ModalHolderActions } from "../src/holders";
import { useModal, useModalHolder } from "../src/useModal";
import { resetRegistry } from "./test-utils";

/**
 * Regression tests for C4: ModalHolder used to assign `handler.show` and
 * `handler.hide` directly during the render phase. That breaks React's
 * render purity rule (renders must be side-effect-free) and is fragile
 * under concurrent rendering / StrictMode double-invoke. The fix moves
 * the assignment into a `useLayoutEffect` so the external `handler`
 * object is mutated in the commit phase — the idiomatic React pattern.
 *
 * Tests pin:
 *   (a) handler.show / handler.hide are defined and functional after mount
 *   (b) StrictMode double-invoke doesn't break the setup
 *   (c) handler method identity stays stable across parent re-renders when
 *       modalId + dispatch are stable
 */
describe("ModalHolder render purity (C4)", () => {
  beforeEach(() => {
    resetRegistry();
  });

  const TestModal = create<{ value?: number }>(({ value }) => {
    const modal = useModal();
    if (!modal.visible) {
      return null;
    }
    return <div data-testid="c4-modal">value:{String(value ?? "unset")}</div>;
  });

  it("sets up a working show() on mount and the modal renders after invocation", async () => {
    // `null as …` keeps the flow-narrowed type as the full union. A bare
    // `: ModalHolderActions | null = null` narrows to `null` at the reads below
    // (the assignment happens only inside the render callback, invisible to the
    // outer control flow), which makes `capturedHandler?.show` resolve its
    // non-null branch to `never`.
    let capturedHandler = null as ModalHolderActions | null;

    const Parent = () => {
      const [handler, ModalSlot] = useModalHolder(TestModal);
      capturedHandler = handler;
      return (
        <>
          <button
            data-testid="c4-show"
            onClick={() => handler.show({ value: 7 })}
            type="button"
          >
            show
          </button>
          <ModalSlot />
        </>
      );
    };

    render(
      <Provider>
        <Parent />
      </Provider>
    );

    expect(capturedHandler).not.toBeNull();

    act(() => {
      fireEvent.click(screen.getByTestId("c4-show"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("c4-modal")).toBeInTheDocument();
    });
    expect(screen.getByTestId("c4-modal").textContent).toContain("value:7");
    // After commit, the handler must have show installed.
    expect(typeof capturedHandler?.show).toBe("function");
    expect(typeof capturedHandler?.hide).toBe("function");
  });

  it("works correctly under StrictMode double-invoke", async () => {
    const Parent = () => {
      const [handler, ModalSlot] = useModalHolder(TestModal);
      return (
        <>
          <button
            data-testid="c4-strict-show"
            onClick={() => handler.show({ value: 3 })}
            type="button"
          >
            show
          </button>
          <ModalSlot />
        </>
      );
    };

    render(
      <StrictMode>
        <Provider>
          <Parent />
        </Provider>
      </StrictMode>
    );

    act(() => {
      fireEvent.click(screen.getByTestId("c4-strict-show"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("c4-modal")).toBeInTheDocument();
    });
    expect(screen.getByTestId("c4-modal").textContent).toContain("value:3");
  });

  it("does not mutate handler during the render phase (sibling observes empty handler on first render)", () => {
    // During the first parent render, ModalSlot renders and (in the broken
    // code) mutates handler.show via render-phase assignment. A sibling
    // rendered *after* ModalSlot in the same render pass would therefore see
    // handler.show already set — a telltale sign of render-phase side
    // effects. The fix moves the assignment to useLayoutEffect, which fires
    // only after all renders commit, so a sibling in the same render pass
    // sees handler.show as still undefined.

    const observationsPerRender: unknown[] = [];

    const Sibling = ({ handler }: { handler: ModalHolderActions }) => {
      // Captured during the sibling's render phase, which runs AFTER
      // ModalSlot's render phase in the same pass.
      observationsPerRender.push(handler.show);
      return null;
    };

    const Parent = () => {
      const [handler, ModalSlot] = useModalHolder(TestModal);
      return (
        <>
          <ModalSlot />
          <Sibling handler={handler} />
        </>
      );
    };

    render(
      <Provider>
        <Parent />
      </Provider>
    );

    // First observation (during first render pass) must be undefined — the
    // useLayoutEffect has not fired yet. Before the fix, render-phase
    // mutation would have made this defined.
    expect(observationsPerRender[0]).toBeUndefined();
  });

  it("keeps handler.show identity stable across parent re-renders", () => {
    const recorded: (ModalHolderActions["show"] | undefined)[] = [];
    let bumpParent!: () => void;

    const Parent = () => {
      const [tick, setTick] = useState(0);
      bumpParent = () => setTick((v) => v + 1);
      const [handler, ModalSlot] = useModalHolder(TestModal);
      recorded.push(handler.show);
      return (
        <>
          <span data-testid="tick">{tick}</span>
          <ModalSlot />
        </>
      );
    };

    render(
      <Provider>
        <Parent />
      </Provider>
    );

    act(() => {
      bumpParent();
    });
    act(() => {
      bumpParent();
    });

    // Collect all defined show references captured across renders. The first
    // parent render happens before ModalHolder has committed, so handler.show
    // is undefined at that point (in both old and new code — initial latency
    // is inherent to the handshake). All *subsequent* renders must see the
    // same stable function identity.
    const definedShows = recorded.filter(
      (fn): fn is ModalHolderActions["show"] => fn !== undefined
    );
    expect(definedShows.length).toBeGreaterThan(0);
    const firstDefined = definedShows[0];
    for (const show of definedShows) {
      expect(show).toBe(firstDefined);
    }
  });
});
