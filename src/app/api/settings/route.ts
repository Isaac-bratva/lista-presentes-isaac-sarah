import { db } from "@/db";
import { settings } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { clampText } from "@/lib/utils";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const TEXT_FIELDS = [
  "coupleTitle",
  "weddingDate",
  "weddingTime",
  "weddingVenue",
  "heroMessage",
  "listTitle",
  "listSubtitle",
  "pixKey",
  "pixKeyType",
  "pixName",
  "pixCity",
  "pixNote",
  "creditCardUrl",
  "footerNote",
] as const;

const LIMITS: Record<string, number> = {
  coupleTitle: 80,
  weddingDate: 80,
  weddingTime: 120,
  weddingVenue: 200,
  heroMessage: 400,
  listTitle: 120,
  listSubtitle: 400,
  pixKey: 120,
  pixKeyType: 20,
  pixName: 60,
  pixCity: 40,
  pixNote: 400,
  creditCardUrl: 600,
  footerNote: 240,
};

export async function GET() {
  const current = await getSettings();
  return Response.json({ settings: current });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  for (const field of TEXT_FIELDS) {
    const value = body[field];
    if (typeof value === "string") {
      patch[field] = clampText(value, LIMITS[field] ?? 200);
    }
  }

  if (body.goalCents !== undefined) {
    const goalCents = Math.round(Number(body.goalCents));
    if (Number.isFinite(goalCents) && goalCents >= 0) {
      patch.goalCents = goalCents;
    }
  }

  if (typeof patch.pixKey === "string" && patch.pixKey.trim().length === 0) {
    return Response.json({ error: "A chave PIX é obrigatória" }, { status: 400 });
  }

  const [updated] = await db
    .update(settings)
    .set(patch)
    .where(eq(settings.id, 1))
    .returning();

  if (!updated) {
    const [created] = await db
      .insert(settings)
      .values({ id: 1, ...patch })
      .returning();
    return Response.json({ settings: created });
  }

  return Response.json({ settings: updated });
}
