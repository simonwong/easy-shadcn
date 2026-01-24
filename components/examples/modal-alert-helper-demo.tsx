import { Button } from "@/registry/ui/button";
import { AlertModal } from "@/registry/ui/modal";

const Demo = () => {
  return (
    <div className="space-x-2">
      <Button
        onClick={() => {
          AlertModal.alert({
            title: "Tips",
            content: "Alert Content",
          });
        }}
      >
        Click Alert
      </Button>
      <Button
        onClick={() => {
          AlertModal.confirm({
            title: "Tips",
            content:
              "If onConfirm or onCancel is asynchronous events, the button will automatically display loading",
            onCancel: () => {
              console.log("cancel");
            },
            onConfirm: () =>
              new Promise((resolve) => {
                setTimeout(() => {
                  console.log("confirm");
                  resolve();
                }, 1000);
              }),
          });
        }}
      >
        Click Confirm
      </Button>
      <Button
        onClick={async () => {
          await AlertModal.alert({
            title: "Tips1",
            content: "Alert Content-1",
          });
          await AlertModal.alert({
            title: "Tips2",
            content: "Alert Content-2",
          });
        }}
      >
        Alert Step by Step
      </Button>
      <Button
        onClick={async () => {
          await AlertModal.alert({
            title: "Tips1",
            content: (
              <div>
                <div>Alert Content-1</div>
                <div>Alert Content-1</div>
                <div>Alert Content-1</div>
                <div>Alert Content-1</div>
                <div>Alert Content-1</div>
              </div>
            ),
            onConfirm: async () => {
              await AlertModal.alert({
                title: "Tips1-1",
                content: "Alert Content-1-1",
              });
            },
          });
        }}
      >
        Alert Step In Step
      </Button>
    </div>
  );
};

export default Demo;
