import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum ficheiro fornecido." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nome único seguro
    const ext = file.type === "image/webp" ? "webp" : "jpg";
    const filename = `item_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Gravar em todos os locais relevantes (Docker volume /app/data/uploads e public/uploads)
    const targetDirs = [
      "/app/data/uploads",
      path.join(process.cwd(), "public", "uploads"),
      path.join(process.cwd(), "data", "uploads"),
    ];

    let written = false;
    for (const dir of targetDirs) {
      try {
        await mkdir(dir, { recursive: true });
        const filePath = path.join(dir, filename);
        await writeFile(filePath, buffer);
        written = true;
      } catch (err) {
        // Ignorar se o diretório raiz não for acessível (ex: /app/data em dev local)
      }
    }

    if (!written) {
      throw new Error("Não foi possível gravar a imagem em nenhum dos diretórios de armazenamento.");
    }

    return NextResponse.json({
      url: `/uploads/${filename}`,
      size: buffer.length,
      filename,
    });
  } catch (error) {
    console.error("Erro no upload de imagem:", error);
    return NextResponse.json({ error: "Falha ao gravar imagem." }, { status: 500 });
  }
}
