import { readFileSync } from "fs";
import { describe, it, expect } from "vitest";
import { parseMatches, getMondayTimestamp } from "./scraper.js";

const fixtureHtml = readFileSync(
  "src/scraper/fixtures/ffvb-response.html",
  "utf-8"
);

describe("getMondayTimestamp", () => {
  it("returns a timestamp corresponding to a Monday", () => {
    const timestamp = getMondayTimestamp(0);
    const date = new Date(timestamp * 1000);
    expect(date.getUTCDay()).toBe(1);
  });

  it("shifts correctly by one week with offset 1", () => {
    const ts0 = getMondayTimestamp(0);
    const ts1 = getMondayTimestamp(1);
    const date0 = new Date(ts0 * 1000);
    const date1 = new Date(ts1 * 1000);
    const dayStart0 = new Date(
      date0.getFullYear(),
      date0.getMonth(),
      date0.getDate()
    );
    const dayStart1 = new Date(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate()
    );
    const diffDays =
      (dayStart1.getTime() - dayStart0.getTime()) / (24 * 60 * 60 * 1000);
    expect(diffDays).toBe(7);
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
