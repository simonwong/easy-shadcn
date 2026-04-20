import type React from "react";
import { type Dispatch, useContext, useEffect } from "react";
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
  CommandModalArgs,
  CommandModalCallbacks,
  CreateModalComponent,
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
 * Internal show used by both the top-level `show()` and scoped callers such as
 * `useModal`'s `show` callback. `dispatch` may be null, in which case the
 * legacy fallback dispatch (top of the Provider stack) is used.
 */
export function showWithDispatch(
  modal: React.FC | string,
  args: CommandModalArgs<React.FC> | undefined,
  dispatch: Dispatch<CommandModalAction> | null
): Promise<unknown> {
  const modalId = getModalId(modal);
  if (typeof modal !== "string" && !MODAL_REGISTRY[modalId]) {
    register(modalId, modal);
  }
  resolveActions(dispatch).showModal(modalId, args);
  return createModalPromise(modalCallbacks, modalId);
}

export function hideWithDispatch(
  modal: string | CreateModalComponent,
  dispatch: Dispatch<CommandModalAction> | null
): Promise<unknown> {
  const modalId = getModalId(modal);
  resolveActions(dispatch).hideModal(modalId);
  // Clean up show promise callback to prevent memory leaks.
  // (Promise-settle semantics are addressed in a later fix — see I7.)
  delete modalCallbacks[modalId];
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
  delete modalCallbacks[modalId];
  delete hideModalCallbacks[modalId];
  delete ALREADY_MOUNTED[modalId];
}

export function show<T, C, P extends Partial<CommandModalArgs<React.FC<C>>>>(
  modal: CreateModalComponent<C>,
  args?: P
): Promise<T>;
export function show<T>(
  modal: string,
  args?: Record<string, unknown>
): Promise<T>;
export function show<T, P>(modal: string, args: P): Promise<T>;

/**
 * Show a modal and return a promise that resolves when the modal is resolved.
 * Note: The promise callback is automatically cleaned up when the modal is hidden.
 *
 * When called from outside a Provider tree, this routes to the most recently
 * mounted Provider. For scoped routing in multi-Provider setups, prefer
 * `useModal(...).show()` from inside the component tree.
 *
 * @param modal - The modal id or component to show
 * @param args - Arguments to pass to the modal component
 * @returns A promise that resolves with the value passed to modal.resolve()
 */
export function show(
  modal: React.FC | string,
  args?: CommandModalArgs<React.FC>
) {
  return showWithDispatch(modal, args, null);
}

export function hide<T, C>(modal: string | CreateModalComponent<C>): Promise<T>;

/**
 * Hide a modal and return a promise that resolves when the modal is fully hidden.
 * Note: This automatically cleans up the show() promise callback to prevent memory leaks.
 * The hide promise callback is cleaned up when the modal is removed or when resolveHide is called.
 * @param modal - The modal id or component to hide
 * @returns A promise that resolves when the modal's afterClose callback is triggered
 */
export function hide(modal: string | CreateModalComponent) {
  return hideWithDispatch(modal, null);
}

/**
 * Remove a modal from the tree and clean up all associated resources.
 * This includes:
 * - Removing modal state from the store
 * - Cleaning up pending promise callbacks to prevent memory leaks
 * - Removing the mounted flag
 * @param modal - The modal id or component to remove
 */
export const remove = (modal: string | CreateModalComponent): void => {
  removeWithDispatch(modal, null);
};

export const create = <P extends object>(Comp: React.ComponentType<P>) => {
  const HocComp: CreateModalComponent<P> = ({
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

    useEffect(() => {
      // If defaultVisible, show it after mounted.
      if (defaultVisible) {
        modalShow();
      }

      ALREADY_MOUNTED[id] = true;

      return () => {
        delete ALREADY_MOUNTED[id];
      };
    }, [id, modalShow, defaultVisible]);

    // Keep ALREADY_MOUNTED in sync with shouldMount so that a re-show after
    // remove() works in scenarios where HocComp itself never unmounts
    // (e.g. ModalHolder keeps rendering <ModalComp id={id} /> across shows).
    useEffect(() => {
      if (shouldMount) {
        ALREADY_MOUNTED[id] = true;
        return () => {
          delete ALREADY_MOUNTED[id];
        };
      }
    }, [shouldMount, id]);

    useEffect(() => {
      if (keepMounted) {
        resolveActions(scopedDispatch).setModalFlags(id, { keepMounted: true });
      }
    }, [id, keepMounted, scopedDispatch]);

    const delayVisible = modals[id]?.delayVisible;
    // If modal.show is called
    //  1. If modal was mounted, should make it visible directly
    //  2. If modal has not been mounted, should mount it first, then make it visible
    useEffect(() => {
      if (delayVisible) {
        // delayVisible: false => true, it means the modal.show() is called, should show it.
        modalShow(args);
      }
    }, [delayVisible, args, modalShow]);

    if (!shouldMount) {
      return null;
    }
    return (
      <CommandModalIdContext.Provider value={id}>
        <Comp {...(props as P)} {...args} />
      </CommandModalIdContext.Provider>
    );
  };

  return HocComp;
};

// All registered modals will be rendered in modal placeholder
// biome-ignore lint/suspicious/noExplicitAny: Required for generic component registration - CommandModalArgs<T> extracts actual props
export const register = <T extends CreateModalComponent<any>>(
  id: string,
  comp: T,
  props?: Partial<CommandModalArgs<T>>
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
  delete modalCallbacks[id];
  delete hideModalCallbacks[id];
  delete ALREADY_MOUNTED[id];
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
 * Unregister a modal and clean up all associated resources.
 * This should be called when a modal component is permanently removed.
 * It cleans up:
 * - Modal registry entry
 * - Pending promise callbacks
 * - Modal state from the store
 * - Mounted flag
 * @param id - The id of the modal.
 */
export const unregister = (id: string): void => {
  unregisterWithDispatch(id, null);
};
