import { Serie } from "@prisma/client";

export function buildSeasonIdFromSerieImdbIdAndIndex(
  serie: Serie,
  seasonIndex: number
): string {
  return `${serie.imdbId}_${seasonIndex}`;
}
