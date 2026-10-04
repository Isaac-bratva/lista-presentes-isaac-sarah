import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidPassword, tokenFor } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return Response.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const password = String(body.password ?? "");
  if (!isValidPassword(password)) {
    return Response.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, tokenFor(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
