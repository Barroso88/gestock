export interface BgRemovalProgress {
  key: string;
  current: number;
  total: number;
  percent: number;
}

export async function removeImageBackground(
  imageSource: Blob | File | string,
  onProgress?: (progress: BgRemovalProgress) => void
): Promise<{ blob: Blob; dataUrl: string }> {
  // Importação dinâmica exclusiva para o cliente
  const { removeBackground } = await import("@imgly/background-removal");

  // Converter SEMPRE qualquer string (data URL, blob URL, caminho remoto) para um Blob nativo
  // Isto evita o bug de URL parsing no @imgly ao lidar com data-URIs e caminhos relativos
  let inputBlob: Blob;
  if (typeof imageSource === "string") {
    console.log("[BG-Removal] A converter source string para Blob...");
    const res = await fetch(imageSource);
    inputBlob = await res.blob();
  } else {
    inputBlob = imageSource;
  }

  // Garantir tipo MIME válido suportado pelo descodificador do @imgly (image/png, image/jpeg, image/webp)
  if (!inputBlob.type || !inputBlob.type.startsWith("image/")) {
    console.log("[BG-Removal] A normalizar tipo MIME para image/webp...");
    inputBlob = new Blob([await inputBlob.arrayBuffer()], { type: "image/webp" });
  }

  const progressCallback = (key: string, current: number, total: number) => {
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    console.log(`[BG-Removal] ${key}: ${current}/${total} (${percent}%)`);
    onProgress?.({ key, current, total, percent });
  };

  const publicPath = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";

  try {
    console.log("[BG-Removal] A iniciar remoção de fundo com modelo isnet_quint8...", {
      type: inputBlob.type,
      size: inputBlob.size,
    });

    // 1. Tentar com modelo leve quint8 (mais rápido em mobile)
    const blob = await removeBackground(inputBlob, {
      publicPath,
      model: "isnet_quint8",
      output: {
        format: "image/png",
        quality: 0.85,
      },
      debug: false,
      progress: progressCallback,
    });

    console.log("[BG-Removal] Concluído com sucesso com isnet_quint8!", { size: blob.size });
    const dataUrl = URL.createObjectURL(blob);
    return { blob, dataUrl };
  } catch (err: any) {
    console.warn("[BG-Removal] Aviso: Falha com isnet_quint8, a tentar com isnet_fp16:", err);

    // 2. Fallback automático para modelo padrão de alta precisão (isnet_fp16)
    try {
      const blob = await removeBackground(inputBlob, {
        publicPath,
        model: "isnet_fp16",
        output: {
          format: "image/png",
          quality: 0.85,
        },
        debug: false,
        progress: progressCallback,
      });

      console.log("[BG-Removal] Concluído com sucesso com isnet_fp16!", { size: blob.size });
      const dataUrl = URL.createObjectURL(blob);
      return { blob, dataUrl };
    } catch (fallbackErr: any) {
      console.error("[BG-Removal] Erro na remoção de fundo com IA:", fallbackErr);
      throw new Error(
        fallbackErr?.message || "Não foi possível carregar o modelo de IA no browser. Verifique a sua ligação à internet."
      );
    }
  }
}

/**
 * Converte uma imagem recortada transparente para um fundo branco de estúdio
 */
export async function applyStudioBackground(
  transparentBlob: Blob,
  bgColor: string = "#FFFFFF"
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(transparentBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error("Contexto 2D indisponível"));
      }

      // Preencher fundo com cor de estúdio (ex: Branco puro)
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenhar produto recortado por cima
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (finalBlob) => {
          URL.revokeObjectURL(url);
          if (!finalBlob) return reject(new Error("Falha ao gerar estúdio"));
          const dataUrl = canvas.toDataURL("image/png");
          resolve({ blob: finalBlob, dataUrl });
        },
        "image/png"
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erro ao carregar imagem para aplicar estúdio"));
    };

    img.src = url;
  });
}
