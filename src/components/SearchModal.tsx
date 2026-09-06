"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { GlobalInventorySearch } from "./GlobalInventorySearch";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
}

export function SearchModal({ isOpen, onClose, onSelectProduct }: SearchModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-start items-center bg-black/75 backdrop-blur-xs p-4 pt-12 animate-in fade-in duration-150">
      <div
        ref={containerRef}
        className="w-full max-w-lg bg-[#1e1723] rounded-3xl p-5 shadow-2xl border border-[#2b2233] flex flex-col gap-3 animate-in slide-in-from-top-6 duration-200"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#2b2233]">
          <h3 className="font-bold text-[#f3f0f5] text-base">
            Pesquisa de Inventário
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#151016] border border-[#2b2233] flex items-center justify-center text-[#84778b] hover:text-[#f3f0f5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Componente de Pesquisa Global */}
        <GlobalInventorySearch
          onSelectProduct={(id) => {
            onSelectProduct(id);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
