import { useState } from "react";
import { AsyncButton } from "@/registry/ui/async-button";
import { Modal } from "@/registry/ui/modal";

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const Demo = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-x-2">
      <Modal
        description="The flat footer needs no controlled state — OK closes after the async handler resolves."
        onConfirm={() => wait(1000)}
        title="Flat footer"
        trigger={<AsyncButton>Flat Confirm Footer</AsyncButton>}
      >
        <div>Modal Content</div>
      </Modal>

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
        title="Custom footer"
        trigger={<AsyncButton variant="outline">Custom Footer</AsyncButton>}
      >
        <div>Modal Content</div>
        <div>Modal Content</div>
        <div>Modal Content</div>
      </Modal>
    </div>
  );
};

export default Demo;
