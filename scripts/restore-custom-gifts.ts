import { config } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";

// Prefer .env.local (Neon) over .env (banco local), igual ao Next.js.
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

type CustomGift = {
  slug: string;
  title?: string;
  description?: string;
  amountCents?: number;
  imageUrl?: string | null;
};

/**
 * Reaplica as personalizações feitas pelos noivos (fotos, títulos, valores)
 * sobre a lista base. Rode depois de popular os presentes:
 *
 *   npx tsx scripts/populate-gifts.ts
 *   npx tsx scripts/restore-custom-gifts.ts
 */
async function main() {
  const { db } = await import("../src/db");
  const { gifts } = await import("../src/db/schema");

  const file = path.join(process.cwd(), "data", "gifts-custom.json");
  const custom = JSON.parse(readFileSync(file, "utf8")) as CustomGift[];
  console.log(`Reaplicando ${custom.length} personalizações...`);

  let applied = 0;
  const missing: string[] = [];

  for (const item of custom) {
    const [row] = await db
      .select({ id: gifts.id })
      .from(gifts)
      .where(eq(gifts.slug, item.slug))
      .limit(1);

    if (!row) {
      missing.push(item.slug);
      continue;
    }

    const patch: Record<string, unknown> = {};
    if (item.imageUrl !== undefined) patch.imageUrl = item.imageUrl;
    if (item.title !== undefined) patch.title = item.title;
    if (item.description !== undefined) patch.description = item.description;
    if (item.amountCents !== undefined) patch.amountCents = item.amountCents;

    if (Object.keys(patch).length === 0) continue;

    await db.update(gifts).set(patch).where(eq(gifts.id, row.id));
    applied++;
  }

  console.log(`Personalizações aplicadas: ${applied}`);
  if (missing.length > 0) {
    console.log("Slugs não encontrados:", missing.join(", "));
  }
  process.exit(0);
}

main().catch((error) => {
  console.error("Falha ao restaurar:", error);
  process.exit(1);
});
