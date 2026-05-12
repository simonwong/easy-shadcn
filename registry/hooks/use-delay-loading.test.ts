import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDelayLoading } from "./use-delay-loading";

// Explicit minDuration so behavior tests don't depend on the default value.
const BASE_OPTS = { minDuration: 500 };

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDelayLoading", () => {
  it("starts as false", () => {
    const { result } = renderHook(() => useDelayLoading(BASE_OPTS));
    expect(result.current[0]).toBe(false);
  });

  // ---- Spec ----
  // Rule 1: Initial controlled value drives the first-render result.
  // Rule 2: Controlled false→true reflects immediately (no delay).
  // Rule 3: Uncontrolled — setLoading(true) shows immediately,
  //         setLoading(false) waits minDuration before hiding.

  it("Rule 1: returns the initial controlled value on the very first render (loading=false)", () => {
    const { result } = renderHook(() =>
      useDelayLoading({ ...BASE_OPTS, loading: false })
    );
    expect(result.current[0]).toBe(false);
  });

  it("Rule 1: returns the initial controlled value on the very first render (loading=true)", () => {
    const { result } = renderHook(() =>
      useDelayLoading({ ...BASE_OPTS, loading: true })
    );
    expect(result.current[0]).toBe(true);
  });

  it("Rule 2: controlled false→true updates the returned value immediately on rerender", () => {
    const { result, rerender } = renderHook(
      ({ loading }: { loading: boolean | undefined }) =>
        useDelayLoading({ ...BASE_OPTS, loading }),
      { initialProps: { loading: false as boolean | undefined } }
    );
    expect(result.current[0]).toBe(false);
    rerender({ loading: true });
    expect(result.current[0]).toBe(true);
  });

  it("Rule 3: uncontrolled — setLoading(true) shows immediately, setLoading(false) waits minDuration", () => {
    const { result } = renderHook(() => useDelayLoading({ minDuration: 200 }));
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](false);
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current[0]).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current[0]).toBe(false);
  });

  it("shows loading immediately when setLoading(true) is called", () => {
    const { result } = renderHook(() => useDelayLoading(BASE_OPTS));
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);
  });

  it("keeps the spinner visible for at least minDuration ms", () => {
    const { result } = renderHook(() => useDelayLoading(BASE_OPTS));
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);

    // Stop loading 50ms after shown
    act(() => {
      vi.advanceTimersByTime(50);
    });
    act(() => {
      result.current[1](false);
    });
    expect(result.current[0]).toBe(true);

    // Should stay visible until total visible time reaches minDuration (500ms)
    act(() => {
      vi.advanceTimersByTime(449);
    });
    expect(result.current[0]).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current[0]).toBe(false);
  });

  it("hides immediately when elapsed already exceeds minDuration", () => {
    const { result } = renderHook(() => useDelayLoading(BASE_OPTS));
    act(() => {
      result.current[1](true);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(true);
    act(() => {
      result.current[1](false);
    });
    expect(result.current[0]).toBe(false);
  });

  it("respects a custom minDuration value", () => {
    const { result } = renderHook(() => useDelayLoading({ minDuration: 1000 }));
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);
    act(() => {
      result.current[1](false);
    });
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current[0]).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current[0]).toBe(false);
  });

  it("hides immediately when minDuration is 0", () => {
    const { result } = renderHook(() => useDelayLoading({ minDuration: 0 }));
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);
    act(() => {
      result.current[1](false);
    });
    expect(result.current[0]).toBe(false);
  });

  it("defaults minDuration to 200ms when not provided", () => {
    const { result } = renderHook(() => useDelayLoading());
    act(() => {
      result.current[1](true);
    });
    act(() => {
      result.current[1](false);
    });
    // Default minDuration keeps spinner visible
    expect(result.current[0]).toBe(true);
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current[0]).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current[0]).toBe(false);
  });

  it("controlled mode: external loading prop drives the display", () => {
    const { result, rerender } = renderHook(
      ({ loading }: { loading: boolean }) =>
        useDelayLoading({ ...BASE_OPTS, loading }),
      { initialProps: { loading: false } }
    );
    expect(result.current[0]).toBe(false);

    rerender({ loading: true });
    expect(result.current[0]).toBe(true);

    rerender({ loading: false });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current[0]).toBe(false);
  });

  it("controlled mode: setLoading is ignored when controlled is true", () => {
    const { result } = renderHook(() =>
      useDelayLoading({ ...BASE_OPTS, loading: true })
    );
    expect(result.current[0]).toBe(true);
    act(() => {
      result.current[1](false);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(true);
  });

  it("cancels pending hide when loading restarts mid minDuration", () => {
    const { result } = renderHook(() => useDelayLoading(BASE_OPTS));
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);

    // Stop loading 100ms after shown
    act(() => {
      vi.advanceTimersByTime(100);
    });
    act(() => {
      result.current[1](false);
    });
    expect(result.current[0]).toBe(true); // hide scheduled

    // Restart loading before hide fires
    act(() => {
      result.current[1](true);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(true);
  });

  it("cleans up pending hide timer on unmount", () => {
    const { result, unmount } = renderHook(() => useDelayLoading(BASE_OPTS));
    act(() => {
      result.current[1](true);
    });
    act(() => {
      result.current[1](false);
    });
    expect(() => {
      unmount();
      vi.advanceTimersByTime(1000);
    }).not.toThrow();
  });

  it("setLoading(true) while already shown does not reset minDuration timer", () => {
    const { result } = renderHook(() => useDelayLoading(BASE_OPTS));
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);

    // Re-trigger setLoading(true) while already visible; should not affect state
    act(() => {
      result.current[1](true);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(true);
  });

  it("setLoading(false) when never set to true is a safe no-op", () => {
    const { result } = renderHook(() => useDelayLoading(BASE_OPTS));
    act(() => {
      result.current[1](false);
    });
    expect(result.current[0]).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(false);
  });

  it("transition controlled → uncontrolled preserves state and returns control to setLoading", () => {
    const { result, rerender } = renderHook(
      ({ loading }: { loading?: boolean }) =>
        useDelayLoading({ ...BASE_OPTS, loading }),
      { initialProps: { loading: true as boolean | undefined } }
    );
    expect(result.current[0]).toBe(true);

    // Releasing control should NOT drop the spinner — the synced internal
    // state inherits the last controlled value (true) for a seamless handoff.
    rerender({ loading: undefined });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(true);

    // Now the consumer drives state via setLoading.
    act(() => {
      result.current[1](false);
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current[0]).toBe(false);
  });

  it("transition uncontrolled → controlled lets the prop take over", () => {
    const { result, rerender } = renderHook(
      ({ loading }: { loading?: boolean }) =>
        useDelayLoading({ ...BASE_OPTS, loading }),
      { initialProps: { loading: undefined as boolean | undefined } }
    );
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);

    // Parent takes control and turns it off
    rerender({ loading: false });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current[0]).toBe(false);
  });

  it("treats negative minDuration as no minimum (immediate hide)", () => {
    const { result } = renderHook(() => useDelayLoading({ minDuration: -100 }));
    act(() => {
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);
    act(() => {
      result.current[1](false);
    });
    expect(result.current[0]).toBe(false);
  });

  it("survives 3+ rapid show/hide cycles without leaking timers", () => {
    const { result } = renderHook(() => useDelayLoading(BASE_OPTS));
    for (let i = 0; i < 4; i++) {
      act(() => {
        result.current[1](true);
      });
      expect(result.current[0]).toBe(true);
      act(() => {
        result.current[1](false);
      });
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current[0]).toBe(false);
    }
    expect(vi.getTimerCount()).toBe(0);
  });
});
