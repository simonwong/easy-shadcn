import { AlertModalProps } from './alert-modal';
import { ModalProps } from './modal';

export enum ActionModalType {
  Modal,
  AlertModal,
}

export type ActionModalProps =
  | {
      id: number;
      type: ActionModalType.Modal;
      props: ModalProps;
    }
  | {
      id: number;
      type: ActionModalType.AlertModal;
      props: AlertModalProps;
    };
