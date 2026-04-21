import { act, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as actionsModule from "../src/actions";
import { create } from "../src/actions";
import { MODAL_REGISTRY } from "../src/constants";
import { Provider } from "../src/context";
import { useModal } from "../src/useModal";
import { resetRegistry } from "./test-utils";

/**
 * Regression tests for C2: `useModal(Component, args)` used to include the
 * caller-supplied `args` object in its register-on-mount effect's dep array.
 * Inline `args` arguments (very common — `useModal(Modal, { some: value })`)
 * produce a fresh object reference on every render, so the effect scheduled
 * a teardown+setup cycle each render even though the internal
 * `!MODAL_REGISTRY[id]` guard prevented the actual re-registration.
 *
 * Fix: read the latest args via ref, run the register effect only on mount
 * (deps: [modalId] only — no `args`, no `modal`, no `isUseComponent`).
 *
 * The tests below probe the effect's run count directly by wrapping
 * `register` so every effect run becomes observable — the existing
 * `!MODAL_REGISTRY[id]` guard hides re-runs from a naive `register` spy.
 */
describe("useModal args out of register effect deps (C2)", () => {
  beforeEach(() => {
    resetRegistry();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not re-schedule the register effect when the caller passes a fresh args object every render", () => {
    // Force every effect run to be observable by deleting the registry entry
    // inside the spied register, so the internal `!MODAL_REGISTRY[id]` guard
    // cannot short-circuit subsequent runs. This lets us count the number of
    // times the effect body actually fires.
    const realRegister = actionsModule.register;
    let effectRunCount = 0;
    const registerSpy = vi
      .spyOn(actionsModule, "register")
      .mockImplementation((id, comp, props) => {
        effectRunCount += 1;
        realRegister(id, comp, props);
        delete MODAL_REGISTRY[id];
      });

    const InnerModal: React.FC<{ value?: number }> = ({ value }) => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="c2-modal">value:{value ?? "unset"}</div>;
    };
    const TestModal = create(InnerModal);

    let rerenderParent!: () => void;

    const Parent = () => {
      const [tick, setTick] = useState(0);
      rerenderParent = () => setTick((v) => v + 1);
      // Inline args object — new identity each render.
      useModal(TestModal, { value: tick });
      return <span data-testid="tick">{tick}</span>;
    };

    render(
      <Provider>
        <Parent />
      </Provider>
    );

    const mountBaseline = effectRunCount;
    // Baseline must be >= 1 (mount ran at least once; StrictMode may double).
    expect(mountBaseline).toBeGreaterThanOrEqual(1);

    act(() => {
      rerenderParent();
    });
    act(() => {
      rerenderParent();
    });
    act(() => {
      rerenderParent();
    });

    // With the fix: effect deps = [modalId], so args changing identity does
    // not restart the effect. The body must not run again after mount.
    // Before the fix: `args` was in deps, so each rerender caused a
    // teardown+setup cycle, incrementing the counter.
    expect(effectRunCount).toBe(mountBaseline);

    registerSpy.mockRestore();
  });

  it("still registers a component-referenced modal when MODAL_REGISTRY is empty", () => {
    const InnerModal: React.FC = () => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="c2-register">body</div>;
    };
    const TestModal = create(InnerModal);

    const Consumer = () => {
      useModal(TestModal);
      return null;
    };

    render(
      <Provider>
        <Consumer />
      </Provider>
    );

    const registeredIds = Object.keys(MODAL_REGISTRY);
    expect(registeredIds.length).toBeGreaterThan(0);
  });

  it("passes the latest args seen during render to register() on mount", () => {
    // Pin: reading args via ref must read the freshest render-phase value,
    // not an earlier snapshot. This keeps the "register once on mount with
    // fresh args" contract meaningful.
    const registerSpy = vi.spyOn(actionsModule, "register");

    const InnerModal: React.FC<{ value?: number }> = ({ value }) => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return <div data-testid="c2-latest">value:{value}</div>;
    };
    const TestModal = create(InnerModal);

    const Parent: React.FC<{ value: number }> = ({ value }) => {
      useModal(TestModal, { value });
      return null;
    };

    render(
      <Provider>
        <Parent value={42} />
      </Provider>
    );

    const firstCall = registerSpy.mock.calls[0];
    expect(firstCall).toBeDefined();
    // 3rd arg is the `args` object passed to register.
    expect(firstCall?.[2]).toEqual({ value: 42 });

    registerSpy.mockRestore();
  });
});
