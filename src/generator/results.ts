import sharp from "sharp";
import path from "path";
import type { Match } from "../scraper/scraper.js";
import type { Category } from "../matches/categories.js";
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

const CATEGORY_LABELS: Record<Category, string> = {
  seniors: "SENIORS",
  jeunes: "JEUNES",
  competlib: "COMPÉT. LOISIR",
};

const MATCHES_PER_PAGE = 5;

export async function generateResultsVisual(
  matches: Match[],
  category: Category
): Promise<string[]> {
  const playedMatches = matches.filter((m) => m.joue);
  const pages: Match[][] = [];

  for (let i = 0; i < playedMatches.length; i += MATCHES_PER_PAGE) {
    pages.push(playedMatches.slice(i, i + MATCHES_PER_PAGE));
  }

  const logoWatermark = await sharp(path.join(ASSETS_DIR, "logo.png"))
    .resize(450, 450)
    .composite([
      {
        input: Buffer.from([255, 255, 255, 40]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const outputPaths: string[] = [];

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageMatches = pages[pageIndex];
    if (!pageMatches) continue;

    let currentY = 380;
    let matchesSvg = "";

    for (const match of pageMatches) {
      const isHome = isSJL(match.domicile);
      const scoreSJL = Number(
        isHome ? match.scoreDomicile : match.scoreExterieur
      );
      const scoreAdv = Number(
        isHome ? match.scoreExterieur : match.scoreDomicile
      );
      const scoreColor = scoreSJL > scoreAdv ? "#32B432" : "#CC1E1E";
      const adversaire = isHome ? match.exterieur : match.domicile;
      const competition = getCompetitionLabel(match.competition);

      matchesSvg += svgText(
        `${scoreSJL}-${scoreAdv}  ${competition.toUpperCase()}`,
        WIDTH / 2,
        currentY,
        28,
        scoreColor,
        "bold"
      );
      currentY += 42;
      matchesSvg += svgText(
        `VS  ${adversaire}`,
        WIDTH / 2,
        currentY,
        22,
        "#000000",
        "normal"
      );
      currentY += 32;
      matchesSvg += svgLine(
        80,
        currentY + 8,
        WIDTH - 80,
        currentY + 8,
        "#EEEEEE"
      );
      currentY += 40;
    }

    const pageLabel =
      pages.length > 1 ? ` (${pageIndex + 1}/${pages.length})` : "";

    const svg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${WIDTH}" height="${HEIGHT}" fill="white"/>
        <circle cx="0" cy="0" r="120" fill="#CC1E1E" opacity="0.15"/>
        <circle cx="${WIDTH}" cy="${HEIGHT}" r="120" fill="#CC1E1E" opacity="0.15"/>

        ${svgText("RÉSULTATS", WIDTH / 2, 200, 58, "#CC1E1E", "bold")}
        ${svgText("MATCHS", WIDTH / 2, 268, 58, "#CC1E1E", "bold")}
        ${svgText(`${CATEGORY_LABELS[category]}${pageLabel}`, WIDTH / 2, 330, 30, "#000000", "bold")}
        ${svgLine(80, 350, WIDTH - 80, 350, "#CC1E1E", 2)}

        ${matchesSvg}
      </svg>
    `;

    const suffix = pages.length > 1 ? `_${pageIndex + 1}` : "";
    const outputPath = path.join(
      OUTPUT_DIR,
      `results_${category}${suffix}.png`
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
        {
          input: logoWatermark,
          top: HEIGHT / 2 - 225,
          left: WIDTH / 2 - 225,
          blend: "over",
        },
      ])
      .png()
      .toFile(outputPath);

    outputPaths.push(outputPath);
  }

  return outputPaths;
}
