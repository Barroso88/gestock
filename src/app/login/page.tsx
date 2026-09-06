import React from "react";
import { isGoogleAuthConfigured, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Info, Sparkles, ArrowRight } from "lucide-react";
import { GoogleLoginClient } from "./GoogleLoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();

  // Se já estiver autenticado, redireciona para a página inicial
  if (user) {
    redirect("/");
  }

  const isConfigured = isGoogleAuthConfigured();
  const errorParam = searchParams.error;

  return (
    <div className="min-h-screen bg-[#120e14] text-[#f3f0f5] flex flex-col justify-between p-4 relative overflow-hidden select-none">
      {/* Luzes de Fundo Ambientais */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#2dd4bf]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Topo / Logótipo */}
      <header className="max-w-md mx-auto w-full pt-8 flex items-center justify-center gap-3">
        <img
          src="/mainicon.png"
          alt="Gestock"
          className="w-12 h-12 object-contain drop-shadow-md"
        />
        <span className="text-2xl font-black tracking-tight text-[#f3f0f5]">Gestock</span>
      </header>

      {/* Cartão Central de Autenticação */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-[#1e1723]/90 backdrop-blur-md rounded-3xl border border-[#2b2233] p-7 shadow-2xl space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-black text-[#f3f0f5] leading-tight">
              Iniciar Sessão
            </h1>
            <p className="text-xs text-[#998e9f]">
              Aceda à gestão centralizada do seu inventário de forma rápida e segura.
            </p>
          </div>

          {/* Mensagens de Erro se existirem */}
          {errorParam && (
            <div className="p-3.5 bg-rose-950/70 border border-rose-800/40 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-bold">Aviso de Autenticação</p>
                <p className="text-[11px] text-rose-200/90 mt-0.5">
                  {errorParam === "credentials_missing"
                    ? "As chaves GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET ainda não estão configuradas no ficheiro .env."
                    : `Ocorreu um erro no processo de login: ${errorParam}`}
                </p>
              </div>
            </div>
          )}

          {/* Componente de Interação de Login */}
          <GoogleLoginClient isConfigured={isConfigured} />

          {/* Informação sobre Segurança */}
          <div className="pt-2 border-t border-[#2b2233] flex items-center justify-center gap-2 text-[11px] text-[#84778b]">
            <ShieldCheck className="w-4 h-4 text-[#2dd4bf]" />
            <span>Sessão encriptada e protegida via OAuth 2.0</span>
          </div>
        </div>

        {/* Guia de Configuração Rápida se ainda não tiver credenciais */}
        {!isConfigured && (
          <div className="mt-4 p-4 rounded-2xl bg-[#19131d]/80 border border-[#2b2233] text-xs text-[#998e9f] space-y-1.5">
            <span className="font-bold text-[#f59e0b] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Como ativar as suas credenciais reais da Google:
            </span>
            <p className="text-[11px] leading-relaxed text-[#baaebf]">
              Crie um projeto gratuito na{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-[#f59e0b] underline hover:text-amber-300"
              >
                Google Cloud Console
              </a>
              , crie um <b>ID de cliente OAuth 2.0</b> e coloque as chaves no ficheiro <code>.env</code>.
            </p>
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="max-w-md mx-auto w-full pb-6 text-center text-xs text-[#63576a]">
        Gestock &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados
      </footer>
    </div>
  );
}
