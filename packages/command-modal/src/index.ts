/**
 * Originally derived from @ebay/nice-modal-react
 * Copyright (c) 2021 eBay Inc.
 * License: MIT
 */
import { create, hide, register, remove, show } from './actions';
import { CommandModalContext, Provider, reducer } from './context';
import type { CommandModalHandler, ShadCNModalProps } from './type';
import { useModal, useModalHolder } from './useModal';

export const modalProps = (modal: CommandModalHandler): ShadCNModalProps => {
  return {
    open: modal.visible,
    onOpenChange: (open) => {
      if (open) {
        modal.show();
      } else {
        modal.hide();
      }
    },
    afterClose: () => {
      modal.resolveHide();
      if (!modal.keepMounted) {
        modal.remove();
      }
    },
  };
};

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
  modalProps,
};

export type { CommandModalHandler } from './type';
export default CommandModal;
