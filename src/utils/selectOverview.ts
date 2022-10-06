import {
  MovieOverviewTranslation,
  SerieOverviewTranslation,
} from "@prisma/client";

export function selectOverview(
  overviews: (MovieOverviewTranslation | SerieOverviewTranslation)[],
  appLang: string
): string | null {
  const found = overviews.find(({ lang }) => lang === appLang);

  if (found) return found.text;
  return null;
}
