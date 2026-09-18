import { act, render, renderHook, screen } from "@testing-library/react";
import { type PropsWithChildren, StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { create, register, unregister } from "../src/actions";
import { Provider } from "../src/context";
import { ModalDef } from "../src/holders";
import { useModal } from "../src/useModal";

const Modal = create(() => null);
const Wrapper = ({ children }: PropsWithChildren) => (
  <Provider>
    <Modal id="shared" />
    {children}
  </Provider>
);

describe("Provider promise ownership", () => {
  it("isolates show and hide results for the same modal id", async () => {
    const first = renderHook(() => useModal("shared"), { wrapper: Wrapper });
    const second = renderHook(() => useModal("shared"), { wrapper: Wrapper });
    let a!: Promise<unknown>;
    let b!: Promise<unknown>;
    act(() => {
      a = first.result.current.show();
      b = second.result.current.show();
    });
    expect(a).not.toBe(b);
    const observed = vi.fn();
    b.then(observed);
    act(() => {
      first.result.current.resolve("first");
    });
    await expect(a).resolves.toBe("first");
    expect(observed).not.toHaveBeenCalled();
    act(() => {
      second.result.current.resolve("second");
    });
    await expect(b).resolves.toBe("second");
    act(() => {
      a = first.result.current.hide();
      b = second.result.current.hide();
    });
    expect(a).not.toBe(b);
    act(() => {
      first.result.current.resolveHide("first close");
      second.result.current.resolveHide("second close");
    });
    await expect(a).resolves.toBe("first close");
    await expect(b).resolves.toBe("second close");
  });
  it.each([
    "show",
    "hide",
  ] as const)("settles pending %s on unmount without settling another Provider", async (method) => {
    const first = renderHook(() => useModal("shared"), { wrapper: Wrapper });
    const second = renderHook(() => useModal("shared"), { wrapper: Wrapper });
    let a!: Promise<unknown>;
    let b!: Promise<unknown>;
    act(() => {
      first.result.current.show();
      second.result.current.show();
      a = first.result.current[method]();
      b = second.result.current[method]();
    });
    const observed = vi.fn();
    b.then(observed);
    first.unmount();
    await expect(a).resolves.toBeUndefined();
    expect(observed).not.toHaveBeenCalled();
    second.unmount();
    await expect(b).resolves.toBeUndefined();
  });
  it("keeps promises active across StrictMode effect replay", async () => {
    const hook = renderHook(() => useModal("shared"), {
      wrapper: ({ children }: PropsWithChildren) => (
        <StrictMode>
          <Wrapper>{children}</Wrapper>
        </StrictMode>
      ),
    });
    let promise!: Promise<unknown>;
    act(() => {
      promise = hook.result.current.show();
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      hook.result.current.resolve("kept");
    });
    await expect(promise).resolves.toBe("kept");
  });
});

describe("Provider registration ownership", () => {
  const Registered = create(() => (
    <div data-testid="registered-modal">modal</div>
  ));
  it("global unregister settles and removes the modal in every Provider", async () => {
    register("global-shared", Registered);
    const first = renderHook(() => useModal("global-shared"), {
      wrapper: Provider,
    });
    const second = renderHook(() => useModal("global-shared"), {
      wrapper: Provider,
    });
    let a!: Promise<unknown>;
    let b!: Promise<unknown>;
    act(() => {
      a = first.result.current.show();
      b = second.result.current.show();
    });
    expect(screen.getAllByTestId("registered-modal")).toHaveLength(2);
    act(() => {
      unregister("global-shared");
    });
    await expect(a).resolves.toBeUndefined();
    await expect(b).resolves.toBeUndefined();
    expect(screen.queryByTestId("registered-modal")).toBeNull();
    expect(second.result.current.visible).toBe(false);
  });
  it("removing a declaration preserves a sibling declaration and pending result", async () => {
    const first = render(
      <Provider>
        <ModalDef component={Registered} id="declared-shared" />
      </Provider>
    );
    const second = renderHook(() => useModal("declared-shared"), {
      wrapper: ({ children }: PropsWithChildren) => (
        <Provider>
          <ModalDef component={Registered} id="declared-shared" />
          {children}
        </Provider>
      ),
    });
    first.unmount();
    let pending!: Promise<unknown>;
    act(() => {
      pending = second.result.current.show();
    });
    second.rerender();
    expect(screen.getByTestId("registered-modal")).toBeTruthy();
    act(() => {
      second.result.current.resolve("kept");
    });
    await expect(pending).resolves.toBe("kept");
  });
});
