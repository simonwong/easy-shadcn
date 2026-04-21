import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { create, show } from "../src/actions";
import { Provider } from "../src/context";
import { useModal } from "../src/useModal";

/**
 * Regression tests for C8: the create() HOC's render output spreads
 * `{...props, ...args}` into the inner component. Without filtering,
 * args can override the HOC's reserved props (`id`, `defaultVisible`,
 * `keepMounted`) — letting a caller accidentally (or maliciously) do
 * `show("x", { id: "different" })` and have the inner component see
 * the wrong id in its CommandModalIdContext / props.
 */
describe("create() HOC args reserved-key filtering (C8)", () => {
  it("does not let args override the id prop reaching the inner component", async () => {
    const observedIds: unknown[] = [];

    const Inner: React.FC<{ value?: string; id?: string }> = (props) => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      observedIds.push(props.id);
      return (
        <div data-testid="c8-inner">
          inner-id:{String(props.id)}
          modal-id:{modal.id}
        </div>
      );
    };

    const TestModal = create(Inner);

    render(
      <Provider>
        <TestModal id="real-id" />
      </Provider>
    );

    act(() => {
      // Caller passes `id` in args — a reserved HOC prop that would
      // otherwise clobber the one declared on the JSX.
      show("real-id", { id: "hijacked-id", value: "ok" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("c8-inner")).toBeInTheDocument();
    });

    // The inner component's `id` prop must stay as what JSX declared
    // (undefined in this arrangement — HOC consumes it) or at worst the
    // real id, never the hijacked one.
    expect(observedIds).not.toContain("hijacked-id");
  });

  it("does not let useModal(Component, args) registry props override the HOC id", async () => {
    const Inner: React.FC<{ id?: string; value?: string }> = ({
      id,
      value,
    }) => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return (
        <div data-testid="c8-registry-props">
          inner-id:{String(id)}
          value:{value}
          modal-id:{modal.id}
        </div>
      );
    };

    const TestModal = create(Inner);

    const Consumer = () => {
      const modal = useModal(TestModal, {
        id: "hijacked-id",
        value: "ok",
      });
      return (
        <button
          data-testid="c8-registry-show"
          onClick={() => {
            modal.show();
          }}
          type="button"
        >
          show
        </button>
      );
    };

    render(
      <Provider>
        <Consumer />
      </Provider>
    );

    act(() => {
      screen.getByTestId("c8-registry-show").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("c8-registry-props")).toHaveTextContent(
        "value:ok"
      );
    });
    expect(screen.getByTestId("c8-registry-props")).not.toHaveTextContent(
      "hijacked-id"
    );
  });

  it("does not let args toggle defaultVisible or keepMounted via spread", async () => {
    let observedKeepMounted: unknown;

    const Inner: React.FC<{
      value?: string;
      defaultVisible?: boolean;
      keepMounted?: boolean;
    }> = (props) => {
      const modal = useModal();
      observedKeepMounted = props.keepMounted;
      if (!modal.visible) {
        return null;
      }
      return (
        <div data-testid="c8-reserved">
          defaultVisible={String(props.defaultVisible)}
          keepMounted={String(props.keepMounted)}
        </div>
      );
    };

    const TestModal = create(Inner);

    render(
      <Provider>
        <TestModal id="reserved-keys" />
      </Provider>
    );

    act(() => {
      show("reserved-keys", {
        defaultVisible: true,
        keepMounted: true,
        value: "ok",
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("c8-reserved")).toBeInTheDocument();
    });

    // Reserved props must not leak through to the inner component — the
    // HOC's contract is that they configure the HOC itself, not the
    // inner component.
    expect(observedKeepMounted).toBeUndefined();
  });

  it("still forwards non-reserved args untouched", async () => {
    const Inner: React.FC<{ greeting: string; count: number }> = ({
      greeting,
      count,
    }) => {
      const modal = useModal();
      if (!modal.visible) {
        return null;
      }
      return (
        <div data-testid="c8-ok">
          {greeting}:{count}
        </div>
      );
    };

    const TestModal = create(Inner);

    render(
      <Provider>
        <TestModal id="pass-through" />
      </Provider>
    );

    act(() => {
      show("pass-through", { greeting: "hi", count: 42 });
    });

    await waitFor(() => {
      expect(screen.getByTestId("c8-ok")).toHaveTextContent("hi:42");
    });
  });
});
