"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  LayoutGrid,
  MapPin,
  Tag,
  Search,
  Plus,
  Settings,
  FolderTree,
  User,
  LogOut,
  LogIn,
  X,
  Palette,
  Menu,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface HomeBoxSidebarProps {
  isExpanded: boolean;
  isMobileOpen: boolean;
  onToggleExpand: () => void;
  onCloseMobile: () => void;
  onOpenAddModal: () => void;
  onOpenSearchModal: () => void;
}

export function HomeBoxSidebar({
  isExpanded,
  isMobileOpen,
  onToggleExpand,
  onCloseMobile,
  onOpenAddModal,
  onOpenSearchModal,
}: HomeBoxSidebarProps) {
  const pathname = usePathname();
  const { openThemeModal } = useTheme();

  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const displayName = currentUser?.name || "André Barroso";

  const navItems = [
    {
      label: "Início",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Inventário",
      href: "/inventory",
      icon: LayoutGrid,
      isActive: pathname === "/inventory",
    },
    {
      label: "Localizações",
      href: "/locations",
      icon: MapPin,
      isActive: pathname === "/locations",
    },
    {
      label: "Categorias",
      href: "/manage",
      icon: Tag,
      isActive: pathname === "/manage",
    },
    {
      label: "Perfil",
      href: "/profile",
      icon: User,
      isActive: pathname === "/profile",
    },
    {
      label: "Temas",
      onClick: openThemeModal,
      icon: Palette,
      isActive: false,
    },
    {
      label: "Pesquisar",
      onClick: onOpenSearchModal,
      icon: Search,
      isActive: false,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#161118] text-[#f3f0f5] border-r border-[#2b2233] select-none">
      {/* 1. Área Superior: Hamburguer no topo esquerdo */}
      <div className={`pt-3.5 pb-3.5 border-b border-[#2b2233]/60 transition-all ${isExpanded ? "px-3.5" : "px-2 flex flex-col items-center"}`}>
        {isExpanded ? (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onToggleExpand}
              className="w-10 h-10 rounded-xl bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-[#baaebf] hover:text-[#f3f0f5] flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0"
              title="Comprimir Menu Lateral (Só Ícones)"
            >
              <Menu className="w-7 h-7" />
            </button>

            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden w-8 h-8 rounded-lg bg-[#241b2c] flex items-center justify-center text-[#998e9f] hover:text-[#f3f0f5] shrink-0"
              title="Fechar Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={onToggleExpand}
              className="w-11 h-11 rounded-xl bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-[#baaebf] hover:text-[#f3f0f5] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              title="Expandir Menu Lateral"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Botão Principal Adicionar */}
      <div className={`py-3 transition-all ${isExpanded ? "px-3" : "px-2 flex justify-center"}`}>
        {isExpanded ? (
          <button
            type="button"
            onClick={() => {
              onOpenAddModal();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] active:scale-[0.98] text-[#151016] font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#f59e0b]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3] text-current" />
            <span>Adicionar</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onOpenAddModal();
              onCloseMobile();
            }}
            className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] active:scale-95 text-[#151016] font-bold rounded-xl flex items-center justify-center shadow-md shadow-[#f59e0b]/25 transition-all cursor-pointer"
            title="Adicionar Artigo"
          >
            <Plus className="w-5 h-5 stroke-[3] text-current" />
          </button>
        )}
      </div>

      {/* 3. Itens de Navegação Principal */}
      <nav className={`flex-1 py-1 space-y-1 overflow-y-auto ${isExpanded ? "px-2" : "px-1.5"}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const activeClasses = item.isActive
            ? "bg-[#163737] text-[#2dd4bf] font-bold border border-[#2dd4bf]/20 shadow-xs"
            : "text-[#998e9f] hover:text-[#f3f0f5] hover:bg-[#201825]";

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                title={!isExpanded ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl transition-all cursor-pointer ${
                  isExpanded ? "px-3 py-2 text-[18px]" : "w-10 h-10 mx-auto justify-center"
                } ${activeClasses}`}
              >
                <Icon className={`shrink-0 w-5 h-5 ${item.isActive ? "text-[#2dd4bf]" : ""}`} />
                {isExpanded && <span className="truncate">{item.label}</span>}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick?.();
                onCloseMobile();
              }}
              title={!isExpanded ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl transition-all cursor-pointer w-full text-left ${
                isExpanded ? "px-3 py-2 text-[18px]" : "w-10 h-10 mx-auto justify-center"
              } ${activeClasses}`}
            >
              <Icon className="shrink-0 w-5 h-5" />
              {isExpanded && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* 4. Rodapé da Sidebar */}
      <div className={`p-3 border-t border-[#2b2233]/60 ${isExpanded ? "" : "flex justify-center"}`}>
        {isExpanded ? (
          <div className="flex items-center justify-between text-[18px] text-[#84778b]">
            <div className="flex items-center gap-2">
              <Settings className="w-4.5 h-4.5" />
              <span>Gestock v1.0</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={openThemeModal}
                title="Personalizar Tema"
                className="p-1.5 rounded-lg hover:bg-[#201825] hover:text-[#f59e0b] text-[#84778b] transition-colors cursor-pointer"
              >
                <Palette className="w-4.5 h-4.5" />
              </button>
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/api/auth/logout";
                  }}
                  title="Terminar Sessão Google"
                  className="p-1.5 rounded-lg hover:bg-rose-950/50 hover:text-rose-400 text-[#84778b] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              ) : (
                <Link
                  href="/login"
                  title="Iniciar Sessão com Google"
                  className="p-1.5 rounded-lg hover:bg-[#201825] hover:text-[#2dd4bf] text-[#84778b] transition-colors cursor-pointer"
                >
                  <LogIn className="w-4.5 h-4.5" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={openThemeModal}
              title="Temas do Gestock"
              className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center hover:bg-[#201825] hover:text-[#f59e0b] text-[#84778b] transition-colors cursor-pointer"
            >
              <Palette className="w-5 h-5" />
            </button>
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/api/auth/logout";
                }}
                title="Terminar Sessão Google"
                className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center hover:bg-rose-950/50 hover:text-rose-400 text-[#84778b] transition-colors cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            ) : (
              <Link
                href="/login"
                title="Iniciar Sessão com Google"
                className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center hover:bg-[#201825] hover:text-[#2dd4bf] text-[#84778b] transition-colors cursor-pointer"
              >
                <LogIn className="w-4.5 h-4.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop Fixa com Animação de Largura (Expanded: 240px, Collapsed: 64px) */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 ease-in-out ${
          isExpanded ? "w-60" : "w-16"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Drawer Mobile com Backdrop (quando ativado pelos 3 traços no telemóvel) */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-64 h-full shadow-2xl animate-in slide-in-from-left duration-200"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
