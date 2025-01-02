import { Button, AlertModal } from '@easy-shadcn/react';

const Demo = () => {
  return (
    <div>
      <AlertModal
        title="Alert Title"
        content={
          <div>
            <div>Modal Content</div>
            <div>Modal Content</div>
            <div>Modal Content</div>
            <div>Modal Content</div>
          </div>
        }
      >
        <Button>Alert Modal</Button>
      </AlertModal>
    </div>
  );
};

export default Demo;
