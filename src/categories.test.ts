import { describe, it, expect } from "vitest";
import { getCategory, groupMatchesByCategory } from "./categories.js";

describe("getCategory", () => {
  it("identifie les compétitions séniors", () => {
    expect(getCategory("PFA - PRE-NATIONALE FEMININES")).toBe("seniors");
    expect(getCategory("M1F - COUPE DE FRANCE MASTERS")).toBe("seniors");
    expect(getCategory("1MB - RÉGIONALE 1 MASCULINS")).toBe("seniors");
  });

  it("identifie les compétitions jeunes", () => {
    expect(getCategory("JFE - M21 Fém.")).toBe("jeunes");
    expect(getCategory("JFD - COUPE DE FRANCE M21")).toBe("jeunes");
    expect(getCategory("MFL - M15 MINIMES")).toBe("jeunes");
  });

  it("identifie les compétitions loisir", () => {
    expect(getCategory("RC1 - LOISIR CORPO")).toBe("competlib");
    expect(getCategory("DLA - Détente Loisir")).toBe("competlib");
    expect(getCategory("DLB - Détente Loisir")).toBe("competlib");
  });

  it("retourne null pour une compétition inconnue", () => {
    expect(getCategory("XYZ - INCONNUE")).toBeNull();
  });
});

describe("groupMatchesByCategory", () => {
  it("groupe correctement les matchs par catégorie", () => {
    const matches = [
      {
        competition: "PFA - PRE-NATIONALE",
        date: "14/02",
        heure: "18:30",
        domicile: "LILLE SJ 1",
        exterieur: "SAINT POL",
        joue: false,
      },
      {
        competition: "JFE - M21",
        date: "14/02",
        heure: "15:00",
        domicile: "LILLE SJ 1",
        exterieur: "HALLUIN",
        joue: false,
      },
      {
        competition: "RC1 - LOISIR",
        date: "15/02",
        heure: "20:00",
        domicile: "SPORT & JOIE 1",
        exterieur: "xxxxx",
        joue: false,
      },
    ];

    const groups = groupMatchesByCategory(matches);
    expect(groups.seniors).toHaveLength(1);
    expect(groups.jeunes).toHaveLength(1);
    expect(groups.competlib).toHaveLength(1);
  });
});
