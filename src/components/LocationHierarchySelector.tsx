"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  MapPin,
  Check,
  FolderTree,
  Search,
  X,
  Layers,
  Plus,
  ArrowLeft,
  Save,
  AlertCircle,
} from "lucide-react";
import { StorageLocationItem } from "@/lib/types";
import { createLocation } from "@/actions/inventory-actions";

interface LocationHierarchySelectorProps {
  locations: StorageLocationItem[];
  selectedLocationId: string | null;
  onSelect: (location: StorageLocationItem | null) => void;
  onLocationCreated?: (newLocation: StorageLocationItem) => void;
}

export function LocationHierarchySelector({
  locations,
  selectedLocationId,
  onSelect,
  onLocationCreated,
}: LocationHierarchySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para criação rápida de novo local
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLocCode, setNewLocCode] = useState("");
  const [newLocType, setNewLocType] = useState("SHELF");
  const [newLocParentId, setNewLocParentId] = useState<string | null>(null);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [newLocError, setNewLocError] = useState<string | null>(null);

  // Map de acesso rápido por ID
  const locationMap = useMemo(() => {
    const map = new Map<string, StorageLocationItem>();
    locations.forEach((loc) => map.set(loc.id, loc));
    return map;
  }, [locations]);

  // Local selecionado atualmente
  const selectedLocation = selectedLocationId ? locationMap.get(selectedLocationId) : null;

  // Filtragem por pesquisa ou navegação hierárquica
  const filteredNodes = useMemo(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return locations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(term) ||
          loc.fullPath.toLowerCase().includes(term) ||
          (loc.code && loc.code.toLowerCase().includes(term))
      );
    }
    // Modo navegação por nível
    return locations.filter((loc) => loc.parentId === currentParentId);
  }, [locations, searchTerm, currentParentId]);

  // Obter caminho para breadcrumb de navegação atual
  const activeParent = currentParentId ? locationMap.get(currentParentId) : null;

  const handleSelect = (loc: StorageLocationItem | null) => {
    onSelect(loc);
    setIsOpen(false);
    setSearchTerm("");
    setCurrentParentId(null);
    setIsCreatingInline(false);
  };

  const handleStartCreate = (prefillName = "") => {
    setNewLocName(prefillName || searchTerm);
    setNewLocCode("");
    setNewLocType("SHELF");
    setNewLocParentId(currentParentId);
    setNewLocError(null);
    setIsCreatingInline(true);
  };

  const handleSaveNewLocation = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!newLocName.trim() || isSubmittingNew) return;

    setIsSubmittingNew(true);
    setNewLocError(null);

    try {
      const res = await createLocation({
        name: newLocName.trim(),
        code: newLocCode.trim() || undefined,
        type: newLocType,
        parentId: newLocParentId,
      });

      if (res.success && res.location) {
        const createdLoc: StorageLocationItem = {
          id: res.location.id,
          name: res.location.name,
          code: res.location.code,
          description: res.location.description,
          type: res.location.type,
          parentId: res.location.parentId,
          fullPath: res.location.fullPath,
          depth: res.location.depth,
        };

        // Notificar pai e selecionar de imediato
        onLocationCreated?.(createdLoc);
        handleSelect(createdLoc);
      } else {
        setNewLocError(res.error || "Erro ao criar local.");
      }
    } catch (err: any) {
      setNewLocError(err.message || "Erro de ligação.");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const locationTypes = [
    { value: "SHELF", label: "Prateleira" },
    { value: "BIN", label: "Gaveta / Caixa" },
    { value: "RACK", label: "Estante" },
    { value: "AISLE", label: "Corredor" },
    { value: "ZONE", label: "Zona / Bancada" },
    { value: "WAREHOUSE", label: "Armazém" },
  ];

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider mb-1.5">
        Local de Arrumação
      </label>

      {/* Botão de Disparo */}
      <button
        type="button"
        onClick={() => {
          setIsCreatingInline(false);
          setIsOpen(true);
        }}
        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#2b2233] bg-[#151016] hover:border-[#3d2c49] active:bg-[#231b29] text-left shadow-xs transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-[#163737] border border-[#2dd4bf]/20 text-[#2dd4bf] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="truncate">
            {selectedLocation ? (
              <>
                <p className="text-sm font-semibold text-[#f3f0f5] truncate">
                  {selectedLocation.name}
                </p>
                <p className="text-xs text-[#2dd4bf] font-medium truncate">
                  {selectedLocation.fullPath.replace(/^\//, "").replace(/\//g, " › ")}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#84778b]">Selecionar onde arrumar...</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#84778b] shrink-0" />
      </button>

      {/* Modal / Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-xs">
          <div className="w-full max-h-[88vh] bg-[#1e1723] rounded-t-3xl p-5 pb-8 flex flex-col shadow-2xl border-t border-[#2b2233] animate-in slide-in-from-bottom-6 duration-200">
            {/* Puxador visual */}
            <div className="w-12 h-1.5 bg-[#3d2c49] rounded-full mx-auto mb-3" />

            {/* Cabeçalho */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2233]">
              <div className="flex items-center gap-2">
                {isCreatingInline ? (
                  <button
                    type="button"
                    onClick={() => setIsCreatingInline(false)}
                    className="w-8 h-8 rounded-xl bg-[#151016] border border-[#2b2233] flex items-center justify-center text-[#baaebf] hover:text-[#f3f0f5] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-[#241b2c] text-[#f59e0b] flex items-center justify-center">
                    <FolderTree className="w-4 h-4" />
                  </div>
                )}
                <h3 className="font-bold text-[#f3f0f5] text-base">
                  {isCreatingInline ? "Adicionar Novo Local de Arrumação" : "Alocar Local de Arrumação"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#151016] border border-[#2b2233] flex items-center justify-center text-[#84778b] hover:text-[#f3f0f5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ============================================================== */}
            {/* VISTA 1: CRIAÇÃO RÁPIDA DE NOVO LOCAL DENTRO DO MODAL          */}
            {/* ============================================================== */}
            {isCreatingInline ? (
              <div className="space-y-3.5 my-3 overflow-y-auto max-h-[65vh]">
                {newLocError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {newLocError}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-[#baaebf] uppercase tracking-wider mb-1">
                    Nome do Novo Local *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSaveNewLocation(e);
                      }
                    }}
                    placeholder="Ex: Prateleira 4C ou Gaveta A1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] text-sm focus:border-[#f59e0b] outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#baaebf] uppercase tracking-wider mb-1">
                      Tipo
                    </label>
                    <select
                      value={newLocType}
                      onChange={(e) => setNewLocType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] text-sm outline-hidden"
                    >
                      {locationTypes.map((t) => (
                        <option key={t.value} value={t.value} className="bg-[#1e1723]">
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#baaebf] uppercase tracking-wider mb-1">
                      Código / QR (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newLocCode}
                      onChange={(e) => setNewLocCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveNewLocation(e);
                        }
                      }}
                      placeholder="Ex: P4C"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] text-sm font-mono outline-hidden"
                    />
                  </div>
                </div>

                {/* Selecionar Pai Hierárquico */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#baaebf] uppercase tracking-wider mb-1">
                    Ficar dentro de (Local Pai)
                  </label>
                  <select
                    value={newLocParentId || ""}
                    onChange={(e) => setNewLocParentId(e.target.value || null)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] text-sm outline-hidden"
                  >
                    <option value="" className="bg-[#1e1723]">Nenhum (Nível Principal / Armazém)</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id} className="bg-[#1e1723]">
                        {loc.fullPath.replace(/^\//, "").replace(/\//g, " › ")}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#998e9f] mt-1">
                    Permite organizar em cascata (ex: Armazém › Estante › Prateleira).
                  </p>
                </div>

                {/* Botões de Submissão */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingInline(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-[#2b2233] bg-[#151016] text-[#baaebf] font-semibold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewLocation}
                    disabled={isSubmittingNew}
                    className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-[#151016] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#f59e0b]/20 cursor-pointer"
                  >
                    {isSubmittingNew ? (
                      <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 stroke-[2.5]" />
                        Gravar e Selecionar
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ============================================================== */
              /* VISTA 2: NAVEGAÇÃO & SELEÇÃO DE LOCAIS EXISTENTES              */
              /* ============================================================== */
              <>
                {/* Campo de Filtro Rápido */}
                <div className="relative my-3">
                  <Search className="w-4 h-4 text-[#84778b] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar locais ou código..."
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#151016] border border-[#2b2233] text-sm text-[#f3f0f5] placeholder:text-[#84778b] focus:border-[#f59e0b] outline-hidden"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-2.5 text-[#84778b] hover:text-[#f3f0f5] p-0.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Botão de Criação Rápida de Localização estilo HomeBox */}
                <button
                  type="button"
                  onClick={() => handleStartCreate()}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#241b2c] hover:bg-[#2d2237] text-[#f59e0b] text-xs font-bold flex items-center justify-center gap-1.5 border border-[#3d2c49] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  {searchTerm
                    ? `Adicionar nova localização "${searchTerm}"`
                    : "Adicionar Nova Localização de Arrumação"}
                </button>

                {/* Breadcrumb de Navegação Hierárquica */}
                {!searchTerm && (
                  <div className="flex items-center gap-1.5 py-2 text-xs text-[#998e9f] overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setCurrentParentId(null)}
                      className={`hover:text-[#f59e0b] font-medium shrink-0 px-2 py-1 rounded-md cursor-pointer ${
                        currentParentId === null ? "bg-[#151016] text-[#f3f0f5] font-bold border border-[#2b2233]" : ""
                      }`}
                    >
                      Geral (Raiz)
                    </button>
                    {activeParent && (
                      <>
                        <ChevronRight className="w-3 h-3 text-[#84778b] shrink-0" />
                        <span className="font-semibold text-[#2dd4bf] truncate bg-[#163737] border border-[#2dd4bf]/20 px-2 py-1 rounded-md">
                          {activeParent.name}
                        </span>
                        {activeParent.parentId && (
                          <button
                            type="button"
                            onClick={() => setCurrentParentId(activeParent.parentId)}
                            className="ml-auto text-[#f59e0b] font-semibold text-xs shrink-0 pl-2 cursor-pointer hover:underline"
                          >
                            Subir nível
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Opção de Limpar Localização */}
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className="py-2 px-3 my-0.5 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  ✕ Sem localização definida
                </button>

                {/* Lista de Nós */}
                <div className="flex-1 overflow-y-auto divide-y divide-[#2b2233] my-1 max-h-72">
                  {filteredNodes.length === 0 ? (
                    <div className="text-center py-6 text-[#84778b] text-sm space-y-2">
                      <p>
                        {searchTerm
                          ? `Nenhum local encontrado para "${searchTerm}".`
                          : "Sem sub-locais neste nível."}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleStartCreate(searchTerm)}
                        className="px-3.5 py-1.5 text-xs font-bold bg-[#f59e0b] text-[#151016] rounded-lg inline-flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        Adicionar "{searchTerm || "Novo Local"}"
                      </button>
                    </div>
                  ) : (
                    filteredNodes.map((loc) => {
                      const hasChildren = locations.some((l) => l.parentId === loc.id);
                      const isSelected = selectedLocationId === loc.id;

                      return (
                        <div
                          key={loc.id}
                          className="flex items-center justify-between py-3 px-2 hover:bg-[#251c2c] rounded-xl transition-colors"
                        >
                          {/* Botão para Selecionar Este Local */}
                          <button
                            type="button"
                            onClick={() => handleSelect(loc)}
                            className="flex-1 flex items-center gap-3 text-left min-w-0 cursor-pointer"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-[#2dd4bf] text-[#151016]"
                                  : "bg-[#151016] border border-[#2b2233] text-[#84778b]"
                              }`}
                            >
                              {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <MapPin className="w-4 h-4" />}
                            </div>
                            <div className="truncate pr-2">
                              <p className="text-sm font-semibold text-[#f3f0f5] truncate">
                                {loc.name}
                              </p>
                              <p className="text-[11px] text-[#998e9f] truncate">
                                {loc.fullPath.replace(/^\//, "").replace(/\//g, " › ")}
                                {loc.code && ` • [${loc.code}]`}
                              </p>
                            </div>
                          </button>

                          {/* Botão para Entrar/Explorar Filhos */}
                          {!searchTerm && hasChildren && (
                            <button
                              type="button"
                              onClick={() => setCurrentParentId(loc.id)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-[#2dd4bf] bg-[#163737] border border-[#2dd4bf]/20 rounded-lg flex items-center gap-1 active:scale-95 shrink-0 cursor-pointer"
                              title="Explorar sub-divisões deste local"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              Sub-locais
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
