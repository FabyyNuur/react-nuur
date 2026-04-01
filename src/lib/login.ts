import { LOGIN_GENERIC_ERROR_FR } from "../constants/loginPage";

export function getLoginErrorMessage(err: unknown): string {
  if (typeof err === "string" && err.trim()) return err;
  return LOGIN_GENERIC_ERROR_FR;
}
