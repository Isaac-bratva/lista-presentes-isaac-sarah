"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useEditor, type EditableGift } from "@/components/EditorProvider";
import { Suspense } from "react";

function Launcher({ gift }: { gift: EditableGift }) {
  const params = useSearchParams();
  const { enabled, openGift } = useEditor();
  const editing = enabled || params.has("editar");

  useEffect(() => {
    if (editing) openGift(gift);
  }, [editing, gift, openGift]);

  if (!editing) return null;

  return (
    <button
      type="button"
      onClick={() => openGift(gift)}
      className="fixed bottom-4 left-4 z-[75] rounded-full bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-cream shadow-xl"
    >
      Editar este presente
    </button>
  );
}

export default function EditGiftLauncher({ gift }: { gift: EditableGift }) {
  return (
    <Suspense fallback={null}>
      <Launcher gift={gift} />
    </Suspense>
  );
}
