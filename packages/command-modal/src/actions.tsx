'use client';

import type React from 'react';
import { useContext, useEffect } from 'react';
import {
  ALREADY_MOUNTED,
  getModalId,
  hideModalCallbacks,
  MODAL_REGISTRY,
  modalCallbacks,
} from './constants';
import {
  CommandModalContext,
  CommandModalIdContext,
  reducerActions,
} from './context';
import type {
  CommandModalCallbacks,
  CreateModalComponent,
  CommandModalArgs,
} from './type';
import { useModal } from './useModal';

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
 * @param modal - The modal id or component to show
 * @param args - Arguments to pass to the modal component
 * @returns A promise that resolves with the value passed to modal.resolve()
 */
export function show(
  modal: React.FC | string,
  args?: CommandModalArgs<React.FC>
) {
  const modalId = getModalId(modal);
  if (typeof modal !== 'string' && !MODAL_REGISTRY[modalId]) {
    register(modalId, modal);
  }
  reducerActions.showModal(modalId, args);

  return createModalPromise(modalCallbacks, modalId);
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
  const modalId = getModalId(modal);
  reducerActions.hideModal(modalId);
  // Clean up show promise callback to prevent memory leaks
  delete modalCallbacks[modalId];

  return createModalPromise(hideModalCallbacks, modalId);
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
  const modalId = getModalId(modal);
  reducerActions.removeModal(modalId);
  // Clean up all callbacks to prevent memory leaks
  delete modalCallbacks[modalId];
  delete hideModalCallbacks[modalId];
  delete ALREADY_MOUNTED[modalId];
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

    useEffect(() => {
      if (keepMounted) {
        reducerActions.setModalFlags(id, { keepMounted: true });
      }
    }, [id, keepMounted]);

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  delete MODAL_REGISTRY[id];
  // Clean up all associated resources to prevent memory leaks
  delete modalCallbacks[id];
  delete hideModalCallbacks[id];
  delete ALREADY_MOUNTED[id];
  reducerActions.removeModal(id);
};
