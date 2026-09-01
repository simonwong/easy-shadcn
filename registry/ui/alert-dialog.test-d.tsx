import type { AlertDialogProps } from "./alert-dialog";

type AlertDialogConfirmProps = NonNullable<AlertDialogProps["confirmProps"]>;
type AlertDialogCancelProps = NonNullable<AlertDialogProps["cancelProps"]>;

declare const acceptConfirmProps: (props: AlertDialogConfirmProps) => void;
declare const acceptCancelProps: (props: AlertDialogCancelProps) => void;

const safeProps = {
  className: "action-x",
  disabled: false,
  endIcon: <span>End</span>,
  form: "alert-dialog-form",
  loading: false,
  render: <button type="button" />,
  size: "sm" as const,
  startIcon: <span>Start</span>,
  type: "submit" as const,
  variant: "destructive" as const,
};

acceptConfirmProps(safeProps);
acceptCancelProps(safeProps);

// @ts-expect-error AlertDialog owns the confirm label.
acceptConfirmProps({ children: "Replace" });
// @ts-expect-error AlertDialog owns the confirm label and rejects raw HTML.
acceptConfirmProps({ dangerouslySetInnerHTML: { __html: "Replace" } });
// @ts-expect-error AlertDialog owns confirm behavior.
acceptConfirmProps({ onClick: () => undefined });

// @ts-expect-error AlertDialog owns the cancel label.
acceptCancelProps({ children: "Replace" });
// @ts-expect-error AlertDialog owns the cancel label and rejects raw HTML.
acceptCancelProps({ dangerouslySetInnerHTML: { __html: "Replace" } });
// @ts-expect-error AlertDialog owns cancel behavior.
acceptCancelProps({ onClick: () => undefined });
