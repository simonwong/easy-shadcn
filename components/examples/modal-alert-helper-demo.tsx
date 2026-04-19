import { AsyncButton } from "@/registry/ui/async-button";
import { AlertModal } from "@/registry/ui/modal";

const Demo = () => (
  <div className="space-x-2">
    <AsyncButton
      onClick={() => {
        AlertModal.alert({
          title: "Tips",
          description: "Alert Content",
        });
      }}
    >
      Click Alert
    </AsyncButton>
    <AsyncButton
      onClick={() => {
        AlertModal.confirm({
          title: "Tips",
          description:
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
    </AsyncButton>
    <AsyncButton
      onClick={async () => {
        await AlertModal.alert({
          title: "Tips1",
          description: "Alert Content-1",
        });
        await AlertModal.alert({
          title: "Tips2",
          description: "Alert Content-2",
        });
      }}
    >
      Alert Step by Step
    </AsyncButton>
    <AsyncButton
      onClick={async () => {
        await AlertModal.alert({
          title: "Tips1",
          description: (
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
              description: "Alert Content-1-1",
            });
          },
        });
      }}
    >
      Alert Step In Step
    </AsyncButton>
  </div>
);

export default Demo;
