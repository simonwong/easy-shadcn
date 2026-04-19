"use client";

import * as CommandModal from "@easy-shadcn/command-modal";
import { AsyncButton } from "@/registry/ui/async-button";
import { Modal } from "@/registry/ui/modal";

export const InfoModal = CommandModal.create(
  ({ username, remark }: { username: string; remark: string }) => {
    const modal = CommandModal.useModal();

    console.log("modal.modalProps", modal.modalProps);
    return (
      <Modal
        {...modal.modalProps}
        footer={
          <AsyncButton
            onClick={async () => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              modal.hide();
            }}
          >
            Confirm
          </AsyncButton>
        }
        title="Modal Open By hooks action"
      >
        <div>username: {username}</div>
        <div>remark: {remark}</div>
      </Modal>
    );
  }
);
