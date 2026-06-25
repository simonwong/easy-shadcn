"use client";

import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { ALREADY_MOUNTED, MODAL_REGISTRY } from "./constants";
import {
  ActionType,
  type CommandModalAction,
  type CommandModalConfig,
  type CommandModalStore,
} from "./type";

// Modal reducer used in useReducer hook.
export const reducer = (
  state: CommandModalStore,
  action: CommandModalAction
): CommandModalStore => {
  switch (action.type) {
    case ActionType.showModal: {
      const { modalId, args } = action.payload;
      return {
        ...state,
        [modalId]: {
          ...state[modalId],
          id: modalId,
          args,
          // If modal is not mounted, mount it first then make it visible.
          // There is logic inside HOC wrapper to make it visible after its first mount.
          // This mechanism ensures the entering transition.
          visible: !!ALREADY_MOUNTED[modalId],
          delayVisible: !ALREADY_MOUNTED[modalId],
        },
      };
    }
    case ActionType.hideModal: {
      const { modalId } = action.payload;
      if (!state[modalId]) {
        return state;
      }
      return {
        ...state,
        [modalId]: {
          ...state[modalId],
          visible: false,
        },
      };
    }
    case ActionType.removeModal: {
      const { modalId } = action.payload;
      const newState = { ...state };
      delete newState[modalId];
      return newState;
    }
    case ActionType.setModalFlags: {
      const { modalId, flags } = action.payload;
      return {
        ...state,
        [modalId]: {
          ...state[modalId],
          ...flags,
        },
      };
    }
    default:
      return state;
  }
};

/**
 * Stack of dispatches from currently-mounted Providers. Top-level
 * `show/hide/remove` calls (made outside React's tree) dispatch to the top of
 * this stack. When exactly one Provider is mounted, routing is unambiguous.
 *
 * **With multiple Providers mounted, the routing target is unspecified** —
 * StrictMode's effect cleanup/setup cycles and concurrent rendering make the
 * stack order indeterminate. For example, given nested `<Provider>` parents
 * and children, stack order may be `[parent, child]` in production (render-
 * phase push order) but `[child, parent]` in StrictMode dev (setup effect re-
 * push order after the simulated cleanup/setup cycle). The one-shot dev warn
 * surfaces this; inside the React tree, use `useModal()` or
 * `useCommandModalDispatch()` so the dispatch is routed to the closest
 * enclosing Provider via context (deterministic in both dev and prod).
 */
const dispatchStack: Dispatch<CommandModalAction>[] = [];

// Exposed for tests only. Not part of the public API.
export const __getDispatchStackSize = (): number => dispatchStack.length;

// Test-only: forcibly drain the stack. Protects against a leaked push from a
// Provider whose render aborted before its cleanup effect could pop. Not part
// of the public API.
export const __resetDispatchStack = (): void => {
  dispatchStack.length = 0;
};

let hasWarnedMultipleProviders = false;

// Test-only: reset the one-shot warn flag so each test can assert the warning
// independently. Not part of the public API.
export const __resetMultipleProvidersWarning = (): void => {
  hasWarnedMultipleProviders = false;
};

const getFallbackDispatch = (): Dispatch<CommandModalAction> => {
  const top = dispatchStack.at(-1);
  if (!top) {
    throw new Error(
      "No dispatch method detected, did you embed your app with CommandModal.Provider?"
    );
  }
  if (
    dispatchStack.length > 1 &&
    !hasWarnedMultipleProviders &&
    typeof process !== "undefined" &&
    process.env?.NODE_ENV !== "production"
  ) {
    hasWarnedMultipleProviders = true;
    console.warn(
      `[CommandModal] Multiple Providers are currently mounted (${dispatchStack.length}). Top-level show/hide/remove routes to an arbitrary Provider and should be considered undefined in multi-Provider setups. Use useModal() inside your component tree for scoped, deterministic dispatching.`
    );
  }
  return top;
};

const registerProviderDispatch = (dispatch: Dispatch<CommandModalAction>) => {
  // Idempotent by dispatch identity: in StrictMode the Provider's effect fires
  // cleanup→setup twice, which can interleave with sibling/parent Providers.
  // If the dispatch is already in the stack, don't push a duplicate — that
  // would both leak and reorder the stack.
  if (!dispatchStack.includes(dispatch)) {
    dispatchStack.push(dispatch);
  }
};

