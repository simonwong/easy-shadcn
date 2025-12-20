'use client';

import type React from 'react';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { hide, register, remove, show } from './actions';
import {
  getModalId,
  hideModalCallbacks,
  MODAL_REGISTRY,
  modalCallbacks,
} from './constants';
import { CommandModalContext, CommandModalIdContext } from './context';
import { ModalHolder, type ModalHolderActions } from './holders';
import type {
  CreateModalComponent,
  CommandModalArgs,
  CommandModalHandler,
  ShadCNModalProps,
} from './type';

export function useModal(): CommandModalHandler & {
  modalProps: ShadCNModalProps;
};
export function useModal(
  modal: string,
  args?: Record<string, unknown>
): CommandModalHandler & {
  modalProps: ShadCNModalProps;
};
export function useModal<C, P extends Partial<CommandModalArgs<React.FC<C>>>>(
  modal: React.FC<C>,
  args?: P
): Omit<CommandModalHandler, 'show'> & {
  show: (args?: P) => Promise<unknown>;
} & {
  modalProps: ShadCNModalProps;
};

export function useModal(
  modal?: string | React.FC,
  args?: Record<string, unknown>
) {
  const modals = useContext(CommandModalContext);
  const contextModalId = useContext(CommandModalIdContext);
  let modalId: string | null = null;
  const isUseComponent = modal && typeof modal !== 'string';
  if (modal) {
    modalId = getModalId(modal);
  } else {
    modalId = contextModalId;
  }

  // Only if contextModalId doesn't exist
  if (!modalId) {
    throw new Error('No modal id found in CommandModal.useModal.');
  }

  // If use a component directly, register it.
  useEffect(() => {
    if (isUseComponent && !MODAL_REGISTRY[modalId]) {
      register(modalId, modal, args);
    }
  }, [isUseComponent, modalId, modal, args]);

  const modalInfo = modals[modalId];
  const showCallback = useCallback(
    (modalArgs?: Record<string, unknown>) => show(modalId, modalArgs),
    [modalId]
  );
  const hideCallback = useCallback(() => hide(modalId), [modalId]);
  const removeCallback = useCallback(() => remove(modalId), [modalId]);
  const resolveCallback = useCallback(
    (resolveArgs?: unknown) => {
      modalCallbacks[modalId]?.resolve(resolveArgs);
      delete modalCallbacks[modalId];
    },
    [modalId]
  );
  const rejectCallback = useCallback(
    (rejectArgs?: unknown) => {
      modalCallbacks[modalId]?.reject(rejectArgs);
      delete modalCallbacks[modalId];
    },
    [modalId]
  );
  const resolveHide = useCallback(
    (resolveHideArgs?: unknown) => {
      hideModalCallbacks[modalId]?.resolve(resolveHideArgs);
      delete hideModalCallbacks[modalId];
    },
    [modalId]
  );

  return useMemo(() => {
    const handler: CommandModalHandler = {
      id: modalId,
      args: modalInfo?.args,
      visible: !!modalInfo?.visible,
      keepMounted: !!modalInfo?.keepMounted,
      show: showCallback,
      hide: hideCallback,
      remove: removeCallback,
      resolve: resolveCallback,
      reject: rejectCallback,
      resolveHide,
    };

    // Use the shared createModalProps function to generate modalProps
    return {
      ...handler,
      modalProps: createModalProps(handler),
    };
  }, [
    modalId,
    modalInfo?.args,
    modalInfo?.visible,
    modalInfo?.keepMounted,
    showCallback,
    hideCallback,
    removeCallback,
    resolveCallback,
    rejectCallback,
    resolveHide,
  ]);
}

export function useModalHolder<T>(modal: string | CreateModalComponent<T>) {
  const handler = useMemo(() => ({}) as ModalHolderActions, []);

  const ModalHolderCallback: React.FC<T> = useCallback(
    (props) => <ModalHolder modal={modal} {...props} handler={handler} />,
    [modal, handler]
  );

  return [handler, ModalHolderCallback] as const;
}

/**
 * Helper function to create modal props for shadcn modal components.
 * This generates the standard props (open, onOpenChange, afterClose) from a modal handler.
 * @param modal - The modal handler from useModal
 * @returns Props object compatible with shadcn modal components
 */
export const createModalProps = (
  modal: CommandModalHandler
): ShadCNModalProps => {
  return {
    open: modal.visible,
    onOpenChange: (open) => {
      if (open) {
        modal.show();
      } else {
        modal.hide();
      }
    },
    afterClose: () => {
      modal.resolveHide();
      if (!modal.keepMounted) {
        modal.remove();
      }
    },
  };
};
