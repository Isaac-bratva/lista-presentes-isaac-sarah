import { db } from "@/db";
import { gifts } from "@/db/schema";
import { canEditGifts, isAdmin } from "@/lib/auth";
import { clampText } from "@/lib/utils";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await canEditGifts())) {
    return Response.json(
      { error: "Abra o site com ?editar no final do link para liberar a edição." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const giftId = Number(id);
  if (!Number.isInteger(giftId) || giftId <= 0) {
    return Response.json({ error: "Presente inválido" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (typeof body.title === "string") {
    const title = clampText(body.title, 120).trim();
    if (title.length < 3) {
      return Response.json({ error: "Informe um título" }, { status: 400 });
    }
    patch.title = title;
  }
  if (typeof body.description === "string") {
    patch.description = clampText(body.description, 480);
  }
  if (body.amountCents !== undefined) {
    const amountCents = Math.round(Number(body.amountCents));
    if (!Number.isFinite(amountCents) || amountCents < 0) {
      return Response.json({ error: "Valor inválido" }, { status: 400 });
    }
    patch.amountCents = amountCents;
  }
  if (body.imageUrl !== undefined) {
    patch.imageUrl = body.imageUrl ? clampText(String(body.imageUrl), 600) : null;
  }
  if (body.emoji !== undefined) {
    patch.emoji = body.emoji ? clampText(String(body.emoji), 8) : null;
  }
  if (typeof body.category === "string") {
    patch.category = body.category ? clampText(body.category, 40) : "memes";
  }
  if (typeof body.memeBadge === "string") {
    patch.memeBadge = body.memeBadge ? clampText(body.memeBadge, 80) : "MEME ✦";
  }
  if (typeof body.memeCaption === "string") {
    patch.memeCaption = clampText(body.memeCaption, 120);
  }
  if (typeof body.isFlexible === "boolean") patch.isFlexible = body.isFlexible;
  if (typeof body.allowMultiple === "boolean") patch.allowMultiple = body.allowMultiple;
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) {
    patch.sortOrder = Math.round(Number(body.sortOrder));
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const [updated] = await db
    .update(gifts)
    .set(patch)
    .where(eq(gifts.id, giftId))
    .returning();

  if (!updated) {
    return Response.json({ error: "Presente não encontrado" }, { status: 404 });
  }

  return Response.json({ gift: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const giftId = Number(id);
  if (!Number.isInteger(giftId) || giftId <= 0) {
    return Response.json({ error: "Presente inválido" }, { status: 400 });
  }

  await db.delete(gifts).where(eq(gifts.id, giftId));
  return Response.json({ ok: true });
}
