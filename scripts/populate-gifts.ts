import { config } from "dotenv";

// Prefer .env.local (Neon) over .env (banco local), igual ao Next.js.
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

import { eq } from "drizzle-orm";

async function main() {
  // Import dinâmico: garante que o dotenv rodou antes de abrir a conexão.
  const { db } = await import("../src/db");
  const { gifts } = await import("../src/db/schema");
  const { ALL_150_GIFTS } = await import("../src/lib/all-gifts-data");
  const { allowsManyBuyers } = await import("../src/lib/purchase-mode");

  console.log("Seeding all 150+ gifts...");

  for (const item of ALL_150_GIFTS) {
    const existing = await db
      .select({ id: gifts.id })
      .from(gifts)
      .where(eq(gifts.slug, item.slug))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(gifts)
        .set({
          title: item.title,
          description: item.description,
          amountCents: item.amountCents,
          imageUrl: item.imageUrl,
          emoji: item.emoji,
          category: item.category,
          memeBadge: item.memeBadge,
          memeCaption: item.memeCaption,
          isFlexible: item.isFlexible,
          allowMultiple: allowsManyBuyers(item.title),
          sortOrder: item.sortOrder,
          isActive: true,
        })
        .where(eq(gifts.id, existing[0].id));
    } else {
      await db.insert(gifts).values({
        slug: item.slug,
        title: item.title,
        description: item.description,
        amountCents: item.amountCents,
        imageUrl: item.imageUrl,
        emoji: item.emoji,
        category: item.category,
        memeBadge: item.memeBadge,
        memeCaption: item.memeCaption,
        isFlexible: item.isFlexible,
        allowMultiple: allowsManyBuyers(item.title),
        sortOrder: item.sortOrder,
        isActive: true,
      });
    }
  }

  const count = await db.select().from(gifts);
  console.log(`Total gifts in database: ${count.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to populate gifts", err);
  process.exit(1);
});
