import { useRef, useState } from "react";
import { AsyncButton } from "@/registry/ui/async-button";
import { Modal } from "@/registry/ui/modal";

const CommandModalModal = Modal.create(({ count }: { count: number }) => {
  const modal = Modal.useModal();

  return (
    <Modal
      {...modal.modalProps}
      footer={
        <div className="space-x-2">
          <AsyncButton
            onClick={() => {
              modal.hide();
            }}
            variant="ghost"
          >
            Cancel
          </AsyncButton>
          <AsyncButton>Save</AsyncButton>
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
  const [action, ModalHolder] = Modal.useModalHolder(CommandModalModal);

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
      <AsyncButton onClick={handleClick}>Click Show Modal</AsyncButton>
      <p>Current Count: {count}</p>
      <ModalHolder count={count} />
    </Modal.Provider>
  );
};

export default Demo;
