import { fireEvent, render, screen } from "@testing-library/react";
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
});
