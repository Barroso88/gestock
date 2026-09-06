"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  MapPin,
  Plus,
  Trash2,
  Pencil,
  Tag,
  Layers,
  Check,
  ChevronDown,
  Sparkles,
  Menu,
} from "lucide-react";
import { ProductItem, CategoryItem, StorageLocationItem } from "@/lib/types";
import { GlobalInventorySearch } from "./GlobalInventorySearch";
import { ProductFormModal } from "./ProductFormModal";
import { ProductDetailModal } from "./ProductDetailModal";
import { BottomNavigation } from "./BottomNavigation";
import { QuickStockAdjuster } from "./QuickStockAdjuster";
import { SearchModal } from "./SearchModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { HomeBoxSidebar } from "./HomeBoxSidebar";
import { deleteProduct } from "@/actions/inventory-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InventoryDashboardProps {
  initialProducts: ProductItem[];
  categories: CategoryItem[];
  locations: StorageLocationItem[];
}

export function InventoryDashboard({
  initialProducts,
  categories,
  locations,
}: InventoryDashboardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductItem | null>(null);
  const [productToView, setProductToView] = useState<ProductItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Estados do Menu Lateral (Sidebar)
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

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: ProductItem) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleViewProduct = (product: ProductItem) => {
    setProductToView(product);
  };

  const handleSelectFromSearch = (productId: string) => {
    const prod = initialProducts.find((p) => p.id === productId);
    if (prod) {
      handleViewProduct(prod);
    }
  };

  const handleModalSuccess = () => {
    router.refresh();
  };

  // Filtragem combinada por categoria e localização
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      if (selectedCategory && p.categoryId !== selectedCategory) return false;
      if (selectedLocationId && p.locationId !== selectedLocationId) return false;
      return true;
    });
  }, [initialProducts, selectedCategory, selectedLocationId]);

  // Contagem de itens por localização
  const productCountByLocation = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of initialProducts) {
      if (p.locationId) {
        counts[p.locationId] = (counts[p.locationId] || 0) + 1;
      }
    }
    return counts;
  }, [initialProducts]);

  // Estatísticas rápidas de inventário (HomeBox KPIs)
  const totalItemsCount = initialProducts.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockCount = initialProducts.filter(
    (p) => p.quantity === 0 || (p.minQuantity > 1 && p.quantity <= p.minQuantity)
  ).length;

  return (
    <div className="min-h-screen bg-[#151016] text-[#f3f0f5]">
      {/* 1. Menu Lateral Expansível / Comprimido Estilo HomeBox */}
      <HomeBoxSidebar
        isExpanded={isSidebarExpanded}
        isMobileOpen={isMobileSidebarOpen}
        onToggleExpand={toggleSidebar}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenAddModal={handleOpenAdd}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
      />

      {/* Conteúdo Principal com Margem Dinâmica da Sidebar no Desktop */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out pb-12 ${
          isSidebarExpanded ? "md:ml-60" : "md:ml-16"
        }`}
      >
        {/* Barra de Cabeçalho Superior com Botão de 3 Traços */}
        <header className="sticky top-0 z-30 bg-[#19131d]/95 backdrop-blur-md border-b border-[#2b2233] px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Botão dos 3 Traços no Header (Apenas Mobile - no Desktop fica no topo da barra lateral) */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="md:hidden w-10 h-10 rounded-xl bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-[#baaebf] hover:text-[#f3f0f5] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                title="Abrir Menu Lateral"
              >
                <Menu className="w-7 h-7" />
              </button>

              {/* Logótipo Gestock com Ícone Oficial sem caixa de contorno */}
              <div className="flex items-center gap-2.5">
                <img
                  src="/mainicon.png"
                  alt="Gestock"
                  className="w-10 h-10 object-contain drop-shadow-xs shrink-0"
                />
                <span className="text-xl font-bold tracking-tight text-[#f3f0f5]">Gestock</span>
              </div>
            </div>

            {/* Barra de Pesquisa Integrada no Topo */}
            <div className="flex-1 max-w-xl">
              <GlobalInventorySearch onSelectProduct={handleSelectFromSearch} />
            </div>

            {/* Botão Adicionar no Header */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-[#151016] font-bold text-xs sm:text-sm shadow-md shadow-[#f59e0b]/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3] text-current" />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo Central */}
        <main className="max-w-6xl mx-auto w-full px-4 pt-5 flex-1 space-y-6">
          {/* 2. Estatísticas Rápidas (HomeBox 4 KPI Cards) */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs md:text-sm font-semibold text-[#baaebf] tracking-wide uppercase">
                Estatísticas Rápidas
              </h3>
              {lowStockCount > 0 && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/60">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  {lowStockCount} em rutura
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* KPI 1: Total Artigos */}
              <div className="bg-[#1e1723] border border-[#2b2233] rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[11px] md:text-xs font-medium text-[#998e9f]">
                  Total de Artigos
                </span>
                <span className="text-2xl md:text-3xl font-extrabold text-[#f3f0f5] mt-1">
                  {initialProducts.length}
                </span>
              </div>

              {/* KPI 2: Total Itens */}
              <div className="bg-[#1e1723] border border-[#2b2233] rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[11px] md:text-xs font-medium text-[#998e9f]">
                  Total de Itens
                </span>
                <span className="text-2xl md:text-3xl font-extrabold text-[#f3f0f5] mt-1">
                  {totalItemsCount}
                </span>
              </div>

              {/* KPI 3: Total Localizações */}
              <div className="bg-[#1e1723] border border-[#2b2233] rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[11px] md:text-xs font-medium text-[#998e9f]">
                  Total de Localizações
                </span>
                <span className="text-2xl md:text-3xl font-extrabold text-[#f3f0f5] mt-1">
                  {locations.length}
                </span>
              </div>

              {/* KPI 4: Total Tags / Categorias */}
              <div className="bg-[#1e1723] border border-[#2b2233] rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[11px] md:text-xs font-medium text-[#998e9f]">
                  Total Categorias
                </span>
                <span className="text-2xl md:text-3xl font-extrabold text-[#f3f0f5] mt-1">
                  {categories.length}
                </span>
              </div>
            </div>
          </section>

          {/* 3. Localizações de Armazenamento (HomeBox Grid com Badges Âmbar) */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs md:text-sm font-semibold text-[#baaebf] tracking-wide uppercase">
                Localizações de Armazenamento
              </h3>
              {selectedLocationId && (
                <button
                  type="button"
                  onClick={() => setSelectedLocationId(null)}
                  className="text-xs font-medium text-[#f59e0b] hover:underline cursor-pointer"
                >
                  Limpar filtro
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {locations.map((loc) => {
                const count = productCountByLocation[loc.id] || 0;
                const isSelected = selectedLocationId === loc.id;

                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() =>
                      setSelectedLocationId(isSelected ? null : loc.id)
                    }
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-[#251c2c] border-[#f59e0b] shadow-md shadow-[#f59e0b]/10"
                        : "bg-[#1e1723] border-[#2b2233] hover:border-[#3d2e48] hover:bg-[#231b29]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <MapPin className="w-4 h-4 shrink-0 text-[#84778b]" />
                      <span className="text-xs font-medium text-[#f3f0f5] truncate">
                        {loc.name}
                      </span>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#f59e0b] text-[#151016]">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. Tags / Categorias (HomeBox Tag Pills) */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs md:text-sm font-semibold text-[#baaebf] tracking-wide uppercase">
                Categorias
              </h3>
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs font-medium text-[#f59e0b] hover:underline cursor-pointer"
                >
                  Todas as categorias
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === null
                    ? "bg-[#163737] text-[#2dd4bf] border border-[#2dd4bf]/30 font-semibold"
                    : "bg-[#1e1723] text-[#998e9f] hover:text-[#f3f0f5] border border-[#2b2233]"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Todas</span>
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(isSelected ? null : cat.id)
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#163737] text-[#2dd4bf] border border-[#2dd4bf]/30 font-semibold"
                        : "bg-[#1e1723] text-[#998e9f] hover:text-[#f3f0f5] border border-[#2b2233]"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 5. Recentemente Adicionados (HomeBox Table / List) */}
          <section className="bg-[#1e1723] border border-[#2b2233] rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3.5 border-b border-[#2b2233] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#baaebf] tracking-wide">
                Recentemente Adicionados
              </h3>
              <span className="text-xs text-[#998e9f]">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "artigo" : "artigos"}
              </span>
            </div>

            {/* Cabeçalho da Tabela Estilo HomeBox (Desktop & Tablet) */}
            <div className="hidden md:grid grid-cols-12 px-4 py-2.5 text-xs font-semibold text-[#84778b] border-b border-[#2b2233] bg-[#1a131f]">
              <div className="col-span-5 flex items-center gap-1">Nome ⇅</div>
              <div className="col-span-3 flex items-center gap-1 justify-center">Quantidade ⇅</div>
              <div className="col-span-3">Localização ⇅</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            {/* Lista de Produtos */}
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#84778b] flex flex-col items-center gap-2">
                <Package className="w-8 h-8 text-[#4a3a54]" />
                <span>Nenhum artigo encontrado com os filtros atuais.</span>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="mt-2 text-xs font-semibold text-[#f59e0b] hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Adicionar primeiro artigo</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#2b2233]">
                {filteredProducts.map((product) => {
                  const isLow = product.quantity === 0 || (product.minQuantity > 1 && product.quantity <= product.minQuantity);
                  const locationPath = product.location
                    ? product.location.fullPath.split("/").join(" › ")
                    : "Sem localização";

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleViewProduct(product)}
                      className="p-3 md:px-4 md:py-3 hover:bg-[#251c2c] transition-colors cursor-pointer flex flex-col md:grid md:grid-cols-12 md:items-center gap-3"
                    >
                      {/* Coluna: Nome & Imagem (Mobile: flex-1, Desktop: col-span-5) */}
                      <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#151016] border border-[#2b2233] overflow-hidden shrink-0 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-[#84778b]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-[#f3f0f5] truncate">
                              {product.name}
                            </h4>
                            {isLow && (
                              <span
                                title="Stock baixo"
                                className="w-4 h-4 rounded-full bg-amber-950/80 text-amber-400 flex items-center justify-center shrink-0"
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#998e9f]">
                            {product.sku && (
                              <span className="font-mono bg-[#151016] px-1.5 py-0.5 rounded text-[#baaebf] border border-[#2b2233]">
                                {product.sku}
                              </span>
                            )}
                            {product.category && (
                              <span className="text-[#baaebf] truncate">
                                {product.category.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Coluna: Quantidade & Ajuste Rápido (Desktop: col-span-3) */}
                      <div
                        className="md:col-span-3 flex items-center justify-between md:justify-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-xs text-[#998e9f] md:hidden">Quantidade:</span>
                        <QuickStockAdjuster
                          productId={product.id}
                          initialQuantity={product.quantity}
                          minQuantity={product.minQuantity}
                        />
                      </div>

                      {/* Coluna: Localização (Desktop: col-span-3) */}
                      <div className="md:col-span-3 flex items-center justify-between md:justify-start gap-1.5 text-xs text-[#2dd4bf]">
                        <div className="flex items-center gap-1.5 bg-[#163737]/70 px-2.5 py-1 rounded-lg border border-[#2dd4bf]/20 max-w-full truncate">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#2dd4bf]" />
                          <span className="truncate">{locationPath}</span>
                        </div>

                        {/* Botões de editar e eliminar visíveis apenas no mobile na linha do local */}
                        <div className="md:hidden flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProduct(product);
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
                              setProductToDelete(product);
                            }}
                            className="w-8 h-8 rounded-lg text-[#84778b] hover:text-rose-400 hover:bg-rose-950/50 flex items-center justify-center transition-colors cursor-pointer"
                            title="Eliminar Artigo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Coluna: Ações (Desktop: col-span-1) */}
                      <div
                        className="hidden md:flex items-center justify-end gap-1 md:col-span-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product)}
                          className="w-8 h-8 rounded-lg text-[#84778b] hover:text-[#f59e0b] hover:bg-[#2b2233] flex items-center justify-center transition-colors cursor-pointer"
                          title="Editar Artigo"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(product)}
                          className="w-8 h-8 rounded-lg text-[#84778b] hover:text-rose-400 hover:bg-rose-950/50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar Artigo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        {/* Modal de Formulário (Criação e Edição de Produto com Câmara Nativa e IA) */}
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productToEdit={productToEdit}
          categories={categories}
          locations={locations}
          onSuccess={handleModalSuccess}
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
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectProduct={handleSelectFromSearch}
        />

        {/* Modal Premium de Confirmação para Eliminação de Produto */}
        <ConfirmationModal
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={async () => {
            if (!productToDelete) return;
            setIsDeletingProduct(true);
            await deleteProduct(productToDelete.id);
            setIsDeletingProduct(false);
            setProductToDelete(null);
            router.refresh();
          }}
          title="Eliminar Artigo de Stock?"
          description={`Tem a certeza que pretende eliminar "${productToDelete?.name}"? Esta ação removerá o artigo do inventário permanentemente.`}
          confirmText="Sim, Eliminar Artigo"
          isLoading={isDeletingProduct}
        />
      </div>
    </div>
  );
}
