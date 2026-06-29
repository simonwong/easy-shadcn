"use client";

import CommandModal from "@easy-shadcn/command-modal";
import { AlertModal, type AlertModalProps } from "./alert-modal";

type AlertHelperProps = Omit<AlertModalProps, "open" | "onOpenChange">;

type CloseCompleteHook = ((open: boolean) => void) | undefined;

/**
 * Compose the caller's and command-modal's `onOpenChangeComplete` hooks, then
 * unregister the one-shot modal once it has fully closed. Each helper call
 * creates a fresh component — without this, long-lived apps leak one registry
 * entry per call.
 */
const chainCloseAndUnregister =
  (id: string, callerHook: CloseCompleteHook, modalHook: CloseCompleteHook) =>
  (open: boolean) => {
    callerHook?.(open);
    modalHook?.(open);
    if (!open) {
      CommandModal.unregister(id);
    }
  };

/**
 * Promise-style alert: a single OK button.
 * Resolves once the user confirms or dismisses the dialog.
 */
const alert = (
  props: Omit<
    AlertHelperProps,
    // A custom footer would disconnect the promise from the OK button.
    "cancelProps" | "cancelText" | "footer" | "onCancel" | "showCancel"
  >
): Promise<void> => {
  const AlertCommandModal = CommandModal.create(() => {
    const { id, modalProps, resolve } = CommandModal.useModal();
    return (
      <AlertModal
        {...props}
        {...modalProps}
        onConfirm={async () => {
          await props.onConfirm?.();
          resolve(true);
        }}
        onOpenChangeComplete={chainCloseAndUnregister(
          id,
          props.onOpenChangeComplete,
          modalProps.onOpenChangeComplete
        )}
        showCancel={false}
      />
    );
  });

  return CommandModal.show(AlertCommandModal).then(() => {
    // Dismissal and confirmation both settle the alert; there is nothing to
    // distinguish for a single-button dialog.
    return;
  });
};

/**
 * Promise-style confirm. Resolves `true` when confirmed, `false` when
 * cancelled or dismissed (Escape) — it never rejects.
 */
const confirm = (
  props: Omit<AlertHelperProps, "footer">
): Promise<boolean> => {
  const AlertCommandModal = CommandModal.create(() => {
    const { id, modalProps, resolve } = CommandModal.useModal();

    return (
      <AlertModal
        {...props}
        {...modalProps}
        onCancel={async () => {
          await props.onCancel?.();
          resolve(false);
        }}
        onConfirm={async () => {
          await props.onConfirm?.();
          resolve(true);
        }}
        onOpenChangeComplete={chainCloseAndUnregister(
          id,
          props.onOpenChangeComplete,
          modalProps.onOpenChangeComplete
        )}
      />
    );
  });

  return CommandModal.show(AlertCommandModal).then((value) => value === true);
};

export default {
  alert,
  confirm,
};
