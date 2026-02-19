import { readFileSync } from "fs";
import { describe, it, expect } from "vitest";
import { parseMatches, getWeekTimestamp } from "./scraper.js";

const fixtureHtml = readFileSync("tests/fixtures/ffvb-response.html", "utf-8");

describe("getWeekTimestamp", () => {
  it("returns a timestamp corresponding to a Monday", () => {
    const timestamp = getWeekTimestamp(0);
    const date = new Date(timestamp * 1000);
    expect(date.getDay()).toBe(1); // 1 = monday
  });

  it("shifts correctly by one week with offset 1", () => {
    const ts0 = getWeekTimestamp(0);
    const ts1 = getWeekTimestamp(1);
    expect(ts1 - ts0).toBe(7 * 24 * 60 * 60); // 7 days in seconds
  });
});

describe("parseMatches", () => {
  it("returns an array of matches", () => {
    const matches = parseMatches(fixtureHtml);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("each match has the required fields", () => {
    const matches = parseMatches(fixtureHtml);
    for (const match of matches) {
      expect(match.competition).toBeDefined();
      expect(match.date).toBeDefined();
      expect(match.domicile).toBeDefined();
      expect(match.exterieur).toBeDefined();
      expect(typeof match.joue).toBe("boolean");
    }
  });

  it("does not contain any header rows", () => {
    const matches = parseMatches(fixtureHtml);
    const parasite = matches.find((m) => m.date === "Compétition");
    expect(parasite).toBeUndefined();
  });

  it("played matches have a score", () => {
    const matches = parseMatches(fixtureHtml);
    const joues = matches.filter((m) => m.joue);
    for (const match of joues) {
      expect(match.scoreDomicile).toBeDefined();
      expect(match.scoreExterieur).toBeDefined();
    }
  });

  it("unplayed matches do not have a score", () => {
    const matches = parseMatches(fixtureHtml);
    const nonJoues = matches.filter((m) => !m.joue);
    for (const match of nonJoues) {
      expect(match.scoreDomicile).toBeUndefined();
      expect(match.scoreExterieur).toBeUndefined();
    }
  });
});
