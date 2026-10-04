import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const EDITOR_COOKIE = "lista_editor_inline";

export async function GET() {
  const store = await cookies();
  const isEditor = store.get(EDITOR_COOKIE)?.value === "1";
  return Response.json({ editorMode: isEditor });
}

export async function POST() {
  const store = await cookies();
  const isEditor = store.get(EDITOR_COOKIE)?.value === "1";

  if (isEditor) {
    store.delete(EDITOR_COOKIE);
  } else {
    store.set(EDITOR_COOKIE, "1", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 15,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return Response.json({ editorMode: !isEditor });
}
