import { PrismaClient } from ".prisma/client";
import { TvDbCharacter } from "~/types/RouteLibraryTvDbApi";

export function upsertActorCharacterCollection(
  prisma: PrismaClient,
  characterCollection: TvDbCharacter[],
  entityId: number,
  entityType: "movie" | "episode"
) {
  return characterCollection.map((char) => {
    return prisma.character.upsert({
      where: {
        id: char.id,
      },
      create: {
        [`${entityType}Id`]: entityId,
        id: char.id,
        image: char.image || undefined,
        name: char.name,
        peopleId: char.peopleId,
      },
      update: {
        image: char.image || undefined,
        name: char.name,
      },
    });
  });
}
