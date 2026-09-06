"use client";

import React, { useEffect } from "react";
import {
  X,
  Pencil,
  MapPin,
  Tag,
  Package,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Barcode,
  Clock,
  Trash2,
} from "lucide-react";
import { ProductItem } from "@/lib/types";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  onEdit: (product: ProductItem) => void;
  onDelete?: (product: ProductItem) => void;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete,
}: ProductDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isLowStock =
    product.quantity === 0 ||
    (product.minQuantity > 0 && product.quantity <= product.minQuantity);

  const isOutOfStock = product.quantity === 0;

  const locationPath = product.location
    ? product.location.fullPath.split("/").join(" › ")
    : "Sem localização atribuída";

  const formatDate = (dateVal: string | Date | undefined) => {
    if (!dateVal) return "N/D";
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/D";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#1e1723] rounded-3xl border border-[#2b2233] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="px-5 py-4 border-b border-[#2b2233] flex items-center justify-between bg-[#19131d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#241b2c] border border-[#3d2c49] flex items-center justify-center text-[#f59e0b]">
              <Package className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-[#f3f0f5] text-base leading-tight">
                Detalhes do Artigo
              </h3>
              <p className="text-[11px] text-[#998e9f]">
                Visualização completa de informações
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-[#baaebf] hover:text-[#f3f0f5] flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Fotografia / Imagem do Produto */}
          <div className="w-full rounded-2xl bg-[#151016] border border-[#2b2233] overflow-hidden flex items-center justify-center min-h-[160px] max-h-[260px] relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full max-h-[260px] object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-[#4a3a54]">
                <Package className="w-14 h-14 mb-2 stroke-[1.2]" />
                <span className="text-xs font-medium text-[#84778b]">
                  Sem fotografia associada
                </span>
              </div>
            )}
          </div>

          {/* Nome e Estado de Stock */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-[#f3f0f5] leading-snug">
                {product.name}
              </h2>
              <div>
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/70 border border-rose-800/40 text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Esgotado
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/70 border border-amber-800/40 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Stock Baixo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 border border-emerald-800/40 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Em Stock
                  </span>
                )}
              </div>
            </div>

            {/* SKU e Categoria */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {product.sku && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#151016] border border-[#2b2233] text-xs font-mono text-[#baaebf]">
                  <Barcode className="w-3.5 h-3.5 text-[#84778b]" />
                  <span>{product.sku}</span>
                </div>
              )}

              {product.category && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#151016] border border-[#2b2233] text-xs text-[#baaebf]">
                  <Tag
                    className="w-3.5 h-3.5"
                    style={{ color: product.category.color || "#f59e0b" }}
                  />
                  <span>{product.category.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Grelha de Informações Chave */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Quantidade em Stock */}
            <div className="p-3.5 rounded-2xl bg-[#151016] border border-[#2b2233] space-y-1">
              <span className="text-[11px] font-semibold text-[#84778b] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2dd4bf]" />
                Stock Atual
              </span>
              <p className="text-xl font-black text-[#f3f0f5]">
                {product.quantity}{" "}
                <span className="text-xs font-normal text-[#998e9f]">unidades</span>
              </p>
            </div>

            {/* Quantidade Mínima */}
            <div className="p-3.5 rounded-2xl bg-[#151016] border border-[#2b2233] space-y-1">
              <span className="text-[11px] font-semibold text-[#84778b] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
                Stock Mínimo
              </span>
              <p className="text-xl font-black text-[#baaebf]">
                {product.minQuantity}{" "}
                <span className="text-xs font-normal text-[#998e9f]">alerta</span>
              </p>
            </div>
          </div>

          {/* Localização de Armazenamento */}
          <div className="p-3.5 rounded-2xl bg-[#151016] border border-[#2b2233] space-y-1.5">
            <span className="text-[11px] font-semibold text-[#84778b] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2dd4bf]" />
              Localização
            </span>
            <p className="text-sm font-medium text-[#2dd4bf] break-words">
              {locationPath}
            </p>
          </div>

          {/* Descrição / Observações */}
          {product.description ? (
            <div className="p-3.5 rounded-2xl bg-[#151016] border border-[#2b2233] space-y-1.5">
              <span className="text-[11px] font-semibold text-[#84778b] uppercase tracking-wider">
                Descrição & Notas
              </span>
              <p className="text-xs text-[#baaebf] whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#151016]/50 border border-[#2b2233]/60 text-[11px] text-[#63576a] italic">
              Sem notas ou descrição adicional registada.
            </div>
          )}

          {/* Datas de Criação / Atualização */}
          <div className="pt-2 border-t border-[#2b2233] flex flex-wrap items-center justify-between text-[11px] text-[#63576a] gap-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Registo: {formatDate(product.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Atualizado: {formatDate(product.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 border-t border-[#2b2233] bg-[#19131d] flex items-center justify-between gap-3">
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(product);
              }}
              className="px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-xs font-medium text-[#baaebf] hover:text-[#f3f0f5] transition-colors cursor-pointer"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#151016] text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar Artigo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
