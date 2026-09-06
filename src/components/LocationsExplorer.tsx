"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  ChevronRight,
  ChevronDown,
  Package,
  Layers,
  FolderTree,
  Plus,
  Box,
  Trash2,
  Pencil,
  Menu,
} from "lucide-react";
import { StorageLocationItem, ProductItem, CategoryItem } from "@/lib/types";
import { BottomNavigation } from "./BottomNavigation";
import { ProductFormModal } from "./ProductFormModal";
import { ProductDetailModal } from "./ProductDetailModal";
import { LocationFormModal } from "./LocationFormModal";
import { QuickStockAdjuster } from "./QuickStockAdjuster";
import { SearchModal } from "./SearchModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { HomeBoxSidebar } from "./HomeBoxSidebar";
import { UserHeaderBadge } from "./UserHeaderBadge";
import { deleteProduct, deleteLocation } from "@/actions/inventory-actions";
import { useRouter } from "next/navigation";

interface LocationWithProducts extends StorageLocationItem {
  products: ProductItem[];
}

interface LocationsExplorerProps {
  locations: LocationWithProducts[];
  categories: CategoryItem[];
  allLocations: StorageLocationItem[];
}

export function LocationsExplorer({
  locations,
  categories,
  allLocations,
}: LocationsExplorerProps) {
  const router = useRouter();
  const [selectedLocId, setSelectedLocId] = useState<string | null>(
    locations.length > 0 ? locations[0].id : null
  );
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductItem | null>(null);
  const [productToView, setProductToView] = useState<ProductItem | null>(null);

  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<StorageLocationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Estados para adicionar/editar locais de arrumação
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<StorageLocationItem | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  const handleOpenAddLocation = (parentId: string | null = null) => {
    setLocationToEdit(null);
    setDefaultParentId(parentId);
    setIsLocationModalOpen(true);
  };

  const handleOpenEditLocation = (loc: StorageLocationItem) => {
    setLocationToEdit(loc);
    setDefaultParentId(null);
    setIsLocationModalOpen(true);
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedLoc = locations.find((l) => l.id === selectedLocId);

  // Agrupar nós em árvore para navegação limpa
  const rootLocations = locations.filter((l) => !l.parentId);
  const getChildren = (parentId: string) => locations.filter((l) => l.parentId === parentId);

  const handleEditProduct = (p: ProductItem) => {
    setProductToEdit(p);
    setIsAddModalOpen(true);
  };

  const handleViewProduct = (p: ProductItem) => {
    setProductToView(p);
  };

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsAddModalOpen(true);
  };

  // Renderizador recursivo da árvore de locais estilo HomeBox
  const renderLocationTree = (loc: LocationWithProducts) => {
    const children = getChildren(loc.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedNodes[loc.id] || selectedLocId === loc.id;
    const isSelected = selectedLocId === loc.id;

    return (
      <div key={loc.id} className="space-y-1">
        <div
          onClick={() => setSelectedLocId(loc.id)}
          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
            isSelected
              ? "bg-[#163737] border-[#2dd4bf]/40 shadow-sm"
              : "bg-[#1e1723] border-[#2b2233] hover:border-[#3d2e48] hover:bg-[#251c2c]"
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected
                  ? "bg-[#1a4a49] text-[#2dd4bf]"
                  : "bg-[#241b2c] text-[#84778b]"
              }`}
            >
              <MapPin className="w-4 h-4" />
            </div>

            <div className="truncate">
              <span
                className={`text-xs md:text-sm font-semibold truncate ${
                  isSelected ? "text-[#2dd4bf]" : "text-[#f3f0f5]"
                }`}
              >
                {loc.name}
              </span>
              <p className="text-[10px] text-[#998e9f] truncate">
                {loc.fullPath.replace(/^\//, "").replace(/\//g, " › ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Badge de quantidade estilo HomeBox */}
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                isSelected
                  ? "bg-[#2dd4bf] text-[#151016]"
                  : "bg-[#f59e0b] text-[#151016]"
              }`}
            >
              {loc.products.length}
            </span>

            {hasChildren && (
              <button
                type="button"
                onClick={(e) => toggleExpand(loc.id, e)}
                className="p-1 text-[#84778b] hover:text-[#f3f0f5] rounded-md transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Nós Filhos Indentados */}
        {hasChildren && isExpanded && (
          <div className="pl-4 border-l-2 border-[#2b2233] space-y-1 my-1">
            {children.map((child) => renderLocationTree(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#151016] text-[#f3f0f5]">
      {/* Menu Lateral Expansível / Comprimido */}
      <HomeBoxSidebar
        isExpanded={isSidebarExpanded}
        isMobileOpen={isMobileSidebarOpen}
        onToggleExpand={toggleSidebar}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenAddModal={handleOpenAdd}
        onOpenSearchModal={() => setIsSearchOpen(true)}
      />

      {/* Conteúdo com margem flexível */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out pb-12 w-full max-w-full min-w-0 overflow-x-hidden ${
          isSidebarExpanded ? "md:ml-60" : "md:ml-16"
        }`}
      >
        {/* Top Header Estilo HomeBox */}
        <header className="sticky top-0 z-30 bg-[#19131d]/95 backdrop-blur-md border-b border-[#2b2233] px-2.5 sm:px-4 py-2 sm:py-3 w-full">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              {/* Botão dos 3 Traços */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-[#baaebf] hover:text-[#f3f0f5] flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0"
                title="Expandir / Comprimir Menu Lateral"
              >
                <Menu className="w-5 h-5 sm:w-7 sm:h-7" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#241b2c] border border-[#3d2c49] flex items-center justify-center text-[#f59e0b] shrink-0">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-[#f3f0f5]">
                    Localizações
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-[#998e9f] hidden xs:block sm:block">
                    Gestão hierárquica e navegação por divisão
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenAddLocation(null)}
                className="px-2.5 sm:px-3.5 py-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] active:scale-95 text-[#151016] font-bold text-xs rounded-xl flex items-center gap-1 sm:gap-1.5 shadow-md shadow-[#f59e0b]/20 transition-all cursor-pointer shrink-0"
                title="Novo Local"
              >
                <Plus className="w-4 h-4 stroke-[3] text-black shrink-0" />
                <span className="hidden sm:inline">Novo Local</span>
              </button>
              <UserHeaderBadge />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto w-full px-3 sm:px-4 pt-4 sm:pt-5 flex-1 space-y-5 min-w-0 overflow-x-hidden">
          {/* Árvore de Locais */}
          <section className="bg-[#1e1723] border border-[#2b2233] rounded-2xl p-4 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#baaebf]">
              Hierarquia de Armazém
            </h2>
            <div className="space-y-2">
              {rootLocations.map((root) => renderLocationTree(root))}
            </div>
          </section>

          {/* Conteúdo do Local Selecionado */}
          {selectedLoc && (
            <section className="bg-[#1e1723] border border-[#2b2233] rounded-2xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2b2233]">
                <div>
                  <h3 className="text-sm font-bold text-[#f3f0f5] flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#f59e0b]" />
                    Artigos em: {selectedLoc.name}
                  </h3>
                  <p className="text-xs text-[#2dd4bf] mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedLoc.fullPath.replace(/^\//, "").replace(/\//g, " › ")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditLocation(selectedLoc)}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#2b2233] bg-[#151016] hover:bg-[#251c2c] text-[#baaebf] hover:text-[#f3f0f5] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Editar este local"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#f59e0b]" />
                    Editar Local
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddLocation(selectedLoc.id)}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#163737] text-[#2dd4bf] border border-[#2dd4bf]/20 hover:bg-[#1a4a49] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Adicionar sub-localização dentro deste local"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Sub-Local
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationToDelete(selectedLoc)}
                    className="w-8 h-8 rounded-lg text-[#84778b] hover:text-rose-400 hover:bg-rose-950/50 flex items-center justify-center transition-colors cursor-pointer ml-1"
                    title="Eliminar este local"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedLoc.products.length === 0 ? (
                <div className="p-8 bg-[#151016] rounded-xl border border-[#2b2233] text-center">
                  <Package className="w-8 h-8 text-[#4a3a54] mx-auto mb-2" />
                  <p className="text-xs text-[#998e9f]">
                    Nenhum artigo arrumado nesta localização no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedLoc.products.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleViewProduct(prod)}
                      className="p-3 bg-[#151016] hover:bg-[#251c2c] rounded-xl border border-[#2b2233] flex items-center justify-between gap-3 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-[#1e1723] border border-[#2b2233] overflow-hidden shrink-0 flex items-center justify-center">
                          {prod.imageUrl ? (
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-[#84778b]" />
                          )}
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs md:text-sm font-semibold text-[#f3f0f5] truncate">
                            {prod.name}
                          </h4>
                          {prod.sku && (
                            <span className="text-[10px] font-mono text-[#998e9f]">
                              SKU: {prod.sku}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <QuickStockAdjuster
                          productId={prod.id}
                          initialQuantity={prod.quantity}
                          minQuantity={prod.minQuantity}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(prod);
                          }}
                          className="w-8 h-8 rounded-lg text-[#84778b] hover:text-[#f59e0b] hover:bg-[#2b2233] flex items-center justify-center transition-colors cursor-pointer"
                          title="Editar Artigo"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToDelete(prod);
                          }}
                          className="w-8 h-8 rounded-lg text-[#84778b] hover:text-rose-400 hover:bg-rose-950/50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Eliminar Artigo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>

        <ProductFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          productToEdit={productToEdit}
          categories={categories}
          locations={allLocations}
          onSuccess={() => router.refresh()}
        />

        {/* Modal de Visualização Detalhada de Artigo */}
        <ProductDetailModal
          isOpen={!!productToView}
          onClose={() => setProductToView(null)}
          product={productToView}
          onEdit={handleEditProduct}
          onDelete={setProductToDelete}
        />

        {/* Modal de Pesquisa Global */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(id) => {
            const prod = locations.flatMap((l) => l.products).find((p) => p.id === id);
            if (prod) handleViewProduct(prod);
          }}
        />

        {/* Modal de Confirmação para Eliminar Artigo */}
        <ConfirmationModal
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={async () => {
            if (!productToDelete) return;
            setIsDeleting(true);
            await deleteProduct(productToDelete.id);
            setIsDeleting(false);
            setProductToDelete(null);
            router.refresh();
          }}
          title="Eliminar Artigo de Stock?"
          description={`Tem a certeza que pretende eliminar "${productToDelete?.name}"? Esta ação removerá o artigo permanentemente.`}
          confirmText="Sim, Eliminar Artigo"
          isLoading={isDeleting}
        />

        {/* Modal de Confirmação para Eliminar Local */}
        <ConfirmationModal
          isOpen={!!locationToDelete}
          onClose={() => setLocationToDelete(null)}
          onConfirm={async () => {
            if (!locationToDelete) return;
            setIsDeleting(true);
            await deleteLocation(locationToDelete.id);
            setIsDeleting(false);
            setLocationToDelete(null);
            router.refresh();
          }}
          title="Eliminar Local de Arrumação?"
          description={`Tem a certeza que pretende eliminar o local "${locationToDelete?.name}"? Os artigos atualmente guardados aqui passarão a constar como "Sem Localização".`}
          confirmText="Sim, Eliminar Local"
          isLoading={isDeleting}
        />

        {/* Modal para Adicionar ou Editar Localização */}
        <LocationFormModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          locationToEdit={locationToEdit}
          locations={allLocations}
          defaultParentId={defaultParentId}
          onSuccess={() => router.refresh()}
        />
      </div>
    </div>
  );
}
