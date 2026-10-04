"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function HomeEditorShortcuts() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Se acessou ?editar, ativa o cookie local persistente de edição flutuante
    if (searchParams && searchParams.get("editar") !== null) {
      // Persíste a permissão de editor do side para permitir flutuar entre itens
      fetch("/api/editor/cookie-toggle", {
        method: "POST",
      }).catch(() => {});
    }
  }, [searchParams]);

  return null;
}
