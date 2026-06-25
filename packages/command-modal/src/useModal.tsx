// biome-ignore-all lint/style/useFilenamingConvention: Keep the existing filename to preserve generated deep import paths.

"use client";

import type React from "react";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
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
  CommandModalHandler,
  CreateModalComponent,
  ModalInnerProps,
  ShadCNModalProps,
} from "./type";

export function useModal(
  modal?: string,
  args?: Record<string, unknown>
): CommandModalHandler & {
  modalProps: ShadCNModalProps;
};
// biome-ignore lint/suspicious/noExplicitAny: C is any modal component; its concrete props are recovered via ModalInnerProps<C>.
export function useModal<C extends React.FC<any>>(
  modal: C,
  args?: Partial<ModalInnerProps<C>>
): Omit<CommandModalHandler, "show"> & {
  show: (args?: Partial<ModalInnerProps<C>>) => Promise<unknown>;
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
  if (modal) {
    modalId = getModalId(modal);
  } else {
    modalId = contextModalId;
  }

  // Only if contextModalId doesn't exist
  if (!modalId) {
    throw new Error("No modal id found in CommandModal.useModal.");
  }

  // Route the component reference and args through refs so the register
  // effect can depend on [modalId] alone. Inline `args` objects produce a
  // fresh identity every render; including them in deps previously caused
  // the effect to teardown+setup each render (masked by the
  // !MODAL_REGISTRY[id] guard, but still wasted React scheduler work and
  // fragile if the guard ever went away).
  const modalRef = useRef(modal);
  modalRef.current = modal;
  const argsRef = useRef(args);
  argsRef.current = args;

  // If use a component directly, register it once per [modalId] lifecycle,
  // reading the freshest component and args from refs at register time.
  useEffect(() => {
    const currentModal = modalRef.current;
    if (
      modalId &&
      currentModal &&
      typeof currentModal !== "string" &&
      !MODAL_REGISTRY[modalId]
    ) {
      register(modalId, currentModal, argsRef.current);
    }
  }, [modalId]);

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
