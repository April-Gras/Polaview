import { User } from "@prisma/client";
import { ValidatorFunction } from "~/types/Validator";

type PasswordObj = { clearPassword: string };

type UserAlias = Pick<User, "email" | "name"> & PasswordObj;
export const userValidator: ValidatorFunction<UserAlias> = function (user) {
  const out: (keyof UserAlias)[] = userLoginValidator(user);

  if (!validateUserName(user.name)) out.push("name");
  return out;
};

type UserLogin = Pick<User, "email"> & PasswordObj;
export const userLoginValidator: ValidatorFunction<UserLogin> = function ({
  email,
  clearPassword,
}) {
  const out: (keyof UserLogin)[] = [];

  if (!validateEmail(email.trim())) out.push("email");
  if (!validateClearPassword(clearPassword)) out.push("clearPassword");
  return out;
};

function validateUserName(name: string): boolean {
  return name.length > 2;
}

function validateClearPassword(clearPassword: string): boolean {
  return clearPassword.length > 8;
}

function validateEmail(email: string): boolean {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}
