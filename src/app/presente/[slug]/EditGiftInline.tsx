"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatBRL, parseBRLToCents } from "@/lib/utils";
import type { GiftWithStatus } from "@/lib/data";

export default function EditGiftInline({
  gift,
}: {
  gift: GiftWithStatus;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isEditarQuery = searchParams?.get("editar") !== null;
  const [editorMode, setEditorMode] = useState<boolean>(isEditarQuery);
  const [isOpen, setIsOpen] = useState<boolean>(isEditarQuery);

  // Form states
  const [title, setTitle] = useState(gift.title);
  const [description, setDescription] = useState(gift.description || "");
  const [amount, setAmount] = useState((gift.amountCents / 100).toFixed(2).replace(".", ","));
  const [imageUrl, setImageUrl] = useState(gift.imageUrl || "");
  const [emoji, setEmoji] = useState(gift.emoji || "");
  const [memeBadge, setMemeBadge] = useState(gift.memeBadge || "MEME ✦");
  const [memeCaption, setMemeCaption] = useState(gift.memeCaption || "");
  const [category, setCategory] = useState(gift.category || "memes");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Se acessou por ?editar, ativa o modo de edição
    if (isEditarQuery) {
      fetch("/api/editor/cookie-toggle", {
        method: "POST",
      }).then(() => {
        setEditorMode(true);
        setIsOpen(true);
      });
    } else {
      // Pega status do cookie
      fetch("/api/editor/cookie-toggle")
        .then((res) => res.json())
        .then((data: { editorMode: boolean }) => {
          setEditorMode(data.editorMode);
          if (data.editorMode) setIsOpen(true);
        })
        .catch(() => {});
    }
  }, [isEditarQuery]);

  // Atalho de teclado Ctrl + Shift + E
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.code === "KeyE") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Se não estiver no modo editor ativado via cookie nem na URL, não renderiza nada visível
  if (!editorMode && !isEditarQuery && !isOpen) return null;

  const handleSave = async () => {
    const amountCents = parseBRLToCents(amount) ?? gift.amountCents;
    setSaving(true);
    setMessage("Salvando...");
    try {
      const response = await fetch(`/api/gifts/${gift.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          amountCents,
          imageUrl: imageUrl.trim() || null,
          emoji: emoji.trim() || null,
          memeBadge,
          memeCaption,
          category,
        }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Erro ao salvar");
      }
      setMessage("Presente atualizado com sucesso! ✓");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("Enviando imagem...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Falha no upload");
      const data = (await response.json()) as { url: string };
      setImageUrl(data.url);
      setMessage("Imagem carregada com sucesso! ✓");
    } catch {
      setMessage("Erro ao fazer upload (verifique as permissões de upload)");
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[92vw] animate-soft-in rounded-3xl border border-ink/30 bg-paper shadow-2xl transition-all">
      {/* Header do Painel de Edição */}
      <div className="flex items-center justify-between border-b border-ink/15 bg-ink px-5 py-3.5 text-cream rounded-t-3xl">
        <div className="flex items-center gap-2">
          <span className="text-lg">✏️</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">Editor Inline</h4>
            <p className="text-[9px] opacity-75">Atalho: <kbd className="bg-white/20 px-1.5 py-0.5 rounded">Ctrl + Shift + E</kbd></p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditorMode(false)}
            className="text-[10px] uppercase tracking-wider bg-white/15 hover:bg-white/30 px-2 py-1 rounded cursor-pointer"
          >
            Desativar
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-sm px-2 hover:scale-110 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Corpo do Formulário */}
      <div className="max-h-[65vh] overflow-y-auto p-5 space-y-4">
        {message ? (
          <div className="rounded-xl bg-cream-deep border border-white/20 p-2.5 text-xs font-semibold text-center text-ink">
            {message}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Nome do Presente</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-cream/50 px-3 py-2 text-sm focus:border-ink focus:bg-paper outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Descrição / Meme</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-cream/50 px-3 py-2 text-sm focus:border-ink focus:bg-paper outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Valor (R$)</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-cream/50 px-3 py-2 text-sm focus:border-ink focus:bg-paper outline-none font-bold text-serenity-deep"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Emoji se não tiver foto</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-cream/50 px-3 py-2 text-sm focus:border-ink focus:bg-paper outline-none text-center"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-cream/50 px-3 py-2 text-sm focus:border-ink focus:bg-paper outline-none"
          >
            <option value="memes">Memes & Zueira</option>
            <option value="casal">Sobrevivência do Casal</option>
            <option value="festa">Festa & Buffet</option>
            <option value="pix">Pix & Boletos</option>
            <option value="casa">Casa & Treta</option>
            <option value="luademel">Lua de Mel</option>
          </select>
        </div>

        {/* Upload de Imagem */}
        <div className="space-y-1.5 rounded-xl border border-dashed border-ink/20 bg-cream/40 p-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink block">Foto do Presente</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL da imagem"
              className="flex-1 rounded-lg border border-ink/15 bg-paper px-2.5 py-1.5 text-xs outline-none focus:border-ink"
            />
            <input
              type="file"
              accept="image/*"
              id={`inline-upload-${gift.id}`}
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => document.getElementById(`inline-upload-${gift.id}`)?.click()}
              disabled={uploading}
              className="whitespace-nowrap rounded-lg bg-ink px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cream hover:bg-serenity-deep disabled:opacity-50 cursor-pointer"
            >
              {uploading ? "📤" : "📁 Upload PC"}
            </button>
          </div>
          {imageUrl && (
            <div className="relative h-24 w-full overflow-hidden rounded-lg border border-ink/15 bg-cream-deep mt-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 rounded-full bg-ink/90 text-cream w-5 h-5 flex items-center justify-center text-[10px] cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          <p className="text-[9px] text-ink-soft/80 leading-tight">
            Cole um link ou envie direto do seu computador (JPG, PNG, até 5MB).
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Selo de Meme (Ex: MA OEEE! 💵)</label>
          <input
            type="text"
            value={memeBadge}
            onChange={(e) => setMemeBadge(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-cream/50 px-3 py-2 text-xs focus:border-ink focus:bg-paper outline-none font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Frase clássica no rodapé</label>
          <input
            type="text"
            value={memeCaption}
            onChange={(e) => setMemeCaption(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-cream/50 px-3 py-2 text-xs focus:border-ink focus:bg-paper outline-none font-bold text-serenity-deep"
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-full bg-ink py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-cream hover:bg-cream-deep hover:text-ink border border-transparent hover:border-ink transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? "⏳ Salvando..." : "✔ Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
