export type { CommandModalHandler } from "@easy-shadcn/command-modal";
export type { AlertModalProps } from "./alert-modal";
export type { ModalProps } from "./modal";

import CommandModal from "@easy-shadcn/command-modal";
import { AlertModal as OriginalAlertModal } from "./alert-modal";
import AlertCommandModal from "./alert-modal-helper";
import { Modal as OriginalModal } from "./modal";

export const AlertModal: typeof OriginalAlertModal & typeof AlertCommandModal =
  Object.assign(OriginalAlertModal, AlertCommandModal);

export const Modal: typeof OriginalModal & typeof CommandModal = Object.assign(
  OriginalModal,
  CommandModal
);
