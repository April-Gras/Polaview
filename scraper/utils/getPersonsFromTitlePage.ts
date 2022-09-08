import { JSDOM } from "jsdom";
import { Person, Role } from "@prisma/client";
import { Pool, spawn, Worker } from "threads";
import { getImdbPageFromUrlAxiosTransporter } from "scraper/utils/provideAxiosGet";

import { getImdbIdFromCastLink } from "#/utils/extractImdbIdsFromUrl";
import { removePictureCropDirectiveFromUrl } from "./removePictureCropDirectivesFromUrl";
import { GetTitleRoleByImdbIdsThreadWorker } from "#/workers/getTitleRoleByImdbIds";
import { GetPersonFromPersonImdbIdWorkerThread } from "#/workers/getPersonFromPersonImdbId";

export async function getFullCreditDocumentFromTitleImdbId(imdbId: string) {
  const url = `https://www.imdb.com/title/${imdbId}/fullcredits/`;

  const { data } = await getImdbPageFromUrlAxiosTransporter.get(url);

  return new JSDOM(data).window.document;
}

export async function getStaffByTypeFromFullCreditDocument(
  document: Document,
  personType: "writer" | "director" | "cast"
) {
  const selector =
    personType === "cast"
      ? "#cast + table > tbody > tr.odd > td.primary_photo > a, #cast + table > tbody > tr.even > td.primary_photo > a"
      : `#${personType} + table.simpleTable.simpleCreditsTable > tbody > tr > td.name > a`;
  const personImdbIds = Array.from(document.querySelectorAll(selector)).reduce(
    (accumulator, element) => {
      const id = getImdbIdFromCastLink(element.getAttribute("href"));

      if (!accumulator.includes(id)) accumulator.push(id);
      return accumulator;
    },
    [] as string[]
  );
  const persons = [] as Person[];
  const getPersonFromImdbThread =
    await spawn<GetPersonFromPersonImdbIdWorkerThread>(
      new Worker("../workers/getPersonFromPersonImdbId.ts")
    );

  for (const imdbId of personImdbIds) {
    const person = await getPersonFromImdbThread(imdbId);

    if (person) persons.push(person);
  }
  return persons;
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
  const roles = [] as Role[];
  const getRoleFromImdbIdsThread =
    await spawn<GetTitleRoleByImdbIdsThreadWorker>(
      new Worker("../workers/getTitleRoleByImdbIds")
    );

  for (const imdbId of personImdbIds) {
    const role = await getRoleFromImdbIdsThread(titleImdbId, imdbId);

    if (role) roles.push(role);
  }
  return roles;
}
