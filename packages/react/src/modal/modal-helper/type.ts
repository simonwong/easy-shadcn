import { symModalId } from './symbol';

export interface ModalHelperState {
  id: string;
  args?: Record<string, unknown>;
  visible?: boolean;
  delayVisible?: boolean;
  keepMounted?: boolean;
}

export interface ModalHelperStore {
  [key: string]: ModalHelperState;
}

export enum ActionType {
  showModal = 'modal-helper/show',
  setModalFlags = 'modal-helper/set-flags',
  hideModal = 'modal-helper/hide',
  removeModal = 'modal-helper/remove',
}

export interface ModalHelperAction {
  type: ActionType;
  payload: {
    modalId: string;
    args?: Record<string, unknown>;
    flags?: Record<string, unknown>;
  };
}
export interface ModalHelperCallbacks {
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
export interface ModalHelperHandler<Props = Record<string, unknown>> extends ModalHelperState {
  /**
   * Whether a modal is visible, it's controlled by {@link ModalHelperHandler.show | show}/{@link ModalHelperHandler.hide | hide} method.
   */
  visible: boolean;
  /**
   * If you don't want to remove the modal from the tree after hide when using helpers, set it to true.
   */
  keepMounted: boolean;
  /**
   * Show the modal, it will change {@link ModalHelperHandler.visible | visible} state to true.
   * @param args - an object passed to modal component as props.
   */
  show: (args?: Props) => Promise<unknown>;
  /**
   * Hide the modal, it will change {@link ModalHelperHandler.visible | visible} state to false.
   */
  hide: () => Promise<unknown>;
  /**
   * Resolve the promise returned by {@link ModalHelperHandler.show | show} method.
   */
  resolve: (args?: unknown) => void;
  /**
   * Reject the promise returned by {@link ModalHelperHandler.show | show} method.
   */
  reject: (args?: unknown) => void;
  /**
   * Remove the modal component from React component tree. It improves performance compared to just making a modal invisible.
   */
  remove: () => void;

  /**
   * Resolve the promise returned by {@link ModalHelperHandler.hide | hide} method.
   */
  resolveHide: (args?: unknown) => void;
}

// Omit will not work if extends Record<string, unknown>, which is not needed here
export interface ModalHelperHocProps {
  id: string;
  defaultVisible?: boolean;
  keepMounted?: boolean;
}

export type CreateModalComponent<T = object> = React.FC<T & ModalHelperHocProps> & {
  [symModalId]?: string;
};

export type ModalHelperArgs<T> = T extends
  | keyof JSX.IntrinsicElements
  | React.JSXElementConstructor<unknown>
  ? React.ComponentProps<T>
  : Record<string, unknown>;
