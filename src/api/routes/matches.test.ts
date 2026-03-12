import { describe, it, expect } from "vitest";
import { handleError } from "./matches.js";

describe("handleError", () => {
  it("returns the message of an Error instance", () => {
    expect(handleError(new Error("something went wrong"))).toBe(
      "something went wrong"
    );
  });

  it("returns 'Unknown error' for a non-Error value", () => {
    expect(handleError("string error")).toBe("Unknown error");
    expect(handleError(null)).toBe("Unknown error");
    expect(handleError(42)).toBe("Unknown error");
    expect(handleError(undefined)).toBe("Unknown error");
  });
});
