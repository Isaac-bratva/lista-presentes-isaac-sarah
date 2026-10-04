import { db } from "@/db";
import { contributions, gifts } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { and, eq, ne, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const contributionId = Number(id);
  if (!Number.isInteger(contributionId) || contributionId <= 0) {
    return Response.json({ error: "Registro inválido" }, { status: 400 });
  }

  let body: { status?: string; isPublic?: boolean; removeFromList?: boolean };
  try {
    body = (await request.json()) as {
      status?: string;
      isPublic?: boolean;
      removeFromList?: boolean;
    };
  } catch {
    return Response.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (
    body.status === "confirmed" ||
    body.status === "pending" ||
    body.status === "declared" ||
    body.status === "cancelled"
  ) {
    patch.status = body.status;
    patch.confirmedAt = body.status === "confirmed" ? new Date() : null;
  }
  if (typeof body.isPublic === "boolean") patch.isPublic = body.isPublic;

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const [updated] = await db
    .update(contributions)
    .set(patch)
    .where(eq(contributions.id, contributionId))
    .returning();

  if (!updated) {
    return Response.json({ error: "Registro não encontrado" }, { status: 404 });
  }

  if (updated.giftId) {
    const [gift] = await db
      .select()
      .from(gifts)
      .where(eq(gifts.id, updated.giftId))
      .limit(1);

    if (gift && !gift.allowMultiple) {
      const [remaining] = await db
        .select({
          confirmed: sql<number>`count(*) filter (where ${contributions.status} = 'confirmed')::int`,
        })
        .from(contributions)
        .where(
          and(eq(contributions.giftId, gift.id), ne(contributions.id, updated.id)),
        );

      const stillConfirmed = (remaining?.confirmed ?? 0) > 0 || updated.status === "confirmed";
      const shouldHide = body.removeFromList === true || (updated.status === "confirmed" && body.removeFromList !== false);
      if (shouldHide && stillConfirmed) {
        await db.update(gifts).set({ isActive: false }).where(eq(gifts.id, gift.id));
      }
      if (!stillConfirmed) {
        await db.update(gifts).set({ isActive: true }).where(eq(gifts.id, gift.id));
      }
    }
  }

  return Response.json({ contribution: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const contributionId = Number(id);
  if (!Number.isInteger(contributionId) || contributionId <= 0) {
    return Response.json({ error: "Registro inválido" }, { status: 400 });
  }

  await db.delete(contributions).where(eq(contributions.id, contributionId));
  return Response.json({ ok: true });
}
