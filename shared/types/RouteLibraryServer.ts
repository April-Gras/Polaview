import { User } from "@prisma/client";
import { BuildRouteEntry, RuntimeConfigBuilder } from "~/types/Route";

type NoId<T extends Record<string, any>> = Omit<T, "id">;

export type AllRoutes = [
  // GET
  BuildRouteEntry<"get", "/", "health">,
  BuildRouteEntry<"get", "/auth/user", Omit<User, "passwordHash">>,
  BuildRouteEntry<"get", "/user/:id", Omit<User, "passwordHash">>,
  BuildRouteEntry<"get", "/user", Omit<User, "passwordHash">[]>,
  // POST
  BuildRouteEntry<
    "post",
    "/auth/login",
    NoId<Omit<User, "passwordHash">>,
    Pick<User, "email"> & { clearPassword: string }
  >,
  BuildRouteEntry<"post", "/auth/logout", true>,
  BuildRouteEntry<
    "post",
    "/user",
    NoId<Omit<User, "passwordHash">>,
    Pick<User, "email" | "name"> & { clearPassword: string }
  >,
  BuildRouteEntry<
    "post",
    "/user/toggleIsActivate",
    Omit<User, "passwordHash">,
    { id: number }
  >,
  // PATCH
  BuildRouteEntry<"patch", "/user/:id", User, NoId<User>>
  // DELETE
];

export type ServerRuntimeConfig = RuntimeConfigBuilder<AllRoutes>;
