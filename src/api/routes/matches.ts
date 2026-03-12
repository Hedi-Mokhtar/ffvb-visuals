import { Router, type IRouter } from "express";
import { fetchMatches } from "../../scraper/scraper.js";

const router: IRouter = Router();

export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

router.get("/upcoming", async (_req, res) => {
  try {
    console.log("[/matches/upcoming] Fetching upcoming matches...");
    const matches = await fetchMatches(0);
    res.json({ success: true, data: matches });
  } catch (error) {
    console.error("[/matches/upcoming]", error);
    res.status(500).json({ success: false, error: handleError(error) });
  }
});

router.get("/results", async (_req, res) => {
  try {
    console.log("[/matches/results] Fetching past matches...");
    const matches = await fetchMatches(-1);
    res.json({ success: true, data: matches });
  } catch (error) {
    console.error("[/matches/results]", error);
    res.status(500).json({ success: false, error: handleError(error) });
  }
});

export default router;
