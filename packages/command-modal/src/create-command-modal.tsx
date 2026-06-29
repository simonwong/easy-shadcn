"use client";

import type { PropsWithChildren } from "react";
import { Provider as BaseProvider } from "./context";
import type {
  CommandModalConfig,
  ModalPropsAdapter,
  UseModalReturn,
} from "./type";
import { useModal as baseUseModal } from "./useModal";

/**
 * Create a typed CommandModal binding for a specific adapter.
 *
 * Returns a `Provider` pre-bound to `adapter` and a `useModal` whose
 * `modalProps` is statically typed as the adapter's return type — so antd / mui
 * / any-library consumers get full type safety with no per-call casts. shadcn
 * users don't need this: the package-root `useModal` is already shadcn-typed.
 *
 * Call this once at module scope (e.g. an app-local `lib/modal.ts` barrel).
 * Calling it inside a render would mint a new `Provider` component identity each
 * render and remount the whole modal tree.
 *
 * @example
 * ```tsx
 * // lib/modal.ts
 * export const { Provider, useModal } = createCommandModal(antdModalProps);
 * ```
 */
export function createCommandModal<TModalProps>(
  adapter: ModalPropsAdapter<TModalProps>
) {
  // Stable, module-scoped config object. The base Provider already memoizes on
  // the adapter identity, so a fresh wrapper render never invalidates
  // downstream consumers.
  const config: CommandModalConfig<TModalProps> = {
    modalPropsAdapter: adapter,
  };

  const Provider = ({ children }: PropsWithChildren) => (
    <BaseProvider config={config as CommandModalConfig}>
      {children}
    </BaseProvider>
  );

  // Type-only reskin: the SAME runtime hook, re-typed so `modalProps` is the
  // adapter's `TModalProps`. The configured adapter is applied at runtime inside
  // the base hook via the config context this Provider injects — so we must NOT
  // re-wrap or re-invoke `adapter` here (that would double-run it and break the
  // base hook's memoization).
  const useModal = baseUseModal as unknown as UseModalReturn<TModalProps>;

  return { Provider, useModal };
}
