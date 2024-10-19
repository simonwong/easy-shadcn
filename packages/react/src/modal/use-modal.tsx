import { useState } from 'react';
import { Modal, type ModalProps } from './modal';

export const useModal = () => {
  const [open, setOpen] = useState(false);
  const [modalProps, setModalProp] = useState<ModalProps>({});
  const handleClose = () => {
    setOpen(false);

    // 防止关闭抖动
    setTimeout(() => {
      setModalProp({});
    }, 200);
  };
  const handleOpen = (props: ModalProps) => {
    setOpen(true);
    setModalProp(props);
  };

  const modalHost = (
    <Modal
      open={open}
      onOpenChange={(isOp) => {
        setOpen(isOp);
        if (!isOp) {
          handleClose();
        }
      }}
      {...modalProps}
    />
  );

  return [
    modalHost,
    {
      open: handleOpen,
      close: handleClose,
    },
  ] as const;
};
