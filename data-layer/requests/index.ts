import { EntityAddtionRequestStatus } from "~/types/EntityAddtionRequest";
import { GetRouteDataHandlerFromUrlAndVerb } from "~/types/Route";
import { AllRoutes } from "~/types/RouteLibraryDataLayer";
import { getSessionIdFromRequest } from "~/expressUtils";
import { userIsAdmin } from "~/middlewares/userIsAdmin";

export const getEntityAdditionRequests: GetRouteDataHandlerFromUrlAndVerb<
  "get",
  AllRoutes,
  "/requests"
> = async (prisma) => {
  return await prisma.entityAddtionRequest.findMany({
    orderBy: {
      updatedOn: "desc",
    },
    include: {
      searchResult: true,
    },
  });
};

export const postEntityAdditionRequest: GetRouteDataHandlerFromUrlAndVerb<
  "post",
  AllRoutes,
  "/requests"
> = async (prisma, req, res, payload) => {
  // Get current user id
  const sessionid = getSessionIdFromRequest(req);
  if (!sessionid) return res.status(403).json("Not allowed") as any;
  const { userId } = await prisma.session.findFirstOrThrow({
    where: {
      id: sessionid,
    },
    select: {
      userId: true,
    },
  });

  const requestEntry = await prisma.entityAddtionRequest.findFirst({
    where: {
      searchResult: {
        id: payload.entityId,
      },
    },
  });

  // Make sure db has target serie

  if (!requestEntry) {
    return await prisma.entityAddtionRequest.create({
      data: {
        createdByUserId: userId,
        searchResult: {
          connect: {
            id: payload.entityId,
          },
        },
        status: EntityAddtionRequestStatus.pending,
        upvoteUserIds: [userId],
      },
      include: {
        searchResult: true,
      },
    });
  }

  const upvotes = [...requestEntry.upvoteUserIds, userId];
  return await prisma.entityAddtionRequest.update({
    where: {
      id: requestEntry.id,
    },
    data: {
      updatedOn: new Date(),
      upvoteUserIds: upvotes.filter(
        (id, index) => upvotes.indexOf(id) === index
      ),
      searchResult: {
        connect: {
          id: payload.entityId,
        },
      },
    },
    include: {
      searchResult: true,
    },
  });
};

export const patchEntityAdditionalRequest: GetRouteDataHandlerFromUrlAndVerb<
  "patch",
  AllRoutes,
  "/request/:id"
> = async (prisma, req, res, payload) => {
  const isAdmin = await userIsAdmin(prisma, req);
  if (!isAdmin) return res.status(403).json("Not allowed") as any;

  const { status } = payload;
  if (!checkPatchPayload(status))
    return res.status(400).json("Bad request") as any;
  return await prisma.entityAddtionRequest.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      status: payload.status,
    },
  });
};

function checkPatchPayload(
  string: string
): string is EntityAddtionRequestStatus {
  return Object.values(EntityAddtionRequestStatus).includes(string as any);
}
