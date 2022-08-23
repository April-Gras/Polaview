import { JSDOM } from "jsdom";
import { getImdbPageFromUrlAxiosTransporter } from "#/utils/provideAxiosGet";

import { getImdbIdFromCastLink } from "#/utils/extractImdbIdsFromUrl";
import { removePictureCropDirectiveFromUrl } from "./removePictureCropDirectivesFromUrl";
import { Person } from "@prisma/client";

export function getCastFromTitleDocument(document: Document) {
  const persons = [] as Person[];
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

    if (!personName) throw "Person name is no string";
    persons.push({
      imdbId,
      name: personName,
      pictureUrl: removePictureCropDirectiveFromUrl(pictureUrl),
    });
  }
  return persons;
}

export async function getFullCreditDocumentFromTitleImdbId(imdbId: string) {
  const url = `https://www.imdb.com/title/${imdbId}/fullcredits/`;

  const { data } = await getImdbPageFromUrlAxiosTransporter.get(url);

  return new JSDOM(data).window.document;
}

export async function getWritersFromFullCreditDocuement(document: Document) {
  const writerElements = Array.from(
    document.querySelectorAll(
      "#writer + table.simpleTable.simpleCreditsTable > tbody > tr > td.name > a"
    )
  );
  const writers = [] as Person[];

  for (const element of writerElements) {
    const link = element.getAttribute("href");
    const imdbId = getImdbIdFromCastLink(link);

    if (writers.some((person) => person.imdbId === imdbId)) continue;
    try {
      writers.push(await getPersonFromPersonImdbId(imdbId));
    } catch (_) {
      continue;
    }
  }
  return writers;
}

async function getPersonFromPersonImdbId(imdbId: string): Promise<Person> {
  const url = `https://www.imdb.com/name/${imdbId}/`;
  const { data } = await getImdbPageFromUrlAxiosTransporter.get(url);
  const { document } = new JSDOM(data).window;

  const pictureElement = document.querySelector("#name-poster");
  const nameElement = document.querySelector(
    "#overview-top h1 > span.itemprop"
  );

  if (!nameElement) throw "No name element for person";
  const name = nameElement.textContent;

  if (!name) throw "No name string for person";
  return {
    name,
    imdbId,
    pictureUrl: pictureElement
      ? removePictureCropDirectiveFromUrl(pictureElement.getAttribute("src"))
      : null,
  };
}
