import BotanicalSprig from "@/components/BotanicalSprig";
import GiftListSection from "@/components/GiftListSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import WeddingBadge from "@/components/WeddingBadge";
import { getGifts, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

const venueMapUrl =
  "https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o+Ravena+Garden%2C+Av.+Ver.+Belarmino+Pereira+de+Carvalho%2C+1313%2C+Mairipor%C3%A3";

const STEPS = [
  {
    number: "01",
    title: "Escolha o presente",
    text: "Reunimos ideias descontraídas e opções especiais. Escolha o presente que mais combina com você.",
  },
  {
    number: "02",
    title: "Pague com PIX ou Cartão",
    text: "No PIX você paga na hora por QR Code ou Copia e Cola. No Cartão de Crédito, você é direcionado ao WhatsApp dos noivos para receber o link de pagamento.",
  },
  {
    number: "03",
    title: "Deixe seu recado",
    text: "Escreva uma mensagem com carinho para os noivos. Vamos ler tudo com muito amor no grande dia.",
  },
];

export default async function HomePage() {
  const settings = await getSettings();
  const gifts = await getGifts();

  return (
    <div className="min-h-screen">
      <SiteHeader settings={settings} />

      {/* HERO */}
      <section className="botanical-paper relative overflow-hidden border-b border-ink/10">
        <BotanicalSprig className="pointer-events-none absolute -right-7 top-8 h-36 w-60 text-serenity-deep/35 sm:right-8 sm:top-12" />
        <BotanicalSprig className="pointer-events-none absolute -bottom-2 -left-12 h-32 w-56 text-serenity-mid/30 sm:left-8" flip />

        <div className="relative mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <WeddingBadge size="sm" className="animate-rise mb-6" />

          <h1 className="animate-rise delay-1 font-display text-6xl leading-[0.95] text-ink sm:text-8xl">
            {settings.coupleTitle}
          </h1>
          <p className="animate-rise delay-1 mt-6 text-xs uppercase tracking-[0.32em] text-ink-soft">
            {settings.weddingDate}
          </p>

          <p className="animate-rise delay-2 mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            Ter você com a gente no dia 21 de março já é o presente que mais importa. Mas, se quiser nos presentear também, reunimos aqui algumas ideias — umas bem sérias, outras nem tanto.
          </p>

          <div className="animate-rise delay-2 mx-auto mt-14 max-w-xl border-y border-ink/15 px-5 py-5">
            <p className="font-display text-2xl italic text-ink">
              “O carinho de vocês é o nosso maior presente.”
            </p>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="border-b border-ink/10 bg-cream-deep/50">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.32em] text-serenity-deep font-semibold">
              Sem complicação
            </p>
            <h2 className="font-display mt-4 text-4xl leading-tight text-ink sm:text-5xl">
              Como funciona essa lista
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="relative rounded-[28px] border border-ink/15 bg-paper/85 p-8 transition-all hover:border-ink/30"
              >
                <span className="font-display absolute right-6 top-5 text-5xl text-serenity-deep/25">
                  {step.number}
                </span>
                <h3 className="font-display text-2xl text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LISTA */}
      <section id="lista" className="paper-grain">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.32em] text-serenity-deep font-semibold">
                Nossa Lista
              </p>
              <h2 className="font-display mt-4 text-4xl leading-tight text-ink sm:text-5xl">
                {settings.listTitle}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">
                Escolha o presente que preferir e contribua via PIX ou Cartão de Crédito com todo o carinho.
              </p>
            </div>
            <p className="font-display max-w-[15rem] text-right text-xl italic text-ink-soft">
              {gifts.length} opções disponíveis para os noivos
            </p>
          </div>

          <div className="mt-12">
            <GiftListSection gifts={gifts} />
          </div>
        </div>
      </section>

      {/* FORMAS DE PAGAMENTO: PIX E CARTÃO */}
      <section className="border-y border-ink/20 bg-ink text-cream">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-serenity font-semibold">
              Formas de presentear
            </p>
            <h2 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">
              Facilidade com PIX ou Cartão de Crédito
            </h2>
            <p className="mt-5 text-base leading-relaxed text-cream/80">
              Queremos que sua experiência seja o mais simples e confortável possível. Você pode concluir seu presente instantaneamente através do PIX ou utilizar a opção de Cartão de Crédito online.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-cream/15 bg-cream/5 p-6">
              <span className="font-display block text-4xl text-serenity">PIX</span>
              <span className="mt-2 block text-xs uppercase tracking-[0.16em] text-serenity">Instantâneo</span>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">
                QR Code e chave Copia e Cola gerados na hora, sem taxa nenhuma.
              </p>
            </div>
            <div className="rounded-[28px] border border-cream/15 bg-cream/5 p-6">
              <span className="font-display block text-4xl text-serenity">Cartão</span>
              <span className="mt-2 block text-xs uppercase tracking-[0.16em] text-serenity">Via WhatsApp</span>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">
                Você é direcionado ao WhatsApp dos noivos com o presente escolhido e enviamos o link de pagamento no cartão.
              </p>
            </div>
            <div className="rounded-[28px] border border-cream/15 bg-cream/5 p-6 sm:col-span-2">
              <span className="font-display block text-3xl text-serenity">Seu recado especial</span>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">
                Junto com qualquer forma de pagamento escolhida, você pode deixar um recadinho assinado que ficará registrado para nós com muito carinho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DETALHES DO CASAMENTO NO FINAL DO SITE */}
      <section id="informacoes" className="botanical-paper border-b border-ink/15 py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-serenity-deep font-semibold">
            Informações do grande dia
          </p>
          <h2 className="script-accent mt-3 text-4xl text-ink sm:text-5xl">
            Esperamos por você
          </h2>
          <div className="mx-auto mt-4 h-px w-20 bg-ink/25" />

          <div className="mt-12 grid gap-6 md:grid-cols-3 text-left">
            <div className="rounded-[28px] border border-ink/15 bg-paper/90 p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-deep text-lg text-ink">
                  📅
                </span>
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-ink-soft">
                    Data
                  </span>
                  <p className="font-display text-2xl text-ink">21 de Março de 2027</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-serenity-deep">
                Domingo
              </p>
            </div>

            <div className="rounded-[28px] border border-ink/15 bg-paper/90 p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-deep text-lg text-ink">
                  ⏰
                </span>
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-ink-soft">
                    Horários
                  </span>
                  <p className="font-display text-2xl text-ink">15:30 · 16:00</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                <strong className="text-ink">15:30</strong> Chegada e organização
                <br />
                <strong className="text-ink">16:00</strong> Início da cerimônia
              </p>
            </div>

            <div className="rounded-[28px] border border-ink/15 bg-paper/90 p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-deep text-lg text-ink">
                  📍
                </span>
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-ink-soft">
                    Cerimônia e Festa
                  </span>
                  <p className="font-display text-2xl text-ink">Espaço Ravena Garden</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                Av. Ver. Belarmino Pereira de Carvalho, 1313 · Mairiporã
              </p>
              <a
                href={venueMapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-serenity-deep hover:underline"
              >
                <span>Ver no mapa</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter settings={settings} />
    </div>
  );
}
