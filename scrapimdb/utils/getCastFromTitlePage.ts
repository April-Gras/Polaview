import puppeteer from "puppeteer";
import { getImdbIdFromCastLink } from "#/utils/extractImdbIdsFromUrl";
import { Person } from "@prisma/client";

export async function getCastFromTitlePage(page: puppeteer.Page) {
  const personImdbIds = [] as Person[];
  const castElementArray = await page.$$(
    ".title-cast > div:nth-child(2) > .ipc-sub-grid .ipc-avatar"
  );

  for (const castElement of castElementArray) {
    const pictureElem = await castElement.$("img");
    const linkElement = await castElement.$("a");

    if (!pictureElem || !linkElement) continue;
    const personName = await (await pictureElem.getProperty("alt")).jsonValue();
    const pictureUrl = await (await pictureElem.getProperty("src")).jsonValue();
    const castLink = await (await linkElement.getProperty("href")).jsonValue();
    const imdbId = await getImdbIdFromCastLink(castLink);

    if (typeof personName !== "string") throw "Person name is no string";
    personImdbIds.push({
      imdbId,
      name: personName,
      pictureUrl: typeof pictureUrl !== "string" ? null : pictureUrl,
    });
  }
  return personImdbIds;
}
