"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  api,
  ChecklistResumoDto,
  DashboardResumoDto,
} from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  PlusCircle,
  RefreshCw,
  Truck,
  UploadCloud,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumoDto | null>(null);
  const [recentes, setRecentes] = useState<ChecklistResumoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const [dashData, listaData] = await Promise.all([
        api.obterDashboard(),
        api.listarChecklists(),
      ]);
      setResumo(dashData);
      setRecentes(listaData.slice(0, 8));
    } catch (err: unknown) {
      setErro(
        err instanceof Error
          ? err.message
          : "Erro ao comunicar com o backend Spring Boot."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleSimularSync = async (comUploadFotoImediato: boolean) => {
    setSimulating(true);
    setErro(null);
    try {
      await api.simularSyncOfflineEmDuasEtapas(comUploadFotoImediato);
      await carregarDados();
    } catch (err: unknown) {
      setErro(
        err instanceof Error
          ? err.message
          : "Falha ao simular sincronização offline."
      );
    } finally {
      setSimulating(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Visão Geral da Frota & Sincronização
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Acompanhe em tempo real os checklists enviados da estrada e o
              status da fila de fotos de avarias.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSimularSync(false)}
              disabled={simulating}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors"
              title="Simula chegada do JSON leve na Etapa 1 (3G fraco), deixando a foto pendente na Etapa 2"
            >
              <Clock className="w-4 h-4" />
              Simular Etapa 1 (Aguardando Foto)
            </button>
            <button
              onClick={() => handleSimularSync(true)}
              disabled={simulating}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
              title="Simula o envio do JSON (Etapa 1) seguido imediatamente pelo upload Multipart da foto de avaria (Etapa 2)"
            >
              <UploadCloud className="w-4 h-4" />
              Simular Sync Completo (2 Etapas + Foto)
            </button>
            <button
              onClick={carregarDados}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
              title="Atualizar indicadores"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {erro && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {erro}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Total de Vistorias</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {resumo?.totalChecklists ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Recebidas via fila offline
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm">
            <div className="flex items-center justify-between text-rose-700 text-xs font-semibold uppercase">
              <span>Com Avarias</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-3xl font-bold text-rose-600 mt-2">
              {resumo?.checklistsComAvaria ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Exigem atenção da manutenção
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between text-amber-700 text-xs font-semibold uppercase">
              <span>Aguardando Fotos</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {resumo?.checklistsAguardandoFotos ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Etapa 1 salva, subindo mídia
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Caminhões Ativos</span>
              <Truck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {resumo?.totalVeiculosAtivos ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Disponíveis no catálogo offline
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Modelos Ativos</span>
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {resumo?.totalTemplatesAtivos ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Formulários dinâmicos publicados
            </p>
          </div>
        </div>

        {/* Últimas Vistorias Sincronizadas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Últimas Vistorias Sincronizadas
              </h2>
              <p className="text-xs text-slate-500">
                Comparativo entre horário real na estrada (Offline) e chegada no
                servidor
              </p>
            </div>
            <Link
              href="/checklists"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Ver todas as vistorias <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentes.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-sm text-slate-600 font-medium">
                Nenhuma vistoria sincronizada ainda.
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Use o botão{" "}
                <strong>&quot;Simular Sync Completo (2 Etapas + Foto)&quot;</strong>{" "}
                no topo da tela ou envie uma vistoria pelo aplicativo Flutter
                para visualizar os dados aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Veículo / Placa</th>
                    <th className="py-3 px-4">Formulário</th>
                    <th className="py-3 px-4">Motorista</th>
                    <th className="py-3 px-4">Hodômetro</th>
                    <th className="py-3 px-4">Realizado (Offline)</th>
                    <th className="py-3 px-4">Status Sync</th>
                    <th className="py-3 px-4">Condição</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {recentes.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {c.veiculoPlaca}
                        </div>
                        <div className="text-xs text-slate-500">
                          {c.veiculoModelo}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {c.templateTitulo}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {c.motoristaNome}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {c.kmVistoria.toLocaleString("pt-BR")} km
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {new Date(c.realizadoEm).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.statusSincronizacao === "CONCLUIDO" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Concluído
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Aguardando Fotos
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.possuiAvaria ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Com Avaria
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              Sem Avarias
                            </span>
                          )}
                          {c.alertaInconsistencia && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800"
                              title={c.motivoInconsistencia || ""}
                            >
                              Inativado no Sync
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/checklists/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-blue-600 text-white transition-colors"
                        >
                          Inspecionar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
