import { XCircleIcon } from "lucide-react";
import { Button } from "@/registry/ui/button";

const Demo = () => {
  const handleAsyncAction = async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 1000);
    });
  };
  return (
    <div className="flex gap-2">
      <Button onClick={handleAsyncAction}>Async Event Auto Show Loading</Button>
      <Button onClick={handleAsyncAction} size="icon" variant="destructive">
        <XCircleIcon />
      </Button>
    </div>
  );
};

export default Demo;
