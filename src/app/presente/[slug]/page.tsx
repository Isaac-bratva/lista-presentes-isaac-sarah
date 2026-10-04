import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import MemeCardVisual from "@/components/MemeCardVisual";
import WeddingBadge from "@/components/WeddingBadge";
import { getGiftBySlug, getSettings } from "@/lib/data";
import { formatBRL } from "@/lib/utils";
import GiftCheckout from "./GiftCheckout";
import EditGiftLauncher from "./EditGiftLauncher";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [settings, gift] = await Promise.all([getSettings(), getGiftBySlug(slug)]);
  if (!gift) return { title: "Presente não encontrado" };
  return {
    title: `${gift.title} · ${settings.coupleTitle}`,
    description: gift.description,
  };
}

export default async function GiftPage({ params }: PageProps) {
  const { slug } = await params;
  const [settings, gift] = await Promise.all([getSettings(), getGiftBySlug(slug)]);

  if (!gift || !gift.isActive) notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader settings={settings} />

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-soft">
          <Link href="/" className="transition-colors hover:text-ink">
            Início
          </Link>
          <span>/</span>
          <Link href="/#lista" className="transition-colors hover:text-ink">
            Lista de presentes
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{gift.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="animate-rise space-y-7">
            <div className="overflow-hidden rounded-[32px] border border-ink/15 shadow-sm">
              <MemeCardVisual gift={gift} />
            </div>

            <div>
              <WeddingBadge size="sm" className="mb-3 !items-start" />
              <p className="text-[11px] uppercase tracking-[0.32em] text-serenity-deep font-semibold">
                Opção escolhida
              </p>
              <h1 className="font-display mt-2 text-4xl leading-tight text-ink sm:text-5xl">
                {gift.title}
              </h1>
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-ink/15 bg-paper p-5">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-ink-soft font-semibold">
                  {gift.isFlexible ? "A partir de" : "Valor do presente"}
                </dt>
                <dd className="font-display mt-1 text-3xl text-serenity-deep font-bold">
                  {formatBRL(gift.amountCents)}
                </dd>
              </div>
              <div className="rounded-3xl border border-ink/15 bg-paper p-5">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-ink-soft font-semibold">
                  Formas de pagamento
                </dt>
                <dd className="font-display mt-1 text-2xl text-ink">PIX ou Cartão</dd>
              </div>
            </dl>

            <div className="rounded-3xl border border-dashed border-ink/20 bg-paper-blue/40 p-6">
              <p className="font-display text-xl text-ink font-semibold">
                Como funciona para presentear {settings.coupleTitle.replace(/\s*&\s*/, " e ")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Você pode optar por PIX instantâneo ou Cartão de Crédito online. Ao concluir, seu nome e seu recado são guardados pelos noivos com muito carinho.
              </p>
            </div>
          </div>

          <div className="animate-rise delay-1 lg:sticky lg:top-28 lg:self-start">
            {gift.isTaken ? (
              <div className="rounded-[32px] border border-ink/15 bg-paper p-8 text-center">
                <p className="text-[11px] uppercase tracking-[0.22em] text-ink-soft">
                  {gift.isReserved ? "Alguém está finalizando" : "Presente indisponível"}
                </p>
                <h2 className="font-display mt-3 text-3xl text-ink">
                  {gift.isReserved
                    ? "Este item está reservado agora"
                    : "Este presente já foi escolhido"}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {gift.isReserved
                    ? "Outro convidado já abriu o pagamento. Se o PIX não for confirmado em até 3 horas, o item volta para a lista."
                    : "Os noivos já receberam este presente. Escolha outro item da lista."}
                </p>
                <Link
                  href="/#lista"
                  className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-cream"
                >
                  Ver outros presentes
                </Link>
              </div>
            ) : (
            <GiftCheckout
              gift={{
                id: gift.id,
                slug: gift.slug,
                title: gift.title,
                description: gift.description,
                amountCents: gift.amountCents,
                isFlexible: gift.isFlexible,
                isTaken: gift.isTaken,
              }}
              pix={{
                key: settings.pixKey,
                keyType: settings.pixKeyType,
                name: settings.pixName,
                city: settings.pixCity,
                note: settings.pixNote,
              }}
              creditCardUrl={settings.creditCardUrl ?? ""}
            />
            )}
          </div>
        </div>
      </div>

      <SiteFooter settings={settings} />
      <EditGiftLauncher
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
    </div>
  );
}
