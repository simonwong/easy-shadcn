"use client";

import * as CommandModal from "@easy-shadcn/command-modal";
import { Button } from "@/registry/ui/button";
import { Modal } from "@/registry/ui/modal";

export const InfoModal = CommandModal.create(
  ({ username, remark }: { username: string; remark: string }) => {
    const modal = CommandModal.useModal();

    console.log("modal.modalProps", modal.modalProps);
    return (
      <Modal
        {...modal.modalProps}
        footer={
          <Button
            onClick={async () => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              modal.hide();
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
