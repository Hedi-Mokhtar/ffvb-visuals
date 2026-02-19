import axios from "axios";
import * as cheerio from "cheerio";

const CLUB_ID = "0593506";
const BASE_URL = "https://www.ffvbbeach.org/ffvbapp/resu/planning_club.php";

export interface Match {
  competition: string;
  date: string;
  heure: string;
  domicile: string;
  exterieur: string;
  scoreDomicile?: string;
  scoreExterieur?: string;
  joue: boolean;
}

export function getWeekTimestamp(offsetWeeks: number): number {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  return Math.floor(monday.getTime() / 1000);
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

      if (date && domicile && exterieur && date !== "Compétition") {
        matches.push({
          competition: currentCompetition,
          date,
          heure,
          domicile,
          exterieur,
          ...(scoreDom && { scoreDomicile: scoreDom }),
          ...(scoreExt && { scoreExterieur: scoreExt }),
          joue: scoreDom !== "" && scoreExt !== "",
        });
      }
    }
  });

  return matches;
}

export async function fetchMatches(weekOffset: number): Promise<Match[]> {
  const timestamp = getWeekTimestamp(weekOffset);
  const url = `${BASE_URL}?aff_semaine=PRE&date_jour=${timestamp}&cnclub=${CLUB_ID}`;

  const { data } = await axios.get(url, { responseType: "arraybuffer" });
  const decoded = new TextDecoder("iso-8859-1").decode(data);
  return parseMatches(decoded);
}
