import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await context.params;
    const pathSegments = resolvedParams?.path;

    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Ficheiro não especificado.", { status: 400 });
    }

    // Prevenir directory traversal com basename em cada segmento
    const safeSegments = pathSegments.map((s) => path.basename(s));
    const relativeFilePath = safeSegments.join(path.sep);

    // Lista de locais potenciais onde os ficheiros podem residir
    const searchDirs = [
      "/app/data/uploads",
      path.join(process.cwd(), "public", "uploads"),
      path.join(process.cwd(), "data", "uploads"),
    ];

    let foundPath: string | null = null;
    for (const dir of searchDirs) {
      const candidate = path.join(dir, relativeFilePath);
      if (fs.existsSync(candidate)) {
        foundPath = candidate;
        break;
      }
    }

    if (!foundPath) {
      return new NextResponse("Imagem não encontrada.", { status: 404 });
    }

    const ext = path.extname(foundPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = await readFile(foundPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Erro ao servir imagem de upload:", error);
    return new NextResponse("Erro ao processar imagem.", { status: 500 });
  }
}
