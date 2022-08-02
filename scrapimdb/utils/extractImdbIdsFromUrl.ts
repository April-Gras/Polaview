import { Title, Person } from "@prisma/client";

export function extractImdbIdFromTitleLink(link: unknown): Title["imdbId"] {
  if (typeof link !== "string") throw "link was not a string";
  const reg = /https:\/\/www.imdb.com\/title\/(tt[0-9]*)\/.*/gi;
  const results = reg.exec(link);

  if (!results) throw "No regex match object";
  if (!results[1]) throw "No regex match result in slot 1";
  return results[1];
}

export function getImdbIdFromCastLink(link: unknown): Person["imdbId"] {
  if (typeof link !== "string") throw "link was not a string";
  const regex = /https:\/\/www.imdb.com\/name\/(nm[0-9]*)\?/gi;
  const matches = regex.exec(link);

  if (!matches) throw "No regex link matches";

  if (!matches[1]) throw "No id match";
  return matches[1];
}
