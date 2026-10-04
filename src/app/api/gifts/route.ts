import { db } from "@/db";
import { gifts } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { getGifts } from "@/lib/data";
import { clampText, slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export type GiftPayload = {
  title?: string;
  description?: string;
  amountCents?: number;
  imageUrl?: string | null;
  emoji?: string | null;
  category?: string;
  memeBadge?: string;
  memeCaption?: string;
  isFlexible?: boolean;
  allowMultiple?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

async function uniqueSlug(base: string, ignoreId?: number): Promise<string> {
  const root = slugify(base) || `presente-${Date.now()}`;
  for (let attempt = 1; attempt <= 60; attempt++) {
    const candidate = attempt === 1 ? root : `${root}-${attempt}`;
    const rows = await db
      .select({ id: gifts.id })
      .from(gifts)
      .where(eq(gifts.slug, candidate))
      .limit(1);
    if (rows.length === 0 || rows[0].id === ignoreId) return candidate;
  }
  return `${root}-${Date.now()}`;
}

export async function GET() {
  const rows = await getGifts(true);
  return Response.json({ gifts: rows });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: GiftPayload;
  try {
    body = (await request.json()) as GiftPayload;
  } catch {
    return Response.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const title = clampText(body.title ?? "", 120).trim();
  if (title.length < 3) {
    return Response.json({ error: "Informe um título" }, { status: 400 });
  }

  const amountCents = Math.round(Number(body.amountCents ?? 0));
  if (!Number.isFinite(amountCents) || amountCents < 0) {
    return Response.json({ error: "Valor inválido" }, { status: 400 });
  }

  const slug = await uniqueSlug(title);

  const [created] = await db
    .insert(gifts)
    .values({
      slug,
      title,
      description: clampText(body.description ?? "", 480),
      amountCents,
      imageUrl: body.imageUrl ? clampText(body.imageUrl, 600) : null,
      emoji: body.emoji ? clampText(body.emoji, 8) : null,
      category: body.category ? clampText(body.category, 40) : "memes",
      memeBadge: body.memeBadge ? clampText(body.memeBadge, 80) : "MEME ✦",
      memeCaption: body.memeCaption ? clampText(body.memeCaption, 120) : "",
      isFlexible: Boolean(body.isFlexible),
      allowMultiple: body.allowMultiple !== false,
      isActive: body.isActive !== false,
      sortOrder: Number.isFinite(Number(body.sortOrder))
        ? Math.round(Number(body.sortOrder))
        : 500,
    })
    .returning();

  return Response.json({ gift: created }, { status: 201 });
}
