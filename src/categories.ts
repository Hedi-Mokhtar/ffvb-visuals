export type Category = "seniors" | "jeunes" | "competlib";

const CATEGORY_PREFIXES: Record<Category, string[]> = {
  seniors: ["PFA", "M1F", "M1M", "DMA", "1FA", "1MB"],
  jeunes: ["JFE", "JFD", "MFL"],
  competlib: ["RC1", "DLA", "DLB"],
};

export function getCategory(competition: string): Category | null {
  for (const [category, prefixes] of Object.entries(CATEGORY_PREFIXES)) {
    if (prefixes.some((prefix) => competition.startsWith(prefix))) {
      return category as Category;
    }
  }
  return null;
}

export function groupMatchesByCategory<T extends { competition: string }>(
  matches: T[]
): Record<Category, T[]> {
  const groups: Record<Category, T[]> = {
    seniors: [],
    jeunes: [],
    competlib: [],
  };

  for (const match of matches) {
    const category = getCategory(match.competition);
    if (category) {
      groups[category].push(match);
    }
  }

  return groups;
}
