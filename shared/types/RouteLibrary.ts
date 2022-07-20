import { User } from "@prisma/client";
import { BuildRouteEntry } from "~/types/Route";
import { NoId } from "~/types/Utils";

export type AllRoutes = [
  // GET
  BuildRouteEntry<"get", "/", "health">,
  BuildRouteEntry<"get", "/auth/user", User>,
  BuildRouteEntry<"get", "/user/:id", User>,
  // POST
  BuildRouteEntry<
    "post",
    "/auth/login",
    NoId<Omit<User, "passwordHash">>,
    Pick<User, "email"> & { clearPassword: string }
  >,
  BuildRouteEntry<
    "post",
    "/user",
    NoId<Omit<User, "passwordHash">>,
    Pick<User, "email" | "name"> & { clearPassword: string }
  >,
  // PATCH
  BuildRouteEntry<"patch", "/user/:id", User, NoId<User>>
  // DELETE
];
