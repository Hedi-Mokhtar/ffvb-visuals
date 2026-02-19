import express, { type Express } from "express";
import { fetchMatches } from "./scraper.js";

const app: Express = express();
const PORT = process.env.PORT ?? 3000;

function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

app.get("/matches/upcoming", async (_req, res) => {
  try {
    const matches = await fetchMatches(1);
    res.json({ success: true, data: matches });
  } catch (error) {
    console.error("[/matches/upcoming]", error);
    res.status(500).json({
      success: false,
      error: handleError(error),
    });
  }
});

app.get("/matches/results", async (_req, res) => {
  try {
    const matches = await fetchMatches(-1);
    res.json({ success: true, data: matches });
  } catch (error) {
    console.error("[/matches/results]", error);
    res.status(500).json({
      success: false,
      error: handleError(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

export { app };
