/**
 * Default modal props adapter for shadcn/ui components.
 * This adapter converts CommandModalHandler to shadcn/ui-compatible props.
 */

import type {
  CommandModalHandler,
  ModalPropsAdapter,
  ShadCNModalProps,
} from './type';

/**
 * Default adapter for shadcn/ui modal components.
 * Supports: open, onOpenChange, afterClose props
 *
 * @example
 * ```tsx
 * import CommandModal, { shadcnModalAdapter } from '@easy-shadcn/command-modal';
 *
 * // Use as default (no config needed)
 * <CommandModal.Provider>
 *   <App />
 * </CommandModal.Provider>
 *
 * // Or explicitly configure
 * <CommandModal.Provider config={{ modalPropsAdapter: shadcnModalAdapter }}>
 *   <App />
 * </CommandModal.Provider>
 * ```
 */
export const shadcnModalAdapter: ModalPropsAdapter<ShadCNModalProps> = (
  handler: CommandModalHandler
): ShadCNModalProps => {
  return {
    open: handler.visible,
    onOpenChange: (open) => {
      if (open) {
        handler.show();
      } else {
        handler.hide();
      }
    },
    afterClose: () => {
      handler.resolveHide();
      if (!handler.keepMounted) {
        handler.remove();
      }
    },
  };
};
