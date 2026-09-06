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
  LayoutGrid,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  X,
  Menu,
} from "lucide-react";
import { ProductItem, CategoryItem, StorageLocationItem } from "@/lib/types";
import { ProductFormModal } from "./ProductFormModal";
import { ProductDetailModal } from "./ProductDetailModal";
import { BottomNavigation } from "./BottomNavigation";
import { QuickStockAdjuster } from "./QuickStockAdjuster";
import { SearchModal } from "./SearchModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { HomeBoxSidebar } from "./HomeBoxSidebar";
import { UserHeaderBadge } from "./UserHeaderBadge";
import { deleteProduct } from "@/actions/inventory-actions";
import { useRouter } from "next/navigation";

interface InventoryGalleryProps {
  initialProducts: ProductItem[];
  categories: CategoryItem[];
  locations: StorageLocationItem[];
}

type SortOption =
  | "name-asc"
  | "name-desc"
  | "date-desc"
  | "date-asc"
  | "qty-desc"
  | "qty-asc";

export function InventoryGallery({
  initialProducts,
  categories,
  locations,
}: InventoryGalleryProps) {
  const router = useRouter();

  // Estados de Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductItem | null>(null);
  const [productToView, setProductToView] = useState<ProductItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Estados de Filtros e Ordenação
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  // Predefinição: Ordem Alfabética (A-Z)
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  // Estados da Barra Lateral
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

  const handleModalSuccess = () => {
    router.refresh();
  };

  // Filtragem e Ordenação dos Produtos
  const processedProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Filtro de Pesquisa (Texto)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.location && p.location.name.toLowerCase().includes(q))
      );
    }

    // 2. Filtro de Categoria
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // 3. Filtro de Localização
    if (selectedLocation) {
      result = result.filter((p) => p.locationId === selectedLocation);
    }

    // 4. Ordenação
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name, "pt", { sensitivity: "base" });
        case "name-desc":
          return b.name.localeCompare(a.name, "pt", { sensitivity: "base" });
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "qty-desc":
          return b.quantity - a.quantity;
        case "qty-asc":
          return a.quantity - b.quantity;
        default:
          return 0;
      }
    });

    return result;
  }, [initialProducts, searchQuery, selectedCategory, selectedLocation, sortBy]);

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "" || selectedLocation !== "";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLocation("");
    setSortBy("name-asc");
  };

  return (
    <div className="min-h-screen bg-[#151016] text-[#f3f0f5]">
      {/* Menu Lateral Expansível */}
      <HomeBoxSidebar
        isExpanded={isSidebarExpanded}
        isMobileOpen={isMobileSidebarOpen}
        onToggleExpand={toggleSidebar}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenAddModal={handleOpenAdd}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
      />

      {/* Conteúdo com margem adaptativa */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out pb-12 min-w-0 ${
          isSidebarExpanded ? "md:ml-60" : "md:ml-16"
        }`}
      >
        {/* Cabeçalho Superior Estilo HomeBox */}
        <header className="sticky top-0 z-30 bg-[#19131d]/95 backdrop-blur-md border-b border-[#2b2233] px-2.5 sm:px-4 py-2 sm:py-2.5 w-full">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
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
                <div className="w-8 h-8 rounded-lg bg-[#241a2c] border border-[#3d2c49] flex items-center justify-center text-[#f59e0b] shrink-0">
                  <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-[#f3f0f5]">Inventário</h1>
                  <p className="text-[10px] sm:text-[11px] text-[#998e9f] hidden xs:block sm:block">Galeria de artigos & miniaturas</p>
                </div>
              </div>
            </div>

            {/* Ação Adicionar & Avatar/Nome no Canto Superior Direito */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <span className="text-xs text-[#998e9f] hidden lg:inline">
                {processedProducts.length} {processedProducts.length === 1 ? "artigo" : "artigos"}
              </span>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-[#151016] font-bold text-xs shadow-md shadow-[#f59e0b]/20 active:scale-95 transition-all cursor-pointer shrink-0"
                title="Adicionar Artigo"
              >
                <Plus className="w-4 h-4 stroke-[3] text-current shrink-0" />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
              <UserHeaderBadge />
            </div>
          </div>
        </header>

        {/* Conteúdo Central */}
        <main className="max-w-6xl mx-auto w-full px-3 sm:px-4 pt-4 sm:pt-5 flex-1 space-y-5 min-w-0 overflow-x-hidden">
          {/* Barra de Filtros & Ordenação */}
          <section className="bg-[#1e1723] border border-[#2b2233] p-3.5 rounded-2xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* 1. Pesquisa Rápida */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#84778b] absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por nome, SKU..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#151016] border border-[#2b2233] text-xs text-[#f3f0f5] placeholder:text-[#84778b] focus:border-[#f59e0b] outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-[#84778b] hover:text-[#f3f0f5] p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Filtro de Categoria */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151016] border border-[#2b2233] text-xs text-[#f3f0f5] focus:border-[#f59e0b] outline-hidden appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1e1723]">Todas as Categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#1e1723]">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <Tag className="w-3.5 h-3.5 text-[#84778b] absolute right-3 top-3 pointer-events-none" />
              </div>

              {/* 3. Filtro de Localização */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151016] border border-[#2b2233] text-xs text-[#f3f0f5] focus:border-[#f59e0b] outline-hidden appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1e1723]">Todas as Localizações</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id} className="bg-[#1e1723]">
                      {loc.fullPath.replace(/^\//, "").replace(/\//g, " › ")}
                    </option>
                  ))}
                </select>
                <MapPin className="w-3.5 h-3.5 text-[#84778b] absolute right-3 top-3 pointer-events-none" />
              </div>

              {/* 4. Ordenação (Alfabética por omissão) */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 rounded-xl bg-[#151016] border border-[#2b2233] text-xs text-[#f59e0b] font-semibold focus:border-[#f59e0b] outline-hidden appearance-none cursor-pointer"
                >
                  <option value="name-asc" className="bg-[#1e1723] text-[#f3f0f5]">
                    Nome: A a Z (Alfabético)
                  </option>
                  <option value="name-desc" className="bg-[#1e1723] text-[#f3f0f5]">
                    Nome: Z a A
                  </option>
                  <option value="date-desc" className="bg-[#1e1723] text-[#f3f0f5]">
                    Data: Mais recentes primeiro
                  </option>
                  <option value="date-asc" className="bg-[#1e1723] text-[#f3f0f5]">
                    Data: Mais antigos primeiro
                  </option>
                  <option value="qty-desc" className="bg-[#1e1723] text-[#f3f0f5]">
                    Quantidade: Maior stock
                  </option>
                  <option value="qty-asc" className="bg-[#1e1723] text-[#f3f0f5]">
                    Quantidade: Menor stock
                  </option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-[#f59e0b] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Barra de Filtros Ativos / Limpeza */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-1 border-t border-[#2b2233]/60 text-xs">
                <span className="text-[#998e9f]">
                  A apresentar <strong>{processedProducts.length}</strong> de {initialProducts.length} artigos
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-[#f59e0b] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </section>

          {/* Grelha de Miniaturas (Visual Product Grid) */}
          {processedProducts.length === 0 ? (
            <div className="bg-[#1e1723] border border-[#2b2233] rounded-2xl py-16 text-center text-xs text-[#84778b] flex flex-col items-center gap-2.5">
              <Package className="w-10 h-10 text-[#4a3a54]" />
              <p className="text-sm font-semibold text-[#f3f0f5]">Nenhum artigo encontrado</p>
              <p className="text-xs text-[#998e9f] max-w-sm">
                Não existem artigos que correspondam aos filtros ou pesquisa selecionados.
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-2 text-xs font-semibold text-[#f59e0b] hover:underline cursor-pointer"
                >
                  Limpar filtros de pesquisa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="mt-2 px-4 py-2 bg-[#f59e0b] text-[#151016] font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Adicionar primeiro artigo</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {processedProducts.map((product) => {
                const isLow = product.quantity === 0 || (product.minQuantity > 1 && product.quantity <= product.minQuantity);
                const locationPath = product.location
                  ? product.location.fullPath.split("/").join(" › ")
                  : "Sem localização";

                return (
                  <div
                    key={product.id}
                    onClick={() => handleViewProduct(product)}
                    className="bg-[#1e1723] hover:bg-[#251c2c] border border-[#2b2233] hover:border-[#f59e0b]/50 rounded-2xl p-3 flex flex-col justify-between gap-2.5 transition-all cursor-pointer group shadow-sm"
                  >
                    {/* 1. Miniatura Fotográfica com Destaque */}
                    <div className="w-full aspect-square rounded-xl bg-[#151016] border border-[#2b2233] overflow-hidden flex items-center justify-center relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-[#4a3a54]" />
                      )}

                      {/* Badge de Alerta de Stock Baixo */}
                      {isLow && (
                        <div
                          title="Stock baixo"
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-950/90 border border-amber-700/80 text-amber-400 flex items-center justify-center shadow-md"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* 2. Informação do Artigo */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-xs sm:text-sm font-semibold text-[#f3f0f5] group-hover:text-[#f59e0b] truncate transition-colors leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-[#998e9f] truncate">
                        {product.sku && (
                          <span className="font-mono bg-[#151016] px-1.5 py-0.5 rounded text-[#baaebf] border border-[#2b2233]">
                            {product.sku}
                          </span>
                        )}
                        {product.category && (
                          <span className="truncate text-[#baaebf]">
                            {product.category.name}
                          </span>
                        )}
                      </div>

                      {/* Localização */}
                      <div className="flex items-center gap-1 text-[11px] text-[#2dd4bf] truncate pt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{locationPath}</span>
                      </div>
                    </div>

                    {/* 3. Rodapé do Cartão com Ajuste Rápido de Stock e Ações */}
                    <div
                      className="pt-2 border-t border-[#2b2233] flex items-center justify-between gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <QuickStockAdjuster
                        productId={product.id}
                        initialQuantity={product.quantity}
                        minQuantity={product.minQuantity}
                      />

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                          className="w-7 h-7 rounded-lg text-[#84778b] hover:text-[#f59e0b] hover:bg-[#2b2233] flex items-center justify-center transition-colors cursor-pointer"
                          title="Editar Artigo"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToDelete(product);
                          }}
                          className="w-7 h-7 rounded-lg text-[#84778b] hover:text-rose-400 hover:bg-rose-950/50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar Artigo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Modal de Formulário (Criação e Edição de Produto) */}
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
          onSelectProduct={(id) => {
            const prod = initialProducts.find((p) => p.id === id);
            if (prod) handleViewProduct(prod);
          }}
        />

        {/* Modal de Confirmação para Eliminação */}
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
