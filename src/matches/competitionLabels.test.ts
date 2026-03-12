import { describe, it, expect } from "vitest";
import { getCompetitionLabel } from "./competitionLabels.js";

describe("getCompetitionLabel", () => {
  it("returns the label for a known code", () => {
    expect(getCompetitionLabel("PFA")).toBe("Pré-Nationale Féminine");
  });

  it("extracts the prefix when the competition contains a space", () => {
    expect(getCompetitionLabel("PFA Poule A")).toBe("Pré-Nationale Féminine");
  });

  it("returns the competition as is if the code is unknown", () => {
    expect(getCompetitionLabel("INCONNU")).toBe("INCONNU");
  });

  it("returns the competition as is if the unknown code contains a space", () => {
    expect(getCompetitionLabel("INCONNU Poule A")).toBe("INCONNU Poule A");
  });
});
