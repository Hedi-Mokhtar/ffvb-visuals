import {
  fetchMatches,
  filterCurrentWeek,
  filterLastWeek,
} from "./scraper/scraper.js";
import type { Match } from "./scraper/scraper.js";
import { groupMatchesByCategory } from "./matches/categories.js";
import {
  generateUpcomingVisual,
  generateResultsVisual,
} from "./generator/index.js";
import { isSJL } from "./generator/helpers.js";
import { mkdirSync } from "fs";
import type { Category } from "./matches/categories.js";

mkdirSync("output", { recursive: true });
mkdirSync("assets", { recursive: true });

function groupUpcomingMatches(
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

async function main() {
  console.log("Récupération des matchs...");
  const [weekMinus1, week0, week1] = await Promise.all([
    fetchMatches(-1),
    fetchMatches(0),
    fetchMatches(1),
  ]);

  const upcoming = filterCurrentWeek([...week0, ...week1]);
  const results = filterLastWeek([...weekMinus1, ...week0]);

  console.log("Génération des visuels à venir...");
  const groupedUpcoming = groupUpcomingMatches(upcoming);
  for (const match of groupedUpcoming) {
    const path = await generateUpcomingVisual(match);
    console.log(`✓ ${path}`);
  }

  console.log("Génération des visuels résultats...");
  const grouped = groupMatchesByCategory(results.filter((m) => m.joue));
  for (const [category, matches] of Object.entries(grouped)) {
    if (matches.length > 0) {
      const paths = await generateResultsVisual(matches, category as Category);
      paths.forEach((p) => console.log(`✓ ${p}`));
    }
  }
}

main();
