"use client";

import React from "react";
import { Palette, Check, X } from "lucide-react";
import { useTheme, THEMES } from "@/context/ThemeContext";

export function ThemeSelectorModal() {
  const { currentTheme, setTheme, isThemeModalOpen, closeThemeModal } = useTheme();

  if (!isThemeModalOpen) return null;

  return (
    <div
      onClick={closeThemeModal}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] bg-[#1e1723] border border-[#2b2233] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 border-b border-[#2b2233] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#241b2c] border border-[#3d2c49] text-[#f59e0b] flex items-center justify-center shrink-0 shadow-inner">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#f3f0f5]">
                Temas & Aparência
              </h2>
              <p className="text-xs text-[#998e9f]">
                Escolha uma das 10 estéticas completas para personalizar o Gestock.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeThemeModal}
            className="w-9 h-9 rounded-xl bg-[#241b2c] hover:bg-[#2e2336] text-[#998e9f] hover:text-[#f3f0f5] flex items-center justify-center transition-colors cursor-pointer border border-[#2b2233]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grelha de 10 Temas */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 gap-3 max-h-[60vh]">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;

            return (
              <div
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group relative ${
                  isSelected
                    ? "bg-[#251c2c] border-[#f59e0b] ring-1 ring-[#f59e0b]/60 shadow-md"
                    : "bg-[#151016] border-[#2b2233] hover:border-[#f59e0b]/50 hover:bg-[#201825]"
                }`}
              >
                {/* Cabeçalho do Cartão de Tema */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-bold truncate transition-colors ${
                          isSelected ? "text-[#f59e0b]" : "text-[#f3f0f5] group-hover:text-[#f59e0b]"
                        }`}
                      >
                        {theme.name}
                      </h3>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
                          Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#998e9f] mt-0.5 line-clamp-1">
                      {theme.description}
                    </p>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all border ${
                      isSelected
                        ? "bg-[#f59e0b] text-[#151016] border-[#f59e0b]"
                        : "border-[#2b2233] bg-[#241b2c] text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Paleta de Cores (Swatches) */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#2b2233]/40">
                  <div className="flex items-center -space-x-1.5 overflow-hidden p-0.5">
                    {/* Fundo */}
                    <span
                      title="Cor de Fundo"
                      className="inline-block w-6 h-6 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: theme.preview.bg }}
                    />
                    {/* Cartão */}
                    <span
                      title="Superfície de Cartão"
                      className="inline-block w-6 h-6 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: theme.preview.card }}
                    />
                    {/* Acento Primário */}
                    <span
                      title="Acento Principal"
                      className="inline-block w-6 h-6 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: theme.preview.accent }}
                    />
                    {/* Acento Secundário */}
                    <span
                      title="Destaque Secundário"
                      className="inline-block w-6 h-6 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: theme.preview.accentSecondary }}
                    />
                  </div>
                  <span className="text-[10px] text-[#84778b] ml-auto font-mono">
                    {theme.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-[#2b2233] bg-[#151016] flex items-center justify-between">
          <span className="text-xs text-[#998e9f]">
            O tema é gravado e mantido entre sessões.
          </span>
          <button
            type="button"
            onClick={closeThemeModal}
            className="px-4 py-2 rounded-xl bg-[#241b2c] hover:bg-[#2e2336] text-xs font-semibold text-[#f3f0f5] border border-[#2b2233] transition-colors cursor-pointer"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
