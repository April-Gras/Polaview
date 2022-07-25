import { expose } from "threads";
import { Title, Person, PrismaClient } from "@prisma/client";

export type SaveTitleAndPersonsThreadWorkerResult = void;
export type SaveTitleAndPersonsThreadWorker = (constext: {
  title: Title;
  casts: Person[];
}) => Promise<SaveTitleAndPersonsThreadWorkerResult>;

const prisma = new PrismaClient();

const saveTitleAndPerson: SaveTitleAndPersonsThreadWorker = async ({
  title,
  casts,
}) => {
  try {
    await prisma.title.create({
      data: {
        ...title,
        titleOnCast: {
          create: casts.map((cast) => {
            return {
              person: {
                create: cast,
              },
            };
          }),
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
};

expose(saveTitleAndPerson);
