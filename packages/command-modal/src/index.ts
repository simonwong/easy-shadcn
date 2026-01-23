/**
 * Originally derived from @ebay/nice-modal-react
 * Copyright (c) 2021 eBay Inc.
 * License: MIT
 */
import { create, hide, register, remove, show } from "./actions";
import { CommandModalContext, Provider, reducer } from "./context";
import { createModalProps, useModal, useModalHolder } from "./useModal";

const CommandModal = {
  Provider,
  CommandModalContext,
  create,
  register,
  show,
  hide,
  remove,
  useModal,
  useModalHolder,
  reducer,
  modalProps: createModalProps,
};

// Export default shadcn adapter
export { shadcnModalAdapter } from "./adapters";
// Export types
export type {
  CommandModalConfig,
  CommandModalHandler,
  ModalPropsAdapter,
  ShadCNModalProps,
} from "./type";

export default CommandModal;
