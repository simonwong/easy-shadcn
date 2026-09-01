"use client";

import type {
  ComponentProps,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import { isValidElement } from "react";
import type { Button } from "@/components/ui/button";
import {
  Toaster as PrimitiveToaster,
  toast as toastManager,
} from "@/components/ui/toast";

type PrimitiveToasterProps = ComponentProps<typeof PrimitiveToaster>;

export type ToastType =
  | "default"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "loading";

export type ToastId = string;

export interface ToastAction {
  label: ReactNode;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

interface ToastActionOwnedProps {
  "aria-disabled"?: never;
  children?: never;
  dangerouslySetInnerHTML?: never;
  "data-slot"?: never;
  nativeButton?: never;
  onClick?: never;
  render?: never;
  role?: never;
}

export type ToastActionButtonProps = Omit<
  ComponentProps<typeof Button>,
  "className" | "style" | keyof ToastActionOwnedProps
> &
  ToastActionOwnedProps &
  Pick<ComponentProps<"button">, "className" | "style">;

export interface ToastOptions {
  action?: ToastAction | null;
  actionButtonProps?: ToastActionButtonProps;
  description?: ReactNode;
  id?: ToastId;
  onClose?: () => void;
  onRemove?: () => void;
  priority?: "low" | "high";
  timeout?: number;
  type?: ToastType;
}

export interface ToastPromiseStateOptions
  extends Omit<ToastOptions, "action" | "actionButtonProps" | "id" | "type"> {
  title: ReactNode;
}

export type ToastPromiseState<Value> =
  | ReactNode
  | ToastPromiseStateOptions
  | ((value: Value) => ReactNode | ToastPromiseStateOptions);

export interface ToastPromiseOptions<Value> {
  error: ToastPromiseState<unknown>;
  loading: ReactNode | ToastPromiseStateOptions;
  success: ToastPromiseState<Value>;
}

export interface ToastProps
  extends Pick<PrimitiveToasterProps, "limit" | "timeout"> {}

type ToastStatusOptions = Omit<ToastOptions, "type">;
type ToastUpdateOptions = Omit<ToastOptions, "id">;

interface ToastApi {
  close: (id?: ToastId) => void;
  error: (title: ReactNode, options?: ToastStatusOptions) => ToastId;
  info: (title: ReactNode, options?: ToastStatusOptions) => ToastId;
  loading: (title: ReactNode, options?: ToastStatusOptions) => ToastId;
  promise: <Value>(
    promise: Promise<Value>,
    options: ToastPromiseOptions<Value>
  ) => Promise<Value>;
  success: (title: ReactNode, options?: ToastStatusOptions) => ToastId;
  update: (id: ToastId, title: ReactNode, options?: ToastUpdateOptions) => void;
  warning: (title: ReactNode, options?: ToastStatusOptions) => ToastId;
  (title: ReactNode, options?: ToastOptions): ToastId;
}

const createActionProps = (
  action: ToastAction,
  actionButtonProps: ToastActionButtonProps | undefined,
  getId: () => ToastId
): ComponentProps<"button"> => {
  const {
    "aria-disabled": _ignoredAriaDisabled,
    children: _ignoredChildren,
    "data-slot": _ignoredDataSlot,
    dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
    nativeButton: _ignoredNativeButton,
    onClick: _ignoredOnClick,
    render: _ignoredRender,
    role: _ignoredRole,
    ...safeButtonProps
  } = (actionButtonProps ?? {}) as ComponentProps<typeof Button> & {
    "data-slot"?: string;
  };

  return {
    ...safeButtonProps,
    children: action.label,
    onClick: (event: ReactMouseEvent<HTMLButtonElement>) => {
      action.onClick?.(event);
      if (!event.defaultPrevented) {
        toastManager.close(getId());
      }
    },
  } as ComponentProps<"button">;
};

const addToast = (title: ReactNode, options: ToastOptions = {}): ToastId => {
  const { action, actionButtonProps, ...managerOptions } = options;
  let id = options.id ?? "";
  const actionProps = action
    ? createActionProps(action, actionButtonProps, () => id)
    : undefined;

  id = toastManager.add({
    ...managerOptions,
    actionProps,
    title,
  });

  return id;
};

const updateToast = (
  id: ToastId,
  title: ReactNode,
  options: ToastUpdateOptions = {}
) => {
  const { action, actionButtonProps, ...managerOptions } = options;
  const replacesAction =
    Object.hasOwn(options, "action") ||
    Object.hasOwn(options, "actionButtonProps");

  toastManager.update(id, {
    ...managerOptions,
    ...(replacesAction && {
      actionProps: action
        ? createActionProps(action, actionButtonProps, () => id)
        : undefined,
    }),
    title,
  });
};

const isPromiseStateOptions = (
  state: ReactNode | ToastPromiseStateOptions
): state is ToastPromiseStateOptions =>
  typeof state === "object" &&
  state !== null &&
  !isValidElement(state) &&
  "title" in state;

const mapPromiseState = (state: ReactNode | ToastPromiseStateOptions) =>
  isPromiseStateOptions(state) ? state : { title: state };

const mapPromiseResolver = <Value,>(state: ToastPromiseState<Value>) =>
  typeof state === "function"
    ? (value: Value) => mapPromiseState(state(value))
    : mapPromiseState(state);

const promiseToast = <Value,>(
  promise: Promise<Value>,
  options: ToastPromiseOptions<Value>
): Promise<Value> =>
  toastManager.promise(promise, {
    error: mapPromiseResolver(options.error),
    loading: mapPromiseState(options.loading),
    success: mapPromiseResolver(options.success),
  });

const statusToast =
  (type: ToastType) =>
  (title: ReactNode, options: ToastStatusOptions = {}) =>
    addToast(title, { ...options, type });

export const Toast = (props: ToastProps) => <PrimitiveToaster {...props} />;

export const Toaster = Toast;

export const toast: ToastApi = Object.assign(addToast, {
  close: (id?: ToastId) => toastManager.close(id),
  error: statusToast("error"),
  info: statusToast("info"),
  loading: statusToast("loading"),
  promise: promiseToast,
  success: statusToast("success"),
  update: updateToast,
  warning: statusToast("warning"),
});

export default Toast;
