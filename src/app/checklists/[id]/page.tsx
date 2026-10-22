"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  api,
  BACKEND_ORIGIN,
  ChecklistDetalheDto,
} from "@/lib/api";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  UploadCloud,
} from "lucide-react";

export default function ChecklistDetalhePage() {
  const params = useParams<{ id: string }>();
  const [detalhe, setDetalhe] = useState<ChecklistDetalheDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFotoId, setUploadingFotoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!params?.id) return;
    setLoading(true);
    try {
      const data = await api.buscarChecklistPorId(params.id);
      setDetalhe(data);
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSimularUploadFotoPendente = async (fotoId: string) => {
    setUploadingFotoId(fotoId);
    try {
      await api.enviarFotoSimulada(fotoId);
      await carregar();
    } finally {
      setUploadingFotoId(null);
    }
  };

  const renderValorResposta = (tipo: string, valor: string) => {
    if (tipo === "BOOLEANO") {
      const conforme = valor === "TRUE";
      return conforme ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          SIM (Conforme)
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          NÃO (Não Conforme)
        </span>
      );
    }
    if (tipo === "ESCALA_1_5") {
      const nota = Number(valor);
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
            nota <= 2
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : nota === 3
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          Nota {valor} / 5
        </span>
      );
    }
    return (
      <p className="text-sm text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        {valor || "—"}
      </p>
    );
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/checklists"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para lista de vistorias
        </Link>

        {loading || !detalhe ? (
          <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
            Carregando detalhes da vistoria...
          </div>
        ) : (
          <>
            {/* Alerta de Inconsistência Offline */}
            {detalhe.alertaInconsistencia && (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm">
                    Vistoria recebida com Alerta de Inconsistência Offline
                  </p>
                  <p>{detalhe.motivoInconsistencia}</p>
                  <p className="text-purple-700">
                    Como a vistoria física já havia sido executada na estrada, o
                    backend preservou o registro via Soft Delete.
                  </p>
                </div>
              </div>
            )}

            {/* Cabeçalho do Checklist */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono text-slate-400">
                    UUID Mobile (Idempotência): {detalhe.id}
                  </span>
                  <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                    {detalhe.templateTitulo}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  {detalhe.statusSincronizacao === "CONCLUIDO" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Sincronização 100% Concluída
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-4 h-4" />
                      Etapa 1 OK — Aguardando Upload de Fotos
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-400 uppercase font-semibold block">
                    Caminhão Vistoriado
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-1 block">
                    {detalhe.veiculoPlaca} — {detalhe.veiculoModelo}
                  </span>
                  <span className="text-slate-600 mt-0.5 block">
                    Hodômetro: {detalhe.kmVistoria.toLocaleString("pt-BR")} km
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-400 uppercase font-semibold block">
                    Motorista Responsável
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-1 block">
                    {detalhe.motoristaNome}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-400 uppercase font-semibold block">
                    Carimbo Duplo de Auditoria
                  </span>
                  <span className="text-slate-700 mt-1 block">
                    <strong>Na estrada:</strong>{" "}
                    {new Date(detalhe.realizadoEm).toLocaleString("pt-BR")}
                  </span>
                  <span className="text-slate-500 mt-0.5 block">
                    <strong>No servidor:</strong>{" "}
                    {new Date(detalhe.sincronizadoEm).toLocaleString("pt-BR")}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-400 uppercase font-semibold block">
                    Geolocalização GPS
                  </span>
                  {detalhe.latitude && detalhe.longitude ? (
                    <span className="inline-flex items-center gap-1 text-slate-700 font-mono mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {detalhe.latitude.toFixed(4)},{" "}
                      {detalhe.longitude.toFixed(4)}
                    </span>
                  ) : (
                    <span className="text-slate-400 mt-1 block">
                      Não informada
                    </span>
                  )}
                </div>
              </div>

              {detalhe.observacoesGerais && (
                <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                  <strong>Observações Gerais da Viagem:</strong>{" "}
                  {detalhe.observacoesGerais}
                </div>
              )}
            </div>

            {/* Lista de Respostas Dinâmicas e Fotos de Avarias */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Respostas do Formulário Dinâmico ({detalhe.respostas.length})
              </h2>

              {detalhe.respostas.map((r) => (
                <div
                  key={r.id}
                  className={`bg-white p-5 rounded-xl border shadow-sm space-y-3 ${
                    r.avariaDetectada
                      ? "border-rose-300 ring-1 ring-rose-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Pergunta #{r.ordemPergunta} • Tipo: {r.tipoResposta}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        {r.enunciadoPergunta}
                      </h3>
                    </div>
                    <div>
                      {renderValorResposta(r.tipoResposta, r.valorResposta)}
                    </div>
                  </div>

                  {r.observacaoAvaria && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      <strong>Relato da Avaria pelo Motorista:</strong>{" "}
                      {r.observacaoAvaria}
                    </div>
                  )}

                  {r.fotos.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        Fotos de Evidência da Avaria ({r.fotos.length})
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {r.fotos.map((f) => (
                          <div
                            key={f.id}
                            className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-3 space-y-2"
                          >
                            {f.statusUpload === "CONCLUIDO" && f.urlArquivo ? (
                              <img
                                src={`${BACKEND_ORIGIN}${f.urlArquivo}`}
                                alt="Foto de avaria"
                                className="w-full h-48 object-cover rounded-lg border border-slate-200 bg-slate-900"
                              />
                            ) : (
                              <div className="h-48 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center p-4 text-center space-y-2">
                                <Clock className="w-6 h-6 text-amber-600" />
                                <p className="text-xs font-semibold text-amber-900">
                                  Foto aguardando Etapa 2 na fila do celular
                                </p>
                                <button
                                  onClick={() =>
                                    handleSimularUploadFotoPendente(f.id)
                                  }
                                  disabled={uploadingFotoId === f.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                                >
                                  <UploadCloud className="w-3.5 h-3.5" />
                                  {uploadingFotoId === f.id
                                    ? "Subindo foto..."
                                    : "Simular Chegada desta Foto (Etapa 2)"}
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>
                                Capturada:{" "}
                                {new Date(f.capturadaEm).toLocaleString(
                                  "pt-BR"
                                )}
                              </span>
                              <span className="font-semibold">
                                {f.statusUpload}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
