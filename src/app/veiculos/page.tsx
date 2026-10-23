"use client";

import React, { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api, LABELS_TIPO_VEICULO, TipoVeiculo, VeiculoDto } from "@/lib/api";
import { CheckCircle2, Plus, Truck, X, XCircle } from "lucide-react";

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<VeiculoDto[]>([]);
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [tipo, setTipo] = useState<TipoVeiculo>("CAVALO_MECANICO");
  const [kmAtual, setKmAtual] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const limparCamposECancelarErro = () => {
    setErro(null);
    setPlaca("");
    setModelo("");
    setTipo("CAVALO_MECANICO");
    setKmAtual(0);
  };

  const carregar = useCallback(async () => {
    const data = await api.listarVeiculos(false);
    setVeiculos(data);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErro(null);
    try {
      await api.criarVeiculo({ placa, modelo, tipo, kmAtual });
      setPlaca("");
      setModelo("");
      setKmAtual(0);
      await carregar();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar veículo.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAtivo = async (v: VeiculoDto) => {
    await api.alterarStatusVeiculo(v.id, !v.ativo);
    await carregar();
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ph-text-primary">
            Frota de Veículos (Carros e Caminhões)
          </h1>
          <p className="text-sm text-ph-text-secondary mt-1">
            Gerencie os carros e caminhões que são sincronizados para o cache
            offline dos motoristas.
          </p>
        </div>

        {/* Formulário de Novo Veículo */}
        <form
          onSubmit={handleCriar}
          className="bg-ph-surface p-5 rounded-xl border border-ph-border shadow-sm space-y-4 transition-colors"
        >
          <h2 className="text-sm font-bold text-ph-text-primary flex items-center gap-2">
            <Plus className="w-4 h-4 text-ph-primary" /> Cadastrar Novo Veículo
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
              maxLength={8}
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="Placa (ex: ABC1D23)"
              className="px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary uppercase font-mono focus:outline-none focus:ring-1 focus:ring-ph-primary"
            />
            <input
              type="text"
              required
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Modelo (ex: Scania R500)"
              className="px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary lg:col-span-2 focus:outline-none focus:ring-1 focus:ring-ph-primary"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoVeiculo)}
              className="px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-ph-primary"
            >
              <option value="CARRO">CARRO</option>
              <option value="CAMINHONETE">CAMINHONETE</option>
              <option value="TOCO">TOCO</option>
              <option value="TRUCK">TRUCK</option>
              <option value="CAVALO_MECANICO">CAVALO-MECANICO</option>
              <option value="REBOQUE">REBOQUE</option>
            </select>
            <input
              type="number"
              required
              min={0}
              value={kmAtual}
              onChange={(e) => setKmAtual(Number(e.target.value))}
              placeholder="Hodômetro (KM)"
              className="px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary focus:outline-none focus:ring-1 focus:ring-ph-primary"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-ph-primary hover:bg-ph-primary-pressed text-white shadow-sm transition-colors"
            >
              {saving ? "Cadastrando..." : "Adicionar à Frota"}
            </button>
          </div>
        </form>

        {/* Tabela de Veículos */}
        <div className="bg-ph-surface rounded-xl border border-ph-border shadow-sm overflow-hidden transition-colors">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ph-sidebar-bg border-b border-ph-border text-[11px] font-bold text-ph-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Placa</th>
                <th className="py-3 px-4">Modelo</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Hodômetro Atual</th>
                <th className="py-3 px-4">Status no Catálogo</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ph-border text-sm">
              {veiculos.map((v) => (
                <tr key={v.id} className="hover:bg-ph-grid-hover transition-colors">
                  <td className="py-3.5 px-4 font-bold font-mono text-ph-text-primary">
                    <span className="inline-flex items-center gap-2">
                      <Truck className="w-4 h-4 text-ph-primary" />
                      {v.placa}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-ph-text-primary font-medium">
                    {v.modelo}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-ph-text-secondary">
                    {LABELS_TIPO_VEICULO[v.tipo] || v.tipo}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-ph-text-secondary">
                    {v.kmAtual.toLocaleString("pt-BR")} km
                  </td>
                  <td className="py-3.5 px-4">
                    {v.ativo ? (
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
                      onClick={() => handleToggleAtivo(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        v.ativo
                          ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900"
                          : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-900"
                      }`}
                    >
                      {v.ativo ? "Inativar" : "Reativar"}
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
