export type { AlertModalProps } from './alert-modal';
export type { ModalProps } from './modal';
export type { ModalHelperHandler } from '../../../packages/modal-helper';

import { AlertModal as OriginalAlertModal } from './alert-modal';
import AlertModalHelper from './alert-modal-helper';
import { Modal as OriginalModal } from './modal';
import ModalHelper from '../../../packages/modal-helper';

export const AlertModal: typeof OriginalAlertModal & typeof AlertModalHelper =
  Object.assign(OriginalAlertModal, AlertModalHelper);

export const Modal: typeof OriginalModal & typeof ModalHelper = Object.assign(
  OriginalModal,
  ModalHelper
);
