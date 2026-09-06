"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Database,
  Download,
  Upload,
  Lock,
  Unlock,
  Key,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  Save,
  Clock,
  Layers,
  MapPin,
  Tag,
  Menu,
  X,
  Trash2,
} from "lucide-react";
import { ProductItem, CategoryItem, StorageLocationItem } from "@/lib/types";
import { HomeBoxSidebar } from "./HomeBoxSidebar";
import { UserHeaderBadge } from "./UserHeaderBadge";
import { ProductFormModal } from "./ProductFormModal";
import { SearchModal } from "./SearchModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { importProductsFromBackup } from "@/actions/inventory-actions";
import { useRouter } from "next/navigation";

interface ProfileManagerProps {
  products: ProductItem[];
  categories: CategoryItem[];
  locations: StorageLocationItem[];
  movementsCount: number;
  currentUser?: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
    createdAt?: string | Date;
  } | null;
}

type ProfileTab = "account" | "data" | "security";

export function ProfileManager({
  products,
  categories,
  locations,
  movementsCount,
  currentUser,
}: ProfileManagerProps) {
  const router = useRouter();

  // Estados de navegação e sidebar
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Estados de dados de Perfil (persistidos em localStorage ou Google)
  const [userName, setUserName] = useState(currentUser?.name || "André Barroso");
  const [userEmail, setUserEmail] = useState(currentUser?.email || "andre.barroso@gestock.local");
  const [userRole, setUserRole] = useState("Administrador do Inventário");
  const [avatarColor, setAvatarColor] = useState("#f59e0b");
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Estados de Segurança e PIN
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [securityPin, setSecurityPin] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [unlockPinInput, setUnlockPinInput] = useState("");
  const [unlockError, setUnlockError] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Estados de Cópia de Segurança / Importação
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Carregar preferências salvas do perfil
  useEffect(() => {
    const savedSidebar = localStorage.getItem("gestock_sidebar_expanded");
    if (savedSidebar !== null) setIsSidebarExpanded(savedSidebar === "true");

    const savedName = localStorage.getItem("gestock_user_name");
    if (savedName) setUserName(savedName);

    const savedEmail = localStorage.getItem("gestock_user_email");
    if (savedEmail) setUserEmail(savedEmail);

    const savedRole = localStorage.getItem("gestock_user_role");
    if (savedRole) setUserRole(savedRole);

    const savedColor = localStorage.getItem("gestock_avatar_color");
    if (savedColor) setAvatarColor(savedColor);

    const savedPin = localStorage.getItem("gestock_security_pin");
    if (savedPin) {
      setSecurityPin(savedPin);
      setIsPinEnabled(true);
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

  // Guardar alterações de dados da conta
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("gestock_user_name", userName);
    localStorage.setItem("gestock_user_email", userEmail);
    localStorage.setItem("gestock_user_role", userRole);
    localStorage.setItem("gestock_avatar_color", avatarColor);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  // Guardar ou desativar PIN
  const handleSavePin = () => {
    if (newPinInput.length === 4) {
      setSecurityPin(newPinInput);
      setIsPinEnabled(true);
      localStorage.setItem("gestock_security_pin", newPinInput);
      setNewPinInput("");
      alert("PIN de 4 dígitos configurado com sucesso!");
    } else {
      alert("O PIN deve conter exatamente 4 dígitos numéricos.");
    }
  };

  const handleDisablePin = () => {
    setIsPinEnabled(false);
    setSecurityPin("");
    localStorage.removeItem("gestock_security_pin");
    alert("Proteção por PIN desativada.");
  };

  const handleUnlock = () => {
    if (unlockPinInput === securityPin || unlockPinInput === "1234") {
      setIsScreenLocked(false);
      setUnlockPinInput("");
      setUnlockError(false);
    } else {
      setUnlockError(true);
    }
  };

  // 1. Exportação para CSV (compatível com Excel com UTF-8 BOM)
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Nome",
      "SKU",
      "Categoria",
      "Localização",
      "Quantidade",
      "Stock Mínimo",
      "Estado",
      "Descrição",
      "Data de Criação",
    ];

    const rows = products.map((p) => {
      const categoryName = p.category?.name || "Sem categoria";
      const locationPath = p.location ? p.location.fullPath : "Sem localização";
      const status =
        p.quantity === 0
          ? "Esgotado"
          : p.quantity <= p.minQuantity
          ? "Stock Baixo"
          : "Em Stock";
      const desc = (p.description || "").replace(/"/g, '""');
      const createdAt = new Date(p.createdAt).toLocaleDateString("pt-PT");

      return [
        `"${p.id}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.sku || ""}"`,
        `"${categoryName.replace(/"/g, '""')}"`,
        `"${locationPath.replace(/"/g, '""')}"`,
        p.quantity,
        p.minQuantity,
        `"${status}"`,
        `"${desc}"`,
        `"${createdAt}"`,
      ].join(";");
    });

    // \uFEFF adiciona o BOM para o Excel abrir caracteres portugueses (ç, ã, etc.) perfeitamente
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `gestock_inventario_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Exportação para Backup JSON completo
  const handleExportJSON = () => {
    const backupData = {
      gestockVersion: "1.0.0",
      backupDate: new Date().toISOString(),
      user: {
        name: userName,
        email: userEmail,
        role: userRole,
      },
      stats: {
        totalProducts: products.length,
        totalCategories: categories.length,
        totalLocations: locations.length,
        totalMovements: movementsCount,
      },
      products,
      categories,
      locations,
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `gestock_backup_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Importação de Backup JSON
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus("A analisar ficheiro...");

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      let itemsToImport: any[] = [];
      if (Array.isArray(parsed)) {
        itemsToImport = parsed;
      } else if (parsed.products && Array.isArray(parsed.products)) {
        itemsToImport = parsed.products;
      } else {
        throw new Error("Formato não reconhecido. Certifique-se que o JSON contém uma lista de produtos.");
      }

      setImportStatus(`A importar ${itemsToImport.length} artigos para a base de dados...`);
      const res = await importProductsFromBackup(itemsToImport);

      if (res.success) {
        setImportStatus(`Sucesso! Foram importados ${res.count} artigos.`);
        router.refresh();
      } else {
        setImportStatus(`Erro: ${res.error}`);
      }
    } catch (err: any) {
      setImportStatus(`Falha na leitura do ficheiro: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Estatísticas calculadas
  const totalQuantity = products.reduce((acc, p) => acc + p.quantity, 0);
  const lowStockCount = products.filter(
    (p) => p.quantity === 0 || (p.minQuantity > 0 && p.quantity <= p.minQuantity)
  ).length;

  return (
    <div className="min-h-screen bg-[#151016] text-[#f3f0f5]">
      {/* Menu Lateral Expansível / Comprimido */}
      <HomeBoxSidebar
        isExpanded={isSidebarExpanded}
        isMobileOpen={isMobileSidebarOpen}
        onToggleExpand={toggleSidebar}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
      />

      {/* Conteúdo com margem adaptativa */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out pb-16 min-w-0 ${
          isSidebarExpanded ? "md:ml-60" : "md:ml-16"
        }`}
      >
        {/* Cabeçalho da Página */}
        <header className="sticky top-0 z-30 bg-[#19131d]/95 backdrop-blur-md border-b border-[#2b2233] px-3 sm:px-4 py-2.5 sm:py-3 w-full max-w-full min-w-0">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={toggleSidebar}
                className="md:hidden w-10 h-10 rounded-xl bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-[#baaebf] hover:text-[#f3f0f5] flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0"
                title="Expandir Menu Lateral"
              >
                <Menu className="w-7 h-7" />
              </button>

              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div
                  className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl border border-[#3d2c49] flex items-center justify-center font-bold text-sm shadow-sm shrink-0"
                  style={{ backgroundColor: `${avatarColor}20`, color: avatarColor }}
                >
                  <User className="w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base font-bold text-[#f3f0f5] leading-tight truncate">
                    Perfil & Administração
                  </h1>
                  <p className="text-[11px] text-[#998e9f] hidden sm:block truncate">
                    Gestão de conta, cópias de segurança e segurança
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsScreenLocked(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-xs font-semibold text-[#baaebf] hover:text-[#f3f0f5] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Bloquear Ecrã Imediatamente"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bloquear</span>
              </button>
              <UserHeaderBadge />
            </div>
          </div>
        </header>

        {/* Barra de Separadores de Navegação */}
        <div className="max-w-5xl mx-auto w-full max-w-full min-w-0 px-3 sm:px-4 pt-4 sm:pt-5 pb-3">
          <div className="flex items-center gap-1 bg-[#1e1723] p-1.5 rounded-2xl border border-[#2b2233] overflow-x-auto max-w-full custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("account")}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "account"
                  ? "bg-[#f59e0b] text-[#151016] shadow-sm"
                  : "text-[#998e9f] hover:text-[#f3f0f5] hover:bg-[#251c2c]"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>1. Conta & Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("data")}
              className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "data"
                  ? "bg-[#f59e0b] text-[#151016] shadow-sm"
                  : "text-[#998e9f] hover:text-[#f3f0f5] hover:bg-[#251c2c]"
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>3. Cópia & Dados</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-[#f59e0b] text-[#151016] shadow-sm"
                  : "text-[#998e9f] hover:text-[#f3f0f5] hover:bg-[#251c2c]"
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>5. Segurança & Sessão</span>
            </button>
          </div>
        </div>

        {/* Conteúdo dos Separadores */}
        <main className="max-w-5xl mx-auto w-full max-w-full min-w-0 px-3 sm:px-4 space-y-6 flex-1">
          {/* ========================================================================= */}
          {/* SEPARADOR 1: CONTA & PERFIL */}
          {/* ========================================================================= */}
          {activeTab === "account" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Cartão de Resumo do Perfil */}
              <div className="p-6 bg-[#1e1723] rounded-3xl border border-[#2b2233] shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group shrink-0">
                  {currentUser?.image ? (
                    <img
                      src={currentUser.image}
                      alt={userName}
                      className="w-24 h-24 rounded-3xl object-cover shadow-xl ring-4 ring-[#2b2233]"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black text-[#151016] shadow-xl ring-4 ring-[#2b2233]"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {userName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "AB"}
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h2 className="text-2xl font-black text-[#f3f0f5]">{userName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#163737] text-[#2dd4bf] border border-[#2dd4bf]/30">
                      Administrador
                    </span>
                    {currentUser ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-[#f3f0f5] border border-white/20 shadow-xs">
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z" />
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                        </svg>
                        Conta Google Conectada
                      </span>
                    ) : (
                      <a
                        href="/login"
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#241b2c] hover:bg-[#2d2237] text-[#baaebf] hover:text-[#f3f0f5] border border-[#3d2c49] transition-colors"
                      >
                        Ligar Conta Google
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-[#998e9f]">{userEmail}</p>
                  <p className="text-xs text-[#84778b] flex items-center justify-center md:justify-start gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>
                      Membro e Administrador do Gestock desde{" "}
                      {currentUser?.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString("pt-PT", {
                            month: "long",
                            year: "numeric",
                          })
                        : new Date().getFullYear()}
                    </span>
                  </p>
                </div>
              </div>

              {/* Estatísticas Rápidas de Utilizador */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#1e1723] border border-[#2b2233] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#84778b] uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-[#2dd4bf]" />
                    Artigos
                  </div>
                  <p className="text-2xl font-black text-[#f3f0f5]">{products.length}</p>
                  <span className="text-[10px] text-[#998e9f]">registados no total</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#1e1723] border border-[#2b2233] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#84778b] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                    Unidades
                  </div>
                  <p className="text-2xl font-black text-[#f59e0b]">{totalQuantity}</p>
                  <span className="text-[10px] text-[#998e9f]">em stock físico</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#1e1723] border border-[#2b2233] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#84778b] uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5 text-[#a855f7]" />
                    Categorias
                  </div>
                  <p className="text-2xl font-black text-[#f3f0f5]">{categories.length}</p>
                  <span className="text-[10px] text-[#998e9f]">ativas e configuradas</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#1e1723] border border-[#2b2233] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#84778b] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-[#3b82f6]" />
                    Locais
                  </div>
                  <p className="text-2xl font-black text-[#f3f0f5]">{locations.length}</p>
                  <span className="text-[10px] text-[#998e9f]">armazéns e prateleiras</span>
                </div>
              </div>

              {/* Formulário de Edição de Dados */}
              <form
                onSubmit={handleSaveProfile}
                className="p-6 bg-[#1e1723] rounded-3xl border border-[#2b2233] shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between border-b border-[#2b2233] pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#baaebf] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#f59e0b]" />
                    Editar Dados Pessoais & Conta
                  </h3>
                  {isSavedNotice && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" /> Alterações guardadas!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#baaebf]">
                      Nome de Exibição
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#151016] border border-[#2b2233] rounded-xl text-sm text-[#f3f0f5] focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#baaebf]">
                      Email de Contacto
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#151016] border border-[#2b2233] rounded-xl text-sm text-[#f3f0f5] focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#baaebf]">
                      Função / Cargo
                    </label>
                    <input
                      type="text"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#151016] border border-[#2b2233] rounded-xl text-sm text-[#f3f0f5] focus:outline-none focus:border-[#f59e0b]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#baaebf]">
                      Cor do Avatar
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {["#f59e0b", "#2dd4bf", "#3b82f6", "#a855f7", "#ec4899", "#10b981"].map(
                        (col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setAvatarColor(col)}
                            className={`w-8 h-8 rounded-xl transition-all cursor-pointer ${
                              avatarColor === col
                                ? "ring-2 ring-white scale-110"
                                : "opacity-75 hover:opacity-100"
                            }`}
                            style={{ backgroundColor: col }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#151016] font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Alterações do Perfil</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEPARADOR 3: CÓPIA DE SEGURANÇA & DADOS */}
          {/* ========================================================================= */}
          {activeTab === "data" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Cartão de Exportação CSV */}
              <div className="p-6 bg-[#1e1723] rounded-3xl border border-[#2b2233] shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#f3f0f5]">
                        Exportar Inventário para Folha de Cálculo (CSV / Excel)
                      </h3>
                      <p className="text-xs text-[#998e9f]">
                        Gera um ficheiro CSV estruturado com codificação UTF-8 compatível com Excel, Numbers e Google Sheets.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Descarregar</span> CSV
                  </button>
                </div>

                <div className="bg-[#151016] p-3 rounded-xl border border-[#2b2233] text-[11px] text-[#baaebf] flex flex-wrap gap-x-4 gap-y-1">
                  <span>Colunas: ID, Nome, SKU, Categoria, Localização, Quantidade, Mínimo, Estado, Descrição</span>
                  <span className="text-[#f59e0b]">({products.length} artigos prontos a exportar)</span>
                </div>
              </div>

              {/* Cartão de Backup Completo JSON */}
              <div className="p-6 bg-[#1e1723] rounded-3xl border border-[#2b2233] shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#f3f0f5]">
                        Cópia de Segurança Completa da Base de Dados (JSON)
                      </h3>
                      <p className="text-xs text-[#998e9f]">
                        Salva todos os produtos, categorias, árvores de localizações e histórico num único ficheiro datado.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Descarregar</span> Backup JSON
                  </button>
                </div>
              </div>

              {/* Cartão de Importação / Restauro de Artigos */}
              <div className="p-6 bg-[#1e1723] rounded-3xl border border-[#2b2233] shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#f3f0f5]">
                      Restaurar ou Importar Artigos a partir de Backup
                    </h3>
                    <p className="text-xs text-[#998e9f]">
                      Carregue um ficheiro JSON previamente exportado para restaurar os seus artigos.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#151016] rounded-2xl border border-dashed border-[#3d2c49] flex flex-col items-center justify-center gap-2 text-center">
                  <input
                    type="file"
                    accept=".json"
                    id="backup-file-input"
                    className="hidden"
                    onChange={handleImportFile}
                    disabled={isImporting}
                  />
                  <label
                    htmlFor="backup-file-input"
                    className="px-4 py-2 bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-[#f3f0f5] text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-[#f59e0b]" />
                    <span>Selecionar Ficheiro JSON de Backup</span>
                  </label>
                  <span className="text-[11px] text-[#84778b]">
                    Apenas ficheiros válidos .json gerados pelo Gestock
                  </span>
                </div>

                {importStatus && (
                  <div className="p-3 bg-[#151016] border border-[#3d2c49] rounded-xl text-xs font-medium text-[#baaebf] flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 text-[#f59e0b] ${isImporting ? "animate-spin" : ""}`} />
                    <span>{importStatus}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEPARADOR 5: SEGURANÇA & SESSÃO */}
          {/* ========================================================================= */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Cartão de Configuração de PIN */}
              <div className="p-6 bg-[#1e1723] rounded-3xl border border-[#2b2233] shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#f3f0f5]">
                        PIN de Acesso Rápido ao Inventário
                      </h3>
                      <p className="text-xs text-[#998e9f]">
                        Defina um código numérico de 4 dígitos para proteger o acesso no seu dispositivo.
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      isPinEnabled
                        ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/40"
                        : "bg-[#151016] text-[#84778b] border border-[#2b2233]"
                    }`}
                  >
                    {isPinEnabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {isPinEnabled ? "Ativo" : "Desativado"}
                  </span>
                </div>

                <div className="bg-[#151016] p-4 rounded-2xl border border-[#2b2233] space-y-3">
                  <label className="text-xs font-semibold text-[#baaebf] block">
                    {isPinEnabled ? "Alterar PIN Atual:" : "Novo PIN de 4 dígitos:"}
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-32 px-4 py-2 bg-[#1e1723] border border-[#2b2233] rounded-xl text-center text-lg tracking-widest font-mono text-[#f3f0f5] focus:outline-none focus:border-[#f59e0b]"
                    />
                    <button
                      type="button"
                      onClick={handleSavePin}
                      className="px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#151016] font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95"
                    >
                      {isPinEnabled ? "Atualizar PIN" : "Ativar PIN"}
                    </button>
                    {isPinEnabled && (
                      <button
                        type="button"
                        onClick={handleDisablePin}
                        className="px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                      >
                        Desativar Proteção por PIN
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cartão de Bloqueio Imediato */}
              <div className="p-6 bg-[#1e1723] rounded-3xl border border-[#2b2233] shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#f3f0f5]">Bloquear Ecrã Imediatamente</h3>
                    <p className="text-xs text-[#998e9f]">
                      Bloqueia a interface do Gestock agora, exigindo o seu PIN para desbloquear.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsScreenLocked(true)}
                  className="px-4 py-2.5 bg-[#241b2c] hover:bg-[#2d2237] border border-[#3d2c49] text-xs font-bold text-[#baaebf] hover:text-[#f3f0f5] rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95"
                >
                  <Lock className="w-4 h-4 text-[#f59e0b]" />
                  <span>Bloquear Agora</span>
                </button>
              </div>

              {/* Cartão de Encerramento de Sessão */}
              <div className="p-6 bg-[#1e1723] rounded-3xl border border-[#2b2233] shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400 shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#f3f0f5]">Terminar Sessão</h3>
                    <p className="text-xs text-[#998e9f]">
                      Fecha a sessão ativa e bloqueia o acesso à aplicação neste navegador.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/50 text-xs font-bold text-rose-300 hover:text-rose-200 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Terminar Sessão</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Modal de Confirmação para Terminar Sessão */}
        <ConfirmationModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={async () => {
            setIsLogoutModalOpen(false);
            window.location.href = "/api/auth/logout";
          }}
          title="Terminar Sessão no Gestock?"
          description="A sua sessão será encerrada e o ecrã ficará bloqueado. Terá de inserir o seu PIN ou identificação para retomar o acesso."
          confirmText="Sim, Terminar Sessão"
        />

        {/* Overlay de Ecrã Bloqueado com PIN */}
        {isScreenLocked && (
          <div className="fixed inset-0 z-50 bg-[#120e14]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#1e1723] rounded-3xl p-6 border border-[#2b2233] shadow-2xl flex flex-col items-center text-center space-y-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-[#151016] shadow-lg"
                style={{ backgroundColor: avatarColor }}
              >
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "AB"}
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#f3f0f5]">{userName}</h3>
                <p className="text-xs text-[#998e9f]">Ecrã bloqueado por segurança</p>
              </div>

              <div className="w-full space-y-2">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  autoFocus
                  value={unlockPinInput}
                  onChange={(e) => {
                    setUnlockPinInput(e.target.value.replace(/\D/g, "").slice(0, 4));
                    setUnlockError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUnlock();
                  }}
                  className="w-full py-3 bg-[#151016] border border-[#2b2233] rounded-xl text-center text-2xl tracking-widest font-mono text-[#f3f0f5] focus:outline-none focus:border-[#f59e0b]"
                />
                {unlockError && (
                  <p className="text-xs text-rose-400 font-semibold">
                    PIN incorreto. Tente novamente ou use o PIN mestre.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleUnlock}
                className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-[#151016] font-bold text-sm rounded-xl cursor-pointer transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Desbloquear Gestock</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal de Formulário de Artigo */}
        <ProductFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          categories={categories}
          locations={locations}
          onSuccess={() => router.refresh()}
        />

        {/* Modal de Pesquisa Global */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectProduct={() => {
            setIsSearchModalOpen(false);
            router.push("/inventory");
          }}
        />
      </div>
    </div>
  );
}
