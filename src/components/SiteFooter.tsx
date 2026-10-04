import Link from "next/link";
import type { Settings } from "@/db/schema";
import WeddingBadge from "./WeddingBadge";

const venueMapUrl =
  "https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o+Ravena+Garden%2C+Av.+Ver.+Belarmino+Pereira+de+Carvalho%2C+1313%2C+Mairipor%C3%A3";

export default function SiteFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="border-t border-ink/15 bg-cream-deep/60 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 text-center sm:px-8">
        {/* Monograma centralizado do manual: CASAMENTO ISAAC & SARAH 21|MAR|2027 */}
        <WeddingBadge size="lg" className="mb-8" />

        <div className="max-w-xl space-y-2 text-sm text-ink-soft">
          <p className="font-medium text-ink">
            {settings.weddingVenue}
          </p>
          <p>
            {settings.weddingDate} · {settings.weddingTime}
          </p>
          <p className="pt-2">
            <a
              href={venueMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-serenity-deep transition-colors hover:text-ink hover:underline"
            >
              <span>Abrir localização no mapa</span>
              <span aria-hidden="true">↗</span>
            </a>
          </p>
        </div>

        <nav className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
          <Link href="/#lista" className="transition-colors hover:text-ink">
            Lista de presentes
          </Link>
          <span className="text-ink/20">·</span>
          <Link href="/recados" className="transition-colors hover:text-ink">
            Mural de recados
          </Link>
          <span className="text-ink/20">·</span>
          <Link href="/admin" className="transition-colors hover:text-ink">
            Área dos noivos
          </Link>
        </nav>

        <div className="mt-10 border-t border-ink/10 pt-6 text-[11px] text-ink-soft/75">
          <p>{settings.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
