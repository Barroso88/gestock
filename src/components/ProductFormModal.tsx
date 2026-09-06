"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Plus, Minus, Package, Tag, Trash2, Check, AlertCircle } from "lucide-react";
import { NativeCameraInput } from "./NativeCameraInput";
import { LocationHierarchySelector } from "./LocationHierarchySelector";
import { ConfirmationModal } from "./ConfirmationModal";
import { CategoryItem, ProductItem, StorageLocationItem } from "@/lib/types";
import { createProduct, updateProduct, deleteProduct, createCategory } from "@/actions/inventory-actions";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: ProductItem | null;
  categories: CategoryItem[];
  locations: StorageLocationItem[];
  onSuccess?: () => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  categories,
  locations,
  onSuccess,
}: ProductFormModalProps) {
  const isEditing = !!productToEdit;

  const [name, setName] = useState(productToEdit?.name || "");
  const [sku, setSku] = useState(productToEdit?.sku || "");
  const [description, setDescription] = useState(productToEdit?.description || "");
  const [quantity, setQuantity] = useState(productToEdit?.quantity ?? 1);
  const [minQuantity, setMinQuantity] = useState(productToEdit?.minQuantity ?? 0);
  const [categoryId, setCategoryId] = useState<string | null>(productToEdit?.categoryId || null);
  const [locationId, setLocationId] = useState<string | null>(productToEdit?.locationId || null);

  // Estados dinâmicos para listas locais
  const [currentLocations, setCurrentLocations] = useState<StorageLocationItem[]>(locations);
  const [currentCategories, setCurrentCategories] = useState<CategoryItem[]>(categories);

  // Criação rápida de categoria
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#f59e0b");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Ficheiro de imagem capturado (WebP comprimido no cliente)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(productToEdit?.imageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal de confirmação para eliminação
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCurrentLocations(locations);
  }, [locations]);

  useEffect(() => {
    setCurrentCategories(categories);
  }, [categories]);

  if (!isOpen) return null;

  const handleLocationCreated = (newLoc: StorageLocationItem) => {
    setCurrentLocations((prev) => {
      if (prev.some((l) => l.id === newLoc.id)) return prev;
      return [...prev, newLoc];
    });
    setLocationId(newLoc.id);
  };

  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSavingCategory(true);
    setCategoryError(null);

    const res = await createCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor,
    });

    setIsSavingCategory(false);
    if (res.success && res.category) {
      const createdCat: CategoryItem = {
        id: res.category.id,
        name: res.category.name,
        slug: res.category.slug,
        color: res.category.color,
        icon: res.category.icon,
      };
      setCurrentCategories((prev) => [...prev, createdCat]);
      setCategoryId(createdCat.id);
      setIsCreatingCategory(false);
      setNewCategoryName("");
    } else {
      setCategoryError(res.error || "Erro ao criar categoria.");
    }
  };

  const handleImageCaptured = (file: File, previewUrl: string) => {
    setImageFile(file);
    setImageUrl(previewUrl);
  };

  const handleImageRemoved = () => {
    setImageFile(null);
    setImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("O nome do artigo é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let finalImageUrl = imageUrl;

      // Se houver um novo ficheiro comprimido da câmara, fazer upload
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Falha no upload da fotografia.");
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      let res;
      if (isEditing && productToEdit) {
        res = await updateProduct(productToEdit.id, {
          name,
          sku: sku.trim() || undefined,
          description: description.trim() || undefined,
          quantity,
          minQuantity,
          categoryId,
          locationId,
          imageUrl: finalImageUrl,
        });
      } else {
        res = await createProduct({
          name,
          sku: sku.trim() || undefined,
          description: description.trim() || undefined,
          quantity,
          minQuantity,
          categoryId,
          locationId,
          imageUrl: finalImageUrl,
        });
      }

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.error || "Ocorreu um erro ao gravar.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro de ligação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!productToEdit) return;
    setIsDeleting(true);
    try {
      const res = await deleteProduct(productToEdit.id);
      if (res.success) {
        setIsDeleteModalOpen(false);
        onSuccess?.();
        onClose();
      } else {
        alert(res.error || "Erro ao eliminar produto.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryColorPresets = ["#f59e0b", "#2dd4bf", "#3b82f6", "#10b981", "#ef4444", "#a855f7", "#ec4899", "#64748b"];

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
        <div className="w-full sm:max-w-lg bg-[#1e1723] rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#2b2233] animate-in slide-in-from-bottom-8 duration-200">
          {/* Puxador visual para mobile */}
          <div className="w-12 h-1.5 bg-[#3d2c49] rounded-full mx-auto mt-3 sm:hidden" />

          {/* Cabeçalho */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2233]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#241b2c] border border-[#3d2c49] text-[#f59e0b] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#f3f0f5]">
                {isEditing ? "Editar Artigo de Stock" : "Novo Artigo de Stock"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#151016] border border-[#2b2233] flex items-center justify-center text-[#84778b] hover:text-[#f3f0f5] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formulário com Scroll Suave */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {errorMsg && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            {/* 1. Integração com Câmara Nativa & Recorte IA */}
            <NativeCameraInput
              onImageCaptured={handleImageCaptured}
              onImageRemoved={handleImageRemoved}
              currentImageUrl={imageUrl}
            />

            {/* 2. Nome do Produto */}
            <div>
              <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider mb-1.5">
                Nome do Artigo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sensor Temperatura Zigbee"
                className="w-full px-3.5 py-3 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] placeholder:text-[#84778b] text-sm focus:border-[#f59e0b] focus:outline-hidden transition-all"
              />
            </div>

            {/* 3. SKU e Categoria com Opção de Criar Nova Categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider mb-1.5">
                  SKU / Código (Opcional)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ex: MAT-BRC-10"
                  className="w-full px-3.5 py-3 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] placeholder:text-[#84778b] text-sm font-mono focus:border-[#f59e0b] focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider">
                    Categoria
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                    className="text-[11px] font-bold text-[#f59e0b] hover:text-[#fbbf24] flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    {isCreatingCategory ? "Escolher Existente" : "Nova Categoria"}
                  </button>
                </div>

                {isCreatingCategory ? (
                  /* Sub-formulário Inline para Criar Categoria */
                  <div className="p-3 bg-[#241a2c] rounded-xl border border-[#3d2c49] space-y-2.5">
                    {categoryError && (
                      <p className="text-[10px] text-rose-400 font-medium">{categoryError}</p>
                    )}
                    <input
                      type="text"
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nome da categoria..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#2b2233] bg-[#151016] text-[#f3f0f5] focus:outline-hidden focus:border-[#f59e0b]"
                    />
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        {categoryColorPresets.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewCategoryColor(c)}
                            className="w-5 h-5 rounded-full flex items-center justify-center transition-transform active:scale-90 border border-black/40 cursor-pointer"
                            style={{ backgroundColor: c }}
                          >
                            {newCategoryColor === c && <Check className="w-3 h-3 text-black stroke-[3]" />}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={isSavingCategory || !newCategoryName.trim()}
                        onClick={handleQuickCreateCategory}
                        className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-[#151016] rounded-lg disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingCategory ? "A criar..." : "Gravar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Dropdown Normal */
                  <div className="relative">
                    <select
                      value={categoryId || ""}
                      onChange={(e) => setCategoryId(e.target.value || null)}
                      className="w-full px-3.5 py-3 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] text-sm focus:border-[#f59e0b] focus:outline-hidden appearance-none transition-all"
                    >
                      <option value="" className="bg-[#1e1723] text-[#f3f0f5]">Sem categoria</option>
                      {currentCategories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-[#1e1723] text-[#f3f0f5]">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <Tag className="w-4 h-4 text-[#84778b] absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>

            {/* 4. Local de Arrumação Dinâmico com Criação Inline */}
            <LocationHierarchySelector
              locations={currentLocations}
              selectedLocationId={locationId}
              onSelect={(loc) => setLocationId(loc ? loc.id : null)}
              onLocationCreated={handleLocationCreated}
            />

            {/* 5. Quantidade & Alerta Mínimo */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider mb-1.5">
                  Quantidade
                </label>
                <div className="flex items-center border border-[#2b2233] rounded-xl bg-[#151016] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                    className="w-11 h-11 flex items-center justify-center text-[#84778b] hover:text-[#f3f0f5] hover:bg-[#251c2c] active:bg-[#2e2336] transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-center font-bold text-sm bg-transparent text-[#f3f0f5] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-11 h-11 flex items-center justify-center text-[#84778b] hover:text-[#f3f0f5] hover:bg-[#251c2c] active:bg-[#2e2336] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider mb-1.5">
                  Alerta Stock Mínimo (0 = sem alerta)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] text-sm focus:border-[#f59e0b] focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* 6. Descrição Opcional */}
            <div>
              <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider mb-1.5">
                Observações / Descrição
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notas adicionais sobre o produto..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] placeholder:text-[#84778b] text-sm focus:border-[#f59e0b] focus:outline-hidden transition-all resize-none"
              />
            </div>

            {/* Botões de Ação no Fundo */}
            <div className="pt-2 pb-1 flex flex-col sm:flex-row items-center gap-2.5">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full sm:w-auto py-3.5 px-4 rounded-xl border border-rose-900/60 bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar Artigo
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex-1 py-3.5 px-5 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] active:scale-[0.99] text-[#151016] font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#f59e0b]/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    <span>A guardar artigo...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 stroke-[2.5]" />
                    <span>{isEditing ? "Atualizar Artigo" : "Adicionar ao Inventário"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Confirmação para Eliminar Artigo */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Artigo de Stock?"
        description={`Tem a certeza que pretende eliminar o artigo "${name}"? Esta ação removerá o registo do inventário e o histórico associado.`}
        confirmText="Sim, Eliminar Artigo"
        isLoading={isDeleting}
      />
    </>
  );
}
