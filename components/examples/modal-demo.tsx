import { useState } from "react";
import { Button } from "@/registry/ui/button";
import { Modal } from "@/registry/ui/modal";

const Demo = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <Modal
        footer={
          <div className="space-x-2">
            <Button
              onClick={() => {
                setShowModal(false);
              }}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button>Save</Button>
          </div>
        }
        onOpenChange={setShowModal}
        open={showModal}
        title="Modal Title"
        trigger={<Button>Click Show Modal</Button>}
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
