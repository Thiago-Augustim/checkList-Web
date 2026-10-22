"use client";

import React, { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api, LABELS_TIPO_VEICULO, TipoVeiculo, VeiculoDto } from "@/lib/api";
import { CheckCircle2, Plus, Truck, XCircle } from "lucide-react";

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<VeiculoDto[]>([]);
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [tipo, setTipo] = useState<TipoVeiculo>("CAVALO");
  const [kmAtual, setKmAtual] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
          <h1 className="text-2xl font-bold text-slate-900">
            Frota de Veículos (Carros e Caminhões)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie os carros e caminhões que são sincronizados para o cache
            offline dos motoristas.
          </p>
        </div>

        {/* Formulário de Novo Veículo */}
        <form
          onSubmit={handleCriar}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4"
        >
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" /> Cadastrar Novo Veículo
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
              maxLength={8}
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="Placa (ex: ABC1D23)"
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 uppercase font-mono"
            />
            <input
              type="text"
              required
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Modelo (ex: Scania R500)"
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 lg:col-span-2"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoVeiculo)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option value="CARRO">Carro Leve / Passeio</option>
              <option value="UTILITARIO">Utilitário / VUC</option>
              <option value="TOCO">Caminhão Toco (4x2)</option>
              <option value="TRUCK">Caminhão Truck (6x2)</option>
              <option value="CAVALO">Cavalo Mecânico</option>
              <option value="CARRETA">Carreta / Implemento</option>
            </select>
            <input
              type="number"
              required
              min={0}
              value={kmAtual}
              onChange={(e) => setKmAtual(Number(e.target.value))}
              placeholder="Hodômetro (KM)"
              className="px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {saving ? "Cadastrando..." : "Adicionar à Frota"}
            </button>
          </div>
        </form>

        {/* Tabela de Veículos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Placa</th>
                <th className="py-3 px-4">Modelo</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Hodômetro Atual</th>
                <th className="py-3 px-4">Status no Catálogo</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {veiculos.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                    <span className="inline-flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      {v.placa}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">
                    {v.modelo}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                    {LABELS_TIPO_VEICULO[v.tipo] || v.tipo}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                    {v.kmAtual.toLocaleString("pt-BR")} km
                  </td>
                  <td className="py-3.5 px-4">
                    {v.ativo ? (
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
                      onClick={() => handleToggleAtivo(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        v.ativo
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
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
