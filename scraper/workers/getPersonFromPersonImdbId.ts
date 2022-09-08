import { Person } from "@prisma/client";
import { expose, Pool, Worker, spawn } from "threads";
import { JSDOM } from "jsdom";

import { removePictureCropDirectiveFromUrl } from "#/utils/removePictureCropDirectivesFromUrl";
import { getImdbPageFromUrlAxiosTransporter } from "#/utils/provideAxiosGet";

export type GetPersonFromPersonImdbIdWorkerThreadReturn = Person | null;
export type GetPersonFromPersonImdbIdWorkerThread = (
  imdbId: string
) => Promise<GetPersonFromPersonImdbIdWorkerThreadReturn>;

const getPersonFromPersonImdbIdWorkerThread: GetPersonFromPersonImdbIdWorkerThread =
  async (imdbId) => {
    const url = `https://www.imdb.com/name/${imdbId}/`;
    const { data } = await getImdbPageFromUrlAxiosTransporter.get(url);
    const { document } = new JSDOM(data).window;

    const pictureElement = document.querySelector("#name-poster");
    const nameElement =
      document.querySelector("#overview-top h1 > span.itemprop") ||
      document.querySelector(
        ".name-overview-widget__section > h1 > span.itemprop"
      );

    if (!nameElement) return null;
    const name = nameElement.textContent;

    if (!name) return null;
    return {
      name,
      imdbId,
      pictureUrl: pictureElement
        ? removePictureCropDirectiveFromUrl(pictureElement.getAttribute("src"))
        : null,
    };
  };

expose(getPersonFromPersonImdbIdWorkerThread);
