import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import type { Match } from "./scraper.js";
import type { Category } from "./categories.js";
import { getCompetitionLabel } from "./competitionLabels.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, "../assets");
const OUTPUT_DIR = path.join(__dirname, "../output");

const WIDTH = 630;
const HEIGHT = 1120;

function svgText(
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string,
  fontWeight: "normal" | "bold" = "normal",
  textAnchor: "start" | "middle" | "end" = "middle"
): string {
  return `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${color}" font-weight="${fontWeight}" text-anchor="${textAnchor}" font-family="Arial, sans-serif">${text}</text>`;
}

function svgLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number = 2
): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
}

export async function generateUpcomingVisual(match: Match): Promise<string> {
  const logoPath = path.join(ASSETS_DIR, "logo.png");
  const logo = await sharp(logoPath).resize(160, 160).toBuffer();

  const adversaire =
    match.domicile.includes("LILLE SJ") ||
    match.domicile.includes("SPORT & JOIE") ||
    match.domicile.includes("AS SPORT ET JOIE")
      ? match.exterieur
      : match.domicile;

  const isHome =
    match.domicile.includes("LILLE SJ") ||
    match.domicile.includes("SPORT & JOIE") ||
    match.domicile.includes("AS SPORT ET JOIE");

  const competition = getCompetitionLabel(match.competition);

  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="white"/>
      
      <!-- Décorations coins -->
      <circle cx="0" cy="0" r="120" fill="#CC1E1E" opacity="0.15"/>
      <circle cx="${WIDTH}" cy="${HEIGHT}" r="120" fill="#CC1E1E" opacity="0.15"/>

      <!-- Titre -->
      ${svgText("MATCHS DU", WIDTH / 2, 280, 52, "#CC1E1E", "bold")}
      ${svgText("WEEKEND", WIDTH / 2, 345, 52, "#CC1E1E", "bold")}
      
      <!-- Compétition -->
      ${svgText(competition.toUpperCase(), WIDTH / 2, 405, 26, "#000000", "bold")}
      
      <!-- Séparateur -->
      ${svgLine(80, 430, WIDTH - 80, 430, "#CC1E1E", 2)}

      <!-- Date et heure -->
      ${svgText(match.date, WIDTH / 2, 475, 28, "#000000", "normal")}
      ${svgText(`À ${match.heure}`, WIDTH / 2, 515, 28, "#000000", "normal")}
      ${svgText(isHome ? "À DOMICILE" : "À L'EXTÉRIEUR", WIDTH / 2, 555, 28, "#000000", "normal")}

      <!-- Séparateur -->
      ${svgLine(80, 580, WIDTH - 80, 580, "#CC1E1E", 2)}

      <!-- Équipes -->
      ${svgText("SPORT JOIE", WIDTH / 2, 660, 48, "#CC1E1E", "bold")}
      ${svgText("LILLE", WIDTH / 2, 720, 48, "#CC1E1E", "bold")}
      ${svgText("vs", WIDTH / 2, 775, 32, "#000000", "normal")}
      ${svgText(adversaire, WIDTH / 2, 840, 38, "#000000", "bold")}

      <!-- Séparateur -->
      ${svgLine(80, 900, WIDTH - 80, 900, "#CC1E1E", 2)}
    </svg>
  `;

  const svgBuffer = Buffer.from(svg);

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
      { input: svgBuffer, top: 0, left: 0 },
      { input: logo, top: 100, left: WIDTH / 2 - 80 },
    ])
    .png()
    .toFile(outputPath);

  return outputPath;
}
export async function generateResultsVisual(
  matches: Match[],
  category: Category
): Promise<string[]> {
  const categoryLabels: Record<Category, string> = {
    seniors: "SENIORS",
    jeunes: "JEUNES",
    competlib: "COMPÉT. LOISIR",
  };

  const playedMatches = matches.filter((m) => m.joue);
  const MATCHES_PER_PAGE = 5;
  const pages: Match[][] = [];

  for (let i = 0; i < playedMatches.length; i += MATCHES_PER_PAGE) {
    pages.push(playedMatches.slice(i, i + MATCHES_PER_PAGE));
  }

  const outputPaths: string[] = [];

  const logoWatermark = await sharp(path.join(ASSETS_DIR, "logo.png"))
    .resize(450, 450)
    .composite([
      {
        input: Buffer.from([255, 255, 255, 40]), // opacity très faible
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageMatches = pages[pageIndex];
    let currentY = 380;
    let matchesSvg = "";

    if (!pageMatches) continue;

    for (const match of pageMatches) {
      const isHome =
        match.domicile.includes("LILLE SJ") ||
        match.domicile.includes("SPORT & JOIE") ||
        match.domicile.includes("AS SPORT ET JOIE");

      const scoreSJL = isHome
        ? Number(match.scoreDomicile)
        : Number(match.scoreExterieur);
      const scoreAdv = isHome
        ? Number(match.scoreExterieur)
        : Number(match.scoreDomicile);

      const hasWon = scoreSJL > scoreAdv;
      const scoreColor = hasWon ? "#32B432" : "#CC1E1E";
      const score = `${scoreSJL}-${scoreAdv}`;
      const adversaire = isHome ? match.exterieur : match.domicile;
      const competition = getCompetitionLabel(match.competition);

      matchesSvg += svgText(
        `${score}  ${competition.toUpperCase()}`,
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
        ${svgText(`${categoryLabels[category]}${pageLabel}`, WIDTH / 2, 330, 30, "#000000", "bold")}
        ${svgLine(80, 350, WIDTH - 80, 350, "#CC1E1E", 2)}

        ${matchesSvg}
      </svg>
    `;

    const svgBuffer = Buffer.from(svg);
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
        { input: svgBuffer, top: 0, left: 0 },
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
