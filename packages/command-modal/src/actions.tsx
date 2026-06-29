import type React from "react";
import { type Dispatch, useContext, useEffect, useRef } from "react";
import {
  ALREADY_MOUNTED,
  getModalId,
  hideModalCallbacks,
  MODAL_REGISTRY,
  modalCallbacks,
} from "./constants";
import {
  __getDispatchStackSize,
  CommandModalContext,
  CommandModalDispatchContext,
  CommandModalIdContext,
  createReducerActions,
  reducerActions,
} from "./context";
import type {
  CommandModalAction,
  CommandModalCallbacks,
  CreateModalComponent,
  ModalInnerProps,
  ResolveType,
} from "./type";
import { useModal } from "./useModal";

/**
 * Helper function to create a promise with exposed resolve/reject callbacks.
 * This is used internally to manage modal promises for show() and hide() operations.
 *
 * This implements the "Deferred Promise" pattern, where resolve/reject are accessible
 * outside the Promise constructor. The non-null assertions (!) are safe here because
 * the Promise constructor executes synchronously, guaranteeing that resolve/reject
 * are assigned before the function returns.
 *
 * @param callbacksStore - The callbacks store to save the promise handlers
 * @param modalId - The modal id to create the promise for
 * @returns The created promise
 */
function createModalPromise(
  callbacksStore: CommandModalCallbacks,
  modalId: string
): Promise<unknown> {
  if (!callbacksStore[modalId]) {
    // These variables will be assigned synchronously in the Promise constructor
    let resolve!: (args?: unknown) => void;
    let reject!: (args?: unknown) => void;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    callbacksStore[modalId] = {
      resolve,
      reject,
      promise,
    };
  }
  return callbacksStore[modalId].promise;
}

/**
 * Pick the right action creators: scoped to the given dispatch when provided
 * (i.e. called from inside a Provider tree), or the legacy fallback (which
 * resolves to the top of the global dispatch stack) when called from outside.
 */
const resolveActions = (dispatch: Dispatch<CommandModalAction> | null) =>
  dispatch ? createReducerActions(dispatch) : reducerActions;

/**
 * Settle any outstanding promise tracked for `modalId` in `store`, then drop
 * the resolver. Resolving with `undefined` before deletion is what keeps
 * `await modal.show()` / `await modal.hide()` from hanging forever whenever
 * a teardown path (hide, remove, unregister) fires without the caller
 * settling the promise explicitly. Resolving a promise that was already
 * settled is a no-op per spec, so invoking this unconditionally is safe.
 */
const settleAndDelete = (
  store: CommandModalCallbacks,
  modalId: string
): void => {
  store[modalId]?.resolve(undefined);
  delete store[modalId];
};

/**
 * Internal show used by both the top-level `show()` and scoped callers such as
 * `useModal`'s `show` callback. `dispatch` may be null, in which case the
 * legacy fallback dispatch (top of the Provider stack) is used.
 */
export function showWithDispatch(
  modal: React.FC | string,
  args: Record<string, unknown> | undefined,
  dispatch: Dispatch<CommandModalAction> | null
): Promise<unknown> {
  const modalId = getModalId(modal);
  if (typeof modal !== "string" && !MODAL_REGISTRY[modalId]) {
    register(modalId, modal);
  }
  resolveActions(dispatch).showModal(modalId, args);
  // Re-showing dismisses any hide() still awaiting its close: settle that stale
  // hide promise with `undefined` and drop it. Otherwise createModalPromise's
  // `if (!callbacksStore[modalId])` guard would let the next hide() reuse the
  // interrupted cycle's promise, cross-settling two close cycles (and leaking
  // the entry until a later teardown). Symmetric with hideWithDispatch settling
  // the pending show below.
  settleAndDelete(hideModalCallbacks, modalId);
  return createModalPromise(modalCallbacks, modalId);
}

export function hideWithDispatch(
  modal: string | CreateModalComponent,
  dispatch: Dispatch<CommandModalAction> | null
): Promise<unknown> {
  const modalId = getModalId(modal);
  resolveActions(dispatch).hideModal(modalId);
  settleAndDelete(modalCallbacks, modalId);
  // Settle any prior hide() still pending from an earlier, not-yet-completed
  // close cycle before minting this hide's promise. Without this, a second
  // hide() on a reopened (keepMounted) modal would reuse the first cycle's
  // promise (createModalPromise reuses an existing entry) and the first
  // awaiter would receive THIS cycle's resolveHide value.
  settleAndDelete(hideModalCallbacks, modalId);
  return createModalPromise(hideModalCallbacks, modalId);
}

