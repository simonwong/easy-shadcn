import { symModalId } from './symbol';
import type { CreateModalComponent, CommandModalCallbacks } from './type';

export const MODAL_REGISTRY: {
  [id: string]: {
    comp: CreateModalComponent;
    props?: Record<string, unknown>;
  };
} = {};
// biome-ignore lint/suspicious/noExplicitAny: allow
export const ALREADY_MOUNTED: Record<string, any> = {};

let uidSeed = 0;
export const getUid = () => `_nice_modal_${uidSeed++}`;

export const modalCallbacks: CommandModalCallbacks = {};
export const hideModalCallbacks: CommandModalCallbacks = {};

// Get modal component by modal id
export function getModal(modalId: string): CreateModalComponent | undefined {
  return MODAL_REGISTRY[modalId]?.comp;
}

export function getModalId(modal: string | CreateModalComponent): string {
  if (typeof modal === 'string') {
    return modal;
  }
  if (!modal[symModalId]) {
    modal[symModalId] = getUid();
  }
  return modal[symModalId];
}
