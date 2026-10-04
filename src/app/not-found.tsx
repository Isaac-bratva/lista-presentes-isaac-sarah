import Link from "next/link";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  const settings = await getSettings();

  return (
    <div className="paper-grain flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <span className="animate-float text-6xl">💐</span>
      <h1 className="font-display mt-6 text-5xl leading-tight text-ink">
        Esse presente fugiu
      </h1>
      <p className="mt-4 max-w-md text-base text-ink-soft">
        A página que você tentou abrir não existe (ou o presente saiu da lista). Mas a
        lista da {settings.coupleTitle} continua no lugar de sempre.
      </p>
      <Link
        href="/#lista"
        className="mt-8 rounded-full bg-terracotta px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-terracotta-deep"
      >
        Voltar para a lista
      </Link>
    </div>
  );
}
