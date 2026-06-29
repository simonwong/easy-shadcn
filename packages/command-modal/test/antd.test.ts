import { describe, expect, it, vi } from "vitest";
import { antdModalProps } from "../src/antd";
import { makeHandler } from "./test-utils";

describe("antdModalProps adapter (issue #71)", () => {
  it("maps the handler's visible state to antd's open", () => {
    expect(antdModalProps(makeHandler({ visible: true })).open).toBe(true);
    expect(antdModalProps(makeHandler({ visible: false })).open).toBe(false);
  });

  it("onCancel hides the modal", () => {
    const hide = vi.fn();
    antdModalProps(makeHandler({ hide })).onCancel?.();
    expect(hide).toHaveBeenCalled();
  });

  it("afterClose resolves the hide and removes when not kept mounted", () => {
    const resolveHide = vi.fn();
    const remove = vi.fn();
    antdModalProps(makeHandler({ resolveHide, remove })).afterClose?.();
    expect(resolveHide).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
  });

  it("afterClose resolves the hide but keeps the modal when keepMounted", () => {
    const resolveHide = vi.fn();
    const remove = vi.fn();
    antdModalProps(
      makeHandler({ keepMounted: true, resolveHide, remove })
    ).afterClose?.();
    expect(resolveHide).toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });
});
