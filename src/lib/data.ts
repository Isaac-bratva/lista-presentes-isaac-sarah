import { db } from "@/db";
import {
  contributions,
  gifts,
  settings,
  type Contribution,
  type Gift,
  type Settings,
} from "@/db/schema";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { DEFAULT_GIFTS, DEFAULT_SETTINGS } from "./seed-data";

export type GiftWithStatus = Gift & {
  confirmedCount: number;
  reservedCount: number;
  isReserved: boolean;
  isTaken: boolean;
};

export type ListStats = {
  raisedCents: number;
  confirmedCount: number;
  pendingCount: number;
  totalListCents: number;
  goalCents: number;
};

let seedPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  await db.insert(settings).values(DEFAULT_SETTINGS).onConflictDoNothing();
  const [countRes] = await db.select({ count: sql<number>`count(*)::int` }).from(gifts);
  const total = countRes?.count ?? 0;
  if (total < 100) {
    await db.insert(gifts).values(DEFAULT_GIFTS).onConflictDoNothing();
  }
}

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  try {
    await seedPromise;
  } catch (error) {
    console.error("[seed] failed", error);
  }
}

export function fallbackSettings(): Settings {
  return { ...DEFAULT_SETTINGS, updatedAt: new Date() };
}

export async function getSettings(): Promise<Settings> {
  try {
    await ensureSeeded();
    const rows = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    return rows[0] ?? fallbackSettings();
  } catch (error) {
    console.error("[settings] failed", error);
    return fallbackSettings();
  }
}

export async function getGifts(includeInactive = false): Promise<GiftWithStatus[]> {
  try {
    await ensureSeeded();
    const rows = await db
      .select({
        ...getTableColumns(gifts),
        confirmedCount: sql<number>`count(distinct case when ${contributions.status} = 'confirmed' then ${contributions.id} end)::int`,
        reservedCount: sql<number>`count(distinct case when ${contributions.status} in ('pending', 'declared') and ${contributions.createdAt} > now() - interval '3 hours' then ${contributions.id} end)::int`,
      })
      .from(gifts)
      .leftJoin(contributions, eq(contributions.giftId, gifts.id))
      .where(includeInactive ? sql`true` : eq(gifts.isActive, true))
      .groupBy(gifts.id)
      .orderBy(gifts.sortOrder, gifts.id);

    return rows
      .map((row) => {
        const isReserved = !row.allowMultiple && row.confirmedCount === 0 && row.reservedCount > 0;
        const isTaken = !row.allowMultiple && (row.confirmedCount > 0 || isReserved);
        return { ...row, isReserved, isTaken };
      })
      .filter((row) => includeInactive || row.allowMultiple || row.confirmedCount === 0);
  } catch (error) {
    console.error("[gifts] failed", error);
    return [];
  }
}

export async function getGiftBySlug(slug: string): Promise<GiftWithStatus | null> {
  const all = await getGifts(true);
  return all.find((gift) => gift.slug === slug) ?? null;
}

export async function getStats(goalCents: number): Promise<ListStats> {
  try {
    await ensureSeeded();
    const [totals] = await db
      .select({
        raisedCents: sql<number>`coalesce(sum(case when ${contributions.status} = 'confirmed' then ${contributions.amountCents} else 0 end), 0)::int`,
        confirmedCount: sql<number>`count(case when ${contributions.status} = 'confirmed' then 1 end)::int`,
        pendingCount: sql<number>`count(case when ${contributions.status} = 'pending' then 1 end)::int`,
      })
      .from(contributions);

    const [listTotal] = await db
      .select({
        total: sql<number>`coalesce(sum(${gifts.amountCents}), 0)::int`,
      })
      .from(gifts)
      .where(eq(gifts.isActive, true));

    return {
      raisedCents: totals?.raisedCents ?? 0,
      confirmedCount: totals?.confirmedCount ?? 0,
      pendingCount: totals?.pendingCount ?? 0,
      totalListCents: listTotal?.total ?? 0,
      goalCents,
    };
  } catch (error) {
    console.error("[stats] failed", error);
    return {
      raisedCents: 0,
      confirmedCount: 0,
      pendingCount: 0,
      totalListCents: 0,
      goalCents,
    };
  }
}

export type PublicMessage = {
  id: number;
  guestName: string;
  message: string;
  giftTitle: string;
  amountCents: number;
  createdAt: Date;
};

export async function getPublicMessages(limit = 60): Promise<PublicMessage[]> {
  try {
    await ensureSeeded();
    const rows = await db
      .select({
        id: contributions.id,
        guestName: contributions.guestName,
        message: contributions.message,
        giftTitle: contributions.giftTitle,
        amountCents: contributions.amountCents,
        createdAt: contributions.createdAt,
      })
      .from(contributions)
      .where(
        and(
          eq(contributions.isPublic, true),
          eq(contributions.status, "confirmed"),
        ),
      )
      .orderBy(desc(contributions.createdAt))
      .limit(limit);
    return rows;
  } catch (error) {
    console.error("[messages] failed", error);
    return [];
  }
}

export async function getAllContributions(): Promise<Contribution[]> {
  try {
    await ensureSeeded();
    return await db
      .select()
      .from(contributions)
      .orderBy(desc(contributions.createdAt));
  } catch (error) {
    console.error("[contributions] failed", error);
    return [];
  }
}

export async function getContributionById(id: number): Promise<Contribution | null> {
  try {
    const rows = await db
      .select()
      .from(contributions)
      .where(eq(contributions.id, id))
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error("[contribution] failed", error);
    return null;
  }
}
