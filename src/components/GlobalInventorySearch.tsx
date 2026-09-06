"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, MapPin, Package, X, AlertTriangle, ChevronRight } from "lucide-react";

interface SearchProductResult {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  minQuantity: number;
  imageUrl: string | null;
  locationPath: string;
  locationId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

interface GlobalInventorySearchProps {
  onSelectProduct: (productId: string) => void;
  onScanClick?: () => void;
}

export function GlobalInventorySearch({ onSelectProduct, onScanClick }: GlobalInventorySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProductResult[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data);
          }
        } catch (err) {
          console.error("Erro na pesquisa:", err);
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full space-y-2 relative">
      {/* Barra de Pesquisa Proeminente estilo HomeBox */}
      <div className="relative flex items-center gap-1.5 min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-[#84778b] absolute left-3 top-1/2 -translate-y-1/2 sm:hidden pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full pl-8 sm:pl-4 pr-8 sm:pr-10 py-1.5 sm:py-2.5 rounded-xl bg-[#1e1723] border border-[#2b2233] text-xs sm:text-sm text-[#f3f0f5] placeholder:text-[#84778b] focus:outline-hidden focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[#998e9f] hover:text-[#f3f0f5] p-1 rounded-md hover:bg-[#2b2233] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Botão de Pesquisa Âmbar do HomeBox (visível em tablet/desktop) */}
        <button
          type="button"
          onClick={() => {}}
          className="hidden sm:flex w-10 h-10 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] active:scale-95 text-[#151016] items-center justify-center shrink-0 transition-all cursor-pointer shadow-md shadow-[#f59e0b]/20"
          title="Pesquisar"
        >
          <Search className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Dropdown de Resultados da Pesquisa em Tempo Real */}
      {query.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#1e1723] rounded-2xl p-2 space-y-2 max-h-[65vh] overflow-y-auto border border-[#2b2233] shadow-2xl backdrop-blur-xl">
          {isPending && results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#998e9f]">A pesquisar no inventário...</div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#84778b]">
              Nenhum artigo encontrado para "{query}".
            </div>
          ) : (
            results.map((item) => {
              const isLowStock = item.quantity === 0 || (item.minQuantity > 1 && item.quantity <= item.minQuantity);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectProduct(item.id);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 p-3 bg-[#151016]/80 hover:bg-[#261d2d] rounded-xl border border-[#2b2233] hover:border-[#f59e0b]/50 active:scale-[0.99] transition-all cursor-pointer group"
                >
                  {/* Foto do Produto */}
                  <div className="w-12 h-12 rounded-xl bg-[#1e1723] overflow-hidden shrink-0 flex items-center justify-center border border-[#2b2233]">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-[#84778b]" />
                    )}
                  </div>

                  {/* Informação do Artigo e Localização Exata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[#f3f0f5] group-hover:text-[#f59e0b] truncate transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isLowStock && (
                          <span
                            title="Stock baixo"
                            className="w-5 h-5 rounded-full bg-amber-950/80 text-amber-400 flex items-center justify-center"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                            isLowStock
                              ? "bg-amber-950/90 text-amber-300 border border-amber-800/60"
                              : "bg-[#163737] text-[#2dd4bf] border border-[#2dd4bf]/20"
                          }`}
                        >
                          {item.quantity} un
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#998e9f]">
                      {item.sku && <span className="font-mono text-[#baaebf]">{item.sku}</span>}
                      {item.sku && item.categoryName && <span>•</span>}
                      {item.categoryName && (
                        <span className="font-medium text-[#baaebf]">
                          {item.categoryName}
                        </span>
                      )}
                    </div>

                    {/* Destaque da Localização de Arrumação */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#2dd4bf] bg-[#163737]/80 px-2 py-0.5 rounded-md w-fit max-w-full truncate border border-[#2dd4bf]/20">
                      <MapPin className="w-3 h-3 shrink-0 text-[#2dd4bf]" />
                      <span className="truncate">{item.locationPath}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#84778b] group-hover:text-[#f59e0b] shrink-0 transition-colors" />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
