import CommandModal from "@easy-shadcn/command-modal";
import { AlertModal, type AlertModalProps } from "./alert-modal";

// TODO: modalProps will cover props

const alert = (
  props: Omit<
    AlertModalProps,
    "open" | "onOpenChange" | "cancelProps" | "onCancel" | "cancelText"
  >
) => {
  const AlertCommandModal = CommandModal.create(() => {
    const { modalProps, resolve } = CommandModal.useModal();
    return (
      <AlertModal
        {...props}
        {...modalProps}
        cancelProps={{
          className: "hidden",
        }}
        onConfirm={async () => {
          await props.onConfirm?.();
          resolve();
        }}
      />
    );
  });

  return CommandModal.show(AlertCommandModal);
};

const confirm = (props: Omit<AlertModalProps, "open" | "onOpenChange">) => {
  const AlertCommandModal = CommandModal.create(() => {
    const { modalProps, resolve, reject } = CommandModal.useModal();

    return (
      <AlertModal
        {...props}
        {...modalProps}
        onCancel={async () => {
          await props.onCancel?.();
          reject();
        }}
        onConfirm={async () => {
          await props.onConfirm?.();
          resolve();
        }}
      />
    );
  });

  return CommandModal.show(AlertCommandModal);
};

export default {
  alert,
  confirm,
};
