import { describe, it, expect } from "vitest";
import { groupUpcomingMatches } from "./groupMatches.js";
import type { Match } from "../scraper/scraper.js";

const baseMatch: Match = {
  competition: "PFA",
  date: "15/03",
  heure: "18:00",
  domicile: "LILLE SJ VOLLEY",
  exterieur: "VALENCIENNES VB",
  salle: "Salle X",
  joue: false,
};

describe("groupUpcomingMatches", () => {
  it("returns a single match with the away opponent when SJL is at home", () => {
    const result = groupUpcomingMatches([baseMatch]);
    expect(result).toHaveLength(1);
    expect(result[0]!.adversaires).toEqual(["VALENCIENNES VB"]);
  });

  it("returns the home opponent when SJL is away", () => {
    const match: Match = {
      ...baseMatch,
      domicile: "VALENCIENNES VB",
      exterieur: "LILLE SJ VOLLEY",
    };
    const result = groupUpcomingMatches([match]);
    expect(result[0]!.adversaires).toEqual(["VALENCIENNES VB"]);
  });

  it("groups two matches of the same competition and date in a double day", () => {
    const match2: Match = { ...baseMatch, exterieur: "DUNKERQUE VB" };
    const result = groupUpcomingMatches([baseMatch, match2]);
    expect(result).toHaveLength(1);
    expect(result[0]!.adversaires).toEqual(["VALENCIENNES VB", "DUNKERQUE VB"]);
  });

  it("does not group two matches of different competitions", () => {
    const match2: Match = { ...baseMatch, competition: "1FA" };
    const result = groupUpcomingMatches([baseMatch, match2]);
    expect(result).toHaveLength(2);
  });

  it("returns an empty array if no matches", () => {
    expect(groupUpcomingMatches([])).toEqual([]);
  });
});
