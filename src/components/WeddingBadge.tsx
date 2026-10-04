export default function WeddingBadge({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const isLg = size === "lg";
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <span className="block text-[9px] uppercase tracking-[0.38em] text-ink-soft">
        Casamento
      </span>
      <div className="my-1.5 flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-ink/30 sm:w-16" />
        <span
          className={`font-display tracking-[0.16em] uppercase text-ink ${
            isLg ? "text-xl sm:text-2xl" : "text-sm sm:text-base"
          }`}
        >
          Isaac <span className="font-serif italic lowercase font-normal text-serenity-deep text-lg sm:text-xl">&amp;</span> Sarah
        </span>
        <span className="h-px w-10 bg-ink/30 sm:w-16" />
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.28em] text-ink-soft uppercase">
        <span>21</span>
        <span>|</span>
        <span>MAR</span>
        <span>|</span>
        <span>2027</span>
      </div>
    </div>
  );
}
