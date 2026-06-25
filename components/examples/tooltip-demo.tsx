import { Button } from "@/components/ui/button";
import { Tooltip } from "@/registry/ui/tooltip";

const Demo = () => (
  <div className="flex flex-wrap items-center gap-4">
    <Tooltip content="Add to your library">
      <Button variant="outline">Hover me</Button>
    </Tooltip>

    <Tooltip content="Shown below the trigger" side="bottom">
      <Button variant="outline">Bottom</Button>
    </Tooltip>

    <Tooltip content="Opens after 500ms" delay={500}>
      <Button variant="outline">Delayed</Button>
    </Tooltip>
  </div>
);

export default Demo;
