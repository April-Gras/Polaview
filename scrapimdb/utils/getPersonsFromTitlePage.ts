import { JSDOM } from "jsdom";
import { getImdbPageFromUrlAxiosTransporter } from "#/utils/provideAxiosGet";

import { getImdbIdFromCastLink } from "#/utils/extractImdbIdsFromUrl";
import { removePictureCropDirectiveFromUrl } from "./removePictureCropDirectivesFromUrl";
import { Person, Role } from "@prisma/client";

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

export async function getStaffByTypeFromFullCreditDocument(
  document: Document,
  personType: "writer" | "director"
) {
  const peopleElements = Array.from(
    document.querySelectorAll(
      `#${personType} + table.simpleTable.simpleCreditsTable > tbody > tr > td.name > a`
    )
  );
  const peoples = [] as Person[];

  for (const element of peopleElements) {
    const link = element.getAttribute("href");
    const imdbId = getImdbIdFromCastLink(link);

    if (peoples.some((person) => person.imdbId === imdbId)) continue;
    try {
      peoples.push(await getPersonFromPersonImdbId(imdbId));
    } catch (_) {
      continue;
    }
  }
  return peoples;
}

export async function getRolesIdFromFullCreditDocumentAndTitleImdb(
  document: Document,
  titleImdbId: string
): Promise<Role[]> {
  const roleElements = Array.from(
    document.querySelectorAll(`.cast_list > tbody > tr > .character > a`)
  );
  const roles = [] as Role[];

  for (const element of roleElements) {
    const regex = new RegExp("(?<imdbId>nm[0-9]*)", "gim");
    const link = element.getAttribute("href");
    if (!link) continue;

    const matches = regex.exec(link);
    if (!matches || !matches.groups || !matches.groups.imdbId) continue;
    try {
      roles.push(
        await getTitleRoleByImdbIds(titleImdbId, matches.groups.imdbId)
      );
    } catch (_) {
      console.log(_);
      continue;
    }
  }
  return roles;
}

async function getTitleRoleByImdbIds(
  titleImdbId: string,
  personImdbId: string
): Promise<Role> {
  const url = `https://www.imdb.com/title/${titleImdbId}/characters/${personImdbId}/`;
  const { data } = await getImdbPageFromUrlAxiosTransporter.get(url);
  const { document } = new JSDOM(data).window;
  const nameCaptureRegex = /.*: (?<name>.*)/gi;

  const nameElement = document.querySelector(".header");

  if (!nameElement || !nameElement.textContent)
    throw new Error(
      `No name element for ${personImdbId} in title ${titleImdbId}`
    );
  const matches = nameCaptureRegex.exec(nameElement.textContent);
  if (!matches || !matches.groups || !matches.groups.name)
    throw new Error(
      `No regex matches for ${personImdbId} in title ${titleImdbId}`
    );

  return {
    name: matches.groups.name,
    pictureUrl: getPicturesFromRolePageDocument(document),
    imdbId: personImdbId,
    personImdbId,
    titleImdbId,
  };
}

function getPicturesFromRolePageDocument(document: Document): string | null {
  const pictureElement = document.querySelector(
    ".titlecharacters-image-grid > a > img"
  );

  if (!pictureElement) return null;
  const pictureLink = pictureElement.getAttribute("src");
  if (!pictureLink) return null;
  return removePictureCropDirectiveFromUrl(pictureLink);
}

async function getPersonFromPersonImdbId(imdbId: string): Promise<Person> {
  const url = `https://www.imdb.com/name/${imdbId}/`;
  const { data } = await getImdbPageFromUrlAxiosTransporter.get(url);
  const { document } = new JSDOM(data).window;

  const pictureElement = document.querySelector("#name-poster");
  const nameElement =
    document.querySelector("#overview-top h1 > span.itemprop") ||
    document.querySelector(
      ".name-overview-widget__section > h1 > span.itemprop"
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
