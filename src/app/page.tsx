"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  RefreshCw,
  Truck,
  UploadCloud,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
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
            <h1 className="text-2xl font-bold text-ph-text-primary">
              Visão Geral da Frota &amp; Sincronização
            </h1>
            <p className="text-sm text-ph-text-secondary mt-1">
              Acompanhe em tempo real os checklists enviados da estrada e o
              status da fila de fotos de avarias.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSimularSync(false)}
              disabled={simulating}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 transition-colors shadow-sm"
              title="Simula chegada do JSON leve na Etapa 1 (3G fraco), deixando a foto pendente na Etapa 2"
            >
              <Clock className="w-4 h-4" />
              Simular Etapa 1 (Aguardando Foto)
            </button>
            <button
              onClick={() => handleSimularSync(true)}
              disabled={simulating}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-ph-primary hover:bg-ph-primary-pressed text-white shadow-sm transition-colors"
              title="Simula o envio do JSON (Etapa 1) seguido imediatamente pelo upload Multipart da foto de avaria (Etapa 2)"
            >
              <UploadCloud className="w-4 h-4" />
              Simular Sync Completo (2 Etapas + Foto)
            </button>
            <button
              onClick={carregarDados}
              className="p-2 rounded-lg border border-ph-border bg-ph-surface hover:bg-ph-grid-hover text-ph-text-secondary hover:text-ph-text-primary transition-colors shadow-sm"
              title="Atualizar indicadores"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {erro && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
            {erro}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-ph-surface p-5 rounded-xl border border-ph-border shadow-sm transition-colors">
            <div className="flex items-center justify-between text-ph-text-secondary text-xs font-semibold uppercase">
              <span>Total de Vistorias</span>
              <CheckCircle2 className="w-4 h-4 text-ph-primary" />
            </div>
            <p className="text-3xl font-bold text-ph-text-primary mt-2">
              {resumo?.totalChecklists ?? 0}
            </p>
            <p className="text-xs text-ph-text-secondary mt-1">
              Recebidas via fila offline
            </p>
          </div>

          <div className="bg-ph-surface p-5 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-sm transition-colors">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-semibold uppercase">
              <span>Com Avarias</span>
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-2">
              {resumo?.checklistsComAvaria ?? 0}
            </p>
            <p className="text-xs text-ph-text-secondary mt-1">
              Exigem atenção da manutenção
            </p>
          </div>

          <div className="bg-ph-surface p-5 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm transition-colors">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase">
              <span>Aguardando Fotos</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
              {resumo?.checklistsAguardandoFotos ?? 0}
            </p>
            <p className="text-xs text-ph-text-secondary mt-1">
              Etapa 1 salva, subindo mídia
            </p>
          </div>

          <div className="bg-ph-surface p-5 rounded-xl border border-ph-border shadow-sm transition-colors">
            <div className="flex items-center justify-between text-ph-text-secondary text-xs font-semibold uppercase">
              <span>Caminhões Ativos</span>
              <Truck className="w-4 h-4 text-ph-primary" />
            </div>
            <p className="text-3xl font-bold text-ph-text-primary mt-2">
              {resumo?.totalVeiculosAtivos ?? 0}
            </p>
            <p className="text-xs text-ph-text-secondary mt-1">
              Disponíveis no catálogo offline
            </p>
          </div>

          <div className="bg-ph-surface p-5 rounded-xl border border-ph-border shadow-sm transition-colors">
            <div className="flex items-center justify-between text-ph-text-secondary text-xs font-semibold uppercase">
              <span>Modelos Ativos</span>
              <FileSpreadsheet className="w-4 h-4 text-ph-primary" />
            </div>
            <p className="text-3xl font-bold text-ph-text-primary mt-2">
              {resumo?.totalTemplatesAtivos ?? 0}
            </p>
            <p className="text-xs text-ph-text-secondary mt-1">
              Formulários dinâmicos publicados
            </p>
          </div>
        </div>

        {/* Últimas Vistorias Sincronizadas */}
        <div className="bg-ph-surface rounded-xl border border-ph-border shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-ph-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ph-text-primary">
                Últimas Vistorias Sincronizadas
              </h2>
              <p className="text-xs text-ph-text-secondary">
                Comparativo entre horário real na estrada (Offline) e chegada no
                servidor
              </p>
            </div>
            <Link
              href="/checklists"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ph-primary hover:underline"
            >
              Ver todas as vistorias <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentes.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-sm text-ph-text-secondary font-medium">
                Nenhuma vistoria sincronizada ainda.
              </p>
              <p className="text-xs text-ph-sidebar-muted max-w-md mx-auto">
                Use o botão{" "}
                <strong className="text-ph-text-primary">&quot;Simular Sync Completo (2 Etapas + Foto)&quot;</strong>{" "}
                no topo da tela ou envie uma vistoria pelo aplicativo Flutter
                para visualizar os dados aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ph-sidebar-bg border-b border-ph-border text-[11px] font-bold text-ph-text-secondary uppercase tracking-wider">
                    <th className="py-2 px-3">Placa</th>
                    <th className="py-2 px-3">Formulário</th>
                    <th className="py-2 px-3">Motorista</th>
                    <th className="py-2 px-3">Hodômetro</th>
                    <th className="py-2 px-3">Realizado (Offline)</th>
                    <th className="py-2 px-3">Status Sync</th>
                    <th className="py-2 px-3">Condição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ph-border text-sm">
                  {recentes.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/checklists/${c.id}`)}
                      className="hover:bg-ph-grid-hover transition-colors cursor-pointer"
                      title="Clique para detalhar esta vistoria"
                    >
                      <td className="py-2 px-3">
                        <span className="font-bold font-mono text-ph-text-primary">
                          {c.veiculoPlaca}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-ph-text-primary">
                        {c.templateTitulo}
                      </td>
                      <td className="py-2 px-3 text-ph-text-secondary">
                        {c.motoristaNome}
                      </td>
                      <td className="py-2 px-3 text-ph-text-secondary font-mono text-xs">
                        {c.kmVistoria.toLocaleString("pt-BR")} km
                      </td>
                      <td className="py-2 px-3 text-xs text-ph-text-secondary">
                        {new Date(c.realizadoEm).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2 px-3">
                        {c.statusSincronizacao === "CONCLUIDO" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Concluído
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            Aguardando Fotos
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1">
                          {c.possuiAvaria ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <AlertTriangle className="w-3 h-3" />
                              Avaria
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-ph-sidebar-bg text-ph-text-secondary border border-ph-border">
                              Sem Avarias
                            </span>
                          )}
                          {c.alertaInconsistencia && (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                              title={c.motivoInconsistencia || ""}
                            >
                              Inativado no Sync
                            </span>
                          )}
                        </div>
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
