import { fetchMatches } from "./scraper/scraper.js";
import { groupMatchesByCategory } from "./matches/categories.js";
import {
  generateUpcomingVisual,
  generateResultsVisual,
} from "./generator/index.js";
import { mkdirSync } from "fs";
import type { Category } from "./matches/categories.js";

mkdirSync("output", { recursive: true });
mkdirSync("assets", { recursive: true });

async function main() {
  console.log("Récupération des matchs...");
  const upcoming = await fetchMatches(1);
  const results = await fetchMatches(-1);

  console.log("Génération des visuels à venir...");
  for (const match of upcoming) {
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
