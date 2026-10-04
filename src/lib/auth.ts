import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "lista_admin";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "noivos2026";
}

export function tokenFor(password: string): string {
  return crypto
    .createHash("sha256")
    .update(`lista-de-presentes::${password}`)
    .digest("hex");
}

export function isValidPassword(password: string): boolean {
  return password === adminPassword();
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === tokenFor(adminPassword());
}

export const ADMIN_COOKIE = COOKIE_NAME;
export const EDITOR_COOKIE = "lista_editor_inline";

export function editorToken(): string {
  return tokenFor(`editor::${adminPassword()}`);
}

export async function isEditor(): Promise<boolean> {
  const store = await cookies();
  return store.get(EDITOR_COOKIE)?.value === editorToken();
}

export async function canEditGifts(): Promise<boolean> {
  return (await isAdmin()) || (await isEditor());
}
