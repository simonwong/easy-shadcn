import type { ComponentProps } from "react";
import { type Toast, toast } from "./toast";

declare const acceptToastProps: (props: ComponentProps<typeof Toast>) => void;

acceptToastProps({ limit: 5, timeout: 8000 });

toast("Saved");
toast.success("Saved", { description: "All changes stored", priority: "high" });
toast.loading("Uploading", { id: "upload", timeout: 0 });
toast.update("upload", "Uploaded", { type: "success" });
toast.close("upload");
toast.close();

toast("Undoable", {
  action: {
    label: "Undo",
    onClick: (event) => event.preventDefault(),
  },
  actionButtonProps: {
    className: "undo",
    disabled: false,
    size: "sm",
    variant: "outline",
  },
});

const promised = toast.promise(Promise.resolve({ id: 1 }), {
  error: (error) => (error instanceof Error ? error.message : "Failed"),
  loading: "Saving",
  success: (value) => ({ title: `Saved ${value.id}` }),
});

const acceptsPromise = (_value: Promise<{ id: number }>) => undefined;
acceptsPromise(promised);

// @ts-expect-error Toast owns the provider's global manager.
acceptToastProps({ toastManager: {} });

// @ts-expect-error Status types are a closed Compose vocabulary.
toast("Saved", { type: "positive" });

toast("Saved", {
  action: { label: "Undo" },
  actionButtonProps: {
    // @ts-expect-error Action label is owned by action.label.
    children: "Replace",
  },
});

toast("Saved", {
  action: { label: "Undo" },
  actionButtonProps: {
    // @ts-expect-error Raw HTML conflicts with the Compose-owned label.
    dangerouslySetInnerHTML: { __html: "Replace" },
  },
});

toast("Saved", {
  action: { label: "Undo" },
  actionButtonProps: {
    // @ts-expect-error Action click behavior is owned by action.onClick.
    onClick: () => undefined,
  },
});
