"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  api,
  ChecklistResumoDto,
  StatusSincronizacao,
  VeiculoDto,
} from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react";

const ITENS_POR_PAGINA = 15;

/** Gera a lista de páginas visíveis com reticências, ex: [1, "...", 4, 5, 6, "...", 12] */
function gerarPaginasVisiveis(
  paginaAtual: number,
  totalPaginas: number
): (number | "...")[] {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }
  const paginas: (number | "...")[] = [1];
  const inicio = Math.max(2, paginaAtual - 1);
  const fim = Math.min(totalPaginas - 1, paginaAtual + 1);
  if (inicio > 2) paginas.push("...");
  for (let p = inicio; p <= fim; p++) paginas.push(p);
  if (fim < totalPaginas - 1) paginas.push("...");
  paginas.push(totalPaginas);
  return paginas;
}

export default function ChecklistsListPage() {
  const [checklists, setChecklists] = useState<ChecklistResumoDto[]>([]);
  const [veiculos, setVeiculos] = useState<VeiculoDto[]>([]);
  const [filtroAvaria, setFiltroAvaria] = useState<string>("TODOS");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroVeiculo, setFiltroVeiculo] = useState<string>("TODOS");
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);

  const totalPaginas = Math.max(
    1,
    Math.ceil(checklists.length / ITENS_POR_PAGINA)
  );

  const checklistsDaPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return checklists.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [checklists, paginaAtual]);

  // Volta para a primeira página quando os filtros mudam
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroAvaria, filtroStatus, filtroVeiculo]);

  // Garante que a página atual continua válida após recarregar a lista
  useEffect(() => {
    if (paginaAtual > totalPaginas) setPaginaAtual(totalPaginas);
  }, [paginaAtual, totalPaginas]);

  const irParaPagina = (pagina: number) => {
    setPaginaAtual(Math.min(Math.max(1, pagina), totalPaginas));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [listaVeiculos, listaChecklists] = await Promise.all([
        api.listarVeiculos(false),
        api.listarChecklists({
          possuiAvaria:
            filtroAvaria === "COM_AVARIA"
              ? true
              : filtroAvaria === "SEM_AVARIA"
              ? false
              : undefined,
          status:
            filtroStatus !== "TODOS"
              ? (filtroStatus as StatusSincronizacao)
              : undefined,
          veiculoId: filtroVeiculo !== "TODOS" ? filtroVeiculo : undefined,
        }),
      ]);
      setVeiculos(listaVeiculos);
      setChecklists(listaChecklists);
    } finally {
      setLoading(false);
    }
  }, [filtroAvaria, filtroStatus, filtroVeiculo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Vistorias Recebidas & Auditoria de Avarias
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Consulte todos os checklists sincronizados pelos motoristas e
              verifique o status das fotos de avarias.
            </p>
          </div>
          <button
            onClick={carregar}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar Lista
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
            <Filter className="w-4 h-4" />
            Filtros:
          </div>

          <select
            value={filtroAvaria}
            onChange={(e) => setFiltroAvaria(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white"
          >
            <option value="TODOS">Todas as condições</option>
            <option value="COM_AVARIA">Apenas com avaria detectada</option>
            <option value="SEM_AVARIA">Sem avarias</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white"
          >
            <option value="TODOS">Todos os status de sincronização</option>
            <option value="CONCLUIDO">Sincronização Concluída</option>
            <option value="AGUARDANDO_FOTOS">
              Aguardando Upload de Fotos (Etapa 2)
            </option>
          </select>

          <select
            value={filtroVeiculo}
            onChange={(e) => setFiltroVeiculo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white"
          >
            <option value="TODOS">Todos os veículos</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} — {v.modelo}
              </option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {checklists.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Nenhuma vistoria encontrada para os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Veículo</th>
                    <th className="py-3 px-4">Modelo de Checklist</th>
                    <th className="py-3 px-4">Motorista</th>
                    <th className="py-3 px-4">Hodômetro</th>
                    <th className="py-3 px-4">Preenchido (Offline)</th>
                    <th className="py-3 px-4">Sincronizado (Servidor)</th>
                    <th className="py-3 px-4">Status Sync</th>
                    <th className="py-3 px-4">Avarias</th>
                    <th className="py-3 px-4 text-right">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {checklistsDaPagina.map((c) => (
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
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {c.kmVistoria.toLocaleString("pt-BR")} km
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {new Date(c.realizadoEm).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(c.sincronizadoEm).toLocaleString("pt-BR")}
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
                        {c.possuiAvaria ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Com Avaria
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/checklists/${c.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-blue-600 text-white transition-colors"
                        >
                          Ver Respostas & Fotos
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Controlador de Páginas */}
          {checklists.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50">
              <span className="text-xs text-slate-500">
                Mostrando{" "}
                <strong className="text-slate-700">
                  {(paginaAtual - 1) * ITENS_POR_PAGINA + 1}–
                  {Math.min(paginaAtual * ITENS_POR_PAGINA, checklists.length)}
                </strong>{" "}
                de{" "}
                <strong className="text-slate-700">{checklists.length}</strong>{" "}
                vistorias
              </span>

              <nav
                className="flex items-center gap-1"
                aria-label="Paginação das vistorias"
              >
                <button
                  id="pagina-primeira"
                  onClick={() => irParaPagina(1)}
                  disabled={paginaAtual === 1}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none"
                  title="Primeira página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  id="pagina-anterior"
                  onClick={() => irParaPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {gerarPaginasVisiveis(paginaAtual, totalPaginas).map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-xs text-slate-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      id={`pagina-${p}`}
                      onClick={() => irParaPagina(p)}
                      aria-current={p === paginaAtual ? "page" : undefined}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors ${
                        p === paginaAtual
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  id="pagina-proxima"
                  onClick={() => irParaPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none"
                  title="Próxima página"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  id="pagina-ultima"
                  onClick={() => irParaPagina(totalPaginas)}
                  disabled={paginaAtual === totalPaginas}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none"
                  title="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
