import { getImdbIdFromCastLink } from "#/utils/extractImdbIdsFromUrl";
import { removePictureCropDirectiveFromUrl } from "./removePictureCropDirectivesFromUrl";
import { Person } from "@prisma/client";

export async function getCastFromTitleDocument(document: Document) {
  const personImdbIds = [] as Person[];
  const castElementArray = Array.from(
    document.querySelectorAll(
      ".title-cast > div:nth-child(2) > .ipc-sub-grid .ipc-avatar"
    )
  );

  for (const castElement of castElementArray) {
    const pictureElem = castElement.querySelector("img");
    const linkElement = castElement.querySelector("a");

    if (!pictureElem || !linkElement) continue;
    const personName = pictureElem.getAttribute("alt");
    const pictureUrl = pictureElem.getAttribute("src");
    const castLink = linkElement.getAttribute("href");
    const imdbId = getImdbIdFromCastLink(castLink);

    if (typeof personName !== "string") throw "Person name is no string";
    personImdbIds.push({
      imdbId,
      name: personName,
      pictureUrl: removePictureCropDirectiveFromUrl(pictureUrl),
    });
  }
  return personImdbIds;
}
