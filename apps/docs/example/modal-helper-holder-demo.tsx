import { useState } from 'react';
import { Button, Modal } from '@easy-shadcn/react';

const ModalHelperModal = Modal.create(({ count }: { count: number }) => {
  const modal = Modal.useModal();

  return (
    <Modal
      {...modal.modalProps}
      title="Modal Will Update by props"
      content={
        <>
          <p>AnyModalContent: {count}</p>
          <p>Count will be updated in 1 second</p>
        </>
      }
      footer={
        <div className="space-x-2">
          <Button
            variant="ghost"
            onClick={() => {
              modal.hide();
            }}
          >
            Cancel
          </Button>
          <Button>Save</Button>
        </div>
      }
    />
  );
});

const Demo = () => {
  const [action, ModalHolder] = Modal.useModalHolder(ModalHelperModal);

  const [count, setCount] = useState(0);

  const handleClick = () => {
    void action.show();

    setTimeout(() => {
      setCount(count + 1);
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
