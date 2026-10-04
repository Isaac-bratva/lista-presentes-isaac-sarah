"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { parseBRLToCents } from "@/lib/utils";

export type EditableGift = {
  id: number;
  title: string;
  description: string;
  amountCents: number;
  imageUrl: string | null;
  emoji: string | null;
  category?: string;
  memeBadge?: string;
  memeCaption?: string;
};

type EditorContextValue = {
  enabled: boolean;
  openGift: (gift: EditableGift) => void;
};

const EditorContext = createContext<EditorContextValue>({
  enabled: false,
  openGift: () => {},
});

export function useEditor() {
  return useContext(EditorContext);
}

export default function EditorProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [wantsEditor, setWantsEditor] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [gift, setGift] = useState<EditableGift | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const openGift = useCallback((next: EditableGift) => {
    setGift(next);
    setOpen(true);
    setHint(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const requested = new URLSearchParams(window.location.search).has("editar");
    setWantsEditor(requested);

    async function sync() {
      if (requested) {
        const response = await fetch("/api/editor/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enable: true }),
        });
        if (!cancelled && response.ok) {
          setEnabled(true);
          setOpen(true);
        }
        return;
      }

      const response = await fetch("/api/editor/session");
      if (!response.ok || cancelled) return;
      const data = (await response.json()) as { editorMode?: boolean };
      setEnabled(Boolean(data.editorMode));
    }

    sync().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === "e") {
        event.preventDefault();
        if (!enabled && !wantsEditor) {
          setHint("Para editar, cole ?editar no final do link e aperte Enter.");
          setOpen(true);
          return;
        }
        setOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, wantsEditor]);

  const value = useMemo(() => ({ enabled: enabled || wantsEditor, openGift }), [enabled, wantsEditor, openGift]);

  return (
    <EditorContext.Provider value={value}>
      {children}
      {(enabled || wantsEditor) && (
        <div className="bg-ink px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-cream">
          Modo edição ligado · clique em “Editar” no presente ou aperte Ctrl+Shift+E
        </div>
      )}
      {open ? (
        <EditorPanel
          gift={gift}
          locked={!enabled && !wantsEditor}
          hint={hint}
          onClose={() => setOpen(false)}
          onSaved={() => router.refresh()}
        />
      ) : null}
    </EditorContext.Provider>
  );
}

function EditorPanel({
  gift,
  locked,
  hint,
  onClose,
  onSaved,
}: {
  gift: EditableGift | null;
  locked: boolean;
  hint: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(gift?.title ?? "");
  const [description, setDescription] = useState(gift?.description ?? "");
  const [amount, setAmount] = useState(
    gift ? (gift.amountCents / 100).toFixed(2).replace(".", ",") : "",
  );
  const [imageUrl, setImageUrl] = useState(gift?.imageUrl ?? "");
  const [status, setStatus] = useState<string | null>(hint);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setTitle(gift?.title ?? "");
    setDescription(gift?.description ?? "");
    setAmount(gift ? (gift.amountCents / 100).toFixed(2).replace(".", ",") : "");
    setImageUrl(gift?.imageUrl ?? "");
    setStatus(hint);
  }, [gift, hint]);

  async function ensureSession() {
    await fetch("/api/editor/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enable: true }),
    });
  }

  async function save() {
    if (!gift) return;
    setSaving(true);
    setStatus("Salvando...");
    await ensureSession();
    try {
      const response = await fetch(`/api/gifts/${gift.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          amountCents: parseBRLToCents(amount) ?? gift.amountCents,
          imageUrl: imageUrl.trim() || null,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar");
      setStatus("Salvo. A foto e a descrição já foram atualizadas.");
      onSaved();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File) {
    setUploading(true);
    setStatus("Enviando foto...");
    await ensureSession();
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error ?? "Falha no envio da foto");
      setImageUrl(data.url);
      setStatus("Foto carregada. Clique em salvar para publicar.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro no envio");
    } finally {
      setUploading(false);
    }
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[80] w-[min(26rem,calc(100vw-2rem))] rounded-3xl border border-ink/20 bg-paper shadow-2xl">
      <div className="flex items-center justify-between rounded-t-3xl bg-ink px-5 py-3 text-cream">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em]">Editar presente</p>
          <p className="text-[10px] text-cream/70">Ctrl+Shift+E abre e fecha este painel</p>
        </div>
        <button type="button" onClick={onClose} className="px-2 text-lg" aria-label="Fechar">
          ×
        </button>
      </div>

      <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
        {locked ? (
          <p className="text-sm leading-relaxed text-ink-soft">
            {hint ?? "Adicione ?editar no final do endereço do site e carregue a página de novo."}
          </p>
        ) : !gift ? (
          <p className="text-sm leading-relaxed text-ink-soft">
            Clique no botão <strong>Editar</strong> do presente que você quer mudar. A foto e a descrição abrem aqui.
          </p>
        ) : (
          <>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">Nome</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm" />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">Descrição</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-ink/15 px-3 py-2 text-sm" />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">Valor (R$)</span>
              <input value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm" />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">Foto</span>
              <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Cole um link de imagem ou envie um arquivo" className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm" />
            </label>
            <label className="flex cursor-pointer items-center justify-center rounded-full border border-ink/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-ink">
              {uploading ? "Enviando..." : "Enviar foto do computador"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) upload(file);
                  event.target.value = "";
                }}
              />
            </label>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-36 w-full rounded-2xl object-cover" />
            ) : null}
            <button type="button" onClick={save} disabled={saving} className="w-full rounded-full bg-ink py-3 text-xs font-bold uppercase tracking-[0.16em] text-cream disabled:opacity-60">
              {saving ? "Salvando..." : "Salvar foto e descrição"}
            </button>
          </>
        )}
        {status ? <p className="text-xs leading-relaxed text-ink-soft">{status}</p> : null}
      </div>
    </aside>
  );
}
