import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
// @ts-expect-error The runtime server entry exists; this repo does not hoist its peer-only types package.
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Progress, type ProgressProps } from "./progress";

describe("Progress", () => {
  it("renders the minimum labeled percentage bar", () => {
    const { container } = render(
      <Progress label="Upload progress" value={56} />
    );

    const root = screen.getByRole("progressbar");
    const label = screen.getByText("Upload progress");
    const value = root.querySelector('[data-slot="progress-value"]');
    const track = root.querySelector('[data-slot="progress-track"]');
    const indicator = root.querySelector<HTMLElement>(
      '[data-slot="progress-indicator"]'
    );

    expect(root.tagName).toBe("DIV");
    expect(label.getAttribute("data-slot")).toBe("progress-label");
    expect(root.getAttribute("aria-valuenow")).toBe("56");
    expect(value?.getAttribute("aria-hidden")).toBe("true");
    expect(value?.textContent).toBe("56%");
    expect(track).not.toBeNull();
    expect(indicator?.parentElement).toBe(track);
    expect(indicator?.style.width).toBe("56%");
    const compatibilityNode = [
      ...container.querySelectorAll<HTMLElement>('span[role="presentation"]'),
    ].find((node) => node.style.clipPath !== "");
    expect(compatibilityNode).toBeDefined();
  });

  it("uses the primitive percentage formatter", () => {
    render(<Progress label="Fractional progress" value={12.5} />);
    const root = screen.getByRole("progressbar");
    const formatted = new Intl.NumberFormat("en-US", {
      style: "percent",
    }).format(0.125);

    expect(root.getAttribute("aria-valuetext")).toBe(formatted);
    expect(
      root.querySelector('[data-slot="progress-value"]')?.textContent
    ).toBe(formatted);
  });

  it("derives progressing, complete, and indeterminate states", () => {
    const { rerender } = render(<Progress label="State" value={0} />);
    const root = screen.getByRole("progressbar");
    const indicator = () =>
      root.querySelector<HTMLElement>('[data-slot="progress-indicator"]');
    const value = () =>
      root.querySelector<HTMLElement>('[data-slot="progress-value"]');

    expect(root.hasAttribute("data-progressing")).toBe(true);
    expect(root.hasAttribute("data-complete")).toBe(false);
    expect(root.getAttribute("aria-valuenow")).toBe("0");
    expect(indicator()?.style.width).toBe("0%");
    expect(value()?.textContent).toBe("0%");

    rerender(<Progress label="State" value={100} />);

    expect(root.hasAttribute("data-progressing")).toBe(false);
    expect(root.hasAttribute("data-complete")).toBe(true);
    expect(root.getAttribute("aria-valuenow")).toBe("100");
    expect(indicator()?.style.width).toBe("100%");
    expect(value()?.textContent).toBe("100%");

    rerender(<Progress label="State" value={null} />);

    expect(root.hasAttribute("data-complete")).toBe(false);
    expect(root.hasAttribute("data-indeterminate")).toBe(true);
    expect(root.hasAttribute("aria-valuenow")).toBe(false);
    expect(indicator()?.style.width).toBe("");
    expect(value()?.getAttribute("aria-hidden")).toBe("true");
    expect(value()?.textContent).toBe("");
  });

  it("updates the same root synchronously as the value changes", () => {
    const { rerender } = render(<Progress label="Upload state" value={20} />);
    const root = screen.getByRole("progressbar");
    const indicator = () =>
      root.querySelector<HTMLElement>('[data-slot="progress-indicator"]');
    const visualValue = () =>
      root.querySelector<HTMLElement>('[data-slot="progress-value"]');
    const expectState = (
      currentValue: string | null,
      currentText: string,
      state: "data-complete" | "data-indeterminate" | "data-progressing",
      width: string
    ) => {
      expect(screen.getByRole("progressbar")).toBe(root);
      expect(root.getAttribute("aria-valuenow")).toBe(currentValue);
      expect(root.getAttribute("aria-valuetext")).toBe(currentText);
      expect(
        ["data-progressing", "data-complete", "data-indeterminate"].filter(
          (attribute) => root.hasAttribute(attribute)
        )
      ).toEqual([state]);
      expect(visualValue()?.textContent).toBe(
        state === "data-indeterminate" ? "" : currentText
      );
      expect(indicator()?.style.width).toBe(width);
    };

    expectState("20", "20%", "data-progressing", "20%");

    rerender(<Progress label="Upload state" value={75} />);

    expectState("75", "75%", "data-progressing", "75%");

    rerender(<Progress label="Upload state" value={100} />);

    expectState("100", "100%", "data-complete", "100%");

    rerender(<Progress label="Upload state" value={null} />);

    expectState(null, "indeterminate progress", "data-indeterminate", "");
  });

  it("can remove only the visual value", () => {
    render(<Progress label="Quiet upload" showValue={false} value={42} />);

    const root = screen.getByRole("progressbar");
    expect(root.getAttribute("aria-valuenow")).toBe("42");
    expect(root.getAttribute("aria-valuetext")).toBe("42%");
    expect(root.hasAttribute("data-progressing")).toBe(true);
    expect(root.querySelector('[data-slot="progress-value"]')).toBeNull();
    expect(
      root.querySelector<HTMLElement>('[data-slot="progress-indicator"]')?.style
        .width
    ).toBe("42%");
  });

  it("uses the rendered label as its accessible name on the client", () => {
    render(<Progress label="Client upload" value={34} />);

    const root = screen.getByRole("progressbar", { name: "Client upload" });
    const label = screen.getByText("Client upload");
    expect(root.getAttribute("aria-labelledby")).toBe(label.id);
  });

  it("emits the label relationship in the initial server markup", () => {
    const html = renderToStaticMarkup(
      <Progress label="Server upload" value={12} />
    );
    const container = document.createElement("div");
    container.innerHTML = html;
    const root = container.querySelector('[role="progressbar"]');
    const label = container.querySelector('[data-slot="progress-label"]');

    expect(root).not.toBeNull();
    expect(label).not.toBeNull();
    expect(label?.id).toBeTruthy();
    expect(label?.id).not.toBe("");
    expect(root?.getAttribute("aria-labelledby")).toBe(label?.id);
  });

  it("merges external naming tokens after the internal label id", () => {
    render(
      <>
        <span id="external-progress-first">External first</span>
        <span id="external-progress-second">External second</span>
        <span id="progress-details">External details</span>
        <Progress
          aria-describedby="progress-details"
          aria-labelledby={
            " external-progress-first\nexternal-progress-second external-progress-first  "
          }
          label="Internal name"
          value={60}
        />
      </>
    );

    const root = screen.getByRole("progressbar", {
      name: "Internal name External first External second",
    });
    const label = screen.getByText("Internal name");
    expect(root.getAttribute("aria-labelledby")).toBe(
      `${label.id} external-progress-first external-progress-second`
    );
    expect(root.getAttribute("aria-describedby")).toBe("progress-details");
  });

  it("normalizes external naming when label content is absent", () => {
    const { container } = render(
      <>
        <span id="external-only">External only</span>
        <Progress
          aria-labelledby={" external-only\texternal-only "}
          label={null}
          value={10}
        />
        <Progress aria-label="Boolean label" label={false} value={20} />
        <Progress aria-label="Undefined label" label={undefined} value={25} />
        <Progress aria-label="Zero label fallback" label={0} value={30} />
        <Progress aria-label="Empty label fallback" label="" value={40} />
      </>
    );

    const roots = container.querySelectorAll('[role="progressbar"]');
    expect(roots[0].getAttribute("aria-labelledby")).toBe("external-only");
    expect(roots[0].querySelector('[data-slot="progress-label"]')).toBeNull();
    expect(roots[1].hasAttribute("aria-labelledby")).toBe(false);
    expect(roots[1].querySelector('[data-slot="progress-label"]')).toBeNull();
    expect(screen.getByRole("progressbar", { name: "Boolean label" })).toBe(
      roots[1]
    );
    expect(roots[2].hasAttribute("aria-labelledby")).toBe(false);
    expect(roots[2].querySelector('[data-slot="progress-label"]')).toBeNull();
    expect(screen.getByRole("progressbar", { name: "Undefined label" })).toBe(
      roots[2]
    );
    expect(
      roots[3].querySelector('[data-slot="progress-label"]')?.textContent
    ).toBe("0");
    expect(
      roots[4].querySelector('[data-slot="progress-label"]')
    ).not.toBeNull();
  });

  it("keeps ids stable and unique without making the label interactive", () => {
    const onClick = vi.fn();
    const { container, rerender } = render(
      <>
        <Progress label="First progress" onClick={onClick} value={10} />
        <Progress label="Second progress" value={20} />
      </>
    );
    const roots = container.querySelectorAll<HTMLElement>(
      '[role="progressbar"]'
    );
    const firstId = roots[0].getAttribute("aria-labelledby");
    const secondId = roots[1].getAttribute("aria-labelledby");

    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
    fireEvent.click(screen.getByText("First progress"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(document.activeElement).not.toBe(roots[0]);
    expect(roots[0].getAttribute("aria-valuenow")).toBe("10");

    rerender(
      <>
        <Progress
          label={<span>First progress</span>}
          onClick={onClick}
          value={10}
        />
        <Progress label="Second progress" value={20} />
      </>
    );

    expect(roots[0].getAttribute("aria-labelledby")).toBe(firstId);
    expect(roots[1].getAttribute("aria-labelledby")).toBe(secondId);
  });

  it("preserves default, custom, and explicitly undefined value text", () => {
    const { container } = render(
      <>
        <Progress label="Default determinate" value={25} />
        <Progress
          aria-valuetext="1 of 4 batches"
          label="Custom determinate"
          value={25}
        />
        <Progress
          aria-valuetext={undefined}
          label="Undefined determinate"
          value={25}
        />
        <Progress label="Default indeterminate" value={null} />
        <Progress
          aria-valuetext="Waiting for totals"
          label="Custom indeterminate"
          value={null}
        />
        <Progress
          aria-valuetext={undefined}
          label="Undefined indeterminate"
          value={null}
        />
      </>
    );
    const roots = container.querySelectorAll('[role="progressbar"]');

    expect(roots[0].getAttribute("aria-valuetext")).toBe("25%");
    expect(roots[1].getAttribute("aria-valuetext")).toBe("1 of 4 batches");
    expect(roots[2].getAttribute("aria-valuetext")).toBe("25%");
    expect(roots[3].getAttribute("aria-valuetext")).toBe(
      "indeterminate progress"
    );
    expect(roots[4].getAttribute("aria-valuetext")).toBe("Waiting for totals");
    expect(roots[5].getAttribute("aria-valuetext")).toBe(
      "indeterminate progress"
    );
  });

  it("fixes numeric range and state after untyped runtime props", () => {
    const hostileProps = {
      "aria-valuemax": 10,
      "aria-valuemin": -10,
      "aria-valuenow": 9,
      "data-complete": "forged",
      "data-indeterminate": "forged",
      max: 25,
      min: -10,
      role: "meter",
    } as unknown as ProgressProps;
    const { container } = render(
      <Progress {...hostileProps} label="Protected progress" value={25} />
    );
    const root = container.querySelector('[data-slot="progress"]');
    const indicator = root?.querySelector<HTMLElement>(
      '[data-slot="progress-indicator"]'
    );

    expect(root?.getAttribute("role")).toBe("progressbar");
    expect(root?.getAttribute("aria-valuemin")).toBe("0");
    expect(root?.getAttribute("aria-valuemax")).toBe("100");
    expect(root?.getAttribute("aria-valuenow")).toBe("25");
    expect(root?.getAttribute("aria-valuetext")).toBe("25%");
    expect(root?.hasAttribute("data-progressing")).toBe(true);
    expect(root?.hasAttribute("data-complete")).toBe(false);
    expect(root?.hasAttribute("data-indeterminate")).toBe(false);
    expect(indicator?.style.width).toBe("25%");
  });

  it("fixes English percentage formatting after untyped runtime props", () => {
    const hostileProps = {
      format: { currency: "EUR", style: "currency" },
      getAriaValueText: () => "forged value text",
      locale: "de-DE",
    } as unknown as ProgressProps;
    const { container } = render(
      <Progress {...hostileProps} label="Protected formatting" value={25} />
    );
    const root = container.querySelector('[data-slot="progress"]');
    const visibleValue = root?.querySelector('[data-slot="progress-value"]');

    expect(root?.getAttribute("aria-valuetext")).toBe("25%");
    expect(visibleValue?.textContent).toBe("25%");
  });

  it("routes classes and ordinary root props to their owned elements", () => {
    const onMouseEnter = vi.fn();
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Progress
        aria-busy="true"
        className={["root-x", false]}
        data-owner="caller"
        data-testid="owned-root"
        id="progress-root"
        label="Styled progress"
        labelClassName={["label-x", null]}
        onMouseEnter={onMouseEnter}
        ref={ref}
        style={{ opacity: 0.5 }}
        value={45}
        valueClassName={["value-x", undefined]}
      />
    );
    const root = screen.getByTestId("owned-root");
    const label = screen.getByText("Styled progress");
    const value = root.querySelector<HTMLElement>(
      '[data-slot="progress-value"]'
    );

    fireEvent.mouseEnter(root);

    expect(container.firstElementChild).toBe(root);
    expect(ref.current).toBe(root);
    expect(root.id).toBe("progress-root");
    expect(root.style.opacity).toBe("0.5");
    expect(root.getAttribute("aria-busy")).toBe("true");
    expect(root.getAttribute("data-owner")).toBe("caller");
    expect(root.classList.contains("root-x")).toBe(true);
    expect(root.classList.contains("label-x")).toBe(false);
    expect(root.classList.contains("value-x")).toBe(false);
    expect(label.classList.contains("label-x")).toBe(true);
    expect(value?.classList.contains("value-x")).toBe(true);
    expect(label.classList.contains("root-x")).toBe(false);
    expect(label.classList.contains("value-x")).toBe(false);
    expect(label.hasAttribute("aria-busy")).toBe(false);
    expect(label.hasAttribute("data-owner")).toBe(false);
    expect(value?.classList.contains("root-x")).toBe(false);
    expect(value?.classList.contains("label-x")).toBe(false);
    expect(value?.hasAttribute("aria-busy")).toBe(false);
    expect(value?.hasAttribute("data-owner")).toBe(false);
    expect(onMouseEnter).toHaveBeenCalledOnce();
  });

  it("rejects an untyped root render replacement at runtime", () => {
    const hostileProps = {
      render: <button type="button" />,
    } as unknown as ProgressProps;
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Progress {...hostileProps} label="Fixed root" ref={ref} value={50} />
    );
    const root = container.firstElementChild;

    expect(root?.tagName).toBe("DIV");
    expect(ref.current).toBe(root);
  });

  it("rejects an untyped root slot replacement at runtime", () => {
    const hostileProps = {
      "data-slot": "forged-slot",
    } as unknown as ProgressProps;
    const { container } = render(
      <Progress {...hostileProps} label="Fixed slot" value={50} />
    );
    const root = container.firstElementChild;

    expect(root?.getAttribute("data-slot")).toBe("progress");
  });

  it("rejects untyped raw HTML at runtime", () => {
    const hostileProps = {
      dangerouslySetInnerHTML: { __html: "<em>Bypass HTML</em>" },
    } as unknown as ProgressProps;
    const { container } = render(
      <Progress {...hostileProps} label="Owned HTML" value={50} />
    );
    const root = container.firstElementChild;

    expect(root?.querySelector("em")).toBeNull();
    expect(root?.textContent).not.toContain("Bypass HTML");
    expect(screen.getByText("Owned HTML")).not.toBeNull();
  });

  it("rejects untyped child replacement at runtime", () => {
    const hostileProps = {
      children: "Bypass children",
    } as unknown as ProgressProps;
    const { container } = render(
      <Progress {...hostileProps} label="Owned children" value={50} />
    );
    const root = container.firstElementChild;

    expect(root?.textContent).not.toContain("Bypass children");
    expect(screen.getByText("Owned children")).not.toBeNull();
    expect(root?.querySelector('[data-slot="progress-track"]')).not.toBeNull();
  });
});
