import { fetchMatches } from "./scraper.js";

async function main() {
  console.log("=== UPCOMING MATCHES ===");
  const incoming = await fetchMatches(1);
  console.log(incoming);

  console.log("=== RESULTS ===");
  const results = await fetchMatches(-1);
  console.log(results);
}

main();
