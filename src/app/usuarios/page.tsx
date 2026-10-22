"use client";

import React, { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api, PerfilUsuario, UsuarioDto } from "@/lib/api";
import { CheckCircle2, Plus, UserCheck, XCircle } from "lucide-react";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<PerfilUsuario>("MOTORISTA");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
          <h1 className="text-2xl font-bold text-slate-900">
            Motoristas & Gestores
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cadastre motoristas que utilizarão o aplicativo Flutter Offline-First
            e gestores do painel Web com seu respectivo username único.
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleCriar}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4"
        >
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" /> Cadastrar Novo Usuário
          </h2>

          {erro && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {erro}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome Completo"
              className="px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Username único (ex: joao.silva)"
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha Inicial"
              className="px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
            <select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option value="MOTORISTA">MOTORISTA (App Flutter)</option>
              <option value="GESTOR">GESTOR (Painel Web)</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {saving ? "Salvando..." : "Criar Usuário"}
            </button>
          </div>
        </form>

        {/* Lista */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <span className="inline-flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      {u.nome}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-700">
                    @{u.username}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        u.perfil === "GESTOR"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {u.perfil}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.ativo ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                        <XCircle className="w-3.5 h-3.5" /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleAtivo(u)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        u.ativo
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
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