export function removeWithDispatch(
  modal: string | CreateModalComponent,
  dispatch: Dispatch<CommandModalAction> | null
): void {
  const modalId = getModalId(modal);
  // Use an explicit stack-size guard (mirroring unregisterWithDispatch) so
  // that a teardown path without an active Provider — e.g. calling top-level
  // remove() after the last Provider has unmounted — is a no-op on the
  // reducer side but still clears the module-level stores below.
  if (dispatch) {
    createReducerActions(dispatch).removeModal(modalId);
  } else if (__getDispatchStackSize() > 0) {
    reducerActions.removeModal(modalId);
  }
  settleAndDelete(modalCallbacks, modalId);
  settleAndDelete(hideModalCallbacks, modalId);
  // Note: ALREADY_MOUNTED is owned by the HOC's own mount/unmount effect.
  // For auto-registered modals the placeholder drops the HOC when the
  // reducer entry is gone, so the effect cleanup clears the flag naturally.
  // For JSX-declared modals the HOC stays mounted, so the flag stays true —
  // that is the desired behavior (next show() avoids the delayVisible
  // roundtrip because the component is still there).
}

// biome-ignore lint/suspicious/noExplicitAny: C is constrained to any modal component; its concrete props are recovered via ModalInnerProps<C> and its resolve type via ResolveType<C>.
export function show<C extends CreateModalComponent<any, any>>(
  modal: C,
  args?: Partial<ModalInnerProps<C>>
): Promise<ResolveType<C>>;
export function show<T = unknown>(
  modal: string,
  args?: Record<string, unknown>
): Promise<T>;

/**
 * Show a modal and return a promise tied to its lifecycle.
 *
 * Settlement contract:
 *  - Resolves with the value passed to `modal.resolve(value)`.
 *  - Rejects with the value passed to `modal.reject(reason)`.
 *  - If the modal is hidden, removed, or unregistered without an explicit
 *    resolve/reject, the promise **resolves with `undefined`** (treated as a
 *    dismissal). Callers that need to distinguish an explicit
 *    `resolve(undefined)` from a dismissal should use a sentinel value.
 *
 * When called from outside a Provider tree, this routes to the most recently
 * mounted Provider. For scoped routing in multi-Provider setups, prefer
 * `useModal(...).show()` from inside the component tree.
 *
 * @param modal - The modal id or component to show
 * @param args - Arguments to pass to the modal component
 * @returns A promise that settles as described above.
 */
export function show(
  // The implementation signature must be a supertype of every overload above.
  // `CreateModalComponent<C>` carries a required `id`, so it is not assignable
  // to the bare `React.FC` (= `FC<{}>`); the permissive `React.FC<any>` is.
  // biome-ignore lint/suspicious/noExplicitAny: see comment above — supertype of all show() overloads.
  modal: React.FC<any> | string,
  args?: Record<string, unknown>
) {
  return showWithDispatch(modal, args, null);
}

export function hide<T, C>(modal: string | CreateModalComponent<C>): Promise<T>;

/**
 * Hide a modal and return a promise tied to the hide lifecycle.
 *
 * Settlement contract:
 *  - Resolves with the value passed to `modal.resolveHide(value)` (typically
 *    from the modal component's `afterClose` hook).
 *  - If the modal is removed or unregistered before `resolveHide` is called,
 *    the promise **resolves with `undefined`**.
 *  - Calling `hide()` also settles any outstanding `show()` promise with
 *    `undefined` so callers awaiting `await modal.show()` are not orphaned.
 *
 * @param modal - The modal id or component to hide
 * @returns A promise that settles as described above.
 */
export function hide(modal: string | CreateModalComponent) {
  return hideWithDispatch(modal, null);
}

/**
 * Remove a modal from the tree and clean up associated module-level state.
 * This includes:
 * - Removing modal state from the store
 * - Settling and cleaning up pending show/hide promise callbacks
 *
 * Note: the `ALREADY_MOUNTED` flag is owned by the HOC's mount/unmount
 * effect and is *not* cleared here. For auto-registered modals the HOC will
 * unmount when the placeholder drops it (naturally clearing the flag); for
 * JSX-declared modals the HOC stays mounted and the flag stays true (so
 * subsequent `show()` calls render without a delayVisible roundtrip).
 *
 * @param modal - The modal id or component to remove
 */
export const remove = (modal: string | CreateModalComponent): void => {
  removeWithDispatch(modal, null);
};

