"use client";

import { Button } from "@/registry/ui/button";
import { AlertModal, Modal } from "@/registry/ui/modal";

export const InfoModal = Modal.create(
  ({ username, remark }: { username: string; remark: string }) => {
    const modal = Modal.useModal();

    return (
      <Modal
        {...modal.modalProps}
        footer={
          <Button
            onClick={() => {
              AlertModal.confirm({
                title: "Are you sure to submit",
                content: "Close the form pop-up after submission",
                onConfirm: async () => {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  modal.hide();
                },
              });
            }}
          >
            Confirm
          </Button>
        }
        title="Modal Open By hooks action"
      >
        <div>username: {username}</div>
        <div>remark: {remark}</div>
      </Modal>
    );
  }
);
