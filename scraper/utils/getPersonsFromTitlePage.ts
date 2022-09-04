import { JSDOM } from "jsdom";
import { Person, Role } from "@prisma/client";
import { Pool, spawn, Worker } from "threads";
import { getImdbPageFromUrlAxiosTransporter } from "scraper/utils/provideAxiosGet";

import { getImdbIdFromCastLink } from "#/utils/extractImdbIdsFromUrl";
import { removePictureCropDirectiveFromUrl } from "./removePictureCropDirectivesFromUrl";
import {
  GetTitleRoleByImdbIdsThreadWorker,
  GetTitleRoleByImdbIdsThreadWorkerReturn,
} from "#/workers/getTitleRoleByImdbIds";

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
  const peopleImdbIds = Array.from(
    document.querySelectorAll(
      `#${personType} + table.simpleTable.simpleCreditsTable > tbody > tr > td.name > a`
    )
  ).reduce((accumulator, element) => {
    const id = getImdbIdFromCastLink(element.getAttribute("href"));

    if (!accumulator.includes(id)) accumulator.push(id);
    return accumulator;
  }, [] as string[]);
  const peoples = [] as Person[];

  for (const imdbId of peopleImdbIds) {
    try {
      peoples.push(await getPersonFromPersonImdbId(imdbId));
    } catch (_) {
      continue;
    }
  }
  return peoples;
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

export async function getRolesIdFromFullCreditDocumentAndTitleImdb(
  document: Document,
  titleImdbId: string
): Promise<Role[]> {
  const roleElements = Array.from(
    document.querySelectorAll(`.cast_list > tbody > tr > .character > a`)
  );
  const personImdbIds = roleElements.reduce((accumulator, element) => {
    const regex = new RegExp("(?<imdbId>nm[0-9]*)", "gim");
    const link = element.getAttribute("href");
    if (!link) return accumulator;

    const matches = regex.exec(link);
    if (!matches || !matches.groups || !matches.groups.imdbId)
      return accumulator;
    accumulator.push(matches.groups.imdbId);
    return accumulator;
  }, [] as string[]);
  const threadPool = Pool(() =>
    spawn<GetTitleRoleByImdbIdsThreadWorker>(
      new Worker("../workers/getTitleRoleByImdbIds")
    )
  );
  const tasks = personImdbIds.map((personImdbId) =>
    threadPool.queue((task) => task(titleImdbId, personImdbId))
  );
  const results =
    await Promise.allSettled<GetTitleRoleByImdbIdsThreadWorkerReturn>(tasks);

  return results.reduce((accumulator, promise) => {
    if (promise.status === "rejected" || !promise.value) return accumulator;
    accumulator.push(promise.value);
    return accumulator;
  }, [] as Role[]);
}
