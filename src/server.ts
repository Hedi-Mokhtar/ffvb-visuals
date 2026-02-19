import express from "express";
import { fetchMatches } from "./scraper.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.get("/matches/upcoming", async (_req, res) => {
  try {
    const matches = await fetchMatches(1);
    res.json({ success: true, data: matches });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des matchs",
    });
  }
});

app.get("/matches/results", async (_req, res) => {
  try {
    const matches = await fetchMatches(-1);
    res.json({ success: true, data: matches });
  } catch {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des résultats",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
