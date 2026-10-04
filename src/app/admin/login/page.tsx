"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Não foi possível entrar");
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="paper-grain flex min-h-screen items-center justify-center px-5 py-16">
      <div className="animate-rise w-full max-w-md rounded-[32px] border border-ink/10 bg-paper p-8 shadow-[0_30px_80px_-50px_rgba(28,42,35,0.6)]">
        <p className="text-[11px] uppercase tracking-[0.32em] text-terracotta">
          Área dos noivos
        </p>
        <h1 className="font-display mt-3 text-4xl leading-tight text-ink">
          Entrar para editar a lista
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Aqui você cria, edita e reordena os presentes, muda a chave PIX e lê os
          recados dos convidados.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft"
            >
              Senha dos noivos
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3.5 text-base text-ink outline-none transition focus:border-terracotta focus:bg-paper"
            />
          </div>

          {error ? (
            <p className="rounded-2xl border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm text-terracotta-deep">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="w-full rounded-full bg-terracotta px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-terracotta-deep disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-terracotta"
        >
          ← Voltar para o site
        </Link>
      </div>
    </div>
  );
}
