import { describe, it, expect } from "vitest";
import { paginateMatches } from "./results.js";

describe("paginateMatches", () => {
  it("returns a page if there is less than 5 items", () => {
    const result = paginateMatches([1, 2, 3], 5);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual([1, 2, 3]);
  });

  it("returns two pages for 6 items with perPage=5", () => {
    const items = [1, 2, 3, 4, 5, 6];
    const result = paginateMatches(items, 5);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(5);
    expect(result[1]).toHaveLength(1);
  });

  it("returns an empty array for an empty input", () => {
    expect(paginateMatches([], 5)).toEqual([]);
  });

  it("returns as many pages as there are items if perPage=1", () => {
    const result = paginateMatches([1, 2, 3], 1);
    expect(result).toHaveLength(3);
  });
});
