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
 * Generates a unique modal ID for auto-registration fallback.
 *
 * Note: this is NOT SSR-safe — the counter is module-level state shared
 * across concurrent SSR requests in the same Node process. It remains in
 * use only as a last-resort id source for component-reference lookups
 * (see `getModalId`). Render-time ids should be generated via
 * `React.useId()` instead (see `ModalHolder`).
 */
export const getUid = () => `_command_modal_${modalIdCounter++}`;

export const modalCallbacks: CommandModalCallbacks = {};
export const hideModalCallbacks: CommandModalCallbacks = {};

/**
 * Stable mapping from component reference → auto-generated id. Replaces
 * the previous approach of mutating the component function itself with a
 * symbol property, which:
 *   - violated React's render-purity rule when called during render,
 *   - cross-contaminated component functions between concurrent SSR
 *     requests in the same Node process,
 *   - failed on frozen component functions (TypeError).
 *
 * The WeakMap isolates the id store from the component identity and lets
 * the component be frozen / shared freely.
 */
const COMPONENT_ID_MAP = new WeakMap<CreateModalComponent, string>();

// Get modal component by modal id
export function getModal(modalId: string): CreateModalComponent | undefined {
  return MODAL_REGISTRY[modalId]?.comp;
}

export function getModalId(modal: string | CreateModalComponent): string {
  if (typeof modal === "string") {
    return modal;
  }
  const existing = COMPONENT_ID_MAP.get(modal);
  if (existing) {
    return existing;
  }
  const id = getUid();
  COMPONENT_ID_MAP.set(modal, id);
  return id;
}
