"use client";

import React, { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api, PerfilUsuario, UsuarioDto } from "@/lib/api";
import { CheckCircle2, Plus, UserCheck, X, XCircle } from "lucide-react";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<PerfilUsuario>("MOTORISTA");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const limparCamposECancelarErro = () => {
    setErro(null);
    setNome("");
    setUsername("");
    setEmail("");
    setSenha("");
    setPerfil("MOTORISTA");
  };

  const carregar = useCallback(async () => {
    const data = await api.listarUsuarios();
    setUsuarios(data);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErro(null);
    try {
      await api.criarUsuario({ nome, username, email, senha, perfil });
      setNome("");
      setUsername("");
      setEmail("");
      setSenha("");
      await carregar();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao criar usuário.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAtivo = async (u: UsuarioDto) => {
    await api.alterarStatusUsuario(u.id, !u.ativo);
    await carregar();
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ph-text-primary">
            Motoristas &amp; Gestores
          </h1>
          <p className="text-sm text-ph-text-secondary mt-1">
            Cadastre motoristas que utilizarão o aplicativo Flutter Offline-First
            e gestores do painel Web com seu respectivo username único.
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleCriar}
          className="bg-ph-surface p-5 rounded-xl border border-ph-border shadow-sm space-y-4 transition-colors"
        >
          <h2 className="text-sm font-bold text-ph-text-primary flex items-center gap-2">
            <Plus className="w-4 h-4 text-ph-primary" /> Cadastrar Novo Usuário
          </h2>

          {erro && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
              <span>{erro}</span>
              <button
                type="button"
                onClick={limparCamposECancelarErro}
                className="p-1 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 transition-colors shrink-0"
                title="Fechar aviso e limpar campos"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome Completo"
              className="px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary focus:outline-none focus:ring-1 focus:ring-ph-primary"
            />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Username único (ex: joao.silva)"
              className="px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-ph-primary"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary focus:outline-none focus:ring-1 focus:ring-ph-primary"
            />
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha Inicial"
              className="px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary focus:outline-none focus:ring-1 focus:ring-ph-primary"
            />
            <select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
              className="px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-ph-primary"
            >
              <option value="MOTORISTA">MOTORISTA (App Flutter)</option>
              <option value="GESTOR">GESTOR (Painel Web)</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-ph-primary hover:bg-ph-primary-pressed text-white shadow-sm transition-colors"
            >
              {saving ? "Salvando..." : "Criar Usuário"}
            </button>
          </div>
        </form>

        {/* Lista */}
        <div className="bg-ph-surface rounded-xl border border-ph-border shadow-sm overflow-hidden transition-colors">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ph-sidebar-bg border-b border-ph-border text-[11px] font-bold text-ph-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ph-border text-sm">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-ph-grid-hover transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-ph-text-primary">
                    <span className="inline-flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-ph-primary" />
                      {u.nome}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-ph-primary">
                    @{u.username}
                  </td>
                  <td className="py-3.5 px-4 text-ph-text-secondary">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        u.perfil === "GESTOR"
                          ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                          : "bg-ph-primary-bg text-ph-primary border border-ph-primary/20"
                      }`}
                    >
                      {u.perfil}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.ativo ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-ph-sidebar-bg border border-ph-border text-ph-sidebar-muted">
                        <XCircle className="w-3.5 h-3.5" /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleAtivo(u)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        u.ativo
                          ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900"
                          : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-900"
                      }`}
                    >
                      {u.ativo ? "Inativar" : "Reativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
