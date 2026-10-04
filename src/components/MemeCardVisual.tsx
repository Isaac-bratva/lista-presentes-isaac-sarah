import type { GiftWithStatus } from "@/lib/data";

const CATEGORY_STYLES: Record<
  string,
  { bg: string; accent: string; text: string }
> = {
  memes: {
    bg: "from-sky-100 via-blue-50 to-indigo-100",
    accent: "#234d84",
    text: "text-ink",
  },
  casal: {
    bg: "from-blue-100 via-sky-50 to-amber-50",
    accent: "#607fc9",
    text: "text-ink",
  },
  festa: {
    bg: "from-indigo-100 via-sky-50 to-pink-50",
    accent: "#234d84",
    text: "text-ink",
  },
  pix: {
    bg: "from-emerald-100 via-teal-50 to-sky-100",
    accent: "#10b981",
    text: "text-emerald-950",
  },
  casa: {
    bg: "from-slate-100 via-blue-50 to-orange-50",
    accent: "#56709d",
    text: "text-ink",
  },
  luademel: {
    bg: "from-cyan-100 via-sky-50 to-blue-100",
    accent: "#0284c7",
    text: "text-sky-950",
  },
};

export default function MemeCardVisual({
  gift,
}: {
  gift: GiftWithStatus;
}) {
  const soldOut = gift.isTaken && !gift.isReserved;
  const reserved = gift.isReserved;
  const category = (gift as { category?: string }).category || "memes";
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.memes;

  return (
    <div className="relative aspect-[16/11] w-full overflow-hidden select-none">
      {gift.imageUrl ? (
        <div className="relative h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gift.imageUrl}
            alt={gift.title}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              soldOut ? "opacity-50 saturate-50" : ""
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        </div>
      ) : (
        /* Arte ilustrada do presente, sem selos nem legendas */
        <div
          className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${style.bg}`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(#234d84 1px, transparent 1px), radial-gradient(#234d84 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          />
          <span
            className="relative block text-6xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 sm:text-7xl"
            role="img"
            aria-label={gift.title}
          >
            {gift.emoji || "🎁"}
          </span>
        </div>
      )}

      {/* Aviso de indisponibilidade */}
      {soldOut || reserved ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink/75 backdrop-blur-[2px]">
          <span className="rounded-full border border-cream/30 bg-ink px-4 py-2 text-xs font-bold uppercase tracking-widest text-cream shadow-xl">
            {reserved ? "Em reserva agora" : "✓ Já presenteado"}
          </span>
        </div>
      ) : null}
    </div>
  );
}
