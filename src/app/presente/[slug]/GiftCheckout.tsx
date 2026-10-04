"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { formatBRL } from "@/lib/utils";
import { pixKeyLabel } from "@/lib/pix";

type GiftInfo = {
  id: number;
  slug: string;
  title: string;
  description: string;
  amountCents: number;
  isFlexible: boolean;
  isTaken: boolean;
};

type PixInfo = {
  key: string;
  keyType: string;
  name: string;
  city: string;
  note: string;
};

type ContributionResponse = {
  id: number;
  amountCents: number;
  pixPayload: string;
  qrDataUrl: string;
};

type PaymentMethod = "pix" | "credit_card";

export default function GiftCheckout({
  gift,
  pix,
  creditCardUrl = "",
}: {
  gift: GiftInfo;
  pix: PixInfo;
  creditCardUrl?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "payment">("form");
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("pix");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contribution, setContribution] = useState<ContributionResponse | null>(null);

  const amountCents = useMemo(() => {
    if (!gift.isFlexible) return gift.amountCents;
    const parsed = Number.parseFloat(customAmount.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) return gift.amountCents;
    return Math.round(parsed * 100);
  }, [customAmount, gift.amountCents, gift.isFlexible]);

  const amountValid =
    !gift.isFlexible || (Number.parseFloat(customAmount.replace(",", ".")) || 0) >= 10;

  async function handleProceedToPayment() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: gift.id,
          guestName: guestName.trim(),
          message: message.trim(),
          isPublic,
          amountCents,
          paymentMethod: selectedMethod,
        }),
      });
      const data = (await response.json()) as Partial<ContributionResponse> & {
        error?: string;
      };
      if (!response.ok || !data.id || !data.pixPayload || !data.qrDataUrl) {
        throw new Error(data.error ?? "Não conseguimos iniciar o presente. Tente novamente.");
      }
      setContribution({
        id: data.id,
        amountCents: data.amountCents ?? amountCents,
        pixPayload: data.pixPayload,
        qrDataUrl: data.qrDataUrl,
      });
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(methodUsed: PaymentMethod) {
    if (!contribution) return;
    setConfirming(true);
    try {
      await fetch(`/api/contributions/${contribution.id}/confirm`, { method: "POST" });
    } catch {
      // segue para a tela de confirmação
    } finally {
      router.push(`/obrigado?c=${contribution.id}&m=${methodUsed}`);
    }
  }

  return (
    <div className="rounded-[32px] border border-ink/15 bg-paper p-6 shadow-[0_24px_60px_-40px_rgba(35,77,132,0.4)] sm:p-9">
      {/* stepper */}
      <ol className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
        <li
          className={`flex items-center gap-2 ${
            step === "form" ? "text-ink font-bold" : "text-serenity-deep"
          }`}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-[10px]">
            {step === "form" ? "1" : "✓"}
          </span>
          Recado e Dados
        </li>
        <span className="hairline h-px flex-1" />
        <li
          className={`flex items-center gap-2 ${
            step === "payment" ? "text-ink font-bold" : "text-ink/35"
          }`}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-[10px]">
            2
          </span>
          Pagamento
        </li>
      </ol>

      {step === "form" ? (
        <div className="animate-soft-in space-y-6">
          <div className="rounded-3xl bg-cream-deep/60 p-5 border border-ink/10">
            <span className="text-[10px] uppercase tracking-[0.24em] text-ink-soft font-semibold">
              Presente escolhido
            </span>
            <p className="font-display mt-1 text-2xl leading-tight text-ink">{gift.title}</p>
            <p className="font-display mt-2 text-3xl text-serenity-deep font-semibold">
              {gift.isFlexible ? `${formatBRL(gift.amountCents)} ou mais` : formatBRL(gift.amountCents)}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="guestName" className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Seu nome <span className="font-normal normal-case tracking-normal">(opcional)</span>
            </label>
            <input
              id="guestName"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value.slice(0, 80))}
              placeholder="Ex.: Padrinho João, Família Silva..."
              className="w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3.5 text-base text-ink outline-none transition focus:border-ink focus:bg-paper"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Recado para Isaac &amp; Sarah <span className="font-normal normal-case tracking-normal">(opcional)</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, 480))}
              rows={4}
              placeholder="Escreva sua mensagem com carinho. Os noivos vão guardar cada recado."
              className="w-full resize-none rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3.5 text-base text-ink outline-none transition focus:border-ink focus:bg-paper"
            />
            <p className="text-right text-xs text-ink-soft">{message.length}/480</p>
          </div>

          {gift.isFlexible ? (
            <div className="space-y-2">
              <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
                Qual valor você gostaria de presentear?
              </label>
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl text-ink-soft">R$</span>
                <input
                  id="amount"
                  inputMode="decimal"
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value.replace(/[^\d,.]/g, ""))}
                  placeholder="150,00"
                  className="w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3.5 font-display text-2xl text-ink outline-none transition focus:border-ink focus:bg-paper"
                />
              </div>
              <p className="text-xs text-ink-soft">Valor mínimo R$ 10,00.</p>
            </div>
          ) : null}

          {/* Escolha da preferência de pagamento */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft block">
              Forma de pagamento preferida
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod("pix")}
                className={`flex flex-col items-center justify-center gap-1 p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedMethod === "pix"
                    ? "border-ink bg-ink text-cream shadow-sm"
                    : "border-ink/20 bg-cream/40 text-ink hover:border-ink/40"
                }`}
              >
                <span className="font-bold text-sm tracking-wide">PIX</span>
                <span className="text-[11px] opacity-80">Instantâneo</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("credit_card")}
                className={`flex flex-col items-center justify-center gap-1 p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedMethod === "credit_card"
                    ? "border-ink bg-ink text-cream shadow-sm"
                    : "border-ink/20 bg-cream/40 text-ink hover:border-ink/40"
                }`}
              >
                <span className="font-bold text-sm tracking-wide">Cartão de Crédito</span>
                <span className="text-[11px] opacity-80">Online</span>
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/10 bg-cream/40 p-4">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
              className="mt-1 h-4 w-4 accent-ink"
            />
            <span className="text-sm text-ink-soft leading-relaxed">
              Quero que meu recado apareça no mural público de recados dos noivos.
            </span>
          </label>

          {error ? (
            <p className="rounded-2xl border border-terracotta/40 bg-cream-deep p-4 text-sm text-ink">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleProceedToPayment}
            disabled={loading || !amountValid}
            className="w-full rounded-full bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream transition-all hover:-translate-y-0.5 hover:bg-serenity-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Aguarde um instante..." : "Continuar para o pagamento →"}
          </button>
          <p className="text-center text-xs text-ink-soft">
            Seu presente e recado serão salvos diretamente para os noivos.
          </p>
        </div>
      ) : (
        <div className="animate-soft-in space-y-6">
          <div className="rounded-3xl border border-ink/15 bg-paper-blue/60 p-5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-ink-soft font-semibold">
              Valor do presente
            </p>
            <p className="font-display text-4xl text-ink font-bold">
              {formatBRL(contribution?.amountCents ?? amountCents)}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{gift.title}</p>
          </div>

          {/* Abas para alternar a qualquer momento entre PIX e Cartão */}
          <div className="flex rounded-full border border-ink/15 bg-cream/70 p-1">
            <button
              type="button"
              onClick={() => setSelectedMethod("pix")}
              className={`flex-1 rounded-full py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                selectedMethod === "pix"
                  ? "bg-ink text-cream shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Pagar com PIX
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod("credit_card")}
              className={`flex-1 rounded-full py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                selectedMethod === "credit_card"
                  ? "bg-ink text-cream shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              Cartão de Crédito
            </button>
          </div>

          {selectedMethod === "pix" ? (
            <div className="space-y-6 animate-soft-in">
              <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
                <div className="mx-auto w-fit rounded-3xl border border-ink/15 bg-paper p-4 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={contribution?.qrDataUrl ?? ""}
                    alt="QR Code do PIX"
                    className="h-44 w-44"
                  />
                  <p className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-ink-soft font-medium">
                    Aponte a câmera do seu banco
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 rounded-3xl border border-ink/15 bg-cream/60 p-4">
                    <span className="text-[10px] uppercase tracking-[0.24em] text-ink-soft font-semibold">
                      {pixKeyLabel(pix.keyType)} dos noivos
                    </span>
                    <p className="font-mono text-sm break-all text-ink font-medium">{pix.key}</p>
                    <CopyButton value={pix.key} label="Copiar chave" tone="outline" />
                  </div>

                  <div className="space-y-2 rounded-3xl border border-ink/15 bg-cream/60 p-4">
                    <span className="text-[10px] uppercase tracking-[0.24em] text-ink-soft font-semibold">
                      PIX copia e cola (com o valor)
                    </span>
                    <p className="max-h-24 overflow-y-auto rounded-2xl bg-paper p-3 font-mono text-[11px] leading-relaxed break-all text-ink-soft">
                      {contribution?.pixPayload}
                    </p>
                    <CopyButton
                      value={contribution?.pixPayload ?? ""}
                      label="Copiar código PIX"
                      copiedLabel="Código copiado!"
                      tone="solid"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-ink-soft">{pix.note}</p>

              <button
                type="button"
                onClick={() => handleConfirm("pix")}
                disabled={confirming}
                className="w-full rounded-full bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream transition-all hover:-translate-y-0.5 hover:bg-serenity-deep disabled:opacity-60 cursor-pointer"
              >
                {confirming ? "Confirmando..." : "Já realizei o PIX ♥"}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-soft-in">
              <div className="rounded-3xl border border-ink/15 bg-cream/70 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-cream text-xl">
                    💳
                  </span>
                  <div>
                    <h4 className="font-display text-xl text-ink">Pagamento com Cartão de Crédito</h4>
                    <p className="text-xs text-ink-soft">Transação online segura para os noivos</p>
                  </div>
                </div>

                {creditCardUrl && creditCardUrl.trim().length > 0 ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-sm leading-relaxed text-ink-soft">
                      Clique no botão abaixo para abrir a página de pagamento seguro com cartão de crédito:
                    </p>
                    <a
                      href={creditCardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-full bg-ink px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-all hover:bg-serenity-deep"
                    >
                      <span>Abrir pagamento com Cartão de Crédito</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-ink/15 bg-paper p-4 space-y-2 text-sm text-ink-soft">
                    <p className="font-medium text-ink">
                      Link de pagamento online com cartão de crédito:
                    </p>
                    <p className="text-xs leading-relaxed">
                      Seu presente já está registrado no sistema com o seu recado! Os noivos disponibilizam link de pagamento direto no cartão. Você pode confirmar abaixo para notificá-los, ou se preferir, utilizar a opção PIX acima que é imediata.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleConfirm("credit_card")}
                disabled={confirming}
                className="w-full rounded-full bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream transition-all hover:-translate-y-0.5 hover:bg-serenity-deep disabled:opacity-60 cursor-pointer"
              >
                {confirming ? "Confirmando..." : "Confirmar presente com Cartão de Crédito ♥"}
              </button>
            </div>
          )}

          {guestName || message ? (
            <div className="rounded-3xl border border-ink/15 bg-cream/60 p-5">
              <span className="text-[10px] uppercase tracking-[0.24em] text-ink-soft font-semibold">
                Seu recado registrado
              </span>
              {guestName ? (
                <p className="font-display mt-1 text-xl text-ink font-semibold">{guestName}</p>
              ) : null}
              {message ? (
                <p className="mt-1 text-sm leading-relaxed text-ink-soft italic">“{message}”</p>
              ) : null}
              <button
                type="button"
                onClick={() => setStep("form")}
                className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-serenity-deep hover:underline cursor-pointer"
              >
                Editar nome ou recado
              </button>
            </div>
          ) : null}
        </div>
      )}

      <Link
        href="/#lista"
        className="mt-8 block text-center text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-ink"
      >
        ← Voltar para a lista
      </Link>
    </div>
  );
}
