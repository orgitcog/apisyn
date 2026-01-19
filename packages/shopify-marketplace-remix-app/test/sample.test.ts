/**
 * Sample unit test to verify test infrastructure works
 */
import { describe, it, expect } from "vitest";

describe("Test Infrastructure", () => {
  it("should run basic tests", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle string operations", () => {
    expect("hello".toUpperCase()).toBe("HELLO");
  });

  it("should handle array operations", () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });
});
