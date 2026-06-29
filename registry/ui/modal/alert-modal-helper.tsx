"use client";

import CommandModal from "@easy-shadcn/command-modal";
import { AlertModal, type AlertModalProps } from "./alert-modal";

type AlertHelperProps = Omit<AlertModalProps, "open" | "onOpenChange">;

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
        onOpenChangeComplete={(o) => {
          props.onOpenChangeComplete?.(o);
          modalProps.onOpenChangeComplete?.(o);
          // Each call creates a fresh component — drop its registry entry
          // once fully closed, or long-lived apps leak one entry per call.
          if (!o) {
            CommandModal.unregister(id);
          }
        }}
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
        onOpenChangeComplete={(o) => {
          props.onOpenChangeComplete?.(o);
          modalProps.onOpenChangeComplete?.(o);
          if (!o) {
            CommandModal.unregister(id);
          }
        }}
      />
    );
  });

  return CommandModal.show(AlertCommandModal).then((value) => value === true);
};

export default {
  alert,
  confirm,
};
