import React, { useContext, useEffect } from 'react';
import type { CreateModalComponent, ModalHelperArgs } from './type';
import {
  ALREADY_MOUNTED,
  getModalId,
  hideModalCallbacks,
  MODAL_REGISTRY,
  modalCallbacks,
} from './constants';
import { ModalHelperContext, ModalHelperIdContext, reducerActions } from './context';
import { useModal } from './useModal';

export function show<T, C, P extends Partial<ModalHelperArgs<React.FC<C>>>>(
  modal: CreateModalComponent<C>,
  args?: P
): Promise<T>;
export function show<T>(modal: string, args?: Record<string, unknown>): Promise<T>;
export function show<T, P>(modal: string, args: P): Promise<T>;

export function show(modal: React.FC | string, args?: ModalHelperArgs<React.FC>) {
  const modalId = getModalId(modal);
  if (typeof modal !== 'string' && !MODAL_REGISTRY[modalId]) {
    register(modalId, modal);
  }
  reducerActions.showModal(modalId, args);

  if (!modalCallbacks[modalId]) {
    // `!` tell ts that theResolve will be written before it is used
    let theResolve!: (args?: unknown) => void;
    // `!` tell ts that theResolve will be written before it is used
    let theReject!: (args?: unknown) => void;
    const promise = new Promise((resolve, reject) => {
      theResolve = resolve;
      theReject = reject;
    });
    modalCallbacks[modalId] = {
      resolve: theResolve,
      reject: theReject,
      promise,
    };
  }
  return modalCallbacks[modalId].promise;
}

export function hide<T>(modal: string | CreateModalComponent): Promise<T>;

export function hide(modal: string | CreateModalComponent) {
  const modalId = getModalId(modal);
  reducerActions.hideModal(modalId);
  // Should also delete the callback for modal.resolve #35
  delete modalCallbacks[modalId];
  if (!hideModalCallbacks[modalId]) {
    // `!` tell ts that theResolve will be written before it is used
    let theResolve!: (args?: unknown) => void;
    // `!` tell ts that theResolve will be written before it is used
    let theReject!: (args?: unknown) => void;
    const promise = new Promise((resolve, reject) => {
      theResolve = resolve;
      theReject = reject;
    });
    hideModalCallbacks[modalId] = {
      resolve: theResolve,
      reject: theReject,
      promise,
    };
  }
  return hideModalCallbacks[modalId].promise;
}

export const remove = (modal: string | CreateModalComponent): void => {
  const modalId = getModalId(modal);
  reducerActions.removeModal(modalId);
  delete modalCallbacks[modalId];
  delete hideModalCallbacks[modalId];
};

export const create = <P extends object>(Comp: React.ComponentType<P>) => {
  const HocComp: CreateModalComponent<P> = ({ defaultVisible, keepMounted, id, ...props }) => {
    const { args, show } = useModal(id);

    // If there's modal state, then should mount it.
    const modals = useContext(ModalHelperContext);
    const shouldMount = !!modals[id];

    useEffect(() => {
      // If defaultVisible, show it after mounted.
      if (defaultVisible) {
        void show();
      }

      ALREADY_MOUNTED[id] = true;

      return () => {
        delete ALREADY_MOUNTED[id];
      };
    }, [id, show, defaultVisible]);

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
        void show(args);
      }
    }, [delayVisible, args, show]);

    if (!shouldMount) return null;
    return (
      <ModalHelperIdContext.Provider value={id}>
        <Comp {...(props as P)} {...args} />
      </ModalHelperIdContext.Provider>
    );
  };

  return HocComp;
};

// All registered modals will be rendered in modal placeholder
export const register = <T extends CreateModalComponent>(
  id: string,
  comp: T,
  props?: Partial<ModalHelperArgs<T>>
): void => {
  if (!MODAL_REGISTRY[id]) {
    MODAL_REGISTRY[id] = { comp, props };
  } else {
    MODAL_REGISTRY[id].props = props;
  }
};

/**
 * Unregister a modal.
 * @param id - The id of the modal.
 */
export const unregister = (id: string): void => {
  delete MODAL_REGISTRY[id];
};
