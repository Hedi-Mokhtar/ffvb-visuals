export const COMPETITION_LABELS: Record<string, string> = {
  // Séniors
  PFA: "Pré-Nationale Féminine",
  "1FA": "Régionale 1 Féminine",
  "1MB": "Régionale 1 Masculine",
  DMA: "Départementale 1 Masculine",
  M1F: "Coupe de France Masters Féminine",
  M1M: "Coupe de France Masters Masculine",
  // Jeunes
  CFO: "M18 Féminine",
  CMI: "M18 Masculine",
  JFE: "M21 Féminine",
  JFD: "Coupe de France M21 Féminine",
  MFL: "M15 Féminine",
  BMI: "M13 Benjamin",
  // Compét loisir
  RC1: "Loisir Corpo",
  DLA: "Détente Loisir Excellence A",
  DLB: "Détente Loisir Excellence B",
  DSL: "Coupe du nord Compet-lib",
};

export function getCompetitionLabel(competition: string): string {
  const prefix = competition.split(" ")[0];
  return (prefix && COMPETITION_LABELS[prefix]) ?? competition;
}
