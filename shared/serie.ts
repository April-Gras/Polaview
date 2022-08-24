import { Serie } from "@prisma/client";

/**
 * Utility function used to generate a unique season id.
 * @param serie - The prisma `Serie` object
 * @param seasonIndex - The index of the season (starts at 0)
 * @returns - A unique string Id for this season
 */
export function buildSeasonIdFromSerieImdbIdAndIndex(
  serie: Serie,
  seasonIndex: number
): string {
  return `${serie.imdbId}_${seasonIndex}`;
}
