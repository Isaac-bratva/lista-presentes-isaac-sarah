"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fallback abaixo
  }

  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

type Props = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  tone?: "solid" | "outline" | "quiet";
};

export default function CopyButton({
  value,
  label = "Copiar",
  copiedLabel = "Copiado!",
  className = "",
  tone = "outline",
}: Props) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(value);
    setState(ok ? "ok" : "fail");
    window.setTimeout(() => setState("idle"), 2200);
  }, [value]);

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full text-[13px] font-semibold tracking-wide uppercase transition-all duration-200 active:scale-[0.97] cursor-pointer";
  const tones: Record<string, string> = {
    solid: "bg-terracotta text-cream px-5 py-3 hover:bg-terracotta-deep",
    outline:
      "border border-ink/25 text-ink px-4 py-2 hover:border-terracotta hover:text-terracotta",
    quiet: "text-ink/70 px-3 py-1 hover:text-terracotta underline decoration-dotted",
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${base} ${tones[tone]} ${className}`}
    >
      <span aria-hidden>{state === "ok" ? "✓" : state === "fail" ? "!" : "⧉"}</span>
      <span>
        {state === "ok" ? copiedLabel : state === "fail" ? "Selecione e copie" : label}
      </span>
    </button>
  );
}
