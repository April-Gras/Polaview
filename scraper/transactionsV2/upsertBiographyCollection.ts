import { TvDbMovie, TvDbPeople } from "~/types/RouteLibraryTvDbApi";
import { PrismaClient } from "@prisma/client";

export function upsertBiographyCollection(
  prisma: PrismaClient,
  peoples: TvDbPeople[]
) {
  return peoples.flatMap((people) => {
    if (!people.biographies) return [];
    return people.biographies.map((bio) =>
      prisma.biography.upsert({
        where: {
          lang_peopleId: {
            lang: bio.language,
            peopleId: people.id,
          },
        },
        create: {
          lang: bio.language,
          text: bio.biography,
          People: {
            connect: {
              id: people.id,
            },
          },
        },
        update: {
          lang: bio.language,
          text: bio.biography,
        },
      })
    );
  });
}
