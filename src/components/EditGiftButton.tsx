"use client";

import { useEditor, type EditableGift } from "./EditorProvider";

export default function EditGiftButton({ gift }: { gift: EditableGift }) {
  const { enabled, openGift } = useEditor();
  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={() => openGift(gift)}
      className="rounded-full border border-ink/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-cream"
    >
      Editar
    </button>
  );
}
