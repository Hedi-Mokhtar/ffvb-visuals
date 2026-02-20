import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ASSETS_DIR = path.join(__dirname, "../../assets");
export const OUTPUT_DIR = path.join(__dirname, "../../output");

export const WIDTH = 630;
export const HEIGHT = 1120;

export function svgText(
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

export function svgLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number = 2
): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
}

export function isSJL(team: string): boolean {
  return (
    team.includes("LILLE SJ") ||
    team.includes("SPORT & JOIE") ||
    team.includes("AS SPORT ET JOIE")
  );
}
