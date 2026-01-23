import { beforeEach, describe, expect, it } from "vitest";
import { ALREADY_MOUNTED } from "../src/constants";
import { reducer } from "../src/context";
import { ActionType, type CommandModalStore } from "../src/type";

describe("reducer", () => {
  let initialState: CommandModalStore;

  beforeEach(() => {
    initialState = {};
  });

  describe("showModal action", () => {
    it("should create modal state with visible=false and delayVisible=true when not mounted", () => {
      const action = {
        type: ActionType.showModal as const,
        payload: {
          modalId: "test-modal",
          args: { foo: "bar" },
        },
      };

      const result = reducer(initialState, action);

      expect(result["test-modal"]).toEqual({
        id: "test-modal",
        args: { foo: "bar" },
        visible: false,
        delayVisible: true,
      });
    });

    it("should create modal state with visible=true and delayVisible=false when already mounted", () => {
      ALREADY_MOUNTED["test-modal"] = true;

      const action = {
        type: ActionType.showModal as const,
        payload: {
          modalId: "test-modal",
          args: { foo: "bar" },
        },
      };

      const result = reducer(initialState, action);

      expect(result["test-modal"]).toEqual({
        id: "test-modal",
        args: { foo: "bar" },
        visible: true,
        delayVisible: false,
      });
    });

    it("should preserve existing modal state properties", () => {
      const existingState: CommandModalStore = {
        "test-modal": {
          id: "test-modal",
          keepMounted: true,
        },
      };

      const action = {
        type: ActionType.showModal as const,
        payload: {
          modalId: "test-modal",
          args: { newArg: "value" },
        },
      };

      const result = reducer(existingState, action);

      expect(result["test-modal"].keepMounted).toBe(true);
    });

    it("should handle show without args", () => {
      const action = {
        type: ActionType.showModal as const,
        payload: {
          modalId: "test-modal",
        },
      };

      const result = reducer(initialState, action);

      expect(result["test-modal"].args).toBeUndefined();
    });
  });

  describe("hideModal action", () => {
    it("should set visible to false for existing modal", () => {
      const existingState: CommandModalStore = {
        "test-modal": {
          id: "test-modal",
          visible: true,
          args: { foo: "bar" },
        },
      };

      const action = {
        type: ActionType.hideModal as const,
        payload: {
          modalId: "test-modal",
        },
      };

      const result = reducer(existingState, action);

      expect(result["test-modal"].visible).toBe(false);
      expect(result["test-modal"].args).toEqual({ foo: "bar" });
    });

    it("should return same state when modal does not exist", () => {
      const action = {
        type: ActionType.hideModal as const,
        payload: {
          modalId: "non-existent",
        },
      };

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe("removeModal action", () => {
    it("should remove modal from state", () => {
      const existingState: CommandModalStore = {
        "test-modal": {
          id: "test-modal",
          visible: true,
        },
        "other-modal": {
          id: "other-modal",
          visible: false,
        },
      };

      const action = {
        type: ActionType.removeModal as const,
        payload: {
          modalId: "test-modal",
        },
      };

      const result = reducer(existingState, action);

      expect(result["test-modal"]).toBeUndefined();
      expect(result["other-modal"]).toBeDefined();
    });

    it("should handle removing non-existent modal", () => {
      const existingState: CommandModalStore = {
        "test-modal": {
          id: "test-modal",
          visible: true,
        },
      };

      const action = {
        type: ActionType.removeModal as const,
        payload: {
          modalId: "non-existent",
        },
      };

      const result = reducer(existingState, action);

      expect(result["test-modal"]).toBeDefined();
      expect(Object.keys(result)).toHaveLength(1);
    });
  });

  describe("setModalFlags action", () => {
    it("should update modal flags", () => {
      const existingState: CommandModalStore = {
        "test-modal": {
          id: "test-modal",
          visible: true,
        },
      };

      const action = {
        type: ActionType.setModalFlags as const,
        payload: {
          modalId: "test-modal",
          flags: { keepMounted: true },
        },
      };

      const result = reducer(existingState, action);

      expect(result["test-modal"].keepMounted).toBe(true);
      expect(result["test-modal"].visible).toBe(true);
    });

    it("should merge multiple flags", () => {
      const existingState: CommandModalStore = {
        "test-modal": {
          id: "test-modal",
          visible: true,
        },
      };

      const action = {
        type: ActionType.setModalFlags as const,
        payload: {
          modalId: "test-modal",
          flags: { keepMounted: true, delayVisible: false },
        },
      };

      const result = reducer(existingState, action);

      expect(result["test-modal"].keepMounted).toBe(true);
      expect(result["test-modal"].delayVisible).toBe(false);
    });

    it("should handle setting flags on non-existent modal (creates partial state)", () => {
      const action = {
        type: ActionType.setModalFlags as const,
        payload: {
          modalId: "new-modal",
          flags: { keepMounted: true },
        },
      };

      const result = reducer(initialState, action);

      expect(result["new-modal"]).toEqual({ keepMounted: true });
    });
  });

  describe("unknown action", () => {
    it("should return same state for unknown action type", () => {
      const existingState: CommandModalStore = {
        "test-modal": {
          id: "test-modal",
          visible: true,
        },
      };

      const action = {
        type: "unknown-action" as const,
        payload: {
          modalId: "test-modal",
        },
      };

      // @ts-expect-error Testing unknown action type
      const result = reducer(existingState, action);

      expect(result).toBe(existingState);
    });
  });
});
