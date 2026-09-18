import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SelectItem } from "./use-select-items";
import { useSelectLoader } from "./use-select-loader";

function deferred() {
  let resolve!: (items: SelectItem[]) => void;
  const promise = new Promise<SelectItem[]>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("Select loader lifecycle", () => {
  it.each([
    "mount",
    "open",
  ] as const)("does not restart pending %s loading on open changes", async (loadOn) => {
    const request = deferred();
    const loadItems = vi.fn(() => request.promise);
    const { result, rerender } = renderHook(
      ({ open }) => useSelectLoader({ loadItems, loadOn, open }),
      { initialProps: { open: false } }
    );
    rerender({ open: true });
    rerender({ open: false });
    rerender({ open: true });
    expect(loadItems).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve([{ value: "a", label: "Ada" }]);
      await request.promise;
    });
    expect(result.current.items[0].label).toBe("Ada");
    expect(result.current.loading).toBe(false);
  });
  it("preserves only currently selected labels across refreshes", async () => {
    const loadItems = vi
      .fn()
      .mockResolvedValueOnce([
        { value: "a", label: "Ada" },
        { value: "b", label: "Ben" },
      ])
      .mockResolvedValue([]);
    const { result, rerender } = renderHook(
      ({ value }: { value: string[] }) => useSelectLoader({ loadItems, value }),
      { initialProps: { value: ["a", "b"] } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.refresh());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items.map((item) => item.label)).toEqual([
      "Ada",
      "Ben",
    ]);
    rerender({ value: ["b"] });
    expect(result.current.items.map((item) => item.label)).toEqual(["Ben"]);
    rerender({ value: ["a", "b"] });
    expect(result.current.items.map((item) => item.label)).toEqual(["Ben"]);
    rerender({ value: [] });
    rerender({ value: ["b"] });
    expect(result.current.items).toEqual([]);
  });
  it("ignores results from an unmounted loader", async () => {
    const requests = [deferred(), deferred()];
    const loadItems = vi.fn(
      (_query: string, _signal: AbortSignal) =>
        requests[loadItems.mock.calls.length - 1].promise
    );
    const first = renderHook(() => useSelectLoader({ loadItems }));
    first.unmount();
    const { result } = renderHook(() => useSelectLoader({ loadItems }));
    expect(loadItems).toHaveBeenCalledTimes(2);
    expect(loadItems.mock.calls[0][1].aborted).toBe(true);
    await act(async () => {
      requests[1].resolve([{ value: "b", label: "Ben" }]);
      await requests[1].promise;
      requests[0].resolve([{ value: "a", label: "Ada" }]);
      await requests[0].promise;
    });
    expect(result.current.items.map((item) => item.label)).toEqual(["Ben"]);
  });
});
