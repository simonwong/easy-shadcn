import { Button } from "@/registry/ui/button";
import { AlertModal } from "@/registry/ui/modal";

const Demo = () => {
  return (
    <div>
      <AlertModal
        content="Modal Content"
        title="Alert Title"
        trigger={<Button>Alert Modal</Button>}
      />
    </div>
  );
};

export default Demo;
