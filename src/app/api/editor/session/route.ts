import { cookies } from "next/headers";
import { EDITOR_COOKIE, editorToken, isAdmin, isEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

function cookieOptions(request: Request) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: request.headers.get("x-forwarded-proto") === "https",
  };
}

export async function GET() {
  return Response.json({ editorMode: await isEditor() });
}

export async function POST(request: Request) {
  let enable = true;
  try {
    const body = (await request.json()) as { enable?: boolean };
    if (body.enable === false) enable = false;
  } catch {
    enable = true;
  }

  const store = await cookies();
  if (!enable) {
    store.delete(EDITOR_COOKIE);
    return Response.json({ editorMode: false });
  }

  // Só quem já entrou na área dos noivos (/admin) pode ligar o modo editor.
  if (!(await isAdmin())) {
    return Response.json(
      { editorMode: false, error: "Entre primeiro em /admin com a senha dos noivos." },
      { status: 401 },
    );
  }

  store.set(EDITOR_COOKIE, editorToken(), cookieOptions(request));
  return Response.json({ editorMode: true });
}