import { symModalId } from "./symbol";
import type { CommandModalCallbacks, CreateModalComponent } from "./type";

export const MODAL_REGISTRY: {
  [id: string]: {
    comp: CreateModalComponent;
    props?: Record<string, unknown>;
  };
} = {};

/**
 * Tracks which modals have been mounted at least once.
 * Used to determine if a modal needs initial mounting or can be shown directly.
 */
export const ALREADY_MOUNTED: Record<string, boolean> = {};

let modalIdCounter = 0;
/**
 * Generates a unique modal ID for auto-registration.
 * This is used when modals are created without explicit IDs.
 */
export const getUid = () => `_command_modal_${modalIdCounter++}`;

export const modalCallbacks: CommandModalCallbacks = {};
export const hideModalCallbacks: CommandModalCallbacks = {};

// Get modal component by modal id
export function getModal(modalId: string): CreateModalComponent | undefined {
  return MODAL_REGISTRY[modalId]?.comp;
}

export function getModalId(modal: string | CreateModalComponent): string {
  if (typeof modal === "string") {
    return modal;
  }
  if (!modal[symModalId]) {
    modal[symModalId] = getUid();
  }
  return modal[symModalId];
}
