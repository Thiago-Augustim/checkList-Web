"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardCheck,
  LayoutDashboard,
  Truck,
  FileSpreadsheet,
  Users,
  LogOut,
  Wifi,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  UsuarioDto,
} from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

const SIDEBAR_COLLAPSED_KEY = "checklist_sidebar_collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UsuarioDto | null>(null);
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }
    setUser(storedUser);

    try {
      const savedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === "true");
      }
    } catch {
      // Ignora erro de acesso ao localStorage
    }

    setReady(true);
  }, [router]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // Ignora erro
      }
      return next;
    });
  };

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-ph-body-bg text-ph-text-secondary">
        <div className="text-sm font-medium animate-pulse">
          Carregando Painel do Gestor...
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/checklists", label: "Vistorias & Avarias", icon: ClipboardCheck },
    {
      href: "/templates",
      label: "Formulários Dinâmicos",
      icon: FileSpreadsheet,
    },
    { href: "/veiculos", label: "Frota de Caminhões", icon: Truck },
    { href: "/usuarios", label: "Motoristas & Gestores", icon: Users },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-ph-body-bg text-ph-text-primary transition-colors">
      {/* Sidebar Fixa e Retrátil (Imune ao scroll do conteúdo) */}
      <aside
        className={`h-full bg-ph-sidebar-bg border-r border-ph-border flex flex-col shrink-0 select-none transition-all duration-300 ease-in-out relative z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Cabeçalho da Sidebar */}
        <div
          className={`border-b border-ph-border flex items-center transition-all ${
            collapsed
              ? "p-3 flex-col gap-2 justify-center"
              : "p-4 justify-between gap-2"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-ph-primary flex items-center justify-center text-white font-bold shadow-sm shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-base tracking-tight text-ph-text-primary truncate">
                  CheckList Frota
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] text-ph-primary font-medium">
                  <Wifi className="w-3 h-3" /> Central Sync Ativa
                </span>
              </div>
            )}
          </div>

          {/* Botão de Encolher / Expandir */}
          <button
            id="toggle-sidebar"
            type="button"
            onClick={toggleCollapsed}
            className="p-1.5 rounded-lg border border-ph-border bg-ph-surface text-ph-text-secondary hover:text-ph-text-primary hover:bg-ph-grid-hover transition-colors shadow-sm shrink-0"
            title={collapsed ? "Expandir barra lateral" : "Encolher barra lateral"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-ph-primary" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                  collapsed
                    ? "justify-center p-3"
                    : "gap-3 px-3 py-2.5"
                } ${
                  active
                    ? "bg-ph-primary text-white shadow-sm font-semibold"
                    : "text-ph-text-secondary hover:bg-ph-grid-hover hover:text-ph-text-primary"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div
          className={`border-t border-ph-border space-y-2 transition-all ${
            collapsed ? "p-2 flex flex-col items-center" : "p-3"
          }`}
        >
          {/* Alternância de Tema */}
          {collapsed ? (
            <button
              id="toggle-tema"
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-ph-surface border border-ph-border text-ph-text-secondary hover:text-ph-text-primary hover:bg-ph-grid-hover transition-colors shadow-sm"
              title={
                isDark
                  ? "Tema Escuro ativo (clique para alternar para Claro)"
                  : "Tema Claro ativo (clique para alternar para Escuro)"
              }
            >
              {isDark ? (
                <Moon className="w-4 h-4 text-emerald-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>
          ) : (
            <button
              id="toggle-tema"
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-ph-surface border border-ph-border text-ph-text-secondary hover:text-ph-text-primary hover:bg-ph-grid-hover transition-colors shadow-sm"
              title={
                isDark ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"
              }
            >
              <span className="flex items-center gap-2">
                {isDark ? (
                  <Moon className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                {isDark ? "Tema Escuro" : "Tema Claro"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-ph-primary-bg text-ph-primary border border-ph-primary/20">
                {isDark ? "Escuro" : "Claro"}
              </span>
            </button>
          )}

          {/* Dados do Usuário */}
          {!collapsed ? (
            <div className="pt-2 border-t border-ph-border/60">
              <p className="text-xs font-semibold text-ph-text-primary truncate">
                {user?.nome}
              </p>
              <p className="text-xs text-ph-sidebar-muted truncate">
                {user?.email}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-ph-primary-bg text-ph-primary border border-ph-primary/30">
                {user?.perfil}
              </span>
            </div>
          ) : (
            <div
              className="w-9 h-9 rounded-full bg-ph-primary-bg text-ph-primary font-bold text-xs flex items-center justify-center border border-ph-primary/30"
              title={`${user?.nome} (${user?.email})`}
            >
              {user?.nome ? user.nome.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          {/* Sair da Conta */}
          {collapsed ? (
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-ph-surface border border-ph-border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:hover:border-rose-900 text-ph-text-secondary transition-colors"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-ph-surface border border-ph-border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:hover:border-rose-900 text-ph-text-secondary transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da Conta
            </button>
          )}
        </div>
      </aside>

      {/* Conteúdo Principal com scroll próprio independente */}
      <main className="flex-1 h-full min-w-0 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
