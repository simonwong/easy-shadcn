import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useReducer,
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

let reducerDispatch: React.Dispatch<CommandModalAction> = () => {
  throw new Error(
    "No dispatch method detected, did you embed your app with CommandModal.Provider?"
  );
};

export const reducerActions: {
  showModal: (modalId: string, args?: Record<string, unknown>) => void;
  setModalFlags: (modalId: string, flags: Record<string, unknown>) => void;
  hideModal: (modalId: string) => void;
  removeModal: (modalId: string) => void;
} = {
  // action creator to show a modal
  showModal: (modalId: string, args?: Record<string, unknown>) => {
    reducerDispatch({
      type: ActionType.showModal,
      payload: {
        modalId,
        args,
      },
    });
  },
  // action creator to set flags of a modal
  setModalFlags: (modalId: string, flags: Record<string, unknown>) => {
    reducerDispatch({
      type: ActionType.setModalFlags,
      payload: {
        modalId,
        flags,
      },
    });
  },
  // action creator to hide a modal
  hideModal: (modalId: string) => {
    reducerDispatch({
      type: ActionType.hideModal,
      payload: {
        modalId,
      },
    });
  },
  // action creator to remove a modal
  removeModal: (modalId: string) => {
    reducerDispatch({
      type: ActionType.removeModal,
      payload: {
        modalId,
      },
    });
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

// The placeholder component is used to auto render modals when call modal.show()
// When modal.show() is called, it means there've been modal info
const CommandModalPlaceholder: React.FC = () => {
  const modals = useContext(CommandModalContext);

  // Memoize expensive filtering and mapping operations
  const toRender = useMemo(() => {
    const visibleModalIds = Object.keys(modals).filter((id) => !!modals[id]);

    // Validate and filter modals, warning about invalid ones without interrupting others
    return visibleModalIds
      .filter((id) => {
        if (!(MODAL_REGISTRY[id] || ALREADY_MOUNTED[id])) {
          console.warn(
            `No modal found for id: ${id}. Please check the id or if it is registered or declared via JSX.`
          );
          return false; // Skip this modal but continue processing others
        }
        return MODAL_REGISTRY[id]; // Only render registered modals (JSX-declared modals render themselves)
      })
      .map((id) => ({
        id,
        ...MODAL_REGISTRY[id],
      }));
  }, [modals]);

  return (
    <>
      {toRender.map((t) => (
        <t.comp id={t.id} key={t.id} {...t.props} />
      ))}
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

  reducerDispatch = dispatch;

  return (
    <CommandModalConfigContext.Provider value={config}>
      <CommandModalContext.Provider value={modals}>
        {children}
        <CommandModalPlaceholder />
      </CommandModalContext.Provider>
    </CommandModalConfigContext.Provider>
  );
};