const unregisterProviderDispatch = (dispatch: Dispatch<CommandModalAction>) => {
  const idx = dispatchStack.lastIndexOf(dispatch);
  if (idx >= 0) {
    dispatchStack.splice(idx, 1);
  }
};

/**
 * Factory for action creators bound to a specific dispatch. Use this when you
 * already have a dispatch in hand (e.g. via `useCommandModalDispatch()`).
 */
export const createReducerActions = (
  dispatch: Dispatch<CommandModalAction>
) => ({
  showModal(modalId: string, args?: Record<string, unknown>) {
    dispatch({ type: ActionType.showModal, payload: { modalId, args } });
  },
  setModalFlags(modalId: string, flags: Record<string, unknown>) {
    dispatch({ type: ActionType.setModalFlags, payload: { modalId, flags } });
  },
  hideModal(modalId: string) {
    dispatch({ type: ActionType.hideModal, payload: { modalId } });
  },
  removeModal(modalId: string) {
    dispatch({ type: ActionType.removeModal, payload: { modalId } });
  },
});

/**
 * Legacy module-level action creators. Each call resolves to the top of the
 * current dispatch stack. Kept for backward compatibility with top-level
 * `show/hide/remove/unregister` helpers. Prefer the hook-based scoped form
 * (`useModal`, `useCommandModalDispatch`) in new code.
 */
export const reducerActions: {
  showModal: (modalId: string, args?: Record<string, unknown>) => void;
  setModalFlags: (modalId: string, flags: Record<string, unknown>) => void;
  hideModal: (modalId: string) => void;
  removeModal: (modalId: string) => void;
} = {
  showModal(modalId, args) {
    createReducerActions(getFallbackDispatch()).showModal(modalId, args);
  },
  setModalFlags(modalId, flags) {
    createReducerActions(getFallbackDispatch()).setModalFlags(modalId, flags);
  },
  hideModal(modalId) {
    createReducerActions(getFallbackDispatch()).hideModal(modalId);
  },
  removeModal(modalId) {
    createReducerActions(getFallbackDispatch()).removeModal(modalId);
  },
};

const initialState: CommandModalStore = {};

/**
 * 全局弹窗 ID 状态上下文
 */
export const CommandModalContext =
  createContext<CommandModalStore>(initialState);

/**
 * 各个弹窗 ID 上下文
 */
export const CommandModalIdContext = createContext<string | null>(null);

/**
 * CommandModal 配置上下文
 * 用于传递自定义的 modalPropsAdapter 等配置
 */
export const CommandModalConfigContext = createContext<
  CommandModalConfig | undefined
>(undefined);

/**
 * Scoped dispatch for the closest enclosing Provider. `null` when used outside
 * any Provider — consumers are expected to fall back to the module-level API
 * (which will throw unless a Provider is mounted).
 */
export const CommandModalDispatchContext =
  createContext<Dispatch<CommandModalAction> | null>(null);

/**
 * Hook form: returns the dispatch of the closest enclosing Provider, or `null`
 * when called outside of any Provider subtree.
 */
export const useCommandModalDispatch =
  (): Dispatch<CommandModalAction> | null =>
    useContext(CommandModalDispatchContext);

