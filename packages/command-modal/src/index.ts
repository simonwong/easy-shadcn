/**
 * Originally derived from @ebay/nice-modal-react
 * Copyright (c) 2021 eBay Inc.
 * License: MIT
 */
// Core API
export { create, hide, register, remove, show, unregister } from "./actions";
// Context
export {
  CommandModalContext,
  CommandModalDispatchContext,
  Provider,
  reducer,
  useCommandModalDispatch,
} from "./context";

// Types
export type {
  CommandModalConfig,
  CommandModalHandler,
  ModalPropsAdapter,
  ShadCNModalProps,
} from "./type";

// Hooks
export { createModalProps, useModal, useModalHolder } from "./useModal";

// Default export
import { create, hide, register, remove, show, unregister } from "./actions";
import { CommandModalContext, Provider, reducer } from "./context";
import { createModalProps, useModal, useModalHolder } from "./useModal";

const CommandModal = {
  create,
  hide,
  register,
  remove,
  show,
  unregister,
  CommandModalContext,
  Provider,
  reducer,
  createModalProps,
  useModal,
  useModalHolder,
};

export default CommandModal;
