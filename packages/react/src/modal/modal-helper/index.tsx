/* *********************************************************
 * Copyright 2021 eBay Inc.

 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
*********************************************************** */

/**
 * Modification based on [@ebay/nice-modal-react](https://github.com/eBay/nice-modal-react)
 */

import type { ModalHelperHandler, ShadCNModalProps } from './type';
import { Provider, reducer, ModalHelperContext } from './context';
import { create, hide, register, remove, show } from './actions';
import { useModal, useModalHolder } from './useModal';

export const modalProps = (modal: ModalHelperHandler): ShadCNModalProps => {
  return {
    open: modal.visible,
    onOpenChange: (open) => {
      if (open) {
        void modal.show();
      } else {
        void modal.hide();
      }
    },
    afterClose: () => {
      modal.resolveHide();
      if (!modal.keepMounted) modal.remove();
    },
  };
};

const ModalHelper = {
  Provider,
  ModalHelperContext,
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

export type { ModalHelperHandler };

export default ModalHelper;