export const create = <P extends object, R = unknown>(
  Comp: React.ComponentType<P>
): CreateModalComponent<P, R> => {
  const HocComp: CreateModalComponent<P, R> = ({
    defaultVisible,
    keepMounted,
    id,
    ...props
  }) => {
    const { args, show: modalShow } = useModal(id);

    // If there's modal state, then should mount it.
    const modals = useContext(CommandModalContext);
    const shouldMount = !!modals[id];

    // Scoped dispatch so setModalFlags targets this Provider, not a sibling one.
    const scopedDispatch = useContext(CommandModalDispatchContext);

    // Lifecycle-bound: ALREADY_MOUNTED is set on mount and cleared on unmount.
    // It represents "this HOC instance is live in the tree" — not "the modal
    // has state". Consolidating into a single [id]-keyed effect removes the
    // previous race where a second effect could drop the flag when
    // shouldMount flipped false (which caused a spurious delayVisible
    // roundtrip on the next show in the HOC-stays-mounted case).
    useEffect(() => {
      ALREADY_MOUNTED[id] = true;
      return () => {
        delete ALREADY_MOUNTED[id];
      };
    }, [id]);

    // Fire defaultVisible once per active id. A ref guard prevents an extra
    // show() when a parent re-renders with the same `defaultVisible` prop, but
    // still allows a long-lived HOC instance to switch to a new id and show it.
    const defaultVisibleFiredIdRef = useRef<string | null>(null);
    useEffect(() => {
      if (defaultVisible && defaultVisibleFiredIdRef.current !== id) {
        defaultVisibleFiredIdRef.current = id;
        modalShow();
      }
    }, [id, defaultVisible, modalShow]);

    useEffect(() => {
      if (keepMounted) {
        resolveActions(scopedDispatch).setModalFlags(id, { keepMounted: true });
      }
    }, [id, keepMounted, scopedDispatch]);

    const delayVisible = modals[id]?.delayVisible;
    // Route args through a ref so this effect does not restart on every new
    // `args` object emitted by the reducer (each showModal action spreads a
    // fresh object even when the semantic args are identical).
    //
    // Reading `argsRef.current` inside the effect is safe: `delayVisible`
    // only flips `false → true` during the same render that assigns
    // `argsRef.current = args`, so the effect body observes the args that
    // accompanied the show that caused the flip.
    const argsRef = useRef(args);
    argsRef.current = args;
    useEffect(() => {
      if (delayVisible) {
        // delayVisible: false => true means show() was called while the
        // component had not yet mounted — re-dispatch now with the latest args.
        modalShow(argsRef.current);
      }
    }, [delayVisible, modalShow]);

    if (!shouldMount) {
      return null;
    }
    // Strip HOC-reserved keys from args before spreading into the inner
    // component. Otherwise a caller doing `show("x", { id: "hijack" })`
    // could overwrite id / defaultVisible / keepMounted downstream.
    const {
      id: _reservedId,
      defaultVisible: _reservedDv,
      keepMounted: _reservedKm,
      ...safeArgs
    } = args ?? {};
    return (
      <CommandModalIdContext.Provider value={id}>
        <Comp {...(props as P)} {...safeArgs} />
      </CommandModalIdContext.Provider>
    );
  };

  return HocComp;
};

// All registered modals will be rendered in modal placeholder
// biome-ignore lint/suspicious/noExplicitAny: Required for generic component registration - ModalInnerProps<T> extracts the actual props.
export const register = <T extends CreateModalComponent<any>>(
  id: string,
  comp: T,
  props?: Partial<ModalInnerProps<T>>
): void => {
  if (MODAL_REGISTRY[id]) {
    MODAL_REGISTRY[id].props = props;
  } else {
    MODAL_REGISTRY[id] = { comp, props };
  }
};

/**
 * Internal unregister variant that removes modal state via an explicit
 * dispatch — used by `ModalDef` to ensure the correct Provider's state is
 * cleaned up (not the top of the global stack) even during unmount.
 */
export const unregisterWithDispatch = (
  id: string,
  dispatch: Dispatch<CommandModalAction> | null
): void => {
  delete MODAL_REGISTRY[id];
  // Settle any outstanding show/hide promises before deletion so callers
  // awaiting `modal.show()` / `modal.hide()` do not hang when a ModalDef
  // unmounts or a top-level `unregister()` runs while the promise is pending.
  settleAndDelete(modalCallbacks, id);
  settleAndDelete(hideModalCallbacks, id);
  // Note: ALREADY_MOUNTED is owned by the HOC's own mount/unmount effect.
  // See the matching note in removeWithDispatch.
  if (dispatch) {
    createReducerActions(dispatch).removeModal(id);
    return;
  }
  // No scoped dispatch captured — fall back to the stack top if a Provider is
  // still mounted, otherwise skip (there is no reducer to update). Use an
  // explicit stack-size guard rather than try/catch so real reducer errors
  // still surface.
  if (__getDispatchStackSize() > 0) {
    reducerActions.removeModal(id);
  }
};

/**
 * Unregister a modal and clean up associated module-level state.
 * This should be called when a modal component is permanently removed.
 * It cleans up:
 * - Modal registry entry
 * - Pending show/hide promise callbacks (settled with `undefined` first)
 * - Modal state from the store
 *
 * Note: the `ALREADY_MOUNTED` flag is owned by the HOC's mount/unmount
 * effect and is *not* cleared here. See the note on `remove()`.
 * @param id - The id of the modal.
 */
export const unregister = (id: string): void => {
  unregisterWithDispatch(id, null);
};
