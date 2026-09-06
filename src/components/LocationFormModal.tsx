"use client";

import React, { useState, useEffect } from "react";
import { X, Save, FolderTree, AlertCircle, MapPin } from "lucide-react";
import { StorageLocationItem } from "@/lib/types";
import { createLocation, updateLocation } from "@/actions/inventory-actions";

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationToEdit?: StorageLocationItem | null;
  locations: StorageLocationItem[];
  defaultParentId?: string | null;
  onSuccess?: () => void;
}

export function LocationFormModal({
  isOpen,
  onClose,
  locationToEdit,
  locations,
  defaultParentId,
  onSuccess,
}: LocationFormModalProps) {
  const isEditing = !!locationToEdit;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("SHELF");
  const [parentId, setParentId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (locationToEdit) {
      setName(locationToEdit.name);
      setCode(locationToEdit.code || "");
      setType(locationToEdit.type || "SHELF");
      setParentId(locationToEdit.parentId || null);
      setDescription(locationToEdit.description || "");
    } else {
      setName("");
      setCode("");
      setType("SHELF");
      setParentId(defaultParentId || null);
      setDescription("");
    }
    setErrorMsg(null);
  }, [locationToEdit, defaultParentId, isOpen]);

  if (!isOpen) return null;

  // Filtrar locais para que um local em edição não possa selecionar a si próprio nem os seus descendentes
  const availableParents = locations.filter((loc) => {
    if (!isEditing || !locationToEdit) return true;
    if (loc.id === locationToEdit.id) return false;
    // Impedir descendentes
    if (loc.fullPath.startsWith(`${locationToEdit.fullPath}/`)) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("O nome do local é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let res;
      if (isEditing && locationToEdit) {
        res = await updateLocation(locationToEdit.id, {
          name: name.trim(),
          code: code.trim() || undefined,
          description: description.trim() || undefined,
          type,
          parentId: parentId || null,
        });
      } else {
        res = await createLocation({
          name: name.trim(),
          code: code.trim() || undefined,
          description: description.trim() || undefined,
          type,
          parentId: parentId || null,
        });
      }

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg(res.error || "Ocorreu um erro ao gravar.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de ligação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationTypes = [
    { value: "SHELF", label: "Prateleira" },
    { value: "BIN", label: "Gaveta / Caixa" },
    { value: "RACK", label: "Estante" },
    { value: "AISLE", label: "Corredor" },
    { value: "ZONE", label: "Zona / Área" },
    { value: "WAREHOUSE", label: "Armazém" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-[#1e1723] rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#2b2233] animate-in slide-in-from-bottom-8 duration-200">
        {/* Puxador visual */}
        <div className="w-12 h-1.5 bg-[#3d2c49] rounded-full mx-auto mt-3 sm:hidden" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2233]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#241b2c] border border-[#3d2c49] text-[#f59e0b] flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#f3f0f5]">
              {isEditing ? "Editar Local de Arrumação" : "Novo Local de Arrumação"}
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider mb-1.5">
              Nome do Local *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Prateleira 3 ou Gaveteiro A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] text-sm focus:border-[#f59e0b] outline-hidden transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider mb-1.5">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] text-sm focus:border-[#f59e0b] outline-hidden"
              >
                {locationTypes.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#1e1723]">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider mb-1.5">
                Código / QR (Opcional)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: ARM-P3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] text-sm font-mono focus:border-[#f59e0b] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider mb-1.5">
              Pertence a (Local Pai)
            </label>
            <select
              value={parentId || ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] text-sm focus:border-[#f59e0b] outline-hidden"
            >
              <option value="" className="bg-[#1e1723]">Nenhum (Nível Raiz / Armazém Principal)</option>
              {availableParents.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-[#1e1723]">
                  {loc.fullPath.replace(/^\//, "").replace(/\//g, " › ")}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#998e9f] mt-1">
              Organização em árvore (ex: Armazém › Corredor › Estante › Prateleira).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#baaebf] uppercase tracking-wider mb-1.5">
              Descrição / Observações (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas adicionais sobre a capacidade ou arrumação..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#2b2233] bg-[#151016] text-[#f3f0f5] placeholder:text-[#84778b] text-sm focus:border-[#f59e0b] outline-hidden resize-none"
            />
          </div>

          <div className="pt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-[#2b2233] bg-[#151016] text-[#baaebf] font-semibold text-xs cursor-pointer hover:bg-[#251c2c]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-[#151016] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#f59e0b]/20 active:scale-95 transition-transform cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>{isEditing ? "Guardar Alterações" : "Adicionar Local"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
