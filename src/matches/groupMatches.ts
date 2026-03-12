import { isSJL } from "../generator/helpers.js";
import type { Match } from "../scraper/scraper.js";

export function groupUpcomingMatches(
  matches: Match[]
): (Match & { adversaires: string[] })[] {
  const map = new Map<string, Match & { adversaires: string[] }>();

  for (const match of matches) {
    const isHome = isSJL(match.domicile);
    const adversaire = isHome ? match.exterieur : match.domicile;
    const key = `${match.competition}_${match.date}`;

    if (map.has(key)) {
      map.get(key)!.adversaires.push(adversaire);
    } else {
      map.set(key, { ...match, adversaires: [adversaire] });
    }
  }

  return Array.from(map.values());
}
