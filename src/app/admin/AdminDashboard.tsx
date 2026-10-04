"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import PurchaseTracker from "./PurchaseTracker";
import { buildPixPayload } from "@/lib/pix";
import { formatBRL, formatDate, parseBRLToCents } from "@/lib/utils";

export type AdminGift = {
  id: number;
  slug: string;
  title: string;
  description: string;
  amountCents: number;
  imageUrl: string | null;
  emoji: string | null;
  category: string;
  memeBadge: string;
  memeCaption: string;
  isFlexible: boolean;
  allowMultiple: boolean;
  isActive: boolean;
  sortOrder: number;
  confirmedCount: number;
};

export type AdminContribution = {
  id: number;
  giftId: number | null;
  giftTitle: string;
  amountCents: number;
  guestName: string;
  message: string;
  paymentMethod: string;
  isPublic: boolean;
  status: string;
  createdAt: string;
};

export type AdminSettings = {
  coupleTitle: string;
  weddingDate: string;
  weddingTime: string;
  weddingVenue: string;
  heroMessage: string;
  listTitle: string;
  listSubtitle: string;
  pixKey: string;
  pixKeyType: string;
  pixName: string;
  pixCity: string;
  pixNote: string;
  creditCardUrl: string;
  footerNote: string;
  goalCents: number;
};

type Tab = "tracking" | "gifts" | "messages" | "settings";

const field =
  "w-full rounded-2xl border border-ink/15 bg-cream/40 px-4 py-3 text-sm text-ink outline-none transition focus:border-terracotta focus:bg-paper";
const labelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft";

function Toggle({
  checked,
  onChange,
  title,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/10 bg-cream/40 p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-terracotta"
      />
      <span>
        <span className="block text-sm font-medium text-ink">{title}</span>
        {hint ? <span className="block text-xs text-ink-soft">{hint}</span> : null}
      </span>
    </label>
  );
}

