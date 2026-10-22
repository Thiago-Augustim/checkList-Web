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
} from "lucide-react";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  UsuarioDto,
} from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UsuarioDto | null>(null);
  const [ready, setReady] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }
    setUser(storedUser);
    setReady(true);
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ph-body-bg text-ph-text-secondary">
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
    <div className="min-h-screen flex bg-ph-body-bg text-ph-text-primary transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-ph-sidebar-bg border-r border-ph-border flex flex-col shrink-0 transition-colors">
        <div className="p-5 border-b border-ph-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ph-primary flex items-center justify-center text-white font-bold shadow-sm shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base tracking-tight text-ph-text-primary truncate">
              CheckList Frota
            </h1>
            <span className="inline-flex items-center gap-1 text-xs text-ph-primary font-medium">
              <Wifi className="w-3 h-3" /> Central Sync Ativa
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-ph-primary text-white shadow-sm font-semibold"
                    : "text-ph-text-secondary hover:bg-ph-grid-hover hover:text-ph-text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar: Seletor de Tema e Usuário */}
        <div className="p-4 border-t border-ph-border space-y-3">
          {/* Botão de Alternância de Tema */}
          <button
            id="toggle-tema"
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-ph-surface border border-ph-border text-ph-text-secondary hover:text-ph-text-primary hover:bg-ph-grid-hover transition-colors shadow-sm"
            title={isDark ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
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

          {/* Dados do Usuário */}
          <div className="pt-2 border-t border-ph-border/60">
            <p className="text-xs font-semibold text-ph-text-primary truncate">
              {user?.nome}
            </p>
            <p className="text-xs text-ph-sidebar-muted truncate">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-ph-primary-bg text-ph-primary border border-ph-primary/30">
              {user?.perfil}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-ph-surface border border-ph-border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:hover:border-rose-900 text-ph-text-secondary transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
