import Link from "next/link";
import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import WeddingBadge from "@/components/WeddingBadge";
import { getPublicMessages, getSettings } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mural de recados · Isaac & Sarah",
  description: "Recados e mensagens de carinho que os convidados deixaram junto com os presentes.",
};

export default async function MessagesPage() {
  const [settings, messages] = await Promise.all([getSettings(), getPublicMessages(120)]);

  return (
    <div className="min-h-screen">
      <SiteHeader settings={settings} />

      <section className="paper-grain">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-2xl">
            <WeddingBadge size="sm" className="mb-4 !items-start" />
            <p className="text-[11px] uppercase tracking-[0.32em] text-serenity-deep font-semibold">
              Mural dos noivos
            </p>
            <h1 className="font-display mt-3 text-4xl leading-tight text-ink sm:text-5xl">
              Recados com carinho
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Cada presente é acompanhado por uma mensagem especial. Aqui estão os recados que os convidados compartilharam para o grande dia.
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="mt-14 rounded-[32px] border border-dashed border-ink/20 bg-paper/60 p-12 text-center">
              <span className="text-5xl">💌</span>
              <p className="font-display mt-4 text-2xl text-ink">
                Ainda não há recados registrados
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
                Seja uma das primeiras pessoas a presentear e deixar uma mensagem especial para Isaac &amp; Sarah.
              </p>
              <Link
                href="/#lista"
                className="mt-6 inline-block rounded-full bg-ink px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-serenity-deep"
              >
                Escolher um presente
              </Link>
            </div>
          ) : (
            <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
              {messages.map((message, index) => (
                <blockquote
                  key={message.id}
                  className="animate-rise mb-6 break-inside-avoid rounded-[28px] border border-ink/15 bg-paper p-7 shadow-[0_4px_20px_-10px_rgba(35,77,132,0.1)]"
                  style={{ animationDelay: `${Math.min(index, 11) * 55}ms` }}
                >
                  <p className="font-display text-xl leading-snug italic text-ink">
                    “{message.message || "Presente enviado com muito carinho!"}”
                  </p>
                  <footer className="mt-5 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                      {message.guestName || "Convidado anônimo"}
                    </p>
                    <p className="text-xs text-ink-soft">
                      presenteou {message.giftTitle} · {formatDate(message.createdAt)}
                    </p>
                  </footer>
                </blockquote>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter settings={settings} />
    </div>
  );
}
