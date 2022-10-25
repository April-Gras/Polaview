import { TvDbPeople } from "~/types/RouteLibraryTvDbApi";
import { PrismaClient } from "@prisma/client";

export function upsertPeopleCollection(
  prisma: PrismaClient,
  peoples: TvDbPeople[]
) {
  return peoples.map(({ id, birth, birthPlace, death, name, image }) => {
    return prisma.people.upsert({
      where: {
        id,
      },
      update: {
        birth,
        image: image || undefined,
        birthPlace,
        death,
        name,
      },
      create: {
        id,
        birth,
        image: image || undefined,
        birthPlace,
        death,
        name,
      },
    });
  });
}
