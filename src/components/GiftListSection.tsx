"use client";

import { useMemo, useState } from "react";
import type { GiftWithStatus } from "@/lib/data";
import GiftCard from "./GiftCard";

type CategoryFilter = "todos" | "memes" | "casal" | "festa" | "pix" | "casa" | "luademel";

const CATEGORIES: { key: CategoryFilter; label: string; icon: string }[] = [
  { key: "todos", label: "Todos", icon: "✨" },
  { key: "memes", label: "Memes & Zueira", icon: "😂" },
  { key: "casal", label: "Sobrevivência do Casal", icon: "💍" },
  { key: "festa", label: "Festa & Buffet", icon: "🎉" },
  { key: "pix", label: "Pix & Boletos", icon: "💸" },
  { key: "casa", label: "Casa & Treta", icon: "🏠" },
  { key: "luademel", label: "Lua de Mel", icon: "✈️" },
];

export default function GiftListSection({
  gifts,
}: {
  gifts: GiftWithStatus[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(24);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc">("default");

  const filteredGifts = useMemo(() => {
    let result = [...gifts];

    // Categoria
    if (selectedCategory !== "todos") {
      result = result.filter((item) => {
        const cat = (item as { category?: string }).category || "memes";
        return cat === selectedCategory;
      });
    }

    // Busca textual
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          ((item as { memeCaption?: string }).memeCaption || "").toLowerCase().includes(q) ||
          ((item as { memeBadge?: string }).memeBadge || "").toLowerCase().includes(q),
      );
    }

    // Ordenação
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.amountCents - b.amountCents);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.amountCents - a.amountCents);
    } else {
      result.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return result;
  }, [gifts, selectedCategory, searchQuery, sortBy]);

  const visibleGifts = useMemo(() => {
    return filteredGifts.slice(0, displayCount);
  }, [filteredGifts, displayCount]);

  const hasMore = displayCount < filteredGifts.length;

  return (
    <div className="space-y-8">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col gap-4 rounded-3xl border border-ink/15 bg-paper/90 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-soft">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayCount(24);
            }}
            placeholder="Buscar presente (ex: silvio, pix, buffet, lençol, bolo...)"
            className="w-full rounded-full border border-ink/15 bg-cream/50 py-3 pl-11 pr-10 text-sm text-ink outline-none transition focus:border-ink focus:bg-paper"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-soft hover:text-ink cursor-pointer"
            >
              ✕
            </button>
          ) : null}
        </div>

        {/* Ordenador de Preço */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-ink-soft font-semibold whitespace-nowrap">
            Ordenar:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "default" | "price_asc" | "price_desc")}
            className="rounded-full border border-ink/15 bg-cream/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink outline-none transition focus:border-ink cursor-pointer"
          >
            <option value="default">Ordem da Lista</option>
            <option value="price_asc">Menor valor</option>
            <option value="price_desc">Maior valor</option>
          </select>
        </div>
      </div>

      {/* Categorias / Tags de Navegação */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.key);
                setDisplayCount(24);
              }}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                isActive
                  ? "bg-ink text-cream shadow-sm scale-105"
                  : "border border-ink/15 bg-paper text-ink-soft hover:border-ink/40 hover:text-ink hover:bg-cream/50"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-xs text-ink-soft">
        <p>
          Exibindo <strong>{visibleGifts.length}</strong> de{" "}
          <strong>{filteredGifts.length}</strong> presentes encontrados
        </p>
        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("todos");
            }}
            className="text-serenity-deep hover:underline cursor-pointer"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      {/* Grid de Presentes */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleGifts.map((gift, index) => (
          <GiftCard key={gift.id} gift={gift} index={index} />
        ))}
      </div>

      {/* Caso nada seja encontrado */}
      {filteredGifts.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-ink/20 bg-paper/70 p-12 text-center space-y-4">
          <span className="text-5xl">🔎</span>
          <h3 className="font-display text-2xl text-ink">Nenhum presente encontrado</h3>
          <p className="text-sm text-ink-soft max-w-md mx-auto">
            Não encontramos nenhum item com o termo &ldquo;{searchQuery}&rdquo;. Tente buscar por outra palavra-chave ou escolha outra categoria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("todos");
            }}
            className="rounded-full bg-ink px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-cream hover:bg-serenity-deep"
          >
            Ver todos os presentes
          </button>
        </div>
      ) : null}

      {/* Botão Ver Mais Presentes */}
      {hasMore ? (
        <div className="pt-8 text-center space-y-2">
          <button
            type="button"
            onClick={() => setDisplayCount((prev) => prev + 24)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-cream shadow-md transition-all hover:-translate-y-0.5 hover:bg-serenity-deep cursor-pointer"
          >
            <span>Ver mais presentes (+24)</span>
            <span>↓</span>
          </button>
          <p className="text-xs text-ink-soft">
            Restam mais {filteredGifts.length - displayCount} opções divertidas para ver
          </p>
        </div>
      ) : filteredGifts.length > 24 ? (
        <div className="pt-8 text-center text-xs uppercase tracking-widest text-ink-soft font-medium">
          🎉 Você viu todos os {filteredGifts.length} presentes desta categoria!
        </div>
      ) : null}
    </div>
  );
}
