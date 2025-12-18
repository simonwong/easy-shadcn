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
import { ModalHelperContext, ModalHelperIdContext } from './context';
import { ModalHolder, type ModalHolderActions } from './holders';
import type {
  CreateModalComponent,
  ModalHelperArgs,
  ModalHelperHandler,
  ShadCNModalProps,
} from './type';

export function useModal(): ModalHelperHandler & {
  modalProps: ShadCNModalProps;
};
export function useModal(
  modal: string,
  args?: Record<string, unknown>
): ModalHelperHandler & {
  modalProps: ShadCNModalProps;
};
export function useModal<C, P extends Partial<ModalHelperArgs<React.FC<C>>>>(
  modal: React.FC<C>,
  args?: P
): Omit<ModalHelperHandler, 'show'> & {
  show: (args?: P) => Promise<unknown>;
} & {
  modalProps: ShadCNModalProps;
};

export function useModal(
  modal?: string | React.FC,
  args?: Record<string, unknown>
) {
  const modals = useContext(ModalHelperContext);
  const contextModalId = useContext(ModalHelperIdContext);
  let modalId: string | null = null;
  const isUseComponent = modal && typeof modal !== 'string';
  if (modal) {
    modalId = getModalId(modal);
  } else {
    modalId = contextModalId;
  }

  // Only if contextModalId doesn't exist
  if (!modalId) {
    throw new Error('No modal id found in ModalHelper.useModal.');
  }

  const mid = modalId;
  // If use a component directly, register it.
  useEffect(() => {
    if (isUseComponent && !MODAL_REGISTRY[mid]) {
      register(mid, modal, args);
    }
  }, [isUseComponent, mid, modal, args]);

  const modalInfo = modals[mid];
  const showCallback = useCallback(
    (modalArgs?: Record<string, unknown>) => show(mid, modalArgs),
    [mid]
  );
  const hideCallback = useCallback(() => hide(mid), [mid]);
  const removeCallback = useCallback(() => remove(mid), [mid]);
  const resolveCallback = useCallback(
    (resolveArgs?: unknown) => {
      modalCallbacks[mid]?.resolve(resolveArgs);
      delete modalCallbacks[mid];
    },
    [mid]
  );
  const rejectCallback = useCallback(
    (rejectArgs?: unknown) => {
      modalCallbacks[mid]?.reject(rejectArgs);
      delete modalCallbacks[mid];
    },
    [mid]
  );
  const resolveHide = useCallback(
    (resolveHideArgs?: unknown) => {
      hideModalCallbacks[mid]?.resolve(resolveHideArgs);
      delete hideModalCallbacks[mid];
    },
    [mid]
  );

  return useMemo(
    () => ({
      id: mid,
      args: modalInfo?.args,
      visible: !!modalInfo?.visible,
      keepMounted: !!modalInfo?.keepMounted,
      show: showCallback,
      hide: hideCallback,
      remove: removeCallback,
      resolve: resolveCallback,
      reject: rejectCallback,
      resolveHide,
      modalProps: {
        open: modalInfo?.visible,
        onOpenChange: (open?: boolean) => {
          if (open) {
            showCallback();
          } else {
            hideCallback();
          }
        },
        afterClose: () => {
          resolveHide();
          if (!modalInfo?.keepMounted) {
            removeCallback();
          }
        },
      },
    }),
    [
      mid,
      modalInfo?.args,
      modalInfo?.visible,
      modalInfo?.keepMounted,
      showCallback,
      hideCallback,
      removeCallback,
      resolveCallback,
      rejectCallback,
      resolveHide,
    ]
  );
}

export function useModalHolder<T>(modal: string | CreateModalComponent<T>) {
  const handler = useMemo(() => ({}) as ModalHolderActions, []);

  const ModalHolderCallback: React.FC<T> = useCallback(
    (props) => <ModalHolder modal={modal} {...props} handler={handler} />,
    [modal, handler]
  );

  return [handler, ModalHolderCallback] as const;
}
