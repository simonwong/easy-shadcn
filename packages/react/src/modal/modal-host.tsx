import { useEffect, useState } from 'react';
import { AlertModal } from './alert-modal';
import { ActionModalProps, ActionModalType } from './types';
import { AlertModalActionState, SubscribeType } from './action-state';
import { Modal } from './modal';

export const ModalHost = () => {
  const [modals, setModals] = useState<ActionModalProps[]>([]);

  const removeModal = (id: number) => {
    setModals((modalList) =>
      modalList.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            props: {
              ...item.props,
              open: false,
            },
          };
        }
        return item;
      })
    );

    setTimeout(() => {
      setModals((modalList) => {
        const newModals = modalList.filter((modal) => modal.id !== id);
        return newModals;
      });
    }, 300);
  };

  const updateModalUtils = (modalList: ActionModalProps[], modal: ActionModalProps) => {
    return modalList.map((item) => {
      if (item.id === modal.id) {
        return {
          ...modal,
          props: {
            ...item.props,
            ...modal.props,
          },
        };
      }
      return item;
    });
  };

  const addModal = (modal: ActionModalProps) => {
    setModals((modalList) => {
      if (modalList.find((item) => modal.id === item.id)) {
        return updateModalUtils(modalList, modal);
      } else {
        return [
          ...modalList,
          {
            ...modal,
            props: {
              ...modal.props,
              open: true,
            },
          },
        ];
      }
    });
  };

  const updateModal = (modal: ActionModalProps) => {
    setModals((modalList) => updateModalUtils(modalList, modal));
  };

  useEffect(() => {
    const unsubscribe = AlertModalActionState.subscribe((modal, type) => {
      switch (type) {
        case SubscribeType.Add:
          addModal(modal);
          break;
        case SubscribeType.Update:
          updateModal(modal);
          break;
        case SubscribeType.Delete:
          removeModal(modal.id);
          break;
        default:
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      {modals.map(({ id, type, props }) => {
        if (type === ActionModalType.AlertModal) {
          return (
            <AlertModal
              key={id}
              onClose={() => {
                props.onClose?.();
                removeModal(id);
              }}
              {...props}
            />
          );
        }
        if (type === ActionModalType.Modal) {
          return (
            <Modal
              key={id}
              onOpenChange={(open) => {
                props.onOpenChange?.(open);
                if (open === false) {
                  removeModal(id);
                }
              }}
              {...props}
            />
          );
        }
      })}
    </>
  );
};

export const modalAction = {
  confirm: AlertModalActionState.confirm,
  alert: AlertModalActionState.alert,
  open: AlertModalActionState.modal,
};
