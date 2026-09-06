"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, LayoutGrid, Plus, MapPin, Tag } from "lucide-react";

interface BottomNavigationProps {
  onOpenAddModal: () => void;
  onOpenSearchModal?: () => void;
}

export function BottomNavigation({
  onOpenAddModal,
}: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#19131d]/95 backdrop-blur-md border-t border-[#2b2233] pb-[env(safe-area-inset-bottom,0px)] shadow-2xl">
      <div className="max-w-md mx-auto h-16 grid grid-cols-5 items-center justify-items-center relative px-2">
        {/* 1. Início (Dashboard) */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 w-full h-12 rounded-xl transition-all ${
            pathname === "/"
              ? "bg-[#163737] text-[#2dd4bf] font-bold shadow-xs"
              : "text-[#998e9f] hover:text-[#f3f0f5] hover:bg-[#231b29]"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Início</span>
        </Link>

        {/* 2. Inventário (Galeria de Miniaturas) */}
        <Link
          href="/inventory"
          className={`flex flex-col items-center justify-center gap-1 w-full h-12 rounded-xl transition-all ${
            pathname === "/inventory"
              ? "bg-[#163737] text-[#2dd4bf] font-bold shadow-xs"
              : "text-[#998e9f] hover:text-[#f3f0f5] hover:bg-[#231b29]"
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Inventário</span>
        </Link>

        {/* 3. Botão Central [+] - HomeBox Âmbar */}
        <div className="flex items-center justify-center w-full h-full">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] active:scale-95 text-[#151016] shadow-lg shadow-[#f59e0b]/25 flex items-center justify-center transition-all cursor-pointer -translate-y-1.5 hover:-translate-y-2 border-2 border-[#151016]"
            title="Adicionar Artigo"
          >
            <Plus className="w-6 h-6 stroke-[3] text-black" />
          </button>
        </div>

        {/* 4. Locais de Arrumação */}
        <Link
          href="/locations"
          className={`flex flex-col items-center justify-center gap-1 w-full h-12 rounded-xl transition-all ${
            pathname === "/locations"
              ? "bg-[#163737] text-[#2dd4bf] font-bold shadow-xs"
              : "text-[#998e9f] hover:text-[#f3f0f5] hover:bg-[#231b29]"
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Locais</span>
        </Link>

        {/* 5. Organização / Categorias */}
        <Link
          href="/manage"
          className={`flex flex-col items-center justify-center gap-1 w-full h-12 rounded-xl transition-all ${
            pathname === "/manage"
              ? "bg-[#163737] text-[#2dd4bf] font-bold shadow-xs"
              : "text-[#998e9f] hover:text-[#f3f0f5] hover:bg-[#231b29]"
          }`}
        >
          <Tag className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Categorias</span>
        </Link>
      </div>
    </nav>
  );
}
