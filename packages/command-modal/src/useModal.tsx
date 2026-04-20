"use client";

import type React from "react";
import { useCallback, useContext, useEffect, useMemo } from "react";
import {
  hideWithDispatch,
  register,
  removeWithDispatch,
  showWithDispatch,
} from "./actions";
import {
  getModalId,
  hideModalCallbacks,
  MODAL_REGISTRY,
  modalCallbacks,
} from "./constants";
import {
  CommandModalConfigContext,
  CommandModalContext,
  CommandModalDispatchContext,
  CommandModalIdContext,
} from "./context";
import { ModalHolder, type ModalHolderActions } from "./holders";
import type {
  CommandModalArgs,
  CommandModalHandler,
  CreateModalComponent,
  ShadCNModalProps,
} from "./type";

export function useModal(
  modal?: string,
  args?: Record<string, unknown>
): CommandModalHandler & {
  modalProps: ShadCNModalProps;
};
export function useModal<C, P extends Partial<CommandModalArgs<React.FC<C>>>>(
  modal: React.FC<C>,
  args?: P
): Omit<CommandModalHandler, "show"> & {
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
  const config = useContext(CommandModalConfigContext);
  let modalId: string | null = null;
  const isUseComponent = modal && typeof modal !== "string";
  if (modal) {
    modalId = getModalId(modal);
  } else {
    modalId = contextModalId;
  }

  // Only if contextModalId doesn't exist
  if (!modalId) {
    throw new Error("No modal id found in CommandModal.useModal.");
  }

  // If use a component directly, register it.
  useEffect(() => {
    if (isUseComponent && !MODAL_REGISTRY[modalId]) {
      register(modalId, modal, args);
    }
  }, [isUseComponent, modalId, modal, args]);

  const modalInfo = modals[modalId];
  // Dispatch scoped to the closest enclosing Provider (null outside any Provider,
  // in which case the helpers fall back to the module-level stack).
  const scopedDispatch = useContext(CommandModalDispatchContext);
  const showCallback = useCallback(
    (modalArgs?: Record<string, unknown>) =>
      showWithDispatch(modalId, modalArgs, scopedDispatch),
    [modalId, scopedDispatch]
  );
  const hideCallback = useCallback(
    () => hideWithDispatch(modalId, scopedDispatch),
    [modalId, scopedDispatch]
  );
  const removeCallback = useCallback(
    () => removeWithDispatch(modalId, scopedDispatch),
    [modalId, scopedDispatch]
  );
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

    // Use the configured adapter or fallback to the default shadcn adapter
    const adapter = config?.modalPropsAdapter || createModalProps;

    return {
      ...handler,
      modalProps: adapter(handler),
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
    // Depend on the adapter identity rather than the whole config object so
    // that an inline `config={{...}}` passed from a re-rendering parent does
    // not invalidate this memo as long as the adapter itself is stable.
    config?.modalPropsAdapter,
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
): ShadCNModalProps => ({
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
});
