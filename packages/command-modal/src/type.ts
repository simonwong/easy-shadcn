import type { JSX } from 'react';
import { symModalId } from './symbol';

export interface CommandModalState {
  id: string;
  args?: Record<string, unknown>;
  visible?: boolean;
  delayVisible?: boolean;
  keepMounted?: boolean;
}

export interface CommandModalStore {
  [key: string]: CommandModalState;
}

export const ActionType = {
  showModal: 'command-modal/show',
  setModalFlags: 'command-modal/set-flags',
  hideModal: 'command-modal/hide',
  removeModal: 'command-modal/remove',
} as const;

export interface CommandModalAction {
  type: (typeof ActionType)[keyof typeof ActionType];
  payload: {
    modalId: string;
    args?: Record<string, unknown>;
    flags?: Record<string, unknown>;
  };
}
export interface CommandModalCallbacks {
  [modalId: string]: {
    resolve: (args: unknown) => void;
    reject: (args: unknown) => void;
    promise: Promise<unknown>;
  };
}

export type ShadCNModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  afterClose?: () => void;
};

/**
 * The handler to manage a modal returned by {@link useModal | useModal} hook.
 */
export interface CommandModalHandler<Props = Record<string, unknown>>
  extends CommandModalState {
  /**
   * Whether a modal is visible, it's controlled by {@link CommandModalHandler.show | show}/{@link CommandModalHandler.hide | hide} method.
   */
  visible: boolean;
  /**
   * If you don't want to remove the modal from the tree after hide when using helpers, set it to true.
   */
  keepMounted: boolean;
  /**
   * Show the modal, it will change {@link CommandModalHandler.visible | visible} state to true.
   * @param args - an object passed to modal component as props.
   */
  show: (args?: Props) => Promise<unknown>;
  /**
   * Hide the modal, it will change {@link CommandModalHandler.visible | visible} state to false.
   */
  hide: () => Promise<unknown>;
  /**
   * Resolve the promise returned by {@link CommandModalHandler.show | show} method.
   */
  resolve: (args?: unknown) => void;
  /**
   * Reject the promise returned by {@link CommandModalHandler.show | show} method.
   */
  reject: (args?: unknown) => void;
  /**
   * Remove the modal component from React component tree. It improves performance compared to just making a modal invisible.
   */
  remove: () => void;

  /**
   * Resolve the promise returned by {@link CommandModalHandler.hide | hide} method.
   */
  resolveHide: (args?: unknown) => void;
}

// Omit will not work if extends Record<string, unknown>, which is not needed here
export interface CommandModalHocProps {
  id: string;
  defaultVisible?: boolean;
  keepMounted?: boolean;
}

export type CreateModalComponent<T = object> = React.FC<
  T & CommandModalHocProps
> & {
  [symModalId]?: string;
};

export type CommandModalArgs<T> = T extends
  | keyof JSX.IntrinsicElements
  | React.JSXElementConstructor<unknown>
  ? React.ComponentProps<T>
  : Record<string, unknown>;
