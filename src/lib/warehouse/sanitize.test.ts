import { describe, expect, it } from "vitest";
import {
  FIELD_LIMITS,
  QUANTITY_MAX,
  clampNonNegativeInt,
  clampNonNegativeNumber,
  isOverLength,
  sanitizeText,
  stripControlChars,
} from "./sanitize";

describe("stripControlChars", () => {
  it("removes null bytes and control characters", () => {
    expect(stripControlChars("ab\u0000c\u0007d")).toBe("abcd");
  });

  it("keeps normal spaces and newlines for later normalize", () => {
    expect(stripControlChars("a b\nc")).toBe("a b\nc");
  });
});

describe("sanitizeText", () => {
  it("trims and collapses whitespace", () => {
    expect(sanitizeText("  hello   world  ", 40)).toBe("hello world");
  });

  it("clamps to max length", () => {
    const long = "x".repeat(200);
    expect(sanitizeText(long, 10)).toHaveLength(10);
  });

  it("strips control chars then clamps", () => {
    expect(sanitizeText("hi\u0000 there", 20)).toBe("hi there");
  });
});

describe("isOverLength", () => {
  it("ignores surrounding whitespace for length check", () => {
    expect(isOverLength("  abc  ", 3)).toBe(false);
    expect(isOverLength("abcd", 3)).toBe(true);
  });
});

describe("clamp helpers", () => {
  it("clamps negative and non-finite to 0", () => {
    expect(clampNonNegativeInt(-5)).toBe(0);
    expect(clampNonNegativeInt(Number.NaN)).toBe(0);
    expect(clampNonNegativeNumber(-1.5)).toBe(0);
  });

  it("respects max bounds", () => {
    expect(clampNonNegativeInt(QUANTITY_MAX + 10)).toBe(QUANTITY_MAX);
  });
});

describe("FIELD_LIMITS", () => {
  it("keeps notes larger than sku (practical warehouse form design)", () => {
    expect(FIELD_LIMITS.notes).toBeGreaterThan(FIELD_LIMITS.sku);
  });
});
