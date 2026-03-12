# ffvb-visuals

[![PR Checks](https://github.com/Hedi-Mokhtar/ffvb-visuals/actions/workflows/pr-check.yml/badge.svg)](https://github.com/Hedi-Mokhtar/ffvb-visuals/actions/workflows/pr-check.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Hedi-Mokhtar_ffvb-visuals&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Hedi-Mokhtar_ffvb-visuals)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Hedi-Mokhtar_ffvb-visuals&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Hedi-Mokhtar_ffvb-visuals)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Hedi-Mokhtar_ffvb-visuals&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Hedi-Mokhtar_ffvb-visuals)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Hedi-Mokhtar_ffvb-visuals&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Hedi-Mokhtar_ffvb-visuals)
![Node.js](https://img.shields.io/badge/node-22-brightgreen?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![pnpm](https://img.shields.io/badge/pnpm-10.30-orange?logo=pnpm)

> Automated visual generator for **Sport Joie Lille** — scrapes match schedules and results from the FFVB website and produces ready-to-post social media images.

---

## Overview

`ffvb-visuals` fetches the weekly volleyball match data for Sport Joie Lille from the [FFVB](https://www.ffvb.org) (Fédération Française de Volley-Ball) website and generates two types of visuals:

- **Upcoming matches** — a clean announcement card with date, time, venue, and opponent
- **Results** — a recap card showing scores for all played matches, grouped by category (Seniors, Jeunes, Compét. Loisir)

Images are generated using [Sharp](https://sharp.pixelplumbing.com/) with SVG composition and are output as PNG files ready to be shared on social media.

---

## Example Output

| Upcoming match                               | Results                                  |
| -------------------------------------------- | ---------------------------------------- |
| ![Upcoming](./output/upcoming_DLB_24-02.png) | ![Results](./output/results_seniors.png) |

---

## Project Structure

```
.
├── assets/
│   └── logo.png               # Club logo used in visuals
├── src/
│   ├── api/
│   │   ├── server.ts          # Express API server
│   │   ├── routes/            # API route handlers
│   │   └── server.test.ts     # API integration tests
│   ├── generator/
│   │   ├── upcoming.ts        # Generates "upcoming match" visuals
│   │   ├── results.ts         # Generates "results" visuals
│   │   ├── helpers.ts         # Shared SVG helpers & constants
│   │   └── index.ts           # Generator entry point
│   ├── matches/
│   │   ├── categories.ts      # Match category definitions (seniors, jeunes, competlib)
│   │   └── competitionLabels.ts # Human-readable competition name mapping
│   ├── scraper/
│   │   └── scraper.ts         # FFVB scraper (axios + cheerio)
│   ├── config.ts              # Club ID & base URL config
│   └── index.ts               # Main entry point
├── tests/
│   └── fixtures/
│       └── ffvb-response.html # HTML fixture for scraper unit tests
└── output/                    # Generated PNG files
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 10

### Installation

```bash
pnpm install
```

### Configuration

Edit `src/config.ts` to set your club ID and the FFVB base URL:

```typescript
export const config = {
  baseUrl: "https://www.ffvb.org/...",
  clubId: "YOUR_CLUB_ID",
};
```

---

## Usage

### Generate visuals for the current week

```bash
pnpm start
```

This will:

1. Scrape upcoming and played matches for the current week from FFVB
2. Generate PNG images in the `output/` directory

### Start the API server

```bash
pnpm dev
```

The API server exposes endpoints to trigger generation on demand — useful for integrations or automation.

---

## Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `pnpm start`        | Run the main generator             |
| `pnpm dev`          | Start the API server in watch mode |
| `pnpm build`        | Compile TypeScript to JavaScript   |
| `pnpm test`         | Run all tests with Vitest          |
| `pnpm lint`         | Lint with ESLint                   |
| `pnpm format:check` | Check formatting with Prettier     |

---

## How It Works

### 1. Scraping

The scraper (`src/scraper/scraper.ts`) fetches the FFVB results page for a given week using the club's ID and a Unix timestamp pointing to the Monday of that week. The response is ISO-8859-1 encoded HTML, which is decoded and parsed with [Cheerio](https://cheerio.js.org/).

Each table row is parsed into a `Match` object:

```typescript
interface Match {
  competition: string;
  date: string;
  heure: string;
  domicile: string;
  exterieur: string;
  scoreDomicile?: string;
  scoreExterieur?: string;
  joue: boolean;
}
```

### 2. Categorisation

Matches are classified into three categories — `seniors`, `jeunes`, `competlib` — based on the competition name. Each category gets its own results visual.

### 3. Image Generation

Visuals are composed using Sharp:

- A base SVG is built as a string with all text, shapes, and layout
- The club logo (with a white circular background) is overlaid as a separate layer
- The final image is exported as a PNG to the `output/` directory

---

## CI/CD

Pull requests to `main` are validated by the **PR Checks** workflow (`.github/workflows/pr.yaml`):

- ✅ Lint (ESLint)
- ✅ Format check (Prettier)
- ✅ Tests (Vitest)
- ✅ Build (TypeScript)

---

## Architecture Notes

The project is currently structured with both a legacy `src/imageGenerator.ts` at the root of `src/` and a refactored `src/generator/` module. The generator module (`upcoming.ts`, `results.ts`, `helpers.ts`) is the active implementation — `imageGenerator.ts` can be removed once all call sites have been migrated.

---

## License

MIT
