import { useCallback, useEffect, useMemo } from 'react';
import { hide, register, show, unregister } from './actions';
import { getUid, MODAL_REGISTRY } from './constants';
import type { CreateModalComponent } from './type';

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
  useEffect(() => {
    register(id, component);
    return () => {
      unregister(id);
    };
  }, [id, component]);
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
    typeof modal === 'string'
      ? (MODAL_REGISTRY[modal]?.comp as CreateModalComponent<T>)
      : modal;

  if (!ModalComp && typeof modal === 'string') {
    throw new Error(
      `No modal found for id: ${modal} in CommandModal.ModalHolder.`
    );
  }

  handler.show = useCallback(
    (args: unknown) => show(modalId, args),
    [modalId]
  );
  handler.hide = useCallback(() => hide(modalId), [modalId]);

  return <ModalComp id={modalId} {...(restProps as T)} />;
}
