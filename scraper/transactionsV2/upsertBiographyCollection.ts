import { TvDbMovie, TvDbPeople } from "~/types/RouteLibraryTvDbApi";
import { PrismaClient } from "@prisma/client";
import { availableLocales } from "~/availableLocales";

export function upsertBiographyCollection(
  prisma: PrismaClient,
  peoples: TvDbPeople[]
) {
  return peoples.flatMap((people) => {
    if (!people.biographies) return [];
    return people.biographies
      .filter(
        ({ language, biography }) =>
          availableLocales.includes(language) && !!biography
      )
      .map(({ language, biography }) =>
        prisma.biography.upsert({
          where: {
            lang_peopleId: {
              lang: language,
              peopleId: people.id,
            },
          },
          create: {
            lang: language,
            text: biography,
            People: {
              connect: {
                id: people.id,
              },
            },
          },
          update: {
            lang: language,
            text: biography,
          },
        })
      );
  });
}
