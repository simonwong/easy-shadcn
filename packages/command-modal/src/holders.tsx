"use client";

import { useCallback, useContext, useEffect, useMemo } from "react";
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
  handler.show = useCallback(
    (args: unknown) =>
      showWithDispatch(
        modalId,
        args as Record<string, unknown> | undefined,
        scopedDispatch
      ),
    [modalId, scopedDispatch]
  );
  handler.hide = useCallback(
    () => hideWithDispatch(modalId, scopedDispatch),
    [modalId, scopedDispatch]
  );

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
