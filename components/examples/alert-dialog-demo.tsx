import { AlertDialog } from "@/registry/ui/alert-dialog";
import { AsyncButton } from "@/registry/ui/async-button";

const Demo = () => (
  <div className="flex flex-wrap gap-3">
    <AlertDialog
      description="This action cannot be undone."
      onConfirm={async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }}
      title="Are you sure?"
      trigger={<AsyncButton variant="outline">Async confirm</AsyncButton>}
    />

    <AlertDialog
      confirmText="Delete"
      description="The project and all its data will be permanently removed."
      title="Delete project?"
      trigger={<AsyncButton variant="destructive">Delete</AsyncButton>}
      variant="destructive"
    />

    <AlertDialog
      confirmText="Got it"
      description="Your changes have been saved successfully."
      showCancel={false}
      title="All done"
      trigger={<AsyncButton variant="outline">Single action</AsyncButton>}
    />

    <AlertDialog
      description="This footer replaces the entire button row."
      footer={<AsyncButton className="w-full">Custom footer</AsyncButton>}
      title="Footer override"
      trigger={<AsyncButton variant="outline">Custom footer</AsyncButton>}
    />
  </div>
);

export default Demo;
