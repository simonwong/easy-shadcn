import { useRef, useState } from 'react';
import { Button } from '@/registry/ui/button';
import { Modal } from '@/registry/ui/modal';

const ModalHelperModal = Modal.create(({ count }: { count: number }) => {
  const modal = Modal.useModal();

  return (
    <Modal
      {...modal.modalProps}
      footer={
        <div className="space-x-2">
          <Button
            onClick={() => {
              modal.hide();
            }}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button>Save</Button>
        </div>
      }
      title="Modal Will Update by props"
    >
      <p>AnyModalContent: {count}</p>
      <p>Count will be updated in 1 second</p>
    </Modal>
  );
});

const Demo = () => {
  const [action, ModalHolder] = Modal.useModalHolder(ModalHelperModal);

  const [count, setCount] = useState(0);
  const countRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    countRef.current && clearInterval(countRef.current);
    action.show();

    countRef.current = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
  };

  return (
    <Modal.Provider>
      <Button onClick={handleClick}>Click Show Modal</Button>
      <p>Current Count: {count}</p>
      <ModalHolder count={count} />
    </Modal.Provider>
  );
};

export default Demo;
