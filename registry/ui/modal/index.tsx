"use client";

export type { CommandModalHandler } from "@easy-shadcn/command-modal";
export type { AlertModalProps } from "./alert-modal";
export type { ModalProps } from "./modal";

import CommandModal from "@easy-shadcn/command-modal";
import { AlertModal as OriginalAlertModal } from "./alert-modal";
import AlertCommandModal from "./alert-modal-helper";
import { Modal as OriginalModal } from "./modal";

// Only the public command-modal surface rides on the Modal namespace —
// internals like the reducer and contexts stay in the package.
const commandModalApi = {
  create: CommandModal.create,
  hide: CommandModal.hide,
  Provider: CommandModal.Provider,
  register: CommandModal.register,
  remove: CommandModal.remove,
  show: CommandModal.show,
  unregister: CommandModal.unregister,
  useModal: CommandModal.useModal,
  useModalHolder: CommandModal.useModalHolder,
};

export const AlertModal: typeof OriginalAlertModal & typeof AlertCommandModal =
  Object.assign(OriginalAlertModal, AlertCommandModal);

export const Modal: typeof OriginalModal & typeof commandModalApi =
  Object.assign(OriginalModal, commandModalApi);
