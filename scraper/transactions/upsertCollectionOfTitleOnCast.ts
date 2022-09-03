import { Title, Person, PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

type PrismaKey = "titleOnCast" | "titleOnWriter" | "titleOnDirector";

function getUpsertFunction(prisma: PrismaClient, type: PrismaKey) {
  return prisma[type];
}

type ExpectedReturn<T extends PrismaKey> = ReturnType<
  PrismaClient[T]["upsert"]
>;

export function upsertCollectionOfTitleOnPersonObject<T extends PrismaKey>(
  prisma: PrismaClient,
  title: Title,
  persons: Person[],
  type: T
): ExpectedReturn<T>[] {
  const upsertFunction = getUpsertFunction(prisma, type);

  return persons.map((cast) => {
    // As long as the three schemas are the same appart from their name this should just work
    // If at one point they split runtime might crash depending on the changes and TS won't have any way of picking it up
    const upsertArg: Prisma.TitleOnCastUpsertArgs = {
      where: {
        titleId_personId: {
          personId: cast.imdbId,
          titleId: title.imdbId,
        },
      },
      create: {
        person: {
          connect: {
            imdbId: cast.imdbId,
          },
        },
        title: {
          connect: {
            imdbId: title.imdbId,
          },
        },
      },
      // Don't update shit since this connection already exists
      update: {},
    };

    // @ts-expect-error
    return upsertFunction.upsert(upsertArg);
  });
}
