import { Person, PrismaClient } from "@prisma/client";

export function upsertCollectionOfPerson(
  prisma: PrismaClient,
  persons: Person[]
) {
  return persons.map((person) => {
    return prisma.person.upsert({
      where: {
        imdbId: person.imdbId,
      },
      create: person,
      update: {},
    });
  });
}