// The placeholder component is used to auto render modals when call modal.show()
// When modal.show() is called, it means there've been modal info
const CommandModalPlaceholder: React.FC = () => {
  const modals = useContext(CommandModalContext);

  // Derive synchronously from live module state on every render. No useMemo:
  // the result depends on MODAL_REGISTRY / ALREADY_MOUNTED, which mutate
  // (register(), <ModalDef>) without changing `modals`, so a memo keyed on
  // [modals] could serve a stale list and silently fail to mount a modal that
  // was registered after its id entered the store. The filter/map is cheap
  // relative to the modal subtrees it gates.
  const visibleModalIds = Object.keys(modals).filter((id) => !!modals[id]);
  const unresolvedIds: string[] = [];
  const toRender = visibleModalIds
    .filter((id) => {
      if (!(MODAL_REGISTRY[id] || ALREADY_MOUNTED[id])) {
        unresolvedIds.push(id);
        return false; // Skip this modal but continue processing others
      }
      return MODAL_REGISTRY[id]; // Only render registered modals (JSX-declared modals render themselves)
    })
    .map((id) => ({
      id,
      ...MODAL_REGISTRY[id],
    }));

  // Emit the "no modal found" diagnostic from a commit-phase effect, never from
  // the render body: render must be side-effect-free, since React may run it
  // twice (StrictMode) or discard it (concurrent rendering), which would double-
  // or phantom-log. Keying on the joined id list fires the warning once per
  // committed set of unresolved ids.
  const unresolvedKey = unresolvedIds.join(",");
  useEffect(() => {
    if (!unresolvedKey) {
      return;
    }
    for (const id of unresolvedKey.split(",")) {
      console.warn(
        `No modal found for id: ${id}. Please check the id or if it is registered or declared via JSX.`
      );
    }
  }, [unresolvedKey]);

  return (
    <>
      {toRender.map((t) => {
        const {
          id: _reservedId,
          defaultVisible: _reservedDefaultVisible,
          keepMounted: _reservedKeepMounted,
          ...safeProps
        } = t.props ?? {};
        return <t.comp id={t.id} key={t.id} {...safeProps} />;
      })}
    </>
  );
};

export interface CommandModalProviderProps extends PropsWithChildren {
  /**
   * Optional configuration for the CommandModal system.
   * Use this to customize modal behavior, such as providing a custom modalPropsAdapter
   * for different UI libraries (e.g., Ant Design, MUI).
   *
   * @example
   * ```tsx
   * import CommandModal, { antdModalAdapter } from '@easy-shadcn/command-modal';
   *
   * <CommandModal.Provider config={{ modalPropsAdapter: antdModalAdapter }}>
   *   <App />
   * </CommandModal.Provider>
   * ```
   */
  config?: CommandModalConfig;
}

export const Provider: React.FC<CommandModalProviderProps> = ({
  children,
  config,
}) => {
  const [modals, dispatch] = useReducer(reducer, initialState);

  // Stabilize the config context value so a parent re-render that passes a
  // fresh inline `{ modalPropsAdapter }` object does not invalidate every
  // downstream useModal consumer's useMemo. We key memoization on the
  // referential identity of each field of CommandModalConfig so downstream
  // consumers only re-derive when a field actually changes.
  //
  // ⚠ Keep the destructure below and the dep array in sync with
  // `CommandModalConfig` (see type.ts). Any new field must be destructured
  // here AND added to the dep array, otherwise it will not propagate
  // through the context boundary when it changes.
  const { modalPropsAdapter } = config ?? {};
  const stableConfig = useMemo<CommandModalConfig | undefined>(
    () => (modalPropsAdapter ? { modalPropsAdapter } : undefined),
    [modalPropsAdapter]
  );

  // Register this Provider's dispatch with the module-level stack so that
  // top-level show/hide/remove (called from outside React) can route to it.
  // Writing during render is intentional: child effects (e.g. the create() HOC's
  // defaultVisible effect) run before parent effects, and those children may
  // call top-level show() before Provider's useEffect would have fired. A ref
  // guards against double-push under StrictMode / concurrent re-renders; the
  // useEffect cleanup pops on unmount and resets the guard so a subsequent
  // mount re-pushes correctly.
  const pushedRef = useRef(false);
  if (!pushedRef.current) {
    pushedRef.current = true;
    registerProviderDispatch(dispatch);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: `dispatch` from useReducer is stable across renders, so biome sees listing it as redundant; we keep it as the logical subject of this effect's register/cleanup pair.
  useEffect(() => {
    // StrictMode runs effect setup/cleanup twice without re-rendering, so if
    // the simulated cleanup popped us off, re-push here rather than rely on
    // another render pass.
    if (!pushedRef.current) {
      pushedRef.current = true;
      registerProviderDispatch(dispatch);
    }
    return () => {
      unregisterProviderDispatch(dispatch);
      pushedRef.current = false;
    };
  }, [dispatch]);

  return (
    <CommandModalConfigContext.Provider value={stableConfig}>
      <CommandModalContext.Provider value={modals}>
        <CommandModalDispatchContext.Provider value={dispatch}>
          {children}
          <CommandModalPlaceholder />
        </CommandModalDispatchContext.Provider>
      </CommandModalContext.Provider>
    </CommandModalConfigContext.Provider>
  );
};
