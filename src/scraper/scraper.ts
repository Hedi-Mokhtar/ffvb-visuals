import axios from "axios";
import * as cheerio from "cheerio";
import { config } from "../config.js";

export interface Match {
  competition: string;
  date: string;
  heure: string;
  domicile: string;
  exterieur: string;
  salle?: string;
  scoreDomicile?: string;
  scoreExterieur?: string;
  joue: boolean;
}

export function parseMatches(html: string): Match[] {
  const $ = cheerio.load(html);
  const matches: Match[] = [];
  let currentCompetition = "";

  $("table tr").each((_, row) => {
    const cells = $(row).find("td");
    const text = $(row).text().trim();

    if (cells.length <= 3 && text.includes("-")) {
      const compText = cells.first().text().trim();
      if (compText.length > 5) currentCompetition = compText;
      return;
    }

    if (cells.length >= 8) {
      const date = $(cells[2]).text().trim();
      const heure = $(cells[3]).text().trim();
      const domicile = $(cells[4]).text().trim();
      const exterieur = $(cells[6]).text().trim();
      const scoreDom = $(cells[7]).text().trim();
      const scoreExt = $(cells[8]).text().trim();

      const joue = /^\d+$/.test(scoreDom) && /^\d+$/.test(scoreExt);
      const salle = joue
        ? undefined
        : $(row)
            .find("td.liengris_pt")
            .toArray()
            .map((el) => $(el).text().trim())
            .find((txt) => txt.length > 10) || undefined;

      if (date && domicile && exterieur && date !== "Compétition") {
        matches.push({
          competition: currentCompetition,
          date,
          heure,
          domicile,
          exterieur,
          ...(salle && { salle }),
          ...(joue && scoreDom && { scoreDomicile: scoreDom }),
          ...(joue && scoreExt && { scoreExterieur: scoreExt }),
          joue,
        });
      }
    }
  });

  return matches;
}

export function getMondayTimestamp(weekOffset: number): number {
  const now = new Date();
  const day = now.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const mondayUTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + diffToMonday + (weekOffset - 1) * 7,
      23,
      0,
      0,
      0
    )
  );

  return Math.floor(mondayUTC.getTime() / 1000);
}

export async function fetchMatches(weekOffset: number): Promise<Match[]> {
  const timestamp = getMondayTimestamp(weekOffset);
  const url = `${config.baseUrl}?aff_semaine=SUI&date_jour=${timestamp}&cnclub=${config.clubId}`;

  const { data } = await axios.get(url, { responseType: "arraybuffer" });
  const decoded = new TextDecoder("iso-8859-1").decode(data);
  return parseMatches(decoded);
}

function filterByWeek(matches: Match[], mondayOffset: number): Match[] {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return matches.filter((match) => {
    const [d = 1, m = 1] = match.date.split("/").map(Number);
    const matchDate = new Date(now.getFullYear(), m - 1, d);
    return matchDate >= monday && matchDate <= sunday;
  });
}

export function filterCurrentWeek(matches: Match[]): Match[] {
  return filterByWeek(matches, 0);
}

export function filterLastWeek(matches: Match[]): Match[] {
  return filterByWeek(matches, -7);
}
