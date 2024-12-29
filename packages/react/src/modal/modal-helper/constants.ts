import type { CreateModalComponent, ModalHelperCallbacks } from './type';
import { symModalId } from './symbol';

export const MODAL_REGISTRY: {
  [id: string]: {
    comp: CreateModalComponent;
    props?: Record<string, unknown>;
  };
} = {};
export const ALREADY_MOUNTED = {};

let uidSeed = 0;
export const getUid = () => `_nice_modal_${uidSeed++}`;

export const modalCallbacks: ModalHelperCallbacks = {};
export const hideModalCallbacks: ModalHelperCallbacks = {};

// Get modal component by modal id
export function getModal(modalId: string): CreateModalComponent | undefined {
  return MODAL_REGISTRY[modalId]?.comp;
}

export function getModalId(modal: string | CreateModalComponent): string {
  if (typeof modal === 'string') return modal;
  if (!modal[symModalId]) {
    modal[symModalId] = getUid();
  }
  return modal[symModalId];
}
