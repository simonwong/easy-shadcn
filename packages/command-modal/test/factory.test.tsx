import { act, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { create, show } from "../src/actions";
import { createCommandModal } from "../src/create-command-modal";
import type { CommandModalHandler } from "../src/type";

describe("createCommandModal factory (issue #72)", () => {
  it("injects the adapter, so modalProps comes from it (not the shadcn default)", async () => {
    const adapter = (handler: CommandModalHandler) => ({
      open: handler.visible,
      onCancel: () => handler.hide(),
      marker: "factory-adapter" as const,
    });
    const { Provider, useModal } = createCommandModal(adapter);

    let captured: ReturnType<typeof adapter> | undefined;
    const TestModal = create(() => {
      const modal = useModal();
      captured = modal.modalProps;
      return modal.visible ? <div data-testid="m">content</div> : null;
    });

    render(
      <Provider>
        <TestModal id="factory-marker" />
      </Provider>
    );
    act(() => {
      show("factory-marker");
    });

    await waitFor(() => {
      expect(captured?.marker).toBe("factory-adapter");
      expect(captured?.open).toBe(true);
    });
  });

  it("wires adapter callbacks to handler verbs (onCancel hides the modal)", async () => {
    const adapter = (handler: CommandModalHandler) => ({
      open: handler.visible,
      onCancel: () => handler.hide(),
    });
    const { Provider, useModal } = createCommandModal(adapter);

    let captured: ReturnType<typeof adapter> | undefined;
    const TestModal = create(() => {
      const modal = useModal();
      captured = modal.modalProps;
      return modal.visible ? (
        <div data-testid="open">open</div>
      ) : (
        <div data-testid="closed">closed</div>
      );
    });

    const { getByTestId } = render(
      <Provider>
        <TestModal id="factory-cancel" />
      </Provider>
    );
    act(() => {
      show("factory-cancel");
    });
    await waitFor(() => getByTestId("open"));

    act(() => {
      captured?.onCancel();
    });
    await waitFor(() => getByTestId("closed"));
  });

  it("keeps modalProps referentially stable across a state-only re-render", async () => {
    const adapter = (handler: CommandModalHandler) => ({
      open: handler.visible,
      onCancel: () => handler.hide(),
    });
    const { Provider, useModal } = createCommandModal(adapter);

    let captured: unknown;
    let renderCount = 0;
    let forceRerender: () => void = () => {
      // assigned on first render
    };
    const TestModal = create(() => {
      const modal = useModal();
      const [, setTick] = useState(0);
      forceRerender = () => setTick((t) => t + 1);
      renderCount += 1;
      captured = modal.modalProps;
      return modal.visible ? <div data-testid="m">m</div> : null;
    });

    render(
      <Provider>
        <TestModal id="factory-memo" />
      </Provider>
    );
    act(() => {
      show("factory-memo");
    });
    await waitFor(() => expect(captured).toBeDefined());

    const snapshot = captured;
    const countBefore = renderCount;
    act(() => {
      forceRerender();
    });
    await waitFor(() => expect(renderCount).toBeGreaterThan(countBefore));

    // modalProps must be the SAME reference across a state-only re-render. A
    // naive `{ ...m, modalProps: adapter(m) }` factory would mint a fresh object
    // every render and break this — and downstream memoization with it.
    expect(captured).toBe(snapshot);
  });
});