export default function AdminDashboard({
  gifts,
  contributions,
  settings,
  stats,
}: {
  gifts: AdminGift[];
  contributions: AdminContribution[];
  settings: AdminSettings;
  stats: { raisedCents: number; confirmedCount: number; pendingCount: number; totalListCents: number; goalCents: number };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("tracking");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ---- presentes
  const emptyGift = {
    title: "",
    description: "",
    amount: "",
    imageUrl: "",
    emoji: "",
    sortOrder: "500",
    category: "memes",
    memeBadge: "MEME ✦",
    memeCaption: "",
    isFlexible: false,
    allowMultiple: true,
    isActive: true,
  };
  const [giftForm, setGiftForm] = useState(emptyGift);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adminGiftSearch, setAdminGiftSearch] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    notify("Enviando imagem...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Erro ao enviar imagem");
      }

      const data = (await response.json()) as { url: string };
      setGiftForm((prev) => ({ ...prev, imageUrl: data.url }));
      notify("Imagem enviada com sucesso! ✓");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erro ao enviar imagem");
    } finally {
      setUploadingImage(false);
      event.target.value = ""; // Reseta o input para permitir enviar o mesmo arquivo de novo se quiser
    }
  }

  // ---- configurações
  const [settingsForm, setSettingsForm] = useState<AdminSettings>(settings);
  const [goal, setGoal] = useState(String((settings.goalCents / 100).toFixed(2)));

  const testPayload = useMemo(
    () =>
      buildPixPayload({
        key: settingsForm.pixKey,
        name: settingsForm.pixName,
        city: settingsForm.pixCity,
        amountCents: 100,
        txid: "TESTEPIX",
      }),
    [settingsForm.pixKey, settingsForm.pixName, settingsForm.pixCity],
  );

  function notify(text: string) {
    setFeedback(text);
    window.setTimeout(() => setFeedback(null), 3200);
  }

  async function call(url: string, method: string, body?: unknown) {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Algo deu errado");
    }
    return response.json();
  }

  async function handleSaveGift() {
    const amountCents = giftForm.isFlexible
      ? parseBRLToCents(giftForm.amount) ?? 0
      : parseBRLToCents(giftForm.amount) ?? 0;
    if (giftForm.title.trim().length < 3) {
      notify("Dê um título com pelo menos 3 letras.");
      return;
    }
    if (!giftForm.isFlexible && amountCents <= 0) {
      notify("Informe o valor do presente (ex.: 89,90).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: giftForm.title,
        description: giftForm.description,
        amountCents,
        imageUrl: giftForm.imageUrl.trim() || null,
        emoji: giftForm.emoji.trim() || null,
        category: giftForm.category,
        memeBadge: giftForm.memeBadge,
        memeCaption: giftForm.memeCaption,
        isFlexible: giftForm.isFlexible,
        allowMultiple: giftForm.allowMultiple,
        isActive: giftForm.isActive,
        sortOrder: Number.parseInt(giftForm.sortOrder, 10) || 500,
      };
      if (editingId) {
        await call(`/api/gifts/${editingId}`, "PATCH", payload);
        notify("Presente atualizado ♥");
      } else {
        await call("/api/gifts", "POST", payload);
        notify("Presente adicionado à lista ♥");
      }
      setGiftForm(emptyGift);
      setEditingId(null);
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(gift: AdminGift) {
    setEditingId(gift.id);
    setGiftForm({
      title: gift.title,
      description: gift.description,
      amount: (gift.amountCents / 100).toFixed(2).replace(".", ","),
      imageUrl: gift.imageUrl ?? "",
      emoji: gift.emoji ?? "",
      sortOrder: String(gift.sortOrder),
      category: gift.category || "memes",
      memeBadge: gift.memeBadge || "MEME ✦",
      memeCaption: gift.memeCaption || "",
      isFlexible: gift.isFlexible,
      allowMultiple: gift.allowMultiple,
      isActive: gift.isActive,
    });
    setTab("gifts");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteGift(gift: AdminGift) {
    if (!window.confirm(`Remover "${gift.title}" da lista?`)) return;
    try {
      await call(`/api/gifts/${gift.id}`, "DELETE");
      notify("Presente removido");
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erro ao remover");
    }
  }

  async function handleToggleGiftActive(gift: AdminGift) {
    try {
      await call(`/api/gifts/${gift.id}`, "PATCH", { isActive: !gift.isActive });
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erro");
    }
  }

  async function handleContribution(id: number, patch: Record<string, unknown>) {
    try {
      await call(`/api/contributions/${id}`, "PATCH", patch);
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erro");
    }
  }

  async function handleDeleteContribution(id: number) {
    if (!window.confirm("Apagar esse registro de presente?")) return;
    try {
      await call(`/api/contributions/${id}`, "DELETE");
      notify("Registro apagado");
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erro");
    }
  }

  async function handleSaveSettings() {
    const goalCents = parseBRLToCents(goal) ?? 0;
    setSaving(true);
    try {
      await call("/api/settings", "PUT", { ...settingsForm, goalCents });
      notify("Configurações salvas ♥");
      router.refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/");
    router.refresh();
  }

  const waitingCount = contributions.filter(
    (item) => item.status === "pending" || item.status === "declared",
  ).length;
  const tabs: { key: Tab; label: string }[] = [
    { key: "tracking", label: `Acompanhamento (${waitingCount})` },
    { key: "gifts", label: `Presentes (${gifts.length})` },
    { key: "messages", label: `Recados (${contributions.length})` },
    { key: "settings", label: "Configurações" },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-terracotta">
              Área dos noivos
            </p>
            <h1 className="font-display text-2xl text-ink">
              Painel da lista de presentes
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-ink/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-terracotta hover:text-terracotta"
            >
              Ver site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-terracotta"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Arrecadado (confirmado)", value: formatBRL(stats.raisedCents) },
            { label: "Presentes confirmados", value: String(stats.confirmedCount) },
            { label: "Aguardando PIX", value: String(stats.pendingCount) },
            { label: "Valor total da lista", value: formatBRL(stats.totalListCents) },
          ].map((card) => (
            <div key={card.label} className="rounded-3xl border border-ink/10 bg-paper p-5">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                {card.label}
              </span>
              <span className="font-display mt-1 block text-3xl text-ink">
                {card.value}
              </span>
            </div>
          ))}
        </div>

        {feedback ? (
          <p className="animate-soft-in mt-6 rounded-2xl border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-ink">
            {feedback}
          </p>
        ) : null}

        <nav className="mt-8 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                tab === item.key
                  ? "bg-terracotta text-cream"
                  : "border border-ink/15 text-ink-soft hover:border-terracotta hover:text-terracotta"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "tracking" ? (
          <PurchaseTracker gifts={gifts} contributions={contributions} onNotify={notify} />
        ) : null}

        {tab === "gifts" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[32px] border border-ink/10 bg-paper p-6 sm:p-8">
              <h2 className="font-display text-3xl text-ink">
                {editingId ? "Editar presente" : "Novo presente"}
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Use uma imagem engraçada (URL) ou um emoji. A URL pode ser de qualquer
                imagem pública na internet.
              </p>

              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="gift-title">
                    Título
                  </label>
                  <input
                    id="gift-title"
                    value={giftForm.title}
                    onChange={(event) =>
                      setGiftForm({ ...giftForm, title: event.target.value })
                    }
                    placeholder="Ex.: 1 ano de corte de cabelo pro noivo"
                    className={field}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="gift-description">
                    Descrição
                  </label>
                  <textarea
                    id="gift-description"
                    rows={3}
                    value={giftForm.description}
                    onChange={(event) =>
                      setGiftForm({ ...giftForm, description: event.target.value })
                    }
                    placeholder="Conte a piada ou explique o presente."
                    className={`${field} resize-none`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="gift-amount">
                      Valor (R$)
                    </label>
                    <input
                      id="gift-amount"
                      value={giftForm.amount}
                      onChange={(event) =>
                        setGiftForm({ ...giftForm, amount: event.target.value })
                      }
                      placeholder="89,90"
                      className={field}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="gift-order">
                      Ordem na lista
                    </label>
                    <input
                      id="gift-order"
                      value={giftForm.sortOrder}
                      onChange={(event) =>
                        setGiftForm({
                          ...giftForm,
                          sortOrder: event.target.value.replace(/\D/g, ""),
                        })
                      }
                      className={field}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="gift-image">
                    Imagem do presente (URL ou Upload)
                  </label>

                  <div className="flex gap-2">
                    <input
                      id="gift-image"
                      value={giftForm.imageUrl}
                      onChange={(event) =>
                        setGiftForm({ ...giftForm, imageUrl: event.target.value })
                      }
                      placeholder="https://... ou /gifts/careca.png"
                      className={field}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      id="gift-image-upload"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("gift-image-upload")?.click()}
                      disabled={uploadingImage}
                      className="whitespace-nowrap rounded-2xl border border-ink/15 bg-cream/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink hover:border-ink/30 hover:bg-cream transition cursor-pointer disabled:opacity-50"
                    >
                      {uploadingImage ? "⏳ Enviando..." : "📁 Enviar do PC"}
                    </button>
                  </div>
                  <p className="text-[10px] text-ink-soft/80">
                    Cole uma URL da internet ou envie uma foto/meme do seu computador (máx. 5MB).
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className={labelClass} htmlFor="gift-emoji">
                      Emoji se não tiver foto
                    </label>
                    <input
                      id="gift-emoji"
                      value={giftForm.emoji}
                      onChange={(event) =>
                        setGiftForm({ ...giftForm, emoji: event.target.value })
                      }
                      placeholder="💈"
                      className={field}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="gift-category">
                      Categoria
                    </label>
                    <select
                      id="gift-category"
                      value={giftForm.category}
                      onChange={(event) =>
                        setGiftForm({ ...giftForm, category: event.target.value })
                      }
                      className={field}
                    >
                      <option value="memes">Memes & Zueira</option>
                      <option value="casal">Sobrevivência do Casal</option>
                      <option value="festa">Festa & Buffet</option>
                      <option value="pix">Pix & Boletos</option>
                      <option value="casa">Casa & Treta</option>
                      <option value="luademel">Lua de Mel</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Toggle
                    checked={giftForm.isActive}
                    onChange={(value) => setGiftForm({ ...giftForm, isActive: value })}
                    title="Visível na lista"
                  />
                  <Toggle
                    checked={giftForm.allowMultiple}
                    onChange={(value) =>
                      setGiftForm({ ...giftForm, allowMultiple: value })
                    }
                    title="Pode ser dado por mais de um convidado"
                  />
                  <Toggle
                    checked={giftForm.isFlexible}
                    onChange={(value) => setGiftForm({ ...giftForm, isFlexible: value })}
                    title="Valor livre"
                    hint="Convidado escolhe quanto dar"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveGift}
                    disabled={saving}
                    className="rounded-full bg-terracotta px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-terracotta-deep disabled:opacity-60"
                  >
                    {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Adicionar presente"}
                  </button>
                  {editingId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setGiftForm(emptyGift);
                      }}
                      className="rounded-full border border-ink/20 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-terracotta hover:text-terracotta"
                    >
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="rounded-2xl border border-ink/15 bg-paper p-3 flex items-center gap-2">
                <span className="text-sm">🔍</span>
                <input
                  type="text"
                  value={adminGiftSearch}
                  onChange={(e) => setAdminGiftSearch(e.target.value)}
                  placeholder="Pesquisar entre os 150+ presentes..."
                  className="w-full bg-transparent text-sm text-ink outline-none"
                />
                {adminGiftSearch ? (
                  <button
                    type="button"
                    onClick={() => setAdminGiftSearch("")}
                    className="text-xs text-ink-soft hover:text-ink font-bold"
                  >
                    ✕
                  </button>
                ) : null}
              </div>

              {gifts
                .filter((g) => {
                  if (!adminGiftSearch.trim()) return true;
                  const q = adminGiftSearch.toLowerCase().trim();
                  return (
                    g.title.toLowerCase().includes(q) ||
                    g.description.toLowerCase().includes(q)
                  );
                })
                .map((gift) => (
                <article
                  key={gift.id}
                  className="flex flex-wrap items-center gap-4 rounded-[28px] border border-ink/10 bg-paper p-4"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cream-deep">
                    {gift.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={gift.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        {gift.emoji ?? "💝"}
                      </div>
                    )}
                  </div>

                  <div className="min-w-[12rem] flex-1">
                    <p className="font-display text-xl leading-tight text-ink">
                      {gift.title}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {gift.isFlexible ? "valor livre · " : ""}
                      {formatBRL(gift.amountCents)} · ordem {gift.sortOrder} ·{" "}
                      {gift.confirmedCount} confirmado(s)
                      {gift.isActive ? "" : " · oculto"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(gift)}
                      className="rounded-full border border-ink/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-terracotta hover:text-terracotta"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleGiftActive(gift)}
                      className="rounded-full border border-ink/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-terracotta hover:text-terracotta"
                    >
                      {gift.isActive ? "Ocultar" : "Mostrar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGift(gift)}
                      className="rounded-full border border-terracotta/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-terracotta transition-colors hover:bg-terracotta hover:text-cream"
                    >
                      Apagar
                    </button>
                  </div>
                </article>
              ))}
              {gifts.length === 0 ? (
                <p className="rounded-[28px] border border-dashed border-ink/20 p-8 text-center text-sm text-ink-soft">
                  Nenhum presente ainda. Crie o primeiro do lado esquerdo.
                </p>
              ) : null}
            </section>
          </div>
        ) : null}

        {tab === "messages" ? (
          <section className="mt-8 space-y-4">
            {contributions.map((item) => (
              <article
                key={item.id}
                className="rounded-[28px] border border-ink/10 bg-paper p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl leading-tight text-ink">
                      {item.guestName || "Convidado anônimo"}
                    </p>
                    <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">
                      {item.giftTitle} · {formatBRL(item.amountCents)} ·{" "}
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                      item.status === "confirmed"
                        ? "bg-sage/20 text-sage"
                        : "bg-mustard/20 text-mustard"
                    }`}
                  >
                    {item.status === "confirmed" ? "confirmado" : "aguardando PIX"}
                  </span>
                </div>

                {item.message ? (
                  <p className="font-display mt-4 text-lg italic leading-snug text-ink">
                    “{item.message}”
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-ink-soft">Sem recado.</p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {item.status !== "confirmed" ? (
                    <button
                      type="button"
                      onClick={() => handleContribution(item.id, { status: "confirmed" })}
                      className="rounded-full bg-sage px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-cream transition-opacity hover:opacity-90"
                    >
                      Marcar como pago
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleContribution(item.id, { status: "pending" })}
                      className="rounded-full border border-ink/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-terracotta hover:text-terracotta"
                    >
                      Voltar para pendente
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      handleContribution(item.id, { isPublic: !item.isPublic })
                    }
                    className="rounded-full border border-ink/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-terracotta hover:text-terracotta"
                  >
                    {item.isPublic ? "Tirar do mural" : "Publicar no mural"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteContribution(item.id)}
                    className="rounded-full border border-terracotta/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-terracotta transition-colors hover:bg-terracotta hover:text-cream"
                  >
                    Apagar
                  </button>
                </div>
              </article>
            ))}
            {contributions.length === 0 ? (
              <p className="rounded-[28px] border border-dashed border-ink/20 p-10 text-center text-sm text-ink-soft">
                Nenhum presente escolhido ainda. Assim que um convidado gerar o PIX, o
                registro aparece aqui.
              </p>
            ) : null}
          </section>
        ) : null}

        {tab === "settings" ? (
          <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-ink/10 bg-paper p-6 sm:p-8">
              <h2 className="font-display text-3xl text-ink">Dados do casal e do PIX</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Tudo aqui aparece no site e no QR Code gerado para os convidados.
              </p>

              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="coupleTitle">
                      Nomes do casal
                    </label>
                    <input
                      id="coupleTitle"
                      value={settingsForm.coupleTitle}
                      onChange={(event) =>
                        setSettingsForm({ ...settingsForm, coupleTitle: event.target.value })
                      }
                      className={field}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="weddingDate">
                      Data do casamento
                    </label>
                    <input
                      id="weddingDate"
                      value={settingsForm.weddingDate}
                      onChange={(event) =>
                        setSettingsForm({ ...settingsForm, weddingDate: event.target.value })
                      }
                      className={field}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="weddingTime">
                      Horário
                    </label>
                    <input
                      id="weddingTime"
                      value={settingsForm.weddingTime}
                      onChange={(event) =>
                        setSettingsForm({ ...settingsForm, weddingTime: event.target.value })
                      }
                      className={field}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="weddingVenue">
                      Local e endereço
                    </label>
                    <input
                      id="weddingVenue"
                      value={settingsForm.weddingVenue}
                      onChange={(event) =>
                        setSettingsForm({ ...settingsForm, weddingVenue: event.target.value })
                      }
                      className={field}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="heroMessage">
                    Mensagem de abertura
                  </label>
                  <textarea
                    id="heroMessage"
                    rows={3}
                    value={settingsForm.heroMessage}
                    onChange={(event) =>
                      setSettingsForm({ ...settingsForm, heroMessage: event.target.value })
                    }
                    className={`${field} resize-none`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="listTitle">
                      Título da lista
                    </label>
                    <input
                      id="listTitle"
                      value={settingsForm.listTitle}
                      onChange={(event) =>
                        setSettingsForm({ ...settingsForm, listTitle: event.target.value })
                      }
                      className={field}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="goal">
                      Meta de arrecadação (R$)
                    </label>
                    <input
                      id="goal"
                      value={goal}
                      onChange={(event) => setGoal(event.target.value)}
                      className={field}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="listSubtitle">
                    Subtítulo da lista
                  </label>
                  <textarea
                    id="listSubtitle"
                    rows={2}
                    value={settingsForm.listSubtitle}
                    onChange={(event) =>
                      setSettingsForm({ ...settingsForm, listSubtitle: event.target.value })
                    }
                    className={`${field} resize-none`}
                  />
                </div>

                <div className="rounded-[28px] border border-terracotta/25 bg-terracotta/5 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
                    Chave PIX
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
                    <div className="space-y-1.5">
                      <label className={labelClass} htmlFor="pixKey">
                        Chave
                      </label>
                      <input
                        id="pixKey"
                        value={settingsForm.pixKey}
                        onChange={(event) =>
                          setSettingsForm({ ...settingsForm, pixKey: event.target.value })
                        }
                        className={field}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass} htmlFor="pixKeyType">
                        Tipo
                      </label>
                      <select
                        id="pixKeyType"
                        value={settingsForm.pixKeyType}
                        onChange={(event) =>
                          setSettingsForm({ ...settingsForm, pixKeyType: event.target.value })
                        }
                        className={field}
                      >
                        <option value="chave">Chave PIX (tipo não especificado)</option>
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="telefone">Celular</option>
                        <option value="email">E-mail</option>
                        <option value="aleatoria">Aleatória</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className={labelClass} htmlFor="pixName">
                        Nome do recebedor
                      </label>
                      <input
                        id="pixName"
                        value={settingsForm.pixName}
                        onChange={(event) =>
                          setSettingsForm({ ...settingsForm, pixName: event.target.value })
                        }
                        className={field}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass} htmlFor="pixCity">
                        Cidade do recebedor
                      </label>
                      <input
                        id="pixCity"
                        value={settingsForm.pixCity}
                        onChange={(event) =>
                          setSettingsForm({ ...settingsForm, pixCity: event.target.value })
                        }
                        className={field}
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <label className={labelClass} htmlFor="pixNote">
                      Observação sobre o PIX
                    </label>
                    <textarea
                      id="pixNote"
                      rows={2}
                      value={settingsForm.pixNote}
                      onChange={(event) =>
                        setSettingsForm({ ...settingsForm, pixNote: event.target.value })
                      }
                      className={`${field} resize-none`}
                    />
                  </div>
                </div>

                <div className="rounded-[28px] border border-ink/20 bg-paper-blue/50 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                    Cartão de crédito online
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Quando tiver o link de pagamento ou link da maquininha/gateway (ex: InfinitePay, Mercado Pago, Stripe, etc.), cole aqui:
                  </p>
                  <div className="mt-3 space-y-1.5">
                    <label className={labelClass} htmlFor="creditCardUrl">
                      Link para pagamento com cartão de crédito (opcional)
                    </label>
                    <input
                      id="creditCardUrl"
                      value={settingsForm.creditCardUrl}
                      onChange={(event) =>
                        setSettingsForm({ ...settingsForm, creditCardUrl: event.target.value })
                      }
                      placeholder="https://link-de-pagamento.com/..."
                      className={field}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="footerNote">
                    Rodapé
                  </label>
                  <input
                    id="footerNote"
                    value={settingsForm.footerNote}
                    onChange={(event) =>
                      setSettingsForm({ ...settingsForm, footerNote: event.target.value })
                    }
                    className={field}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full rounded-full bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-terracotta disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar configurações"}
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[32px] border border-ink/10 bg-paper p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                  Teste da chave PIX (R$ 1,00)
                </p>
                <p className="mt-3 rounded-2xl bg-cream/70 p-3 font-mono text-[11px] leading-relaxed break-all text-ink-soft">
                  {testPayload}
                </p>
                <div className="mt-3">
                  <CopyButton
                    value={testPayload}
                    label="Copiar código de teste"
                    tone="outline"
                  />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                  Cole esse código no app do seu banco: se o nome que aparecer for o
                  seu, a chave está correta.
                </p>
              </div>

              <div className="rounded-[32px] border border-dashed border-ink/20 bg-cream/50 p-6">
                <p className="font-display text-2xl text-ink">Como divulgar</p>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
                  <li>1. Copie o endereço do site (ex.: lista.casamento.com).</li>
                  <li>
                    2. No casar.com, edite o menu ou o texto do site dos noivos e
                    aponte o link “Lista de presentes” para cá.
                  </li>
                  <li>
                    3. Pronto: o convidado clica, escolhe o presente, paga por PIX e o
                    valor cai inteiro na sua conta.
                  </li>
                </ol>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
