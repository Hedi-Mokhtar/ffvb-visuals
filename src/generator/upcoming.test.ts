import { describe, it, expect, vi } from "vitest";
import {
  splitAdversaire,
  getAdversaireFontSize,
  getDayLabel,
  generateUpcomingVisual,
} from "./upcoming.js";
import type { Match } from "../scraper/scraper.js";

vi.mock("sharp", () => {
  const instance = {
    resize: vi.fn().mockReturnThis(),
    composite: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("mock-image")),
    toFile: vi.fn().mockResolvedValue({ size: 1000 }),
  };
  return { default: vi.fn(() => instance) };
});

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

describe("generateUpcomingVisual", () => {
  const baseMatch: Match & { adversaires: string[] } = {
    competition: "PFA - PRE-NATIONALE FEMININES",
    date: "15/03",
    heure: "18:30",
    domicile: "LILLE SJ VOLLEY",
    exterieur: "VALENCIENNES VB",
    salle: "Salle des Sports",
    joue: false,
    adversaires: ["VALENCIENNES VB"],
  };

  it("generates an output path for a single home match", async () => {
    const result = await generateUpcomingVisual(baseMatch);
    expect(result).toContain("upcoming_PFA_15-03.png");
  });

  it("generates an output path for a single away match", async () => {
    const awayMatch = {
      ...baseMatch,
      domicile: "VALENCIENNES VB",
      exterieur: "LILLE SJ VOLLEY",
    };
    const result = await generateUpcomingVisual(awayMatch);
    expect(result).toContain("upcoming_PFA_15-03.png");
  });

  it("generates an output path for a double-day match", async () => {
    const doubleMatch = {
      ...baseMatch,
      adversaires: ["VALENCIENNES VB", "DUNKERQUE VB"],
    };
    const result = await generateUpcomingVisual(doubleMatch);
    expect(result).toContain("upcoming_PFA_15-03.png");
  });

  it("handles a long adversaire name that needs splitting", async () => {
    const longNameMatch = {
      ...baseMatch,
      adversaires: ["SAINT AMAND LES EAUX VOLLEY BALL"],
    };
    const result = await generateUpcomingVisual(longNameMatch);
    expect(result).toContain("upcoming_PFA");
  });

  it("handles an adversaire name with XML special characters", async () => {
    const specialMatch = {
      ...baseMatch,
      adversaires: ["SPORT & JOIE NORD"],
    };
    const result = await generateUpcomingVisual(specialMatch);
    expect(result).toContain("upcoming_PFA");
  });

  it("handles a match without a venue (salle undefined)", async () => {
    const noSalleMatch = { ...baseMatch, salle: undefined };
    const result = await generateUpcomingVisual(noSalleMatch);
    expect(result).toContain("upcoming_PFA");
  });

  it("generates an output path for a double-day match with a long first adversaire", async () => {
    const doubleMatch = {
      ...baseMatch,
      adversaires: ["SAINT AMAND LES EAUX VB", "DUNKERQUE VB"],
    };
    const result = await generateUpcomingVisual(doubleMatch);
    expect(result).toContain("upcoming_PFA");
  });

  it("handles a match with an empty adversaires array", async () => {
    const noAdvMatch = { ...baseMatch, adversaires: [] };
    const result = await generateUpcomingVisual(noAdvMatch);
    expect(result).toContain("upcoming_PFA");
  });
});
