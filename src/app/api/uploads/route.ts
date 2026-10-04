import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { canEditGifts } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: Request) {
  if (!(await canEditGifts())) {
    return Response.json(
      { error: "Abra o site com ?editar no final do link antes de enviar a foto." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Selecione um arquivo de imagem" }, { status: 400 });
    }

    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      return Response.json(
        { error: "Formato inválido. Use JPG, PNG, WEBP ou GIF." },
        { status: 400 },
      );
    }

    // Limite de segurança: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: "A imagem deve ter no máximo 5MB." },
        { status: 400 },
      );
    }

    const filename = `upload-${Date.now()}-${Math.floor(Math.random() * 100000)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return Response.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Erro no upload de imagem:", error);
    return Response.json(
      {
        error:
          "No site publicado não dá para enviar arquivo do computador. Cole o link (endereço) da imagem no campo Foto.",
      },
      { status: 500 },
    );
  }
}
