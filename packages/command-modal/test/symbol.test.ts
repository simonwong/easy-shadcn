import { describe, expect, it } from "vitest";
import { symModalId } from "../src/symbol";

describe("symbol", () => {
  describe("symModalId", () => {
    it("should be a Symbol", () => {
      expect(typeof symModalId).toBe("symbol");
    });

    it("should have correct description", () => {
      expect(symModalId.description).toBe("CommandModalId");
    });

    it("should be unique", () => {
      // Each Symbol() call creates a unique symbol, even with the same description
      const anotherSymbol = Symbol("CommandModalId");
      expect(symModalId).not.toBe(anotherSymbol);
    });
  });
});
