import { readFileSync } from "fs";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseMatches,
  getMondayTimestamp,
  fetchMatches,
  filterCurrentWeek,
  filterLastWeek,
} from "./scraper.js";
import type { Match } from "./scraper.js";
import { join } from "node:path";
import axios from "axios";

vi.mock("axios", () => ({
  default: { get: vi.fn() },
}));

const fixtureHtml = readFileSync(
  join(import.meta.dirname, "fixtures/ffvb-response.html"),
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

  it("returns a Monday timestamp when called on a Sunday (day === 0 branch)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-03-17T12:00:00.000Z")); // Sunday March 17, 2024
    const timestamp = getMondayTimestamp(0);
    const date = new Date(timestamp * 1000);
    expect(date.getUTCDay()).toBe(1);
    vi.useRealTimers();
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

  it("returns an empty array for HTML without a table", () => {
    expect(parseMatches("<html><body></body></html>")).toEqual([]);
  });

  it("ignores competition header rows with text of 5 characters or fewer", () => {
    const html = `<table>
      <tr><td>ABC</td><td>-</td></tr>
      <tr><td>1</td><td>2</td><td>15/03</td><td>18:30</td><td>LILLE SJ 1</td><td>-</td><td>TEAM B</td><td>3</td><td>0</td></tr>
    </table>`;
    const matches = parseMatches(html);
    // "ABC" is <= 5 chars so it should NOT update currentCompetition
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]?.competition).toBe("");
  });

  it("getMondayTimestamp returns different timestamps for different offsets", () => {
    expect(getMondayTimestamp(0)).not.toBe(getMondayTimestamp(1));
  });
});

describe("fetchMatches", () => {
  it("fetches and parses matches from the FFVB API", async () => {
    const fixtureBinary = readFileSync(
      join(import.meta.dirname, "fixtures/ffvb-response.html")
    );
    vi.mocked(axios.get).mockResolvedValue({ data: fixtureBinary });

    const matches = await fetchMatches(0);

    expect(Array.isArray(matches)).toBe(true);
    expect(matches.length).toBeGreaterThan(0);
  });
});

describe("filterCurrentWeek", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns only matches from the current week", () => {
    // Fix to Wednesday March 13, 2024 (UTC noon)
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-03-13T12:00:00.000Z"));

    const makeMatch = (date: string): Match => ({
      competition: "PFA",
      date,
      heure: "18:00",
      domicile: "LILLE SJ",
      exterieur: "TEAM B",
      joue: false,
    });

    // Current week: March 11–17, 2024
    const matches = [
      makeMatch("11/03"), // Monday – in current week
      makeMatch("13/03"), // Wednesday – in current week
      makeMatch("17/03"), // Sunday – in current week
      makeMatch("05/03"), // Previous week – excluded
      makeMatch("20/03"), // Next week – excluded
    ];

    const result = filterCurrentWeek(matches);
    expect(result).toHaveLength(3);
  });

  it("handles Sunday correctly (day === 0 branch)", () => {
    // Fix to Sunday March 17, 2024 (UTC noon)
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-03-17T12:00:00.000Z"));

    const makeMatch = (date: string): Match => ({
      competition: "PFA",
      date,
      heure: "18:00",
      domicile: "LILLE SJ",
      exterieur: "TEAM B",
      joue: false,
    });

    // Current week: March 11–17, 2024
    const matches = [
      makeMatch("11/03"), // Monday – in current week
      makeMatch("17/03"), // Sunday – in current week
      makeMatch("04/03"), // Previous week – excluded
    ];

    const result = filterCurrentWeek(matches);
    expect(result).toHaveLength(2);
  });
});

describe("filterLastWeek", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns only matches from the previous week", () => {
    // Fix to Wednesday March 13, 2024 (UTC noon)
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-03-13T12:00:00.000Z"));

    const makeMatch = (date: string): Match => ({
      competition: "PFA",
      date,
      heure: "18:00",
      domicile: "LILLE SJ",
      exterieur: "TEAM B",
      joue: false,
    });

    // Last week: March 4–10, 2024
    const matches = [
      makeMatch("04/03"), // Monday – in last week
      makeMatch("07/03"), // Thursday – in last week
      makeMatch("10/03"), // Sunday – in last week
      makeMatch("11/03"), // Current week – excluded
      makeMatch("01/03"), // Two weeks ago – excluded
    ];

    const result = filterLastWeek(matches);
    expect(result).toHaveLength(3);
  });
});
