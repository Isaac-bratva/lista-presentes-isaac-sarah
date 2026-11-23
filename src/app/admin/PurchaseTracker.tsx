"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatBRL, formatDate } from "@/lib/utils";
import type { AdminContribution, AdminGift } from "./AdminDashboard";

type Filter = "attention" | "confirmed" | "all" | "unique" | "repeatable";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "attention", label: "Para conferir" },
  { key: "confirmed", label: "Já recebidos" },
  { key: "unique", label: "Itens únicos" },
  { key: "repeatable", label: "Podem repetir" },
  { key: "all", label: "Tudo" },
];

function statusLabel(status: string) {
  if (status === "confirmed") return "Caiu na conta";
  if (status === "declared") return "Convidado disse que pagou";
  if (status === "cancelled") return "Liberado";
  return "Abriu o pagamento";
}

export default function PurchaseTracker({
  gifts,
  contributions,
  onNotify,
}: {
  gifts: AdminGift[];
  contributions: AdminContribution[];
  onNotify: (text: string) => void;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("attention");
  const [query, setQuery] = useState("");
  const [ruleQuery, setRuleQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [savingLinkId, setSavingLinkId] = useState<number | null>(null);
  const [linkDrafts, setLinkDrafts] = useState<Record<number, string>>({});

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 20000);
    return () => window.clearInterval(timer);
  }, [router]);

  const giftById = useMemo(() => new Map(gifts.map((gift) => [gift.id, gift])), [gifts]);

  const waiting = contributions.filter(
    (item) => item.status === "pending" || item.status === "declared",
  ).length;
  const received = contributions.filter((item) => item.status === "confirmed").length;

  const visible = contributions.filter((item) => {
    const gift = item.giftId ? giftById.get(item.giftId) : undefined;
    const text = `${item.guestName} ${item.giftTitle} ${item.message}`.toLowerCase();
    if (query && !text.includes(query.toLowerCase().trim())) return false;
    if (filter === "attention") return item.status === "pending" || item.status === "declared";
    if (filter === "confirmed") return item.status === "confirmed";
    if (filter === "unique") return gift ? !gift.allowMultiple : false;
    if (filter === "repeatable") return gift ? gift.allowMultiple : false;
    return item.status !== "cancelled";
  });

  async function updateContribution(
    id: number,
    patch: { status?: string; removeFromList?: boolean },
    success: string,
  ) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/contributions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Não foi possível atualizar");
      onNotify(success);
      router.refresh();
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Erro ao atualizar");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleMode(gift: AdminGift) {
    const response = await fetch(`/api/gifts/${gift.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowMultiple: !gift.allowMultiple }),
    });
    if (!response.ok) {
      onNotify("Não foi possível mudar a regra deste presente");
      return;
    }
    onNotify(
      gift.allowMultiple
        ? "Agora só 1 pessoa pode comprar este item"
        : "Várias pessoas podem comprar este item",
    );
    router.refresh();
  }

  async function saveExternalLink(gift: AdminGift) {
    const draft = (linkDrafts[gift.id] ?? gift.externalUrl ?? "").trim();
    setSavingLinkId(gift.id);
    try {
      const response = await fetch(`/api/gifts/${gift.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalUrl: draft }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Não foi possível salvar o link");
      }
      const data = (await response.json()) as { gift?: { externalUrl?: string } };
      const savedUrl = data.gift?.externalUrl ?? draft;
      setLinkDrafts((prev) => ({ ...prev, [gift.id]: savedUrl }));
      onNotify(
        savedUrl
          ? `Link da loja salvo para "${gift.title}"`
          : `Link da loja removido de "${gift.title}"`,
      );
      router.refresh();
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Erro ao salvar link");
    } finally {
      setSavingLinkId(null);
    }
  }

  function downloadCsv() {
    const header = ["Data", "Convidado", "Presente", "Valor", "Pagamento", "Status", "Recado"];
    const rows = contributions.map((item) => [
      formatDate(item.createdAt),
      item.guestName || "Anônimo",
      item.giftTitle,
      (item.amountCents / 100).toFixed(2).replace(".", ","),
      item.paymentMethod === "credit_card" ? "Cartão" : "PIX",
      statusLabel(item.status),
      item.message.replaceAll("\n", " "),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "acompanhamento-presentes.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-[28px] border border-ink/15 bg-paper p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-serenity-deep">
          Como acompanhar os 180 convidados
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
          Cada compra aparece aqui, mesmo que aconteça no mesmo minuto. Itens únicos,
          como o micro-ondas, ficam reservados por 3 horas assim que alguém abre o pagamento
          e saem da lista quando vocês confirmam que o PIX caiu. Itens repetíveis, como o
          PIX da paciência, continuam disponíveis e somam quantas vezes foram dados.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-ink/10 bg-paper p-5">
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">Para conferir no banco</span>
          <strong className="font-display mt-1 block text-4xl text-ink">{waiting}</strong>
        </div>
        <div className="rounded-3xl border border-ink/10 bg-paper p-5">
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">Recebidos</span>
          <strong className="font-display mt-1 block text-4xl text-ink">{received}</strong>
        </div>
        <div className="rounded-3xl border border-ink/10 bg-paper p-5">
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">Atualização</span>
          <strong className="font-display mt-1 block text-2xl text-ink">a cada 20s</strong>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] ${
                filter === item.key ? "bg-ink text-cream" : "border border-ink/15 text-ink-soft"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          className="rounded-full border border-ink/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink"
        >
          Baixar planilha
        </button>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por convidado ou presente"
        className="w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-sm"
      />

      <div className="space-y-3">
        {visible.map((item) => {
          const gift = item.giftId ? giftById.get(item.giftId) : undefined;
          const unique = gift ? !gift.allowMultiple : false;
          const open = item.status === "pending" || item.status === "declared";
          return (
            <article key={item.id} className="rounded-[28px] border border-ink/10 bg-paper p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl text-ink">{item.guestName || "Convidado anônimo"}</p>
                  <p className="text-sm text-ink-soft">
                    {item.giftTitle} · {formatBRL(item.amountCents)} · {formatDate(item.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-cream-deep px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink">
                  {statusLabel(item.status)}
                </span>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-soft">
                {item.paymentMethod === "credit_card" ? "Cartão" : "PIX"} ·{" "}
                {unique ? "item único" : "pode ser dado várias vezes"}
                {gift && !gift.isActive ? " · já saiu da lista" : ""}
              </p>
              {item.message ? <p className="mt-3 text-sm italic text-ink">“{item.message}”</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {open ? (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() =>
                      updateContribution(
                        item.id,
                        { status: "confirmed", removeFromList: unique },
                        unique
                          ? "Recebido. O item saiu da lista pública."
                          : "Recebido. O item continua disponível para outros convidados.",
                      )
                    }
                    className="rounded-full bg-ink px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-cream"
                  >
                    {unique ? "Caiu e tirar da lista" : "Caiu e manter na lista"}
                  </button>
                ) : null}
                {item.status !== "cancelled" ? (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() =>
                      updateContribution(item.id, { status: "cancelled", removeFromList: false }, "Reserva liberada")
                    }
                    className="rounded-full border border-ink/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink"
                  >
                    Não caiu, liberar
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
        {visible.length === 0 ? (
          <p className="rounded-[28px] border border-dashed border-ink/20 p-8 text-center text-sm text-ink-soft">
            Nenhum presente neste filtro ainda.
          </p>
        ) : null}
      </div>

      <div className="rounded-[28px] border border-ink/10 bg-paper p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-display text-2xl text-ink">Regra e link de cada presente</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Cole na coluna ao lado o link do produto (ex.: Mercado Livre) para abrir direto a loja quando o convidado clicar em “Presentear”, ou troque entre “só 1 pessoa” e “várias pessoas”.
            </p>
          </div>
          <input
            value={ruleQuery}
            onChange={(event) => setRuleQuery(event.target.value)}
            placeholder="Filtrar presente..."
            className="w-full sm:w-64 rounded-full border border-ink/15 bg-cream/40 px-4 py-2 text-xs text-ink outline-none focus:border-ink focus:bg-paper"
          />
        </div>

        <div className="mt-4 hidden md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_auto] md:gap-3 px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-soft">
          <span>Presente</span>
          <span>Link externo da loja (Mercado Livre, etc.)</span>
          <span className="text-right">Regra</span>
        </div>

        <div className="mt-2 max-h-[34rem] space-y-2 overflow-y-auto">
          {gifts
            .filter((gift) => gift.isActive || gift.confirmedCount > 0)
            .filter((gift) =>
              ruleQuery.trim()
                ? gift.title.toLowerCase().includes(ruleQuery.toLowerCase().trim())
                : true,
            )
            .map((gift) => {
              const currentDraft = linkDrafts[gift.id] ?? gift.externalUrl ?? "";
              const isDirty = currentDraft.trim() !== (gift.externalUrl ?? "").trim();
              const isSaving = savingLinkId === gift.id;
              return (
                <div
                  key={gift.id}
                  className="grid gap-3 rounded-2xl bg-cream/60 px-3 py-2.5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate" title={gift.title}>
                      {gift.title}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {gift.confirmedCount} recebido(s)
                      {gift.isActive ? "" : " · fora da lista"}
                      {gift.externalUrl ? " · abre link externo" : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={currentDraft}
                      onChange={(event) =>
                        setLinkDrafts((prev) => ({
                          ...prev,
                          [gift.id]: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          saveExternalLink(gift);
                        }
                      }}
                      placeholder="https://produto.mercadolivre.com.br/..."
                      aria-label={`Link externo para ${gift.title}`}
                      className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-paper px-3 py-1.5 text-xs text-ink outline-none transition focus:border-ink"
                    />
                    <button
                      type="button"
                      disabled={isSaving || (!isDirty && !currentDraft)}
                      onClick={() => saveExternalLink(gift)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                        isDirty
                          ? "bg-ink text-cream hover:bg-serenity-deep"
                          : "border border-ink/20 bg-paper text-ink-soft hover:border-ink/40 hover:text-ink"
                      } disabled:opacity-50`}
                    >
                      {isSaving ? "..." : "Salvar"}
                    </button>
                    {gift.externalUrl ? (
                      <a
                        href={gift.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Testar link da loja"
                        className="shrink-0 rounded-full border border-ink/20 bg-paper px-2.5 py-1.5 text-[10px] font-bold text-ink hover:border-ink"
                      >
                        ↗
                      </a>
                    ) : null}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => toggleMode(gift)}
                      className="rounded-full border border-ink/20 bg-paper px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink hover:border-ink/40 cursor-pointer whitespace-nowrap"
                    >
                      {gift.allowMultiple ? "Várias pessoas" : "Só 1 pessoa"}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
