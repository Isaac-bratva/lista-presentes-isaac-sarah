import { db } from "@/db";
import { contributions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const contributionId = Number(id);
  if (!Number.isInteger(contributionId) || contributionId <= 0) {
    return Response.json({ error: "Registro inválido" }, { status: 400 });
  }

  const [updated] = await db
    .update(contributions)
    .set({ status: "declared" })
    .where(
      and(eq(contributions.id, contributionId), eq(contributions.status, "pending")),
    )
    .returning();

  if (!updated) {
    // já confirmado (ou inexistente): respondemos ok para o convidado
    return Response.json({ ok: true, alreadyConfirmed: true });
  }

  return Response.json({ ok: true });
}
