import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { resetRegistry } from "./test-utils";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  resetRegistry();
});
