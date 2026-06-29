"use client";

import type { ModalPropsAdapter } from "./type";

/**
 * The subset of Ant Design v6 `<Modal>` props this adapter drives. Hand-written
 * (no `antd` import) so the package keeps its zero-dependency guarantee — antd's
 * `open` / `onCancel` / `afterClose` are stable across v5→v6. Spread the rest
 * (`title`, `onOk`, `width`, …) directly at the JSX site.
 */
export type AntdModalProps = {
  open?: boolean;
  onCancel?: () => void;
  afterClose?: () => void;
};

/**
 * Official adapter for Ant Design v6 `<Modal>`. Pass it to
 * {@link createCommandModal} for a fully typed antd binding.
 *
 * @example
 * ```tsx
 * // lib/modal.ts
 * import { createCommandModal } from '@easy-shadcn/command-modal';
 * import { antdModalProps } from '@easy-shadcn/command-modal/antd';
 *
 * export const { Provider, useModal } = createCommandModal(antdModalProps);
 * ```
 */
export const antdModalProps: ModalPropsAdapter<AntdModalProps> = (handler) => ({
  open: handler.visible,
  onCancel: () => {
    handler.hide();
  },
  afterClose: () => {
    handler.resolveHide();
    if (!handler.keepMounted) {
      handler.remove();
    }
  },
});
