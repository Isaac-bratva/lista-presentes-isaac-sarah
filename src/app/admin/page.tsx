import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getAllContributions, getGifts, getSettings, getStats } from "@/lib/data";
import AdminDashboard, {
  type AdminContribution,
  type AdminGift,
  type AdminSettings,
} from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const settings = await getSettings();
  const [giftRows, contributionRows, stats] = await Promise.all([
    getGifts(true),
    getAllContributions(),
    getStats(settings.goalCents),
  ]);

  const gifts: AdminGift[] = giftRows.map((gift) => ({
    id: gift.id,
    slug: gift.slug,
    title: gift.title,
    description: gift.description,
    amountCents: gift.amountCents,
    imageUrl: gift.imageUrl,
    emoji: gift.emoji,
    category: gift.category || "memes",
    memeBadge: gift.memeBadge || "MEME ✦",
    memeCaption: gift.memeCaption || "",
    isFlexible: gift.isFlexible,
    allowMultiple: gift.allowMultiple,
    isActive: gift.isActive,
    sortOrder: gift.sortOrder,
    confirmedCount: gift.confirmedCount,
  }));

  const contributions: AdminContribution[] = contributionRows.map((item) => ({
    id: item.id,
    giftId: item.giftId,
    giftTitle: item.giftTitle,
    amountCents: item.amountCents,
    guestName: item.guestName,
    message: item.message,
    paymentMethod: item.paymentMethod,
    isPublic: item.isPublic,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
  }));

  const adminSettings: AdminSettings = {
    coupleTitle: settings.coupleTitle,
    weddingDate: settings.weddingDate,
    weddingTime: settings.weddingTime,
    weddingVenue: settings.weddingVenue,
    heroMessage: settings.heroMessage,
    listTitle: settings.listTitle,
    listSubtitle: settings.listSubtitle,
    pixKey: settings.pixKey,
    pixKeyType: settings.pixKeyType,
    pixName: settings.pixName,
    pixCity: settings.pixCity,
    pixNote: settings.pixNote,
    creditCardUrl: settings.creditCardUrl ?? "",
    footerNote: settings.footerNote,
    goalCents: settings.goalCents,
  };

  return (
    <AdminDashboard
      gifts={gifts}
      contributions={contributions}
      settings={adminSettings}
      stats={{
        raisedCents: stats.raisedCents,
        confirmedCount: stats.confirmedCount,
        pendingCount: stats.pendingCount,
        totalListCents: stats.totalListCents,
        goalCents: stats.goalCents,
      }}
    />
  );
}
