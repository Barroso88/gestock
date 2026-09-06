"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

interface GoogleLoginClientProps {
  isConfigured: boolean;
}

export function GoogleLoginClient({ isConfigured }: GoogleLoginClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = "/api/auth/google";
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "André Barroso",
          email: "andre.barroso@gmail.com",
        }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        alert("Falha ao iniciar sessão de teste.");
      }
    } catch {
      alert("Erro ao conectar à API.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Botão Oficial da Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading || isDemoLoading}
        className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span>{isLoading ? "A ligar à Google..." : "Continuar com o Google"}</span>
      </button>

      {/* Opção de Teste Rápido se as chaves ainda não estiverem no .env */}
      <div className="pt-2">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#2b2233]" />
          <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-[#84778b] font-bold">
            ou em ambiente local
          </span>
          <div className="flex-grow border-t border-[#2b2233]" />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading || isDemoLoading}
          className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-[#baaebf] hover:text-[#f3f0f5] font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
        >
          {isDemoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#f59e0b]" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#f59e0b]" />
          )}
          <span>Entrar com Conta de Teste (André Barroso)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
