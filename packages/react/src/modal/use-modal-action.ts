import { useEffect, useRef } from 'react';
import { modalAction } from './modal-host';
import { ModalProps } from './modal';
import { AlertModalProps } from './alert-modal';

export const useModalAction = (props: ModalProps | AlertModalProps, dependencies: any[] = []) => {
  const modalInstanceRef = useRef<
    ReturnType<typeof modalAction.open> | ReturnType<typeof modalAction.alert> | null
  >(null);
  const modalPropsRef = useRef<ModalProps | AlertModalProps | null | undefined>(null);

  useEffect(() => {
    if (modalInstanceRef.current) {
      // props priority
      modalInstanceRef.current.update({
        ...modalPropsRef.current,
        ...props,
      });
    }
  }, dependencies);

  // modalProps priority
  const hookModalAction = {
    open: (modalProps?: ModalProps) => {
      const modalIns = modalAction.open({
        ...props,
        ...modalProps,
      });
      modalInstanceRef.current = modalIns;
      modalPropsRef.current = modalProps;
      return modalIns;
    },
    alert: (modalProps?: AlertModalProps) => {
      const modalIns = modalAction.alert({
        ...props,
        ...modalProps,
      });
      modalInstanceRef.current = modalIns;
      modalPropsRef.current = modalProps;
      return modalIns;
    },
    confirm: (modalProps?: AlertModalProps) => {
      const modalIns = modalAction.confirm({
        ...props,
        ...modalProps,
      });
      modalInstanceRef.current = modalIns;
      modalPropsRef.current = modalProps;
      return modalIns;
    },
  };

  return [hookModalAction, modalInstanceRef] as const;
};
