import Link from "next/link";
import type { Settings } from "@/db/schema";
import BotanicalSprig from "./BotanicalSprig";

export function Monogram({ title, size = "md" }: { title: string; size?: "md" | "lg" }) {
  const initials = title
    .replace(/[&]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={`font-display relative flex items-center justify-center rounded-full border border-ink/30 bg-paper/90 text-ink ${
        size === "lg" ? "h-16 w-16 text-2xl" : "h-11 w-11 text-base"
      }`}
    >
      {initials || "♥"}
    </span>
  );
}

export default function SiteHeader({ settings }: { settings: Settings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-cream/90 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <BotanicalSprig className="pointer-events-none absolute -left-8 top-0 hidden h-20 w-32 text-serenity-mid/45 lg:block" />
        <Link href="/" className="group flex items-center gap-3">
          <Monogram title={settings.coupleTitle} />
          <span className="leading-tight">
            <span className="font-display block text-xl text-ink transition-colors group-hover:text-terracotta">
              {settings.coupleTitle}
            </span>
            <span className="block text-[10px] uppercase tracking-[0.24em] text-ink-soft">
              {settings.weddingDate} · {settings.weddingTime.split(" · ")[1] ?? "16h"}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft sm:flex">
          <Link href="/#lista" className="transition-colors hover:text-terracotta">
            Lista de presentes
          </Link>
          <Link href="/#como-funciona" className="transition-colors hover:text-terracotta">
            Como funciona
          </Link>
          <Link href="/recados" className="transition-colors hover:text-terracotta">
            Recados
          </Link>
        </nav>

        <Link
          href="/#lista"
          className="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-terracotta"
        >
          Presentear
        </Link>
      </div>
    </header>
  );
}
