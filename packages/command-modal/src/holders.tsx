"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import {
  hideWithDispatch,
  register,
  removeWithDispatch,
  showWithDispatch,
  unregisterWithDispatch,
} from "./actions";
import { getUid, MODAL_REGISTRY } from "./constants";
import { CommandModalDispatchContext } from "./context";
import type { CreateModalComponent } from "./type";

/**
 * Declarative way to register a modal.
 * @param id - The id of the modal.
 * @param component - The modal Component.
 * @returns
 */
export const ModalDef = ({
  id,
  component,
}: {
  id: string;
  component: React.FC;
}) => {
  // Capture the dispatch of the enclosing Provider at setup so that the
  // cleanup can remove state from that same Provider — not whatever happens
  // to be on top of the global stack at unmount time.
  const scopedDispatch = useContext(CommandModalDispatchContext);
  useEffect(() => {
    register(id, component);
    return () => {
      unregisterWithDispatch(id, scopedDispatch);
    };
  }, [id, component, scopedDispatch]);
  return null;
};

export type ModalHolderActions = {
  show: (args?: unknown) => Promise<unknown>;
  hide: () => Promise<unknown>;
};

/**
 * A place holder allows to bind props to a modal.
 * It assigns show/hide methods to handler object to show/hide the modal.
 *
 * Comparing to use the <MyNiceModal id=../> directly, this approach allows use registered modal id to find the modal component.
 * Also it avoids to create unique id for MyNiceModal.
 *
 * Timing contract: `handler.show` and `handler.hide` are installed in a
 * layout effect after the first commit. They are guaranteed to be defined
 * by the time any user event can fire (events can only fire after paint),
 * but will be `undefined` if read synchronously during the same render pass
 * that first mounts the holder. Use them imperatively from event handlers,
 * not from render or from effects that race with the holder's own layout
 * effect.
 *
 * @param modal - The modal id registered or a modal component.
 * @param handler - The handler object to control the modal.
 * @returns
 */
export function ModalHolder<T>({
  modal,
  handler,
  ...restProps
}: {
  modal: string | CreateModalComponent<T>;
  handler: ModalHolderActions;
} & T) {
  const modalId = useMemo(() => getUid(), []);
  const ModalComp =
    typeof modal === "string"
      ? (MODAL_REGISTRY[modal]?.comp as CreateModalComponent<T>)
      : modal;

  if (!ModalComp && typeof modal === "string") {
    throw new Error(
      `No modal found for id: ${modal} in CommandModal.ModalHolder.`
    );
  }

  const scopedDispatch = useContext(CommandModalDispatchContext);
  const showCallback = useCallback(
    (args: unknown) =>
      showWithDispatch(
        modalId,
        args as Record<string, unknown> | undefined,
        scopedDispatch
      ),
    [modalId, scopedDispatch]
  );
  const hideCallback = useCallback(
    () => hideWithDispatch(modalId, scopedDispatch),
    [modalId, scopedDispatch]
  );

  // Mutate the externally-owned `handler` object in the commit phase, not
  // during render. Render must stay side-effect-free (React purity rule);
  // mutating an outside object during render is fragile under concurrent
  // rendering and StrictMode, where renders can be discarded. useLayoutEffect
  // runs synchronously after commit, so imperative callers that invoke
  // `handler.show(...)` in response to a user event still see the installed
  // methods — their events can only fire after the initial paint.
  useLayoutEffect(() => {
    handler.show = showCallback;
    handler.hide = hideCallback;
  }, [handler, showCallback, hideCallback]);

  // ModalHolder owns an auto-generated id that has no lifetime beyond the
  // holder component itself. When the holder unmounts, nothing else will ever
  // reference this id again, so tear down reducer state, promise callbacks,
  // and the ALREADY_MOUNTED flag — otherwise a keyed list that rapidly
  // remounts holders leaks one set of entries per lifecycle.
  useEffect(
    () => () => {
      removeWithDispatch(modalId, scopedDispatch);
    },
    [modalId, scopedDispatch]
  );

  return <ModalComp id={modalId} {...(restProps as T)} />;
}
