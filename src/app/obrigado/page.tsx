import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import WeddingBadge from "@/components/WeddingBadge";
import { getContributionById, getSettings } from "@/lib/data";
import { formatBRL, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; m?: string }>;
}) {
  const { c, m } = await searchParams;
  const settings = await getSettings();
  const contributionId = Number(c);
  const contribution = Number.isInteger(contributionId)
    ? await getContributionById(contributionId)
    : null;

  const isCard = m === "credit_card" || contribution?.paymentMethod === "credit_card";

  return (
    <div className="min-h-screen">
      <SiteHeader settings={settings} />

      <section className="paper-grain">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="animate-rise text-center">
            <WeddingBadge size="sm" className="mb-6" />

            <p className="text-[11px] uppercase tracking-[0.35em] text-serenity-deep font-semibold">
              Presente registrado
            </p>
            <h1 className="font-display mt-4 text-5xl leading-tight text-ink sm:text-6xl">
              Obrigado de coração!
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              {contribution
                ? `Isaac & Sarah vão amar saber que esse carinho veio de você. Seu recado já foi guardado com todo o amor.`
                : "Seu carinho já é o melhor presente de todos. Agradecemos muito por celebrar esse momento tão especial com a gente!"}
            </p>
          </div>

          {contribution ? (
            <div className="animate-rise delay-1 mt-12 space-y-4">
              <div className="rounded-[32px] border border-ink/15 bg-paper p-7 shadow-[0_24px_60px_-45px_rgba(35,77,132,0.4)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-ink-soft font-semibold">
                      Presente
                    </span>
                    <p className="font-display mt-1 text-2xl leading-tight text-ink">
                      {contribution.giftTitle}
                    </p>
                  </div>
                  <span className="font-display text-3xl text-serenity-deep font-bold">
                    {formatBRL(contribution.amountCents)}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 border-t border-ink/10 pt-6 text-sm sm:grid-cols-3">
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.24em] text-ink-soft font-semibold">
                      De
                    </span>
                    <p className="mt-1 text-ink font-medium">
                      {contribution.guestName || "Convidado anônimo 💙"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.24em] text-ink-soft font-semibold">
                      Forma de pagamento
                    </span>
                    <p className="mt-1 text-ink font-medium">
                      {isCard ? "Cartão de Crédito" : "PIX Instantâneo"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.24em] text-ink-soft font-semibold">
                      Registrado em
                    </span>
                    <p className="mt-1 text-ink">{formatDate(contribution.createdAt)}</p>
                  </div>
                </div>

                {contribution.message ? (
                  <div className="mt-6 rounded-3xl bg-cream-deep/60 border border-ink/10 p-5">
                    <span className="block text-[10px] uppercase tracking-[0.24em] text-ink-soft font-semibold">
                      Seu recado
                    </span>
                    <p className="font-display mt-2 text-xl leading-snug italic text-ink">
                      “{contribution.message}”
                    </p>
                  </div>
                ) : null}

                {isCard && settings.creditCardUrl && settings.creditCardUrl.trim().length > 0 ? (
                  <div className="mt-6 rounded-2xl bg-paper-blue/60 border border-ink/15 p-4">
                    <p className="text-xs text-ink-soft mb-2">
                      Caso ainda não tenha concluído a transação do cartão online:
                    </p>
                    <a
                      href={settings.creditCardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-serenity-deep hover:text-ink hover:underline"
                    >
                      <span>Acessar link do cartão de crédito</span>
                      <span>↗</span>
                    </a>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                      contribution.status === "confirmed"
                        ? "bg-serenity-mid/30 text-ink"
                        : "bg-cream-deep text-ink-soft border border-ink/15"
                    }`}
                  >
                    {contribution.status === "confirmed"
                      ? "Presente confirmado pelos noivos"
                      : contribution.status === "declared"
                      ? "Avisamos os noivos para conferir o pagamento"
                      : isCard
                      ? "Cartão de crédito registrado"
                      : "Aguardando confirmação do PIX"}
                  </span>
                  {contribution.isPublic ? (
                    <span className="rounded-full bg-cream-deep border border-ink/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                      Recado visível no mural
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="text-center text-xs text-ink-soft">
                Guarde esse link se desejar guardar como comprovante comemorativo do presente 💙
              </p>
            </div>
          ) : null}

          <div className="animate-rise delay-2 mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/#lista"
              className="rounded-full bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream transition-all hover:-translate-y-0.5 hover:bg-serenity-deep"
            >
              Ver mais presentes
            </Link>
            <Link
              href="/recados"
              className="rounded-full border border-ink/20 bg-paper/70 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-all hover:-translate-y-0.5 hover:border-ink/40"
            >
              Mural de recados
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter settings={settings} />
    </div>
  );
}
