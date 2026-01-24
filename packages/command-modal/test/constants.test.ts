import { describe, expect, it } from "vitest";
import { getModal, getModalId, getUid, MODAL_REGISTRY } from "../src/constants";
import { symModalId } from "../src/symbol";
import type { CreateModalComponent } from "../src/type";

describe("constants", () => {
  describe("getUid", () => {
    it("should generate unique IDs with _command_modal_ prefix", () => {
      const id1 = getUid();
      const id2 = getUid();

      expect(id1).toMatch(/^_command_modal_\d+$/);
      expect(id2).toMatch(/^_command_modal_\d+$/);
      expect(id1).not.toBe(id2);
    });

    it("should increment seed for each call", () => {
      const id1 = getUid();
      const id2 = getUid();
      const id3 = getUid();

      const num1 = Number.parseInt(id1.replace("_command_modal_", ""), 10);
      const num2 = Number.parseInt(id2.replace("_command_modal_", ""), 10);
      const num3 = Number.parseInt(id3.replace("_command_modal_", ""), 10);

      expect(num2).toBe(num1 + 1);
      expect(num3).toBe(num2 + 1);
    });
  });

  describe("getModalId", () => {
    it("should return string directly when modal is a string", () => {
      const result = getModalId("my-modal-id");
      expect(result).toBe("my-modal-id");
    });

    it("should return existing symbol ID when component has one", () => {
      const TestComponent: CreateModalComponent = () => null;
      TestComponent[symModalId] = "existing-id";

      const result = getModalId(TestComponent);
      expect(result).toBe("existing-id");
    });

    it("should assign and return new symbol ID when component does not have one", () => {
      const TestComponent: CreateModalComponent = () => null;

      expect(TestComponent[symModalId]).toBeUndefined();

      const result = getModalId(TestComponent);

      expect(result).toMatch(/^_command_modal_\d+$/);
      expect(TestComponent[symModalId]).toBe(result);
    });

    it("should return same ID for same component on subsequent calls", () => {
      const TestComponent: CreateModalComponent = () => null;

      const id1 = getModalId(TestComponent);
      const id2 = getModalId(TestComponent);

      expect(id1).toBe(id2);
    });
  });

  describe("getModal", () => {
    it("should return undefined when modal is not registered", () => {
      const result = getModal("non-existent");
      expect(result).toBeUndefined();
    });

    it("should return component when modal is registered", () => {
      const TestComponent: CreateModalComponent = () => null;
      MODAL_REGISTRY["test-modal"] = { comp: TestComponent };

      const result = getModal("test-modal");
      expect(result).toBe(TestComponent);
    });

    it("should return component with props when registered with props", () => {
      const TestComponent: CreateModalComponent = () => null;
      MODAL_REGISTRY["test-modal-with-props"] = {
        comp: TestComponent,
        props: { foo: "bar" },
      };

      const result = getModal("test-modal-with-props");
      expect(result).toBe(TestComponent);
    });
  });
});
