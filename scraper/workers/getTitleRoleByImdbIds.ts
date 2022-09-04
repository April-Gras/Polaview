import { Person, Role } from "@prisma/client";
import { expose } from "threads";
import { JSDOM } from "jsdom";

import { removePictureCropDirectiveFromUrl } from "#/utils/removePictureCropDirectivesFromUrl";
import { getImdbPageFromUrlAxiosTransporter } from "#/utils/provideAxiosGet";

export type GetTitleRoleByImdbIdsThreadWorkerReturn = Role | null;
export type GetTitleRoleByImdbIdsThreadWorker = (
  titleImdbId: string,
  personImdbId: string
) => Promise<GetTitleRoleByImdbIdsThreadWorkerReturn>;

const getTitleRoleByImdbIdsThreadWorker: GetTitleRoleByImdbIdsThreadWorker =
  async (titleImdbId, personImdbId) => {
    const url = `https://www.imdb.com/title/${titleImdbId}/characters/${personImdbId}/`;
    const { data } = await getImdbPageFromUrlAxiosTransporter.get(url);
    const { document } = new JSDOM(data).window;
    const nameCaptureRegex = /.*: (?<name>.*)/gi;

    const nameElement = document.querySelector(".header");

    if (!nameElement || !nameElement.textContent) return null;
    const matches = nameCaptureRegex.exec(nameElement.textContent);
    if (!matches || !matches.groups || !matches.groups.name) return null;

    return {
      name: matches.groups.name,
      pictureUrl: getPicturesFromRolePageDocument(document),
      imdbId: personImdbId,
      personImdbId,
      titleImdbId,
    };
  };

export function getPicturesFromRolePageDocument(
  document: Document
): string | null {
  const pictureElement = document.querySelector(
    ".titlecharacters-image-grid > a > img"
  );

  if (!pictureElement) return null;
  const pictureLink = pictureElement.getAttribute("src");
  if (!pictureLink) return null;
  return removePictureCropDirectiveFromUrl(pictureLink);
}

expose(getTitleRoleByImdbIdsThreadWorker);
