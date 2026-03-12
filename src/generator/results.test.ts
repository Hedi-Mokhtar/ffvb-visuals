import { describe, it, expect, vi } from "vitest";
import { paginateMatches, generateResultsVisual } from "./results.js";
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

describe("generateResultsVisual", () => {
  const basePlayedMatch: Match = {
    competition: "PFA - PRE-NATIONALE FEMININES",
    date: "08/03",
    heure: "18:30",
    domicile: "LILLE SJ VOLLEY",
    exterieur: "VALENCIENNES VB",
    scoreDomicile: "3",
    scoreExterieur: "0",
    joue: true,
  };

  it("returns an empty array when there are no played matches", async () => {
    const unplayed: Match = { ...basePlayedMatch, joue: false };
    const result = await generateResultsVisual([unplayed], "seniors");
    expect(result).toEqual([]);
  });

  it("returns one output path for a single page of results", async () => {
    const result = await generateResultsVisual([basePlayedMatch], "seniors");
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("results_seniors");
  });

  it("returns multiple output paths when results span several pages", async () => {
    const matches: Match[] = Array(6).fill(basePlayedMatch);
    const result = await generateResultsVisual(matches, "jeunes");
    expect(result).toHaveLength(2);
    expect(result[0]).toContain("results_jeunes");
  });

  it("handles an away match (SJL is extérieur)", async () => {
    const awayMatch: Match = {
      ...basePlayedMatch,
      domicile: "VALENCIENNES VB",
      exterieur: "LILLE SJ VOLLEY",
      scoreDomicile: "0",
      scoreExterieur: "3",
    };
    const result = await generateResultsVisual([awayMatch], "competlib");
    expect(result).toHaveLength(1);
  });

  it("handles a loss (SJL score is lower)", async () => {
    const lossMatch: Match = {
      ...basePlayedMatch,
      scoreDomicile: "1",
      scoreExterieur: "3",
    };
    const result = await generateResultsVisual([lossMatch], "seniors");
    expect(result).toHaveLength(1);
  });

  it("uses the correct category label for competlib", async () => {
    const result = await generateResultsVisual([basePlayedMatch], "competlib");
    expect(result[0]).toContain("results_competlib");
  });
});
