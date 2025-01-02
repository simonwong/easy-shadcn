import { Button, Modal } from '@easy-shadcn/react';
import { useState } from 'react';

const Demo = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <Modal
        open={showModal}
        onOpenChange={setShowModal}
        title="Modal Title"
        content={
          <div>
            <div>Modal Content</div>
            <div>Modal Content</div>
            <div>Modal Content</div>
            <div>Modal Content</div>
          </div>
        }
        footer={
          <div className="space-x-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowModal(false);
              }}
            >
              Cancel
            </Button>
            <Button>Save</Button>
          </div>
        }
      >
        <Button>Click Show Modal</Button>
      </Modal>
    </div>
  );
};

export default Demo;
