import { describe, it, expect } from "vitest";
import {
  splitAdversaire,
  getAdversaireFontSize,
  getDayLabel,
} from "./upcoming.js";

describe("splitAdversaire", () => {
  it("returns the entire name if it fits on one line", () => {
    expect(splitAdversaire("VALENCIENNES")).toEqual(["VALENCIENNES", null]);
  });

  it("splits a long name into two lines", () => {
    const [line1, line2] = splitAdversaire("SAINT AMAND LES EAUX VB");
    expect(line1.length).toBeLessThanOrEqual(16);
    expect(line2).not.toBeNull();
  });

  it("returns null for the second line if the name fits on one line", () => {
    const [, line2] = splitAdversaire("LILLE VB");
    expect(line2).toBeNull();
  });
});

describe("getAdversaireFontSize", () => {
  it("returns 32 for a short name (≤12 characters)", () => {
    expect(getAdversaireFontSize("LILLE VB")).toBe(32);
  });

  it("returns 24 for a medium name (≤24 characters)", () => {
    expect(getAdversaireFontSize("VALENCIENNES VOLLEY")).toBe(24);
  });

  it("returns 20 for a long name (>24 characters)", () => {
    expect(getAdversaireFontSize("SAINT AMAND LES EAUX VOLLEY BALL")).toBe(20);
  });
});

it("returns a consistent label with the JS date", () => {
  const DAYS = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
  const year = new Date().getFullYear();
  const date = new Date(year, 2, 10); // March 10 of the current year
  const expected = DAYS[date.getDay()];
  expect(getDayLabel("10/03")).toBe(expected);
});
