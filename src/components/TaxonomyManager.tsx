"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Menu,
} from "lucide-react";
import { StorageLocationItem, CategoryItem } from "@/lib/types";
import { ProductFormModal } from "./ProductFormModal";
import { SearchModal } from "./SearchModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { HomeBoxSidebar } from "./HomeBoxSidebar";
import { UserHeaderBadge } from "./UserHeaderBadge";
import {
  createCategory,
  deleteCategory,
} from "@/actions/inventory-actions";
import { useRouter } from "next/navigation";

interface TaxonomyManagerProps {
  locations: (StorageLocationItem & { _count?: { products: number } })[];
  categories: (CategoryItem & { _count?: { products: number } })[];
}

export function TaxonomyManager({ locations, categories }: TaxonomyManagerProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Estados do Menu Lateral
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gestock_sidebar_expanded");
    if (saved !== null) {
      setIsSidebarExpanded(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarExpanded((prev) => {
        const next = !prev;
        localStorage.setItem("gestock_sidebar_expanded", String(next));
        return next;
      });
    }
  };

  // Estados para modal de confirmação de eliminação de categoria
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Categoria
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#f59e0b");
  const [isCatSubmitting, setIsCatSubmitting] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    await deleteCategory(categoryToDelete.id);
    setIsDeleting(false);
    setCategoryToDelete(null);
    router.refresh();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setIsCatSubmitting(true);
    setCatError(null);

    const res = await createCategory({
      name: catName,
      color: catColor,
    });

    setIsCatSubmitting(false);
    if (res.success) {
      setCatName("");
      router.refresh();
    } else {
      setCatError(res.error || "Erro ao criar categoria.");
    }
  };

  const colorPresets = [
    "#f59e0b",
    "#2dd4bf",
    "#3b82f6",
    "#10b981",
    "#ef4444",
    "#a855f7",
    "#ec4899",
    "#64748b",
  ];

  return (
    <div className="min-h-screen bg-[#151016] text-[#f3f0f5]">
      {/* Menu Lateral Expansível / Comprimido */}
      <HomeBoxSidebar
        isExpanded={isSidebarExpanded}
        isMobileOpen={isMobileSidebarOpen}
        onToggleExpand={toggleSidebar}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSearchModal={() => setIsSearchOpen(true)}
      />

      {/* Conteúdo com margem adaptativa */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out pb-12 min-w-0 ${
          isSidebarExpanded ? "md:ml-60" : "md:ml-16"
        }`}
      >
        {/* Header Estilo HomeBox */}
        <header className="sticky top-0 z-30 bg-[#19131d]/95 backdrop-blur-md border-b border-[#2b2233] px-3 sm:px-4 py-2.5 sm:py-3 w-full max-w-full min-w-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Botão dos 3 Traços */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="md:hidden w-10 h-10 rounded-xl bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-[#baaebf] hover:text-[#f3f0f5] flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0"
                title="Expandir / Comprimir Menu Lateral"
              >
                <Menu className="w-7 h-7" />
              </button>

              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#241b2c] border border-[#3d2c49] flex items-center justify-center text-[#f59e0b] shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base font-bold text-[#f3f0f5] truncate">
                    Categorias
                  </h1>
                  <p className="text-[11px] text-[#998e9f] hidden sm:block truncate">
                    Gestão e personalização das categorias de artigos ({categories.length})
                  </p>
                </div>
              </div>
            </div>

            <UserHeaderBadge />
          </div>
        </header>

        <main className="max-w-4xl mx-auto w-full max-w-full min-w-0 px-3 sm:px-4 pt-4 flex-1 space-y-5">
          {/* Formulário Nova Categoria */}
          <form
            onSubmit={handleAddCategory}
            className="p-4 bg-[#1e1723] rounded-2xl border border-[#2b2233] shadow-xs space-y-3"
          >
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#baaebf] flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#f59e0b]" />
              Adicionar Nova Categoria
            </h3>

            {catError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {catError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#998e9f] mb-1">
                Nome da Categoria *
              </label>
              <input
                type="text"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Ex: Eletrónica, Ferramentas, Cabos..."
                className="w-full px-3 py-2 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] text-sm placeholder:text-[#84778b] focus:outline-hidden focus:border-[#f59e0b]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#998e9f] mb-1.5">
                Cor de Identificação
              </label>
              <div className="flex items-center gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCatColor(color)}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-transform active:scale-90 border border-black/40 cursor-pointer"
                    style={{ backgroundColor: color }}
                  >
                    {catColor === color && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isCatSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-[#151016] font-bold text-xs rounded-xl shadow-md shadow-[#f59e0b]/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3] text-current" />
              <span>Adicionar Categoria</span>
            </button>
          </form>

          {/* Lista Existente de Categorias */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#baaebf] px-1">
              Categorias Ativas ({categories.length})
            </h4>
            <div className="space-y-1.5">
              {categories.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#84778b] bg-[#1e1723] rounded-xl border border-[#2b2233]">
                  Nenhuma categoria criada ainda. Crie a primeira acima!
                </div>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 bg-[#1e1723] rounded-xl border border-[#2b2233] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.color || "#f59e0b" }}
                      />
                      <span className="font-semibold text-xs text-[#f3f0f5]">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#163737] text-[#2dd4bf] border border-[#2dd4bf]/20">
                        {cat._count?.products || 0} {cat._count?.products === 1 ? "produto" : "produtos"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete({ id: cat.id, name: cat.name })}
                        className="w-7 h-7 rounded-lg text-[#84778b] hover:text-rose-400 hover:bg-rose-950/50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Eliminar Categoria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        <ProductFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          categories={categories}
          locations={locations}
          onSuccess={() => router.refresh()}
        />

        {/* Modal de Pesquisa Global */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={() => router.push("/")}
        />

        {/* Modal Premium de Confirmação para Eliminar Categoria */}
        <ConfirmationModal
          isOpen={!!categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={confirmDeleteCategory}
          title="Eliminar Categoria?"
          description={`Tem a certeza que pretende eliminar a categoria "${categoryToDelete?.name}"? Os produtos associados ficarão sem categoria atribuída.`}
          confirmText="Sim, Eliminar Categoria"
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
