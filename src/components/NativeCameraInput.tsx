"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Camera,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Sun,
  Moon,
  Eye,
} from "lucide-react";
import { compressImage } from "@/lib/image-compressor";
import { removeImageBackground, applyStudioBackground, BgRemovalProgress } from "@/lib/bg-removal";

interface NativeCameraInputProps {
  onImageCaptured: (file: File, previewUrl: string) => void;
  onImageRemoved?: () => void;
  currentImageUrl?: string | null;
}

type BackgroundMode = "original" | "studio" | "studio_black" | "transparent";

export function NativeCameraInput({
  onImageCaptured,
  onImageRemoved,
  currentImageUrl,
}: NativeCameraInputProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgProgress, setBgProgress] = useState<BgRemovalProgress | null>(null);

  // Versões de imagem persistentes em memória
  interface VersionItem {
    file: File;
    url: string;
  }

  const versionsRef = useRef<{
    original: VersionItem | null;
    transparent: VersionItem | null;
    studio: VersionItem | null;
    studio_black: VersionItem | null;
  }>({
    original: null,
    transparent: null,
    studio: null,
    studio_black: null,
  });

  const isInternalUpdateRef = useRef(false);

  const [hasCutout, setHasCutout] = useState(false);
  const [activeMode, setActiveMode] = useState<BackgroundMode>("original");
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [stats, setStats] = useState<{ orig: number; comp: number } | null>(null);

  // Sincronizar quando currentImageUrl mudar externamente (ex: abrir modal de outro produto)
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    if (currentImageUrl) {
      setPreview(currentImageUrl);
      // Se não havia original guardado, podemos guardar o preview atual como base original
      versionsRef.current = {
        original: null,
        transparent: null,
        studio: null,
        studio_black: null,
      };
      setHasCutout(false);
      setActiveMode("original");
    } else {
      setPreview(null);
      versionsRef.current = {
        original: null,
        transparent: null,
        studio: null,
        studio_black: null,
      };
      setHasCutout(false);
      setActiveMode("original");
    }
  }, [currentImageUrl]);

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const openCamera = () => {
    triggerHaptic();
    cameraInputRef.current?.click();
  };

  const openGallery = () => {
    triggerHaptic();
    galleryInputRef.current?.click();
  };

  // 1. Processar nova foto da câmara
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const result = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.85,
        format: "image/webp",
      });

      const compressedFile = new File([result.blob], `prod_${Date.now()}.webp`, {
        type: "image/webp",
      });

      const origItem: VersionItem = {
        file: compressedFile,
        url: result.dataUrl,
      };

      // Registar versão original e limpar versões de recorte anteriores
      versionsRef.current.original = origItem;
      versionsRef.current.transparent = null;
      versionsRef.current.studio = null;
      versionsRef.current.studio_black = null;

      setHasCutout(false);
      setActiveMode("original");
      setPreview(result.dataUrl);
      setStats({ orig: result.originalSize, comp: result.compressedSize });

      isInternalUpdateRef.current = true;
      onImageCaptured(compressedFile, result.dataUrl);
    } catch (err) {
      console.error("Erro ao otimizar foto:", err);
      alert("Não foi possível processar a imagem. Tente novamente.");
    } finally {
      setIsProcessing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  // 2. Acionar Remoção de Fundo com IA Local
  const handleRemoveBackground = async () => {
    // Garantir que temos uma imagem fonte
    let sourceBlobOrFile: Blob | File | string | null =
      versionsRef.current.original?.file || preview;

    if (!sourceBlobOrFile) {
      alert("Por favor, tire uma fotografia ou selecione uma imagem primeiro.");
      return;
    }

    try {
      setIsRemovingBg(true);
      triggerHaptic();

      // Se ainda não tínhamos uma versão original guardada (ex: veio do currentImageUrl), criar e guardar agora
      if (!versionsRef.current.original && preview) {
        try {
          const res = await fetch(preview);
          const blob = await res.blob();
          const origFile = new File([blob], `prod_orig_${Date.now()}.webp`, {
            type: blob.type || "image/webp",
          });
          versionsRef.current.original = { file: origFile, url: preview };
          sourceBlobOrFile = origFile;
        } catch {
          // Se falhar o fetch do preview, continuar com o sourceBlobOrFile existente
        }
      }

      console.log("[NativeCameraInput] A iniciar recorte de fundo com IA...");

      // Recorte via WebAssembly/ONNX local no browser
      const { blob: transBlob, dataUrl: transUrl } = await removeImageBackground(
        sourceBlobOrFile,
        (p) => setBgProgress(p)
      );

      const transFile = new File([transBlob], `prod_trans_${Date.now()}.png`, {
        type: "image/png",
      });
      versionsRef.current.transparent = { file: transFile, url: transUrl };

      // Gerar versão de estúdio branco e estúdio preto em paralelo
      const [whiteStudio, blackStudio] = await Promise.all([
        applyStudioBackground(transBlob, "#ffffff"),
        applyStudioBackground(transBlob, "#050505"),
      ]);

      const studioWhiteFile = new File([whiteStudio.blob], `prod_white_${Date.now()}.png`, {
        type: "image/png",
      });
      versionsRef.current.studio = { file: studioWhiteFile, url: whiteStudio.dataUrl };

      const studioBlackFile = new File([blackStudio.blob], `prod_black_${Date.now()}.png`, {
        type: "image/png",
      });
      versionsRef.current.studio_black = { file: studioBlackFile, url: blackStudio.dataUrl };

      // Ativar modo estúdio por omissão
      setHasCutout(true);
      setActiveMode("studio");
      setPreview(whiteStudio.dataUrl);

      isInternalUpdateRef.current = true;
      onImageCaptured(studioWhiteFile, whiteStudio.dataUrl);
    } catch (err: any) {
      console.error("Erro ao remover fundo com IA:", err);
      alert(`Não foi possível remover o fundo: ${err?.message || err}`);
    } finally {
      setIsRemovingBg(false);
      setBgProgress(null);
    }
  };

  // 3. Alternar entre modos de visualização
  const switchMode = (mode: BackgroundMode) => {
    triggerHaptic();
    setActiveMode(mode);

    const target = versionsRef.current[mode];
    console.log(`[NativeCameraInput] switchMode: "${mode}"`, target);

    if (target) {
      setPreview(target.url);
      isInternalUpdateRef.current = true;
      onImageCaptured(target.file, target.url);
    } else if (mode === "original" && preview) {
      // Fallback para original se url estiver guardado
      setPreview(preview);
    }
  };

  const handleRemove = () => {
    versionsRef.current = {
      original: null,
      transparent: null,
      studio: null,
      studio_black: null,
    };
    setHasCutout(false);
    setPreview(null);
    setStats(null);
    setActiveMode("original");
    onImageRemoved?.();
  };

  return (
    <div className="w-full space-y-2">
      {/* Inputs nativos escondidos */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Visualização de Pré-visualização com Controlo de Fundo */}
      {preview ? (
        <div className="relative group rounded-2xl overflow-hidden border border-[#2b2233] bg-[#151016] shadow-inner">
          <div
            className="w-full h-56 flex items-center justify-center overflow-hidden transition-all relative"
            style={
              activeMode === "transparent"
                ? {
                    backgroundImage: `
                      linear-gradient(45deg, #281d30 25%, transparent 25%),
                      linear-gradient(-45deg, #281d30 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #281d30 75%),
                      linear-gradient(-45deg, transparent 75%, #281d30 75%)
                    `,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    backgroundColor: "#16101c",
                  }
                : activeMode === "studio"
                ? { backgroundColor: "#ffffff" }
                : activeMode === "studio_black"
                ? { backgroundColor: "#050505" }
                : { backgroundColor: "#151016" }
            }
          >
            <img
              src={preview}
              alt="Foto do produto"
              className="w-full h-full object-contain p-2"
            />

            {/* Overlay durante processamento de remoção de fundo */}
            {isRemovingBg && (
              <div className="absolute inset-0 bg-[#151016]/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-[#f3f0f5] z-20">
                <Sparkles className="w-8 h-8 text-[#f59e0b] animate-bounce mb-2" />
                <p className="font-bold text-sm">A Recortar Fundo com IA...</p>
                <p className="text-xs text-[#baaebf] mt-1 text-center max-w-xs">
                  {bgProgress
                    ? bgProgress.key.includes("fetch") || bgProgress.key.includes("model")
                      ? `A carregar motor neural... (${bgProgress.percent}%)`
                      : `A recortar o produto... (${bgProgress.percent}%)`
                    : "A inicializar motor neural no dispositivo..."}
                </p>
                <div className="w-52 h-2 bg-[#2b2233] rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] transition-all duration-200 rounded-full"
                    style={{ width: `${Math.max(6, bgProgress?.percent || 12)}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#84778b] mt-2">
                  100% privado no dispositivo (sem envio para servidores)
                </span>
              </div>
            )}

            {/* Botão de Remover Foto */}
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemovingBg}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-[#151016]/80 text-[#f3f0f5] border border-[#2b2233] flex items-center justify-center hover:bg-[#251c2c] active:scale-95 transition-all shadow-md z-10 cursor-pointer"
              title="Remover foto"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Botões rápidos em hover/overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none group-hover:pointer-events-auto">
              <button
                type="button"
                onClick={openCamera}
                disabled={isProcessing || isRemovingBg}
                className="px-3 py-1.5 bg-[#f59e0b] text-[#151016] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                Tirar Outra
              </button>
            </div>
          </div>

          {/* Barra de Controlo de Fundo */}
          <div className="p-2 bg-[#1e1723] border-t border-[#2b2233]">
            {hasCutout ? (
              /* Comutador de Estilo de Fundo após o recorte com destaque ativo evidente */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#151016] rounded-xl border border-[#2b2233]">
                <button
                  type="button"
                  onClick={() => switchMode("studio")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeMode === "studio"
                      ? "bg-[#f59e0b] text-[#151016] shadow-sm scale-[1.02]"
                      : "bg-[#1e1723] text-[#baaebf] hover:text-[#f3f0f5] hover:bg-[#281d30]"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Estúdio Branco
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("studio_black")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeMode === "studio_black"
                      ? "bg-[#f59e0b] text-[#151016] shadow-sm scale-[1.02]"
                      : "bg-[#1e1723] text-[#baaebf] hover:text-[#f3f0f5] hover:bg-[#281d30]"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Estúdio Preto
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("transparent")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeMode === "transparent"
                      ? "bg-[#f59e0b] text-[#151016] shadow-sm scale-[1.02]"
                      : "bg-[#1e1723] text-[#baaebf] hover:text-[#f3f0f5] hover:bg-[#281d30]"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Transparente
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("original")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeMode === "original"
                      ? "bg-[#f59e0b] text-[#151016] shadow-sm scale-[1.02]"
                      : "bg-[#1e1723] text-[#baaebf] hover:text-[#f3f0f5] hover:bg-[#281d30]"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Original
                </button>
              </div>
            ) : (
              /* Botão de Disparo para Remover Fundo com IA */
              <button
                type="button"
                onClick={handleRemoveBackground}
                disabled={isRemovingBg}
                className="w-full py-2.5 px-3 bg-[#241b2c] hover:bg-[#2d2237] active:scale-[0.99] text-[#f59e0b] border border-[#3d2c49] text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#f59e0b] animate-pulse" />
                Eliminar Fundo com IA (Manter apenas o produto)
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Estado sem foto: Botões de captura */
        <div className="rounded-2xl border border-[#2b2233] bg-[#151016] p-4 transition-all">
          {isProcessing ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-[#998e9f]">
              <RefreshCw className="w-8 h-8 animate-spin text-[#f59e0b]" />
              <p className="text-xs font-medium">A otimizar fotografia no telemóvel...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#241b2c] border border-[#3d2c49] text-[#f59e0b] flex items-center justify-center shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#f3f0f5]">
                  Fotografia do Artigo
                </p>
                <p className="text-xs text-[#998e9f] mt-0.5 max-w-xs">
                  Abre a câmara nativa com foco automático e suporte a recorte de fundo por IA.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full pt-1">
                <button
                  type="button"
                  onClick={openCamera}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] active:scale-[0.98] text-[#151016] font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform cursor-pointer"
                >
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                  Abrir Câmara
                </button>
                <button
                  type="button"
                  onClick={openGallery}
                  className="py-3 px-4 bg-[#231b29] hover:bg-[#2b2233] active:scale-[0.98] border border-[#2b2233] text-[#baaebf] hover:text-[#f3f0f5] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform cursor-pointer"
                  title="Escolher da Galeria"
                >
                  <ImageIcon className="w-4 h-4 text-[#84778b]" />
                  Galeria
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
