/**
 * Basic package test to verify test infrastructure works
 */
import { describe, it, expect } from "vitest";

describe("Partner App Utils Package", () => {
  it("should pass basic tests", () => {
    expect(true).toBe(true);
  });

  it("should verify test environment", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });
});
