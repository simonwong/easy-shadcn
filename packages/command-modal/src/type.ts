export interface CommandModalState {
  args?: Record<string, unknown>;
  delayVisible?: boolean;
  id: string;
  keepMounted?: boolean;
  visible?: boolean;
}

export interface CommandModalStore {
  [key: string]: CommandModalState;
}

export const ActionType = {
  showModal: "command-modal/show",
  setModalFlags: "command-modal/set-flags",
  hideModal: "command-modal/hide",
  removeModal: "command-modal/remove",
} as const;

export interface CommandModalAction {
  payload: {
    modalId: string;
    args?: Record<string, unknown>;
    flags?: Record<string, unknown>;
  };
  type: (typeof ActionType)[keyof typeof ActionType];
}
export interface CommandModalCallbacks {
  [modalId: string]: {
    resolve: (args?: unknown) => void;
    reject: (args?: unknown) => void;
    promise: Promise<unknown>;
  };
}

/**
 * Standard modal props for shadcn/ui components
 */
export type ShadCNModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  afterClose?: () => void;
};

/**
 * Adapter function that converts a modal handler to UI library-specific props.
 * This allows the modal system to work with different UI libraries (shadcn, antd, mui, etc.)
 *
 * @template TModalProps - The type of props your modal library expects
 * @param handler - The command modal handler
 * @returns Props object compatible with your modal library
 *
 * @example
 * // For shadcn/ui
 * const shadcnAdapter: ModalPropsAdapter<ShadCNModalProps> = (handler) => ({
 *   open: handler.visible,
 *   onOpenChange: (open) => open ? handler.show() : handler.hide(),
 *   afterClose: () => { handler.resolveHide(); if (!handler.keepMounted) handler.remove(); }
 * });
 *
 * // For Ant Design
 * const antdAdapter: ModalPropsAdapter<AntdModalProps> = (handler) => ({
 *   open: handler.visible,
 *   onCancel: () => handler.hide(),
 *   afterClose: () => { handler.resolveHide(); if (!handler.keepMounted) handler.remove(); }
 * });
 */
export type ModalPropsAdapter<TModalProps = ShadCNModalProps> = (
  handler: CommandModalHandler
) => TModalProps;

/**
 * Configuration for the CommandModal system.
 *
 * ⚠ Whenever a new field is added to this interface, update the memo in
 * `Provider` (see context.tsx) so the field is propagated through the
 * config context boundary. The memo keys on each field individually to
 * avoid invalidating downstream consumers when a caller passes an inline
 * `{ ... }` object.
 */
export interface CommandModalConfig<TModalProps = ShadCNModalProps> {
  /**
   * Custom adapter to generate modal props.
   * If not provided, uses the default shadcn adapter.
   */
  modalPropsAdapter?: ModalPropsAdapter<TModalProps>;
}

/**
 * The handler to manage a modal returned by {@link useModal | useModal} hook.
 */
export interface CommandModalHandler<Props = Record<string, unknown>>
  extends CommandModalState {
  /**
   * Hide the modal, it will change {@link CommandModalHandler.visible | visible} state to false.
   */
  hide: () => Promise<unknown>;
  /**
   * If you don't want to remove the modal from the tree after hide when using helpers, set it to true.
   */
  keepMounted: boolean;
  /**
   * Reject the promise returned by {@link CommandModalHandler.show | show} method.
   */
  reject: (args?: unknown) => void;
  /**
   * Remove the modal component from React component tree. It improves performance compared to just making a modal invisible.
   */
  remove: () => void;
  /**
   * Resolve the promise returned by {@link CommandModalHandler.show | show} method.
   */
  resolve: (args?: unknown) => void;

  /**
   * Resolve the promise returned by {@link CommandModalHandler.hide | hide} method.
   */
  resolveHide: (args?: unknown) => void;
  /**
   * Show the modal, it will change {@link CommandModalHandler.visible | visible} state to true.
   * @param args - an object passed to modal component as props.
   */
  show: (args?: Props) => Promise<unknown>;
  /**
   * Whether a modal is visible, it's controlled by {@link CommandModalHandler.show | show}/{@link CommandModalHandler.hide | hide} method.
   */
  visible: boolean;
}

// Omit will not work if extends Record<string, unknown>, which is not needed here
export interface CommandModalHocProps {
  defaultVisible?: boolean;
  id: string;
  keepMounted?: boolean;
}

// The inner component's props (`T`) arrive at runtime via `show(id, args)`, not
// at JSX-mount time. Anything passed where the HOC is mounted (`<Modal id=… />`)
// only acts as a default, so `T` is partial there — `id` is the sole required prop.
export type CreateModalComponent<T = object, R = unknown> = React.FC<
  Partial<T> & CommandModalHocProps
> & {
  /**
   * Phantom marker carrying the modal's resolve (result) type. Exists only at
   * the type level — never present at runtime. {@link ResolveType} reads it so
   * `show(Comp)` returns `Promise<R>` without an explicit type argument.
   */
  readonly __resolveType?: R;
};

/**
 * Extract the resolve (result) type `R` carried by a {@link CreateModalComponent}.
 * Falls back to `unknown` for components that don't carry one.
 */
export type ResolveType<C> = C extends { __resolveType?: infer R }
  ? R
  : unknown;

/**
 * The props a modal component accepts at `show()` / `register()` /
 * `useModal()` time: its own props minus the HOC-reserved keys
 * (`id` / `defaultVisible` / `keepMounted`), which the system injects.
 *
 * Derives directly from the component, so a typed modal's args are actually
 * validated at each `show()` / `register()` call site.
 */
export type ModalInnerProps<
  // biome-ignore lint/suspicious/noExplicitAny: must accept any modal component (whose props carry a required `id`), matching CreateModalComponent<any>.
  C extends React.ComponentType<any>,
> = Omit<React.ComponentProps<C>, keyof CommandModalHocProps>;

/**
 * The overloaded return shape of {@link useModal}, parameterized over the
 * `modalProps` type a given adapter produces. Single source of truth: the
 * package-root `useModal` instantiates this with `ShadCNModalProps`, and the
 * `createCommandModal` factory instantiates it with the adapter's `TModalProps`
 * — so the two never drift.
 */
export type UseModalReturn<TModalProps> = {
  (
    modal?: string,
    args?: Record<string, unknown>
  ): CommandModalHandler & {
    modalProps: TModalProps;
  };
  // biome-ignore lint/suspicious/noExplicitAny: C is any modal component; its props are recovered via ModalInnerProps<C> and its resolve type via ResolveType<C>.
  <C extends React.FC<any>>(
    modal: C,
    args?: Partial<ModalInnerProps<C>>
  ): Omit<CommandModalHandler, "show"> & {
    show: (args?: Partial<ModalInnerProps<C>>) => Promise<ResolveType<C>>;
    modalProps: TModalProps;
  };
};
