"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Lock, User, AlertCircle, Sun, Moon } from "lucide-react";
import { api, saveAuthSession } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("gestor");
  const [senha, setSenha] = useState("senha123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await api.login(username, senha);
      saveAuthSession(auth);
      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Falha ao autenticar no servidor Spring Boot."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ph-body-bg p-4 relative transition-colors">
      {/* Botão de Alternância de Tema no canto superior direito */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-ph-surface border border-ph-border text-ph-text-secondary hover:text-ph-text-primary hover:bg-ph-grid-hover transition-colors shadow-sm"
          title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-emerald-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span>{isDark ? "Tema Escuro" : "Tema Claro"}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-ph-surface border border-ph-border rounded-2xl shadow-2xl overflow-hidden transition-colors">
        <div className="bg-ph-sidebar-bg border-b border-ph-border px-8 py-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-ph-primary flex items-center justify-center shadow text-white shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ph-text-primary">CheckList Frota</h1>
            <p className="text-xs text-ph-sidebar-muted">
              Painel Central do Gestor (Offline-First)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ph-text-secondary uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-ph-sidebar-muted absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary focus:outline-none focus:ring-2 focus:ring-ph-primary transition-colors"
                placeholder="gestor"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ph-text-secondary uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ph-sidebar-muted absolute left-3 top-3" />
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary focus:outline-none focus:ring-2 focus:ring-ph-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-ph-primary hover:bg-ph-primary-pressed disabled:opacity-60 text-white font-semibold text-sm shadow transition-colors"
          >
            {loading ? "Autenticando..." : "Entrar no Painel"}
          </button>

          <div className="pt-3 border-t border-ph-border text-xs text-ph-text-secondary space-y-1">
            <p className="font-semibold text-ph-text-primary">
              Credenciais iniciais (DataSeeder):
            </p>
            <p>
              Gestor:{" "}
              <code className="bg-ph-sidebar-bg border border-ph-border px-1.5 py-0.5 rounded text-ph-text-primary">
                gestor
              </code>{" "}
              /{" "}
              <code className="bg-ph-sidebar-bg border border-ph-border px-1.5 py-0.5 rounded text-ph-text-primary">
                senha123
              </code>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
