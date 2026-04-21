import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { create } from "../src/actions";
import { getModalId } from "../src/constants";
import { Provider } from "../src/context";
import type { CreateModalComponent } from "../src/type";
import { useModal, useModalHolder } from "../src/useModal";
import { resetRegistry } from "./test-utils";

const COMMAND_MODAL_ID_PATTERN = /^_command_modal_\d+$/;
const USE_ID_PREFIX_PATTERN = /^[:_]/;

/**
 * Regression tests for C6: module-level `modalIdCounter` → SSR-safe ids.
 *
 * Changes covered:
 *   (a) ModalHolder's internal id is generated via `React.useId()`, not a
 *       module-level counter, so it's stable between SSR and hydration.
 *   (b) `getModalId(Component)` does NOT mutate the component function
 *       (previously `modal[symModalId] = ...`). Mutating the shared component
 *       across SSR requests creates cross-request contamination in Node; the
 *       WeakMap-backed mapping isolates the id store from the component
 *       identity.
 *   (c) Behavior preserved: repeated getModalId(Component) calls return the
 *       same id; ModalHolder renders use the returned useId value.
 */
describe("SSR-safe modal id (C6)", () => {
  beforeEach(() => {
    resetRegistry();
  });

  describe("ModalHolder uses React.useId() for internal ids", () => {
    it("renders an id that is not the legacy counter format", () => {
      const observedIds: string[] = [];

      const TestModal = create(() => {
        const modal = useModal();
        observedIds.push(modal.id);
        if (!modal.visible) {
          return null;
        }
        return <div data-testid="c6-modal">body</div>;
      });

      const Consumer = () => {
        const [handler, ModalSlot] = useModalHolder(TestModal);
        return (
          <>
            <button
              data-testid="c6-trigger"
              onClick={() => {
                handler.show();
              }}
              type="button"
            >
              show
            </button>
            <ModalSlot />
          </>
        );
      };

      const { getByTestId } = render(
        <Provider>
          <Consumer />
        </Provider>
      );
      act(() => {
        getByTestId("c6-trigger").click();
      });

      expect(observedIds.length).toBeGreaterThan(0);
      const id = observedIds[0];
      expect(id).not.toMatch(COMMAND_MODAL_ID_PATTERN);
      // React's useId format varies by runtime (":r0:" in concurrent mode,
      // "_r_2_" in some test/dev builds). Assert the ID has a leading
      // delimiter character that is not part of the legacy counter token.
      expect(id).toMatch(USE_ID_PREFIX_PATTERN);
      expect(id).not.toContain("command_modal");
    });

    it("produces stable ids across parent re-renders", () => {
      const observedIds: string[] = [];
      const TestModal = create(() => {
        const modal = useModal();
        observedIds.push(modal.id);
        if (!modal.visible) {
          return null;
        }
        return null;
      });

      const Consumer = () => {
        const [handler, ModalSlot] = useModalHolder(TestModal);
        return (
          <>
            <button
              data-testid="c6-stable"
              onClick={() => {
                handler.show();
              }}
              type="button"
            >
              show
            </button>
            <ModalSlot />
          </>
        );
      };

      const { getByTestId, rerender } = render(
        <Provider>
          <Consumer />
        </Provider>
      );
      act(() => {
        getByTestId("c6-stable").click();
      });
      rerender(
        <Provider>
          <Consumer />
        </Provider>
      );

      expect(observedIds.length).toBeGreaterThan(0);
      const unique = new Set(observedIds);
      expect(unique.size).toBe(1);
    });
  });

  describe("getModalId does not mutate the component", () => {
    it("keeps the component function pristine after calling getModalId", () => {
      const TestComponent: CreateModalComponent = () => null;

      const beforeKeys = Reflect.ownKeys(TestComponent);
      const id = getModalId(TestComponent);
      const afterKeys = Reflect.ownKeys(TestComponent);

      // No new properties (including symbols) should have been added.
      expect(afterKeys).toEqual(beforeKeys);
      expect(typeof id).toBe("string");
      expect(id).toMatch(COMMAND_MODAL_ID_PATTERN);
    });

    it("still returns the same id for the same component on subsequent calls", () => {
      const TestComponent: CreateModalComponent = () => null;
      const id1 = getModalId(TestComponent);
      const id2 = getModalId(TestComponent);
      expect(id1).toBe(id2);
    });

    it("returns different ids for different component references", () => {
      const ComponentA: CreateModalComponent = () => null;
      const ComponentB: CreateModalComponent = () => null;

      const idA = getModalId(ComponentA);
      const idB = getModalId(ComponentB);

      expect(idA).not.toBe(idB);
    });

    it("allows freezing the component after getModalId (no write attempted)", () => {
      const TestComponent: CreateModalComponent = () => null;
      Object.freeze(TestComponent);

      // Before the WeakMap refactor, this would throw a TypeError in strict
      // mode because getModalId tried to assign `modal[symModalId] = ...`
      // onto a frozen function. Now the id is stored in an external WeakMap,
      // so the component itself is never written to.
      expect(() => getModalId(TestComponent)).not.toThrow();
      const id = getModalId(TestComponent);
      expect(id).toMatch(COMMAND_MODAL_ID_PATTERN);
    });
  });

  describe("useModalHolder integration uses useId-based internal ids", () => {
    it("does not use the legacy getUid counter format for ModalHolder auto id", () => {
      // After the fix, ModalHolder no longer calls getUid() in its body —
      // it uses useId() instead. Assert that the auto-id it renders with is
      // NOT in the legacy counter format.
      const TestModal = create(() => {
        const modal = useModal();
        if (!modal.visible) {
          return null;
        }
        return <span data-testid="holder-id">{modal.id}</span>;
      });

      let capturedId: string | null = null;

      const Consumer = () => {
        const [handler, ModalSlot] = useModalHolder(TestModal);
        return (
          <>
            <button
              data-testid="c6-holder-show"
              onClick={() => {
                handler.show().then(() => undefined);
              }}
              type="button"
            >
              show
            </button>
            <ModalSlot />
          </>
        );
      };

      const { getByTestId } = render(
        <Provider>
          <Consumer />
        </Provider>
      );

      act(() => {
        getByTestId("c6-holder-show").click();
      });

      capturedId = getByTestId("holder-id").textContent ?? "";
      expect(capturedId).not.toMatch(COMMAND_MODAL_ID_PATTERN);
      expect(capturedId).toMatch(USE_ID_PREFIX_PATTERN);
    });
  });
});
