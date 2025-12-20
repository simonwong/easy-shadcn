/**
 * Originally derived from @ebay/nice-modal-react
 * Copyright (c) 2021 eBay Inc.
 * License: MIT
 */
import { create, hide, register, remove, show } from './actions';
import { CommandModalContext, Provider, reducer } from './context';
import { createModalProps, useModal, useModalHolder } from './useModal';

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

// Export types
export type {
  CommandModalHandler,
  CommandModalConfig,
  ModalPropsAdapter,
  ShadCNModalProps,
} from './type';

// Export default shadcn adapter
export { shadcnModalAdapter } from './adapters';

export default CommandModal;
