import sharp from "sharp";
import path from "path";
import type { Match } from "../scraper/scraper.js";
import { getCompetitionLabel } from "../matches/competitionLabels.js";
import {
  WIDTH,
  HEIGHT,
  ASSETS_DIR,
  OUTPUT_DIR,
  svgText,
  svgLine,
  isSJL,
} from "./helpers.js";

export async function generateUpcomingVisual(match: Match): Promise<string> {
  const logo = await sharp(path.join(ASSETS_DIR, "logo.png"))
    .resize(160, 160)
    .toBuffer();

  const isHome = isSJL(match.domicile);
  const adversaire = isHome ? match.exterieur : match.domicile;
  const competition = getCompetitionLabel(match.competition);

  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="white"/>
      <circle cx="0" cy="0" r="120" fill="#CC1E1E" opacity="0.15"/>
      <circle cx="${WIDTH}" cy="${HEIGHT}" r="120" fill="#CC1E1E" opacity="0.15"/>

      ${svgText("MATCHS A", WIDTH / 2, 280, 62, "#CC1E1E", "bold")}
      ${svgText("VENIR", WIDTH / 2, 345, 62, "#CC1E1E", "bold")}
      ${svgText(competition.toUpperCase(), WIDTH / 2, 405, 30, "#000000", "bold")}
      ${svgLine(80, 430, WIDTH - 80, 430, "#CC1E1E", 2)}

      ${svgText(match.date, WIDTH / 2, 475, 32, "#000000", "normal")}
      ${svgText(`À ${match.heure}`, WIDTH / 2, 515, 32, "#000000", "normal")}
      ${svgText(isHome ? "À DOMICILE" : "À L'EXTÉRIEUR", WIDTH / 2, 555, 32, "#000000", "normal")}
      ${svgLine(80, 580, WIDTH - 80, 580, "#CC1E1E", 2)}

      ${svgText("SPORT JOIE", WIDTH / 2, 660, 50, "#CC1E1E", "bold")}
      ${svgText("LILLE", WIDTH / 2, 720, 50, "#CC1E1E", "bold")}
      ${svgText("vs", WIDTH / 2, 775, 32, "#000000", "normal")}
      ${svgText(adversaire, WIDTH / 2, 840, 40, "#000000", "bold")}
      ${svgLine(80, 900, WIDTH - 80, 900, "#CC1E1E", 2)}
    </svg>
  `;

  const outputPath = path.join(
    OUTPUT_DIR,
    `upcoming_${match.competition.split(" ")[0]}_${match.date.replace("/", "-")}.png`
  );

  await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: Buffer.from(svg), top: 0, left: 0 },
      { input: logo, top: 100, left: WIDTH / 2 - 80 },
    ])
    .png()
    .toFile(outputPath);

  return outputPath;
}
