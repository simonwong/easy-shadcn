import type { AlertModalProps, ModalProps } from "./index";

type ModalConfirmProps = NonNullable<ModalProps["confirmProps"]>;
type ModalCancelProps = NonNullable<ModalProps["cancelProps"]>;
type AlertModalConfirmProps = NonNullable<AlertModalProps["confirmProps"]>;
type AlertModalCancelProps = NonNullable<AlertModalProps["cancelProps"]>;

declare const acceptModalConfirmProps: (props: ModalConfirmProps) => void;
declare const acceptModalCancelProps: (props: ModalCancelProps) => void;
declare const acceptAlertConfirmProps: (props: AlertModalConfirmProps) => void;
declare const acceptAlertCancelProps: (props: AlertModalCancelProps) => void;

const safeProps = {
  className: "action-x",
  disabled: false,
  endIcon: <span>End</span>,
  form: "modal-form",
  loading: false,
  render: <button type="button" />,
  size: "sm" as const,
  startIcon: <span>Start</span>,
  type: "submit" as const,
  variant: "destructive" as const,
};

acceptModalConfirmProps(safeProps);
acceptModalCancelProps(safeProps);
acceptAlertConfirmProps(safeProps);
acceptAlertCancelProps(safeProps);

// @ts-expect-error Modal owns the confirm label.
acceptModalConfirmProps({ children: "Replace" });
// @ts-expect-error Modal owns the confirm label and rejects raw HTML.
acceptModalConfirmProps({ dangerouslySetInnerHTML: { __html: "Replace" } });
// @ts-expect-error Modal owns confirm behavior.
acceptModalConfirmProps({ onClick: () => undefined });

// @ts-expect-error Modal owns the cancel label.
acceptModalCancelProps({ children: "Replace" });
// @ts-expect-error Modal owns the cancel label and rejects raw HTML.
acceptModalCancelProps({ dangerouslySetInnerHTML: { __html: "Replace" } });
// @ts-expect-error Modal owns cancel behavior.
acceptModalCancelProps({ onClick: () => undefined });

// @ts-expect-error AlertModal owns the confirm label.
acceptAlertConfirmProps({ children: "Replace" });
// @ts-expect-error AlertModal owns the confirm label and rejects raw HTML.
acceptAlertConfirmProps({ dangerouslySetInnerHTML: { __html: "Replace" } });
// @ts-expect-error AlertModal owns confirm behavior.
acceptAlertConfirmProps({ onClick: () => undefined });

// @ts-expect-error AlertModal owns the cancel label.
acceptAlertCancelProps({ children: "Replace" });
// @ts-expect-error AlertModal owns the cancel label and rejects raw HTML.
acceptAlertCancelProps({ dangerouslySetInnerHTML: { __html: "Replace" } });
// @ts-expect-error AlertModal owns cancel behavior.
acceptAlertCancelProps({ onClick: () => undefined });
