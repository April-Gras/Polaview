import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const { BASE_ADMIN_EMAIL, BASE_ADMIN_PASSWORD, BASE_ADMIN_NAME } = process.env;

if (!BASE_ADMIN_EMAIL || !BASE_ADMIN_NAME || !BASE_ADMIN_PASSWORD)
  throw "Please set BASE_ADMIN_EMAIL, BASE_ADMIN_PASSWORD, BASE_ADMIN_NAME .env varaibles";

export async function startupCreateBaseUsers(prisma: PrismaClient) {
  const userData = {
    name: BASE_ADMIN_NAME as string,
    passwordHash: await hash(BASE_ADMIN_PASSWORD as string),
    email: BASE_ADMIN_EMAIL as string,
  };

  if (
    !!(await prisma.user.findFirst({
      where: {
        email: BASE_ADMIN_EMAIL,
        name: BASE_ADMIN_NAME,
      },
    }))
  )
    return;
  await prisma.user.create({
    data: { ...userData, isActive: true, isAdmin: true },
  });
}
