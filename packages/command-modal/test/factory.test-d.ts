import { describe, expectTypeOf, it } from "vitest";
import { createCommandModal } from "../src/create-command-modal";
import type { CommandModalHandler, ShadCNModalProps } from "../src/type";
import { useModal as rootUseModal } from "../src/useModal";

type AntdLikeProps = {
  open: boolean;
  onCancel: () => void;
};

const antdLikeAdapter = (handler: CommandModalHandler): AntdLikeProps => ({
  open: handler.visible,
  onCancel: () => handler.hide(),
});

describe("createCommandModal factory (issue #72)", () => {
  it("types modalProps as the adapter's return type", () => {
    const { useModal } = createCommandModal(antdLikeAdapter);
    const Modal = (() => null) as React.FC<{ name: string }>;
    expectTypeOf(useModal(Modal).modalProps).toEqualTypeOf<AntdLikeProps>();
  });

  it("returns only { Provider, useModal }", () => {
    const api = createCommandModal(antdLikeAdapter);
    expectTypeOf(api).toEqualTypeOf<{
      Provider: typeof api.Provider;
      useModal: typeof api.useModal;
    }>();
  });

  it("root useModal still types modalProps as ShadCNModalProps", () => {
    const Modal = (() => null) as React.FC<{ name: string }>;
    expectTypeOf(
      rootUseModal(Modal).modalProps
    ).toEqualTypeOf<ShadCNModalProps>();
  });
});
