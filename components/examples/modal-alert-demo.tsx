import { AsyncButton } from "@/registry/ui/async-button";
import { AlertModal } from "@/registry/ui/modal";

const Demo = () => (
  <div>
    <AlertModal
      description="Modal Content"
      title="Alert Title"
      trigger={<AsyncButton>Alert Modal</AsyncButton>}
    />
  </div>
);

export default Demo;
