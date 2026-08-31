import { act, fireEvent, render, screen } from "@testing-library/react";
// @ts-expect-error The runtime server entry exists; this repo does not hoist its peer-only types package.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Slider } from "./slider";

describe("Slider", () => {
  it("renders one slider at the minimum with a visible accessible label", async () => {
    render(<Slider label="Volume" />);

    const label = screen.getByText("Volume");
    const sliders = await screen.findAllByRole("slider", { hidden: true });

    expect(sliders).toHaveLength(1);
    expect((sliders[0] as HTMLInputElement).value).toBe("0");
    expect(sliders[0].getAttribute("aria-labelledby")?.split(" ")).toContain(
      label.id
    );
  });

  it("shows the default value and follows uncontrolled changes", async () => {
    render(<Slider defaultValue={25} label="Brightness" />);

    const slider = (
      await screen.findAllByRole("slider", {
        hidden: true,
      })
    )[0];

    expect(screen.getByText("25")).toBeTruthy();

    fireEvent.change(slider, { target: { value: "40" } });

    expect(screen.getByText("40")).toBeTruthy();
  });

  it("keeps the visible value unchanged when a change is canceled", async () => {
    const onValueChange = vi.fn((_value, details) => {
      details.cancel();
    });
    render(
      <Slider
        defaultValue={25}
        label="Brightness"
        onValueChange={onValueChange}
      />
    );

    const slider = (
      await screen.findAllByRole("slider", {
        hidden: true,
      })
    )[0];

    fireEvent.change(slider, { target: { value: "40" } });

    expect(onValueChange).toHaveBeenCalledWith(
      40,
      expect.objectContaining({ reason: "input-change" })
    );
    expect(screen.getByText("25")).toBeTruthy();
    expect(screen.queryByText("40")).toBeNull();
  });

  it("can hide the value and style the public slots", async () => {
    const { container } = render(
      <Slider
        className="control-x"
        label="Volume"
        labelClassName="label-x"
        showValue={false}
        valueClassName="value-x"
      />
    );

    await screen.findAllByRole("slider", { hidden: true });
    expect(
      container.querySelector('[data-slot="slider"]')?.className
    ).toContain("control-x");
    expect(screen.getByText("Volume").className).toContain("label-x");
    expect(container.querySelector('[data-slot="slider-value"]')).toBeNull();
  });

  it("keeps controlled values authoritative and unwraps native callbacks", async () => {
    const onValueChange = vi.fn();
    const onValueCommitted = vi.fn();
    const { container, rerender } = render(
      <Slider
        label="Temperature"
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
        value={20}
      />
    );
    const root = container.querySelector('[data-slot="slider"]');
    const slider = (
      await screen.findAllByRole("slider", {
        hidden: true,
      })
    )[0];

    fireEvent.change(slider, { target: { value: "30" } });

    expect(onValueChange).toHaveBeenCalledWith(
      30,
      expect.objectContaining({ reason: "input-change" })
    );
    expect(onValueCommitted).toHaveBeenCalledWith(
      30,
      expect.objectContaining({ reason: "input-change" })
    );
    expect(screen.getByText("20")).toBeTruthy();

    rerender(
      <Slider
        label="Temperature"
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
        value={35}
      />
    );

    expect(container.querySelector('[data-slot="slider"]')).toBe(root);
    expect(screen.getByText("35")).toBeTruthy();
    expect((slider as HTMLInputElement).value).toBe("35");
  });

  it("delegates bounds, steps, orientation, and disabled state", async () => {
    const { container } = render(
      <Slider
        defaultValue={20}
        disabled
        label="Zoom"
        largeStep={15}
        max={90}
        min={10}
        orientation="vertical"
        step={5}
        thumbAlignment="center"
      />
    );
    const slider = (
      await screen.findAllByRole("slider", {
        hidden: true,
      })
    )[0] as HTMLInputElement;
    const root = container.querySelector('[data-slot="slider"]');

    expect(slider.min).toBe("10");
    expect(slider.max).toBe("90");
    expect(slider.step).toBe("5");
    expect(slider.disabled).toBe(true);
    expect(slider.getAttribute("aria-orientation")).toBe("vertical");
    expect(root?.getAttribute("data-orientation")).toBe("vertical");
  });

  it("uses the primitive large step for Page Up", async () => {
    render(
      <Slider
        defaultValue={20}
        label="Zoom"
        largeStep={15}
        max={90}
        min={10}
        step={5}
      />
    );
    const slider = (
      await screen.findAllByRole("slider", {
        hidden: true,
      })
    )[0] as HTMLInputElement;

    fireEvent.keyDown(slider, { key: "PageUp" });

    expect(slider.value).toBe("35");
    expect(screen.getByText("35")).toBeTruthy();
  });

  it("merges caller labeling with the visible label", async () => {
    render(
      <>
        <span id="slider-context">Playback setting</span>
        <Slider aria-labelledby="slider-context" label="Volume" />
      </>
    );
    const label = screen.getByText("Volume");
    const slider = (
      await screen.findAllByRole("slider", {
        hidden: true,
      })
    )[0];
    const labelledBy = slider.getAttribute("aria-labelledby")?.split(" ");

    expect(labelledBy).toContain(label.id);
    expect(labelledBy).toContain("slider-context");
  });

  it("forwards form identity, style, data attributes, and native events", async () => {
    const onClick = vi.fn();
    render(
      <form data-testid="settings-form">
        <Slider
          data-testid="volume-slider"
          defaultValue={25}
          label="Volume"
          name="volume"
          onClick={onClick}
          style={{ opacity: 0.5 }}
        />
      </form>
    );
    const form = screen.getByTestId("settings-form") as HTMLFormElement;
    const root = screen.getByTestId("volume-slider");

    await screen.findAllByRole("slider", { hidden: true });
    fireEvent.click(root);

    expect(new FormData(form).get("volume")).toBe("25");
    expect(root.style.opacity).toBe("0.5");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("emits the label relationship in server markup", () => {
    const html = renderToStaticMarkup(<Slider label="Server volume" />);
    const container = document.createElement("div");
    container.innerHTML = html;
    const label = container.querySelector('[data-slot="slider-label"]');
    const input = container.querySelector('input[type="range"]');

    expect(label).not.toBeNull();
    expect(label?.id).toBeTruthy();
    expect(input?.getAttribute("aria-labelledby")?.split(" ")).toContain(
      label?.id
    );
  });

  describe("multiple thumbs", () => {
    it("defaults to min and max with distinct accessible thumb names", async () => {
      render(
        <Slider
          label="Price range"
          max={500}
          min={100}
          multiple
          thumbLabels={["Minimum price", "Maximum price"]}
        />
      );

      const sliders = await screen.findAllByRole("slider", { hidden: true });
      expect(sliders).toHaveLength(2);
      expect((sliders[0] as HTMLInputElement).value).toBe("100");
      expect((sliders[1] as HTMLInputElement).value).toBe("500");
      expect(sliders[0].getAttribute("aria-label")).toBe("Minimum price");
      expect(sliders[1].getAttribute("aria-label")).toBe("Maximum price");
      expect(screen.getByRole("group", { name: "Price range" })).toBeTruthy();
      expect(screen.getByText("100 – 500")).toBeTruthy();
    });

    it("keeps controlled arrays authoritative and reports array callbacks", async () => {
      const onValueChange = vi.fn();
      const onValueCommitted = vi.fn();
      const { rerender } = render(
        <Slider
          label="Thresholds"
          multiple
          onValueChange={onValueChange}
          onValueCommitted={onValueCommitted}
          thumbLabels={["Low", "Target", "High"]}
          value={[10, 30, 90]}
        />
      );
      const sliders = await screen.findAllByRole("slider", { hidden: true });

      fireEvent.change(sliders[1], { target: { value: "40" } });

      expect(onValueChange).toHaveBeenCalledWith(
        [10, 40, 90],
        expect.objectContaining({ activeThumbIndex: 1 })
      );
      expect(onValueCommitted).toHaveBeenCalledWith(
        [10, 40, 90],
        expect.objectContaining({ reason: "input-change" })
      );
      expect(screen.getByText("10 – 30 – 90")).toBeTruthy();

      rerender(
        <Slider
          label="Thresholds"
          multiple
          onValueChange={onValueChange}
          onValueCommitted={onValueCommitted}
          thumbLabels={["Low", "Target", "High"]}
          value={[10, 40, 90]}
        />
      );
      expect(screen.getByText("10 – 40 – 90")).toBeTruthy();
    });

    it("updates uncontrolled arrays and preserves them when canceled", async () => {
      const onValueChange = vi.fn((_value, details) => {
        if (details.activeThumbIndex === 1) {
          details.cancel();
        }
      });
      render(
        <Slider
          defaultValue={[20, 80]}
          label="Window"
          multiple
          onValueChange={onValueChange}
          thumbLabels={["Start", "End"]}
        />
      );
      const sliders = await screen.findAllByRole("slider", { hidden: true });

      fireEvent.change(sliders[0], { target: { value: "30" } });
      expect(screen.getByText("30 – 80")).toBeTruthy();

      fireEvent.change(sliders[1], { target: { value: "90" } });
      expect(screen.getByText("30 – 80")).toBeTruthy();
      expect(screen.queryByText("30 – 90")).toBeNull();
      expect((sliders[1] as HTMLInputElement).value).toBe("80");
    });

    it("falls back to stable names when thumbLabels is short", async () => {
      render(
        <Slider
          defaultValue={[10, 50, 90]}
          label="Thresholds"
          multiple
          thumbLabels={["Minimum"]}
        />
      );

      const sliders = await screen.findAllByRole("slider", { hidden: true });
      expect(
        sliders.map((slider) => slider.getAttribute("aria-label"))
      ).toEqual(["Minimum", "Value 2", "Value 3"]);
    });

    it("enforces the minimum step distance", async () => {
      const onValueChange = vi.fn();
      render(
        <Slider
          defaultValue={[20, 80]}
          label="Window"
          minStepsBetweenValues={10}
          multiple
          onValueChange={onValueChange}
          thumbCollisionBehavior="none"
          thumbLabels={["Start", "End"]}
        />
      );
      const sliders = await screen.findAllByRole("slider", { hidden: true });

      fireEvent.change(sliders[0], { target: { value: "75" } });

      expect(onValueChange).not.toHaveBeenCalled();
      expect((sliders[0] as HTMLInputElement).value).toBe("20");
      expect(screen.getByText("20 – 80")).toBeTruthy();
    });

    it("submits every thumb value with the shared field name", async () => {
      render(
        <form data-testid="range-form">
          <Slider
            defaultValue={[25, 75]}
            label="Price range"
            multiple
            name="price"
            thumbLabels={["Minimum price", "Maximum price"]}
          />
        </form>
      );
      const form = screen.getByTestId("range-form") as HTMLFormElement;

      await screen.findAllByRole("slider", { hidden: true });
      expect(new FormData(form).getAll("price")).toEqual(["25", "75"]);
    });

    it("emits indexed, distinctly named thumbs in server markup", () => {
      const html = renderToStaticMarkup(
        <Slider
          defaultValue={[20, 80]}
          label="Server range"
          multiple
          thumbLabels={["Server start", "Server end"]}
        />
      );
      const container = document.createElement("div");
      container.innerHTML = html;
      const inputs = [...container.querySelectorAll('input[type="range"]')];

      expect(inputs).toHaveLength(2);
      expect(inputs.map((input) => input.getAttribute("aria-label"))).toEqual([
        "Server start",
        "Server end",
      ]);
      expect(inputs.map((input) => input.getAttribute("value"))).toEqual([
        "20",
        "80",
      ]);
    });

    it("preserves thumb identity when labels and thumb count change", async () => {
      const { rerender } = render(
        <Slider
          label="Thresholds"
          multiple
          thumbLabels={["Low", "High"]}
          value={[10, 90]}
        />
      );
      const initialSliders = await screen.findAllByRole("slider", {
        hidden: true,
      });
      const firstThumb = initialSliders[0];

      act(() => {
        firstThumb.focus();
      });
      rerender(
        <Slider
          label="Thresholds"
          multiple
          thumbLabels={["Minimum", "Maximum"]}
          value={[10, 90]}
        />
      );

      const renamedSliders = await screen.findAllByRole("slider", {
        hidden: true,
      });
      expect(renamedSliders[0]).toBe(firstThumb);
      expect(document.activeElement).toBe(firstThumb);
      expect(
        renamedSliders.map((slider) => slider.getAttribute("aria-label"))
      ).toEqual(["Minimum", "Maximum"]);

      rerender(
        <Slider
          label="Thresholds"
          multiple
          thumbLabels={["Minimum", "Target", "Maximum"]}
          value={[10, 50, 90]}
        />
      );

      const nextSliders = await screen.findAllByRole("slider", {
        hidden: true,
      });
      expect(nextSliders).toHaveLength(3);
      expect(nextSliders[0]).toBe(firstThumb);
      expect(
        nextSliders.map((slider) => slider.getAttribute("aria-label"))
      ).toEqual(["Minimum", "Target", "Maximum"]);
    });
  });
});
