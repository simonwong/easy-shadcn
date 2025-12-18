'use client';

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useReducer,
} from 'react';
import { ALREADY_MOUNTED, MODAL_REGISTRY } from './constants';
import {
  ActionType,
  type ModalHelperAction,
  type ModalHelperStore,
} from './type';

// Modal reducer used in useReducer hook.
export const reducer = (
  state: ModalHelperStore,
  action: ModalHelperAction
): ModalHelperStore => {
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

let reducerDispatch: React.Dispatch<ModalHelperAction> = () => {
  throw new Error(
    'No dispatch method detected, did you embed your app with ModalHelper.Provider?'
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

const initialState: ModalHelperStore = {};

/**
 * 全局弹窗 ID 状态上下文
 */
export const ModalHelperContext = createContext<ModalHelperStore>(initialState);

/**
 * 各个弹窗 ID 上下文
 */
export const ModalHelperIdContext = createContext<string | null>(null);

// The placeholder component is used to auto render modals when call modal.show()
// When modal.show() is called, it means there've been modal info
const ModalHelperPlaceholder: React.FC = () => {
  const modals = useContext(ModalHelperContext);
  const visibleModalIds = Object.keys(modals).filter((id) => !!modals[id]);
  for (const id of visibleModalIds) {
    if (!(MODAL_REGISTRY[id] || ALREADY_MOUNTED[id])) {
      console.warn(
        `No modal found for id: ${id}. Please check the id or if it is registered or declared via JSX.`
      );
      return;
    }
  }

  const toRender = visibleModalIds
    .filter((id) => MODAL_REGISTRY[id])
    .map((id) => ({
      id,
      ...MODAL_REGISTRY[id],
    }));

  return (
    <>
      {toRender.map((t) => (
        <t.comp id={t.id} key={t.id} {...t.props} />
      ))}
    </>
  );
};

export const Provider: React.FC<PropsWithChildren> = ({ children }) => {
  const [modals, dispatch] = useReducer(reducer, initialState);

  reducerDispatch = dispatch;

  return (
    <ModalHelperContext.Provider value={modals}>
      {children}
      <ModalHelperPlaceholder />
    </ModalHelperContext.Provider>
  );
};
