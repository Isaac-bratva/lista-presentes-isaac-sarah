import Link from "next/link";
import type { GiftWithStatus } from "@/lib/data";
import { formatBRL } from "@/lib/utils";
import EditGiftButton from "./EditGiftButton";
import MemeCardVisual from "./MemeCardVisual";

export default function GiftCard({
  gift,
  index,
}: {
  gift: GiftWithStatus;
  index: number;
}) {
  const soldOut = gift.isTaken && !gift.isReserved;
  const reserved = gift.isReserved;

  return (
    <article
      className="group animate-rise flex flex-col overflow-hidden rounded-[26px] border border-ink/15 bg-paper shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ink/30 hover:shadow-[0_20px_40px_-20px_rgba(35,77,132,0.35)]"
      style={{ animationDelay: `${Math.min(index % 24, 12) * 45}ms` }}
    >
      {/* Meme Visual Artwork */}
      <MemeCardVisual gift={gift} />

      {/* Conteúdo textual do presente */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display min-h-[3.25rem] text-xl leading-snug text-ink font-semibold group-hover:text-serenity-deep transition-colors line-clamp-2">
          {gift.title}
        </h3>

        <div className="mt-3 flex items-end justify-between gap-2 border-t border-ink/10 pt-3">
          <div>
            <span className="block text-[9px] uppercase tracking-[0.2em] text-ink-soft font-semibold">
              {gift.isFlexible ? "Valor a partir de" : "Valor do presente"}
            </span>
            <span className="font-display text-2xl text-ink font-bold">
              {formatBRL(gift.amountCents)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <EditGiftButton
              gift={{
                id: gift.id,
                title: gift.title,
                description: gift.description,
                amountCents: gift.amountCents,
                imageUrl: gift.imageUrl,
                emoji: gift.emoji,
                category: gift.category,
                memeBadge: gift.memeBadge,
                memeCaption: gift.memeCaption,
              }}
            />
            {soldOut ? (
              <span className="rounded-full border border-ink/15 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                Esgotado
              </span>
            ) : reserved ? (
              <span className="rounded-full border border-ink/15 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                Em reserva
              </span>
            ) : (
              <Link
                href={`/presente/${gift.slug}`}
                className="rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream transition-all hover:bg-serenity-deep hover:shadow-sm"
              >
                Presentear
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
