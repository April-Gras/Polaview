import { User } from "@prisma/client";
import { ValidatorFunction } from "~/types/Validator";

type UserAlias = Pick<User, "email" | "name"> & { clearPassword: string };

export const userValidator: ValidatorFunction<UserAlias> = function (user) {
  const out: (keyof UserAlias)[] = [];

  if (!validateEmail(user.email)) out.push("email");
  if (user.name.length < 2) out.push("name");
  if (user.clearPassword.length < 8) out.push("clearPassword");
  return out;
};

function validateEmail(email: string): boolean {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}
