import QRCode from "qrcode";
import { db } from "@/db";
import { contributions, gifts } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { getAllContributions, getSettings } from "@/lib/data";
import { buildPixPayload } from "@/lib/pix";
import { clampText } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Body = {
  giftId?: number;
  guestName?: string;
  message?: string;
  isPublic?: boolean;
  amountCents?: number;
  paymentMethod?: string;
};

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }
  const rows = await getAllContributions();
  return Response.json({ contributions: rows });
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const giftId = Number(body.giftId);
  if (!Number.isInteger(giftId) || giftId <= 0) {
    return Response.json({ error: "Presente inválido" }, { status: 400 });
  }

  const [gift] = await db.select().from(gifts).where(eq(gifts.id, giftId)).limit(1);
  if (!gift || !gift.isActive) {
    return Response.json({ error: "Presente não encontrado" }, { status: 404 });
  }

  let amountCents = gift.amountCents;
  if (gift.isFlexible) {
    const requested = Math.round(Number(body.amountCents));
    if (!Number.isFinite(requested) || requested < 1000 || requested > 50000000) {
      return Response.json(
        { error: "Informe um valor entre R$ 10,00 e R$ 50.000,00" },
        { status: 400 },
      );
    }
    amountCents = requested;
  }

  const guestName = clampText(body.guestName ?? "", 80);
  const message = clampText(body.message ?? "", 480);

  const created = await db.transaction(async (tx) => {
    await tx.execute(sql`select id from gifts where id = ${gift.id} for update`);

    if (!gift.allowMultiple) {
      const [lock] = await tx
        .select({
          confirmed: sql<number>`count(*) filter (where ${contributions.status} = 'confirmed')::int`,
          reserved: sql<number>`count(*) filter (where ${contributions.status} in ('pending', 'declared') and ${contributions.createdAt} > now() - interval '3 hours')::int`,
        })
        .from(contributions)
        .where(eq(contributions.giftId, gift.id));

      if ((lock?.confirmed ?? 0) > 0 || (lock?.reserved ?? 0) > 0) {
        return null;
      }
    }

    const [row] = await tx
      .insert(contributions)
      .values({
        giftId: gift.id,
        giftSlug: gift.slug,
        giftTitle: gift.title,
        amountCents,
        guestName,
        message,
        paymentMethod: body.paymentMethod === "credit_card" ? "credit_card" : "pix",
        isPublic: body.isPublic !== false,
        status: "pending",
      })
      .returning();

    return row;
  });

  if (!created) {
    return Response.json(
      {
        error:
          "Esse presente já está sendo finalizado por outro convidado. Escolha outro item ou tente de novo mais tarde.",
      },
      { status: 409 },
    );
  }

  const settings = await getSettings();
  const payload = buildPixPayload({
    key: settings.pixKey,
    name: settings.pixName,
    city: settings.pixCity,
    amountCents,
    txid: `PRESENTE${created.id}`,
  });

  const qrDataUrl = await QRCode.toDataURL(payload, {
    margin: 1,
    width: 440,
    errorCorrectionLevel: "M",
    color: { dark: "#1c2a23", light: "#fffdf8" },
  });

  return Response.json({
    id: created.id,
    amountCents: created.amountCents,
    pixPayload: payload,
    qrDataUrl,
  });
}


