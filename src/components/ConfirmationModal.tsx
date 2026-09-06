"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Sim, Eliminar",
  cancelText = "Cancelar",
  isDestructive = true,
  isLoading = false,
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-sm bg-[#1e1723] rounded-3xl p-6 shadow-2xl border border-[#2b2233] flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        {/* Ícone de Aviso */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
            isDestructive
              ? "bg-rose-950/60 text-rose-400 border border-rose-900/50"
              : "bg-amber-950/60 text-amber-400 border border-amber-900/50"
          }`}
        >
          {isDestructive ? (
            <Trash2 className="w-7 h-7 stroke-[1.8]" />
          ) : (
            <AlertTriangle className="w-7 h-7 stroke-[1.8]" />
          )}
        </div>

        {/* Título & Descrição */}
        <h3 className="text-base font-bold text-[#f3f0f5] leading-tight mb-2">
          {title}
        </h3>
        <p className="text-xs text-[#998e9f] leading-relaxed mb-6 max-w-xs">
          {description}
        </p>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2.5 w-full">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-[#2b2233] bg-[#151016] hover:bg-[#251c2c] text-[#baaebf] hover:text-[#f3f0f5] font-semibold text-xs active:scale-95 transition-all cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-md transition-all cursor-pointer ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/40"
                : "bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-[#151016] shadow-[#f59e0b]/20"
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
