import sharp from "sharp";
import path from "path";
import type { Match } from "../scraper/scraper.js";
import { getCompetitionLabel } from "../matches/competitionLabels.js";
import {
  WIDTH,
  HEIGHT,
  ASSETS_DIR,
  OUTPUT_DIR,
  isSJL,
  escapeXml,
} from "./helpers.js";

export async function generateUpcomingVisual(
  match: Match & { adversaires: string[] }
): Promise<string> {
  const logo = await sharp(path.join(ASSETS_DIR, "logo.png"))
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
        input: Buffer.from(`
        <svg width="220" height="220" xmlns="http://www.w3.org/2000/svg">
          <circle cx="110" cy="110" r="108" fill="white"/>
        </svg>
      `),
        top: 0,
        left: 0,
      },
      {
        input: logo,
        top: 10,
        left: 10,
      },
    ])
    .png()
    .toBuffer();

  const isHome = isSJL(match.domicile);
  const hasMultiple = match.adversaires.length > 1;

  function splitAdversaire(
    name: string,
    maxLength: number = 16
  ): [string, string | null] {
    if (name.length <= maxLength) return [name, null];

    const words = name.split(" ");
    let line1 = "";
    let line2 = "";

    for (const word of words) {
      if ((line1 + " " + word).trim().length <= maxLength) {
        line1 = (line1 + " " + word).trim();
      } else {
        line2 = (line2 + " " + word).trim();
      }
    }

    return [line1, line2 || null];
  }

  function getAdversaireFontSize(name: string): number {
    if (name.length <= 12) return 32;
    if (name.length <= 18) return 24;
    if (name.length <= 24) return 24;
    return 20;
  }

  const competition = escapeXml(getCompetitionLabel(match.competition));
  const salle = escapeXml(match.salle || "");
  const JOURS = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];

  function getDayLabel(dateStr: string): string {
    const [d = 1, m = 1] = dateStr.split("/").map(Number);
    const date = new Date(new Date().getFullYear(), m - 1, d);
    return JOURS[date.getDay()] ?? "";
  }

  const dayLabel = getDayLabel(match.date);
  const date = escapeXml(match.date);
  const heure = escapeXml(match.heure);

  const adv1 = escapeXml(match.adversaires[0] ?? "");
  const adv2 = escapeXml(match.adversaires[1] ?? "");

  const [adv1Line1, adv1Line2] = splitAdversaire(adv1);
  const [adv2Line1, adv2Line2] = splitAdversaire(adv2);
  const fontSize1 = getAdversaireFontSize(adv1);
  const fontSize2 = getAdversaireFontSize(adv2);

  const adversairesSvg = hasMultiple
    ? `
    <!-- Journée double -->
    <text x="${WIDTH / 2}" y="820" font-size="18" fill="#666666" font-weight="normal" text-anchor="middle"
      font-family="'Montserrat', Arial, sans-serif" letter-spacing="2">JOURNÉE DOUBLE</text>
    <text x="${WIDTH / 2}" y="${adv1Line2 ? "848" : "858"}" font-size="${fontSize1}" fill="#1a1a1a" font-weight="bold" text-anchor="middle"
      font-family="'Bebas Neue', 'Arial Black', sans-serif" letter-spacing="3">${adv1Line1}</text>
    ${
      adv1Line2
        ? `<text x="${WIDTH / 2}" y="${848 + fontSize1 + 4}" font-size="${fontSize1}" fill="#1a1a1a" font-weight="bold" text-anchor="middle"
      font-family="'Bebas Neue', 'Arial Black', sans-serif" letter-spacing="3">${adv1Line2}</text>`
        : ""
    }
    <text x="${WIDTH / 2}" y="${(adv1Line2 ? 848 + fontSize1 * 2 + 8 : 858 + fontSize1) + 8}" font-size="20" fill="#CC1E1E" font-weight="bold" text-anchor="middle"
      font-family="'Montserrat', Arial, sans-serif">&amp;</text>
    <text x="${WIDTH / 2}" y="${(adv1Line2 ? 848 + fontSize1 * 2 + 8 : 858 + fontSize1) + 8 + 30}" font-size="${fontSize2}" fill="#1a1a1a" font-weight="bold" text-anchor="middle"
      font-family="'Bebas Neue', 'Arial Black', sans-serif" letter-spacing="3">${adv2Line1}</text>
    ${
      adv2Line2
        ? `<text x="${WIDTH / 2}" y="${(adv1Line2 ? 848 + fontSize1 * 2 + 8 : 858 + fontSize1) + 8 + 30 + fontSize2 + 4}" font-size="${fontSize2}" fill="#1a1a1a" font-weight="bold" text-anchor="middle"
      font-family="'Bebas Neue', 'Arial Black', sans-serif" letter-spacing="3">${adv2Line2}</text>`
        : ""
    }
  `
    : `
    <!-- Adversaire unique -->
    <text x="${WIDTH / 2}" y="${adv1Line2 ? "845" : "860"}" font-size="${fontSize1}" fill="#1a1a1a" font-weight="bold" text-anchor="middle"
      font-family="'Bebas Neue', 'Arial Black', sans-serif" letter-spacing="3">${adv1Line1}</text>
    ${
      adv1Line2
        ? `<text x="${WIDTH / 2}" y="${845 + fontSize1 + 5}" font-size="${fontSize1}" fill="#1a1a1a" font-weight="bold" text-anchor="middle"
      font-family="'Bebas Neue', 'Arial Black', sans-serif" letter-spacing="3">${adv1Line2}</text>`
        : ""
    }
    <g transform="translate(${WIDTH / 2 - 16}, ${adv1Line2 ? 845 + fontSize1 * 2 + 10 : 900})">
      <svg width="32" height="32" viewBox="0 0 24 24">
        <path d="${isHome ? "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" : "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"}" fill="#CC1E1E"/>
      </svg>
    </g>
    <text x="${WIDTH / 2}" y="${adv1Line2 ? 845 + fontSize1 * 2 + 55 : 950}" font-size="20" fill="#666666" font-weight="normal" text-anchor="middle"
      font-family="'Montserrat', Arial, sans-serif">${salle}</text>
  `;

  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&amp;family=Montserrat:wght@400;700&amp;display=swap');
        </style>
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

      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGrad)"/>
      <circle cx="-40" cy="160" r="200" fill="white" opacity="0.04"/>
      <circle cx="${WIDTH + 60}" cy="400" r="250" fill="white" opacity="0.04"/>
      <circle cx="${WIDTH / 2}" cy="200" r="350" fill="white" opacity="0.03"/>
      <line x1="0" y1="${HEIGHT * 0.3}" x2="${WIDTH}" y2="${HEIGHT * 0.15}" stroke="white" stroke-width="1" opacity="0.08"/>
      <line x1="0" y1="${HEIGHT * 0.35}" x2="${WIDTH}" y2="${HEIGHT * 0.2}" stroke="white" stroke-width="1" opacity="0.05"/>

      <rect x="40" y="330" width="${WIDTH - 80}" height="710" rx="20" ry="20" fill="url(#cardGrad)" filter="url(#shadow)"/>
      <rect x="40" y="330" width="${WIDTH - 80}" height="80" rx="20" ry="20" fill="#CC1E1E"/>
      <rect x="40" y="370" width="${WIDTH - 80}" height="40" fill="#CC1E1E"/>

      <text x="${WIDTH / 2}" y="382" font-size="36" fill="white" font-weight="bold" text-anchor="middle"
        font-family="'Bebas Neue', 'Arial Black', sans-serif" letter-spacing="4">MATCHS À VENIR</text>

      <text x="${WIDTH / 2}" y="450" font-size="22" fill="#CC1E1E" font-weight="bold" text-anchor="middle"
        font-family="'Montserrat', Arial, sans-serif" letter-spacing="2">${competition.toUpperCase()}</text>

      <line x1="120" y1="470" x2="${WIDTH - 120}" y2="470" stroke="#CC1E1E" stroke-width="1.5" opacity="0.4"/>

      <text x="${WIDTH / 2}" y="515" font-size="26" fill="#222222" font-weight="normal" text-anchor="middle"
        font-family="'Montserrat', Arial, sans-serif">${dayLabel} ${date} · ${heure}</text>
      <text x="${WIDTH / 2}" y="552" font-size="20" fill="#666666" font-weight="normal" text-anchor="middle"
        font-family="'Montserrat', Arial, sans-serif">${isHome ? "À DOMICILE" : "À L&apos;EXTÉRIEUR"}</text>

      <line x1="120" y1="578" x2="${WIDTH - 120}" y2="578" stroke="#CC1E1E" stroke-width="1.5" opacity="0.4"/>

      <text x="${WIDTH / 2}" y="660" font-size="55" fill="#CC1E1E" font-weight="bold" text-anchor="middle"
        font-family="'Bebas Neue', 'Arial Black', sans-serif" letter-spacing="6">SPORT JOIE</text>
      <text x="${WIDTH / 2}" y="730" font-size="55" fill="#CC1E1E" font-weight="bold" text-anchor="middle"
        font-family="'Bebas Neue', 'Arial Black', sans-serif" letter-spacing="6">LILLE</text>

      <circle cx="${WIDTH / 2}" cy="785" r="28" fill="#CC1E1E"/>
      <text x="${WIDTH / 2}" y="793" font-size="22" fill="white" font-weight="bold" text-anchor="middle"
        font-family="'Bebas Neue', 'Arial Black', sans-serif" letter-spacing="2">VS</text>

      ${adversairesSvg}

      <rect x="40" y="980" width="${WIDTH - 80}" height="10" rx="0" ry="0" fill="#CC1E1E" opacity="0.15"/>
      <rect x="40" y="1000" width="${WIDTH - 80}" height="40" rx="0" ry="20" fill="#CC1E1E"/>
    </svg>
  `;

  const outputPath = path.join(
    OUTPUT_DIR,
    `upcoming_${match.competition.split(" ")[0]}_${date.replace("/", "-")}.png`
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
      { input: logoWithBackground, top: 90, left: WIDTH / 2 - 100 },
    ])
    .png()
    .toFile(outputPath);

  return outputPath;
}
