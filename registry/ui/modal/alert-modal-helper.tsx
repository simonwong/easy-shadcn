import { AlertModal, type AlertModalProps } from './alert-modal';
import ModalHelper from './modal-helper';

// TODO: modalProps will cover props

const alert = (
  props: Omit<
    AlertModalProps,
    'open' | 'onOpenChange' | 'cancelProps' | 'onCancel' | 'cancelText'
  >
) => {
  const AlertModalHelper = ModalHelper.create(() => {
    const { modalProps, resolve } = ModalHelper.useModal();
    return (
      <AlertModal
        {...props}
        {...modalProps}
        cancelProps={{
          className: 'hidden',
        }}
        onConfirm={async () => {
          await props.onConfirm?.();
          resolve();
        }}
      />
    );
  });

  return ModalHelper.show(AlertModalHelper);
};

const confirm = (props: Omit<AlertModalProps, 'open' | 'onOpenChange'>) => {
  const AlertModalHelper = ModalHelper.create(() => {
    const { modalProps, resolve, reject } = ModalHelper.useModal();

    return (
      <AlertModal
        {...props}
        {...modalProps}
        onCancel={async () => {
          await props.onCancel?.();
          reject();
        }}
        onConfirm={async () => {
          await props.onConfirm?.();
          resolve();
        }}
      />
    );
  });

  return ModalHelper.show(AlertModalHelper);
};

export default {
  alert,
  confirm,
};
