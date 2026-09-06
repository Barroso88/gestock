"use client";

import React, { useState, useTransition } from "react";
import { Plus, Minus } from "lucide-react";
import { quickAdjustStock } from "@/actions/inventory-actions";

interface QuickStockAdjusterProps {
  productId: string;
  initialQuantity: number;
  minQuantity: number;
}

export function QuickStockAdjuster({
  productId,
  initialQuantity,
  minQuantity,
}: QuickStockAdjusterProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isPending, startTransition] = useTransition();

  const handleAdjust = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextQty = Math.max(0, quantity + delta);
    setQuantity(nextQty);

    // Feedback tátil
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {}
    }

    startTransition(async () => {
      await quickAdjustStock(productId, delta);
    });
  };

  const isLowStock = quantity === 0 || (minQuantity > 1 && quantity <= minQuantity);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1 bg-[#151016] border border-[#2b2233] p-1 rounded-xl shadow-xs"
    >
      <button
        type="button"
        disabled={quantity <= 0 || isPending}
        onClick={(e) => handleAdjust(-1, e)}
        className="w-7 h-7 rounded-lg bg-[#231b29] hover:bg-[#2e2336] text-[#baaebf] hover:text-[#f3f0f5] flex items-center justify-center active:scale-90 disabled:opacity-30 transition-all border border-[#2b2233] cursor-pointer"
        title="Retirar 1 unidade"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span
        className={`px-2 text-xs font-bold font-mono min-w-[2.5rem] text-center ${
          isLowStock
            ? "text-[#f59e0b]"
            : "text-[#f3f0f5]"
        }`}
      >
        {quantity}
      </span>

      <button
        type="button"
        disabled={isPending}
        onClick={(e) => handleAdjust(1, e)}
        className="w-7 h-7 rounded-lg bg-[#231b29] hover:bg-[#2e2336] text-[#baaebf] hover:text-[#f3f0f5] flex items-center justify-center active:scale-90 transition-all border border-[#2b2233] cursor-pointer"
        title="Adicionar 1 unidade"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
