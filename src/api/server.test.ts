import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "./server.js";
import * as scraper from "../scraper/scraper.js";

vi.mock("../scraper/scraper.js");

const mockMatches = [
  {
    competition: "PFA - PRE-NATIONALE FEMININES",
    date: "14/02",
    heure: "18:30",
    domicile: "LILLE SJ 1",
    exterieur: "SAINT POL SUR MER 2",
    scoreDomicile: "3",
    scoreExterieur: "0",
    joue: true,
  },
];

describe("GET /matches/upcoming", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("return incoming matches", async () => {
    vi.spyOn(scraper, "fetchMatches").mockResolvedValue(mockMatches);
    const res = await request(app).get("/matches/upcoming");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockMatches);
  });

  it("return 500 error if scraper fails", async () => {
    vi.spyOn(scraper, "fetchMatches").mockRejectedValue(
      new Error("Network timeout")
    );
    const res = await request(app).get("/matches/upcoming");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Network timeout");
  });
});

describe("GET /matches/results", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("return match results", async () => {
    vi.spyOn(scraper, "fetchMatches").mockResolvedValue(mockMatches);
    const res = await request(app).get("/matches/results");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockMatches);
  });

  it("return 500 error if scraper fails", async () => {
    vi.spyOn(scraper, "fetchMatches").mockRejectedValue(
      new Error("Site unavailable")
    );
    const res = await request(app).get("/matches/results");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Site unavailable");
  });
});
