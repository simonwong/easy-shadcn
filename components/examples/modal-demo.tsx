import { useState } from "react";
import { AsyncButton } from "@/registry/ui/async-button";
import { Modal } from "@/registry/ui/modal";

const Demo = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <Modal
        footer={
          <div className="space-x-2">
            <AsyncButton
              onClick={() => {
                setShowModal(false);
              }}
              variant="ghost"
            >
              Cancel
            </AsyncButton>
            <AsyncButton>Save</AsyncButton>
          </div>
        }
        onOpenChange={setShowModal}
        open={showModal}
        title="Modal Title"
        trigger={<AsyncButton>Click Show Modal</AsyncButton>}
      >
        <div>Modal Content</div>
        <div>Modal Content</div>
        <div>Modal Content</div>
        <div>Modal Content</div>
      </Modal>
    </div>
  );
};

export default Demo;
