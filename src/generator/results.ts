import sharp from "sharp";
import path from "node:path";
import type { Match } from "../scraper/scraper.js";
import type { Category } from "../matches/categories.js";
import { getCompetitionLabel } from "../matches/competitionLabels.js";
import { WIDTH, HEIGHT, ASSETS_DIR, OUTPUT_DIR, isSJL } from "./helpers.js";

const CATEGORY_LABELS: Record<Category, string> = {
  seniors: "SENIORS",
  jeunes: "JEUNES",
  competlib: "COMPÉT. LOISIR",
};

const MATCHES_PER_PAGE = 5;

// Height of the white card where matches are listed (excluding the red title banner)
const CARD_TOP = 330;
const CARD_HEIGHT = HEIGHT - CARD_TOP - 40;

export function paginateMatches<T>(items: T[], perPage: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  return pages;
}

export async function generateResultsVisual(
  matches: Match[],
  category: Category
): Promise<string[]> {
  const playedMatches = matches.filter((m) => m.joue);

  const pages = paginateMatches(playedMatches, MATCHES_PER_PAGE);

  // Logo with circular white background (same technique as upcoming)
  const logoRaw = await sharp(path.join(ASSETS_DIR, "logo.png"))
    .resize(200, 200)
    .toBuffer();

  const logoWithBackground = await sharp({
    create: {
      width: 220,
      height: 220,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([
      {
        input:
          Buffer.from(`<svg width="220" height="220" xmlns="http://www.w3.org/2000/svg">
          <circle cx="110" cy="110" r="108" fill="white"/>
        </svg>`),
        top: 0,
        left: 0,
      },
      { input: logoRaw, top: 10, left: 10 },
    ])
    .png()
    .toBuffer();

  const outputPaths: string[] = [];

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageMatches = pages[pageIndex];
    if (!pageMatches) continue;

    // Each match occupies ~114px in the card (after the 80px title banner)
    // Available area for matches: from y=490 to ~1060
    const MATCHES_START_Y = 490;
    const MATCH_BLOCK_HEIGHT = Math.floor(
      (HEIGHT - 40 - MATCHES_START_Y) / MATCHES_PER_PAGE
    ); // ~114px

    let matchesSvg = "";

    pageMatches.forEach((match, i) => {
      const isHome = isSJL(match.domicile);
      const scoreSJL = Number(
        isHome ? match.scoreDomicile : match.scoreExterieur
      );
      const scoreAdv = Number(
        isHome ? match.scoreExterieur : match.scoreDomicile
      );
      const hasWon = scoreSJL > scoreAdv;
      const adversaire = isHome ? match.exterieur : match.domicile;
      const competition = getCompetitionLabel(match.competition);

      const blockY = MATCHES_START_Y + i * MATCH_BLOCK_HEIGHT;
      const scoreColor = hasWon ? "#1a9e1a" : "#CC1E1E";
      const scoreBg = hasWon ? "#e8f7e8" : "#fdecea";
      const score = `${scoreSJL}-${scoreAdv}`;

      // Light background for each match row (subtle alternation)
      if (i % 2 === 0) {
        matchesSvg += `<rect x="60" y="${blockY - 18}" width="${WIDTH - 120}" height="${MATCH_BLOCK_HEIGHT - 6}" rx="10" ry="10" fill="#f9f9f9"/>`;
      }

      // Colored score badge
      matchesSvg += `
        <rect x="65" y="${blockY - 10}" width="80" height="36" rx="8" ry="8" fill="${scoreBg}"/>
        <text x="105" y="${blockY + 15}" font-size="22" fill="${scoreColor}" font-weight="bold" text-anchor="middle"
          font-family="'Bebas Neue', Impact, 'Arial Black', sans-serif" letter-spacing="2">${score}</text>
      `;

      // Competition + opponent
      matchesSvg += `
        <text x="160" y="${blockY + 8}" font-size="17" fill="#CC1E1E" font-weight="bold" text-anchor="start"
          font-family="'Montserrat', Arial, sans-serif" letter-spacing="1">${competition.toUpperCase()}</text>
        <text x="160" y="${blockY + 28}" font-size="19" fill="#1a1a1a" font-weight="bold" text-anchor="start"
          font-family="'Bebas Neue', Impact, 'Arial Black', sans-serif" letter-spacing="2">VS  ${adversaire}</text>
      `;

      // Separator (except for the last one)
      if (i < pageMatches.length - 1) {
        matchesSvg += `<line x1="60" y1="${blockY + MATCH_BLOCK_HEIGHT - 14}" x2="${WIDTH - 60}" y2="${blockY + MATCH_BLOCK_HEIGHT - 14}" stroke="#eeeeee" stroke-width="1.5"/>`;
      }
    });

    const pageLabel =
      pages.length > 1 ? ` (${pageIndex + 1}/${pages.length})` : "";
    const categoryLabel = CATEGORY_LABELS[category];

    const svg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#CC1E1E"/>
            <stop offset="45%" stop-color="#8B0000"/>
            <stop offset="100%" stop-color="#1a1a1a"/>
          </linearGradient>
          <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#f5f5f5"/>
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#00000033"/>
          </filter>
        </defs>

        <!-- Fond dégradé -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGrad)"/>

        <!-- Cercles décoratifs -->
        <circle cx="-40" cy="160" r="200" fill="white" opacity="0.04"/>
        <circle cx="${WIDTH + 60}" cy="400" r="250" fill="white" opacity="0.04"/>
        <circle cx="${WIDTH / 2}" cy="200" r="350" fill="white" opacity="0.03"/>

        <!-- Lignes diagonales -->
        <line x1="0" y1="${HEIGHT * 0.3}" x2="${WIDTH}" y2="${HEIGHT * 0.15}" stroke="white" stroke-width="1" opacity="0.08"/>
        <line x1="0" y1="${HEIGHT * 0.35}" x2="${WIDTH}" y2="${HEIGHT * 0.2}" stroke="white" stroke-width="1" opacity="0.05"/>

        <!-- Carte blanche -->
        <rect x="40" y="${CARD_TOP}" width="${WIDTH - 80}" height="${CARD_HEIGHT}" rx="20" ry="20" fill="url(#cardGrad)" filter="url(#shadow)"/>

        <!-- Bandeau rouge titre -->
        <rect x="40" y="${CARD_TOP}" width="${WIDTH - 80}" height="80" rx="20" ry="20" fill="#CC1E1E"/>
        <rect x="40" y="${CARD_TOP + 40}" width="${WIDTH - 80}" height="40" fill="#CC1E1E"/>

        <!-- Titre -->
        <text x="${WIDTH / 2}" y="${CARD_TOP + 46}" font-size="32" fill="white" font-weight="bold" text-anchor="middle"
          font-family="'Bebas Neue', Impact, 'Arial Black', sans-serif" letter-spacing="4">RÉSULTATS DES MATCHS</text>

        <!-- Catégorie + page -->
        <text x="${WIDTH / 2}" y="${CARD_TOP + 110}" font-size="20" fill="#CC1E1E" font-weight="bold" text-anchor="middle"
          font-family="'Montserrat', Arial, sans-serif" letter-spacing="3">${categoryLabel}${pageLabel}</text>

        <!-- Séparateur sous catégorie -->
        <line x1="120" y1="${CARD_TOP + 128}" x2="${WIDTH - 120}" y2="${CARD_TOP + 128}" stroke="#CC1E1E" stroke-width="1.5" opacity="0.35"/>

        <!-- Matchs -->
        ${matchesSvg}

        <!-- Bande déco bas de carte -->
        <rect x="40" y="${HEIGHT - 80}" width="${WIDTH - 80}" height="8" fill="#CC1E1E" opacity="0.15"/>
        <rect x="40" y="${HEIGHT - 72}" width="${WIDTH - 80}" height="32" rx="0" ry="20" fill="#CC1E1E"/>
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
        background: { r: 204, g: 30, b: 30, alpha: 1 },
      },
    })
      .composite([
        { input: Buffer.from(svg), top: 0, left: 0 },
        { input: logoWithBackground, top: 80, left: WIDTH / 2 - 110 },
      ])
      .png()
      .toFile(outputPath);

    outputPaths.push(outputPath);
  }

  return outputPaths;
}
