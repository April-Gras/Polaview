import { expose } from "threads/worker";
import { removePictureCropDirectiveFromUrl } from "scraper/utils/removePictureCropDirectivesFromUrl";
import { extractImdbIdFromTitleLink } from "scraper/utils/extractImdbIdsFromUrl";
import { Title } from "@prisma/client";

import { getImdbPageFromUrlAxiosTransporter } from "scraper/utils/provideAxiosGet";
import { JSDOM } from "jsdom";

export type SearchThreadWorkerReturn = {
  thumbnailUrl: string | null;
  imdbId: Title["imdbId"];
  name: string;
};

import { SearchArguments, SearchType } from "~/types/Search";

export type SearchThreadWorker = (
  context: SearchArguments
) => Promise<SearchThreadWorkerReturn[]>;

const searchThreadWorker: SearchThreadWorker = async ({
  term,
  typesToCheck,
  releaseYear,
}) => {
  if (!typesToCheck) typesToCheck = [SearchType.movie, SearchType.TV];
  if (!releaseYear) releaseYear = null;
  try {
    const processedSearchTerm = term.replace(/ /gi, "+");
    const resultFromExactSearch = (
      await Promise.all(
        typesToCheck.map((checkType) =>
          findByTypeFromBrowser(checkType, processedSearchTerm, true)
        )
      )
    ).flat();

    if (resultFromExactSearch.length) return resultFromExactSearch;

    const results = await Promise.all(
      typesToCheck.map((checkType) =>
        findByTypeFromBrowser(checkType, processedSearchTerm)
      )
    );

    return results.flat();
  } catch (err) {
    console.log(err);
    return [];
  }
};

async function findByTypeFromBrowser(
  searchType: SearchType,
  processedSearchTerm: string,
  exact = false
) {
  const url =
    `https://www.imdb.com/find?q=${processedSearchTerm}&s=tt&ttype=${searchType}` +
    (exact ? "&exact=true" : "");

  const { data } = await getImdbPageFromUrlAxiosTransporter.get(url);
  const { document } = new JSDOM(data).window;

  const resultEntries = Array.from(document.querySelectorAll(".findResult"));

  const results = (
    await Promise.all(resultEntries.map(evaluateResultEntry))
  ).reduce((accumulator, element) => {
    if (element) accumulator.push(element);
    return accumulator;
  }, [] as SearchThreadWorkerReturn[]);
  return results;
}

async function evaluateResultEntry(
  resultEntry: Element
): Promise<SearchThreadWorkerReturn | null> {
  const parentDiv = resultEntry.querySelector(".result_text");
  if (!parentDiv) return null;
  const linkElement = parentDiv.querySelector("a");

  if (!linkElement) return null;

  const link = linkElement.getAttribute("href");
  const name = linkElement.textContent;
  const textCheckForLowQualityRersults = parentDiv.textContent;
  const imdbId = extractImdbIdFromTitleLink(link);

  if (
    !imdbId ||
    !name ||
    // Low qulity results can fuck off :>
    (textCheckForLowQualityRersults &&
      textCheckForLowQualityRersults.includes("in development"))
  )
    return null;

  const pictureElement = resultEntry.querySelector(".primary_photo img");
  const ret = {
    imdbId,
    name,
    thumbnailUrl: null,
  };
  if (pictureElement) {
    const thumbnailUrl = removePictureCropDirectiveFromUrl(
      pictureElement.getAttribute("src")
    );
    const placeholderThumbnail =
      "https://m.media-amazon.com/images/S/sash/85lhIiFCmSScRzu.png";

    // Low quality result can fuck off
    if (thumbnailUrl === placeholderThumbnail) return null;
    removePictureCropDirectiveFromUrl(thumbnailUrl);
    return {
      ...ret,
      thumbnailUrl,
    };
  }

  return ret;
}

expose(searchThreadWorker);
