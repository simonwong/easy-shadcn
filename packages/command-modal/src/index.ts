/**
 * Originally derived from @ebay/nice-modal-react
 * Copyright (c) 2021 eBay Inc.
 * License: MIT
 */
// Core API
export { create, hide, register, remove, show } from "./actions";
// Context
export { CommandModalContext, Provider, reducer } from "./context";

// Types
export type {
  CommandModalConfig,
  CommandModalHandler,
  ModalPropsAdapter,
  ShadCNModalProps,
} from "./type";

// Hooks
export { createModalProps, useModal, useModalHolder } from "./useModal";
