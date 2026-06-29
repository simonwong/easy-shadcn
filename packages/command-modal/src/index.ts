/**
 * Originally derived from @ebay/nice-modal-react
 * Copyright (c) 2021 eBay Inc.
 * License: MIT
 */
// Public surface: runtime API + types, grouped by source module and sorted to
// satisfy organizeImports. Runtime: create/hide/register/remove/show/unregister
// (actions), Provider + contexts (context), ModalDef (holders), the hooks
// (useModal). Types follow each module.
export { create, hide, register, remove, show, unregister } from "./actions";
export type { CommandModalProviderProps } from "./context";
export {
  CommandModalContext,
  CommandModalDispatchContext,
  Provider,
  reducer,
  useCommandModalDispatch,
} from "./context";
export { createCommandModal } from "./create-command-modal";
export type { ModalHolderActions } from "./holders";
export { ModalDef } from "./holders";
export type {
  CommandModalConfig,
  CommandModalHandler,
  CommandModalHocProps,
  CreateModalComponent,
  ModalInnerProps,
  ModalPropsAdapter,
  ShadCNModalProps,
} from "./type";
export { createModalProps, useModal, useModalHolder } from "./useModal";

// Default export
import { create, hide, register, remove, show, unregister } from "./actions";
import { CommandModalContext, Provider, reducer } from "./context";
import { createCommandModal } from "./create-command-modal";
import { ModalDef } from "./holders";
import { createModalProps, useModal, useModalHolder } from "./useModal";

const CommandModal = {
  create,
  createCommandModal,
  hide,
  register,
  remove,
  show,
  unregister,
  CommandModalContext,
  ModalDef,
  Provider,
  reducer,
  createModalProps,
  useModal,
  useModalHolder,
};

export default CommandModal;
