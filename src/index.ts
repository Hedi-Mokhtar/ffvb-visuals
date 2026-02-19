import { fetchMatches } from "./scraper.js";

async function main() {
  console.log("=== MATCHS À VENIR ===");
  const aVenir = await fetchMatches(1); // semaine prochaine
  console.log(aVenir);

  console.log("=== RÉSULTATS ===");
  const resultats = await fetchMatches(-1); // semaine passée
  console.log(resultats);
}

main();
