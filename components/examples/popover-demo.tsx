import { AsyncButton } from "@/registry/ui/async-button";
import { Popover } from "@/registry/ui/popover";

const Demo = () => (
  <div className="flex flex-wrap gap-4">
    <Popover
      content={
        <div className="grid gap-2 text-muted-foreground">
          <div>Width, height and other layout options.</div>
          <div>Set the dimensions for the layer.</div>
        </div>
      }
      description="Set the dimensions for the layer."
      footer={
        <div className="flex justify-end">
          <AsyncButton size="sm">Save</AsyncButton>
        </div>
      }
      title="Dimensions"
    >
      <AsyncButton variant="outline">Open popover</AsyncButton>
    </Popover>

    <Popover
      align="start"
      content="Aligned to the start edge, opening on the right."
      side="right"
    >
      <AsyncButton variant="outline">Positioned (right / start)</AsyncButton>
    </Popover>

    <Popover content="This one starts open via defaultOpen." defaultOpen>
      <AsyncButton variant="outline">Default open</AsyncButton>
    </Popover>
  </div>
);

export default Demo;
