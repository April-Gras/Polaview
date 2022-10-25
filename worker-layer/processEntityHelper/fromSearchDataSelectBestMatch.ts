import { SearchResult } from "@prisma/client";

import { compareTwoStrings } from "string-similarity";

export function fromSearchDataSelectBestMatch(
  searchData: SearchResult[],
  searchTerm: string
): SearchResult {
  let mostSimilarMatch = {
    score: 0,
    element: null as SearchResult | null,
  };
  searchTerm = searchTerm.toLocaleLowerCase();

  for (const search of searchData) {
    const { name } = search;
    const currentScore = compareTwoStrings(searchTerm, name.toLowerCase());

    if (currentScore > mostSimilarMatch.score) {
      mostSimilarMatch.score = currentScore;
      mostSimilarMatch.element = search;
    }
  }

  if (mostSimilarMatch.element) return mostSimilarMatch.element;
  return searchData[0];
}
