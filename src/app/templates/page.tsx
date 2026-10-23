"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  api,
  LABELS_TIPO_VEICULO,
  PerguntaDto,
  TemplateDto,
  TipoResposta,
  TipoVeiculo,
} from "@/lib/api";
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  FileText,
  Plus,
  Power,
  ShieldCheck,
  Trash2,
  Truck,
  X,
  XCircle,
} from "lucide-react";

const novaPergunta = (ordem: number): PerguntaDto => ({
  enunciado: "",
  tipoResposta: "BOOLEANO",
  ordem,
  obrigatoria: true,
  exigeFotoSeAvaria: false,
  valorGatilhoAvaria: "FALSE",
});

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarInativos, setMostrarInativos] = useState(false);

  // Estado do modal (edição ou criação)
  const [modalAberto, setModalAberto] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusAtivo, setStatusAtivo] = useState<boolean | null>(null);
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [snapshotInicial, setSnapshotInicial] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState<TipoVeiculo>("CAVALO_MECANICO");
  const [perguntas, setPerguntas] = useState<PerguntaDto[]>([]);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const templatesVisiveis = useMemo(
    () => (mostrarInativos ? templates : templates.filter((t) => t.ativo)),
    [templates, mostrarInativos]
  );

  const snapshotAtual = JSON.stringify({
    titulo,
    descricao,
    tipoVeiculo,
    perguntas,
  });
  const possuiAlteracoes = modalAberto && snapshotAtual !== snapshotInicial;

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await api.listarTemplates(false);
      setTemplates(lista);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const preencherFormulario = (
    dados: {
      titulo: string;
      descricao: string;
      tipoVeiculo: TipoVeiculo;
      perguntas: PerguntaDto[];
    },
    id: string | null,
    ativo: boolean | null
  ) => {
    setEditingId(id);
    setStatusAtivo(ativo);
    setTitulo(dados.titulo);
    setDescricao(dados.descricao);
    setTipoVeiculo(dados.tipoVeiculo);
    setPerguntas(dados.perguntas);
    setSnapshotInicial(JSON.stringify(dados));
    setErro(null);
    setModalAberto(true);
  };

  const abrirNovoFormulario = () => {
    preencherFormulario(
      {
        titulo: "",
        descricao: "",
        tipoVeiculo: "CAVALO_MECANICO",
        perguntas: [{ ...novaPergunta(1), exigeFotoSeAvaria: true }],
      },
      null,
      null
    );
  };

  const abrirFormulario = (t: TemplateDto) => {
    preencherFormulario(
      {
        titulo: t.titulo,
        descricao: t.descricao || "",
        tipoVeiculo: t.tipoVeiculo || "CAVALO_MECANICO",
        perguntas: t.perguntas.map((p, idx) => ({ ...p, ordem: idx + 1 })),
      },
      t.id,
      t.ativo
    );
  };

  const fecharModal = useCallback(() => {
    if (
      possuiAlteracoes &&
      !window.confirm("Existem alterações não salvas. Deseja descartá-las?")
    ) {
      return;
    }
    setModalAberto(false);
  }, [possuiAlteracoes]);

  // Esc fecha o modal e trava o scroll da página enquanto ele está aberto
  useEffect(() => {
    if (!modalAberto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") fecharModal();
    };
    window.addEventListener("keydown", onKeyDown);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflowAnterior;
    };
  }, [modalAberto, fecharModal]);

  const adicionarPergunta = () => {
    setPerguntas((prev) => [...prev, novaPergunta(prev.length + 1)]);
    requestAnimationFrame(() => {
      const corpo = document.getElementById("modal-template-corpo");
      corpo?.scrollTo({ top: corpo.scrollHeight, behavior: "smooth" });
    });
  };

  const removerPergunta = (index: number) => {
    setPerguntas((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...item, ordem: idx + 1 }))
    );
  };

  const atualizarPergunta = (
    index: number,
    patch: Partial<PerguntaDto>
  ) => {
    setPerguntas((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const atualizado = { ...item, ...patch };
        if (patch.tipoResposta === "BOOLEANO") {
          atualizado.valorGatilhoAvaria = "FALSE";
        } else if (patch.tipoResposta === "ESCALA_1_5") {
          atualizado.valorGatilhoAvaria = "2";
        } else if (patch.tipoResposta === "TEXTO") {
          atualizado.exigeFotoSeAvaria = false;
          atualizado.valorGatilhoAvaria = null;
        }
        return atualizado;
      })
    );
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (perguntas.length === 0) {
      setErro("Adicione pelo menos uma pergunta ao modelo de checklist.");
      return;
    }
    setSaving(true);
    setErro(null);
    try {
      const payload = {
        titulo,
        descricao,
        tipoVeiculo,
        perguntas: perguntas.map((p, idx) => ({
          ...p,
          ordem: idx + 1,
        })),
      };
      if (editingId) {
        await api.atualizarTemplate(editingId, payload);
      } else {
        await api.criarTemplate(payload);
      }
      setModalAberto(false);
      await carregar();
    } catch (err: unknown) {
      setErro(
        err instanceof Error ? err.message : "Erro ao salvar formulário."
      );
    } finally {
      setSaving(false);
    }
  };

  const limparCamposECancelarErro = () => {
    setErro(null);
    if (!editingId) {
      setTitulo("");
      setDescricao("");
      setTipoVeiculo("CAVALO_MECANICO");
      setPerguntas([{ ...novaPergunta(1), exigeFotoSeAvaria: true }]);
    } else {
      try {
        const inicial = JSON.parse(snapshotInicial);
        setTitulo(inicial.titulo || "");
        setDescricao(inicial.descricao || "");
        setTipoVeiculo(inicial.tipoVeiculo || "CAVALO_MECANICO");
        setPerguntas(inicial.perguntas || []);
      } catch {
        setTitulo("");
        setDescricao("");
        setPerguntas([]);
      }
    }
  };

  const handleToggleAtivo = async () => {
    if (!editingId || statusAtivo === null) return;
    setAlterandoStatus(true);
    setErro(null);
    try {
      const atualizado = await api.alterarStatusTemplate(
        editingId,
        !statusAtivo
      );
      setStatusAtivo(atualizado?.ativo ?? !statusAtivo);
      await carregar();
    } catch (err: unknown) {
      setErro(
        err instanceof Error ? err.message : "Erro ao alterar status."
      );
    } finally {
      setAlterandoStatus(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ph-text-primary">
              Modelos de Checklist &amp; Perguntas Dinâmicas
            </h1>
            <p className="text-sm text-ph-text-secondary mt-1">
              Crie formulários com perguntas tipo Booleano, Escala (1 a 5) ou
              Texto e configure gatilhos automáticos de foto em caso de avaria.
            </p>
          </div>
          <button
            id="novo-template"
            onClick={abrirNovoFormulario}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-ph-primary hover:bg-ph-primary-pressed text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Modelo de Checklist
          </button>
        </div>

        {/* Nota de Imutabilidade e Soft Delete */}
        <div className="p-4 rounded-xl bg-ph-primary-bg border border-ph-primary/20 text-ph-text-primary flex items-center gap-3 text-xs transition-colors">
          <ShieldCheck className="w-5 h-5 text-ph-primary shrink-0" />
          <span>
            <strong>Proteção de Histórico Offline-First:</strong> Quando você
            edita o enunciado ou o tipo de uma pergunta que já possui respostas,
            o Spring Boot aplica <em>Soft Delete</em> (`ativo = false`) na versão
            anterior e cria um novo UUID automaticamente, garantindo que
            vistorias antigas e sincronizações offline atrasadas nunca quebrem.
          </span>
        </div>

        {/* Lista de Modelos Cadastrados */}
        <div className="bg-ph-surface rounded-xl border border-ph-border shadow-sm overflow-hidden transition-colors">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ph-border bg-ph-sidebar-bg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ph-text-secondary">
              {templatesVisiveis.length}{" "}
              {templatesVisiveis.length === 1 ? "formulário" : "formulários"}
            </span>
            <label
              htmlFor="ver-formularios-desativados"
              className="inline-flex items-center gap-2 text-xs font-medium text-ph-text-secondary cursor-pointer select-none"
            >
              <input
                id="ver-formularios-desativados"
                type="checkbox"
                checked={mostrarInativos}
                onChange={(e) => setMostrarInativos(e.target.checked)}
                className="rounded border-ph-border text-ph-primary focus:ring-ph-primary"
              />
              Ver formulários desativados
            </label>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-ph-text-secondary">
              Carregando modelos de checklist...
            </div>
          ) : templatesVisiveis.length === 0 ? (
            <div className="p-8 text-center text-sm text-ph-text-secondary">
              {mostrarInativos
                ? "Nenhum formulário cadastrado."
                : "Nenhum formulário ativo. Marque “Ver formulários desativados” para ver os inativos."}
            </div>
          ) : (
            <ul className="divide-y divide-ph-border">
              {templatesVisiveis.map((t) => (
                <li key={t.id}>
                  <button
                    id={`template-${t.id}`}
                    onClick={() => abrirFormulario(t)}
                    className={`group w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ph-grid-hover ${
                      t.ativo ? "" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-ph-sidebar-bg border border-ph-border group-hover:border-ph-primary/40 text-ph-text-secondary group-hover:text-ph-primary flex items-center justify-center shrink-0 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-sm text-ph-text-primary truncate">
                        {t.titulo}
                      </span>
                      {!t.ativo && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ph-sidebar-bg border border-ph-border text-ph-sidebar-muted shrink-0">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-ph-primary-bg text-ph-primary border border-ph-primary/20">
                        <Truck className="w-3 h-3" />
                        {LABELS_TIPO_VEICULO[t.tipoVeiculo] || t.tipoVeiculo}
                      </span>
                      <ChevronRight className="w-4 h-4 text-ph-sidebar-muted group-hover:text-ph-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal do Formulário (edição / criação) */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) fecharModal();
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-template-titulo"
            onSubmit={handleSalvar}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-ph-surface border border-ph-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-ph-border">
              <div className="flex items-center gap-2 min-w-0">
                <h2
                  id="modal-template-titulo"
                  className="text-base font-bold text-ph-text-primary truncate"
                >
                  {editingId ? "Editar Formulário" : "Novo Formulário"}
                </h2>
                {statusAtivo !== null &&
                  (statusAtivo ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-ph-sidebar-bg border border-ph-border text-ph-sidebar-muted shrink-0">
                      <XCircle className="w-3 h-3" /> Inativo
                    </span>
                  ))}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {editingId && statusAtivo !== null && (
                  <button
                    id="modal-template-status"
                    type="button"
                    onClick={handleToggleAtivo}
                    disabled={alterandoStatus}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                      statusAtivo
                        ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900"
                        : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-900"
                    }`}
                    title={
                      statusAtivo
                        ? "Desativar formulário no app"
                        : "Reativar formulário no app"
                    }
                  >
                    <Power className="w-3.5 h-3.5" />
                    {alterandoStatus
                      ? "Salvando..."
                      : statusAtivo
                      ? "Desativar"
                      : "Reativar"}
                  </button>
                )}
                <button
                  id="modal-template-fechar"
                  type="button"
                  onClick={fecharModal}
                  className="p-1.5 rounded-lg text-ph-sidebar-muted hover:text-ph-text-primary hover:bg-ph-grid-hover transition-colors"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Corpo */}
            <div
              id="modal-template-corpo"
              className="flex-1 overflow-y-auto p-5 space-y-5"
            >
              {erro && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="template-titulo"
                    className="block text-[11px] font-semibold text-ph-text-secondary uppercase mb-1"
                  >
                    Nome do formulário *
                  </label>
                  <input
                    id="template-titulo"
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Vistoria Pré-Viagem Carreta"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary focus:outline-none focus:ring-1 focus:ring-ph-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="template-tipo-veiculo"
                    className="block text-[11px] font-semibold text-ph-text-secondary uppercase mb-1"
                  >
                    Tipo de veículo *
                  </label>
                  <select
                    id="template-tipo-veiculo"
                    value={tipoVeiculo}
                    onChange={(e) =>
                      setTipoVeiculo(e.target.value as TipoVeiculo)
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-ph-primary"
                  >
                    {(
                      Object.keys(LABELS_TIPO_VEICULO) as TipoVeiculo[]
                    ).map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {LABELS_TIPO_VEICULO[tipo]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="template-descricao"
                    className="block text-[11px] font-semibold text-ph-text-secondary uppercase mb-1"
                  >
                    Instrução para o motorista
                  </label>
                  <input
                    id="template-descricao"
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Preencher antes de ligar o motor no pátio"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary focus:outline-none focus:ring-1 focus:ring-ph-primary"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-ph-text-secondary">
                  Perguntas ({perguntas.length})
                </h3>

                {perguntas.length === 0 && (
                  <p className="text-xs text-ph-sidebar-muted italic">
                    Nenhuma pergunta. Adicione pelo menos uma.
                  </p>
                )}

                {perguntas.map((p, idx) => (
                  <div
                    key={p.id || `nova-${idx}`}
                    className="p-3 rounded-xl bg-ph-sidebar-bg border border-ph-border space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-ph-surface border border-ph-border text-ph-text-secondary font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        id={`pergunta-${idx}-enunciado`}
                        type="text"
                        required
                        value={p.enunciado}
                        onChange={(e) =>
                          atualizarPergunta(idx, { enunciado: e.target.value })
                        }
                        placeholder="Enunciado da pergunta..."
                        className="flex-1 min-w-0 px-2.5 py-1.5 text-sm rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary focus:outline-none focus:ring-1 focus:ring-ph-primary"
                      />
                      <select
                        id={`pergunta-${idx}-tipo`}
                        value={p.tipoResposta}
                        onChange={(e) =>
                          atualizarPergunta(idx, {
                            tipoResposta: e.target.value as TipoResposta,
                          })
                        }
                        className="px-2 py-1.5 text-xs font-semibold rounded-lg border border-ph-border bg-ph-surface text-ph-text-primary focus:outline-none focus:ring-1 focus:ring-ph-primary"
                      >
                        <option value="BOOLEANO">Conforme / Não</option>
                        <option value="ESCALA_1_5">Escala 1 a 5</option>
                        <option value="TEXTO">Texto livre</option>
                      </select>
                      <button
                        id={`pergunta-${idx}-remover`}
                        type="button"
                        onClick={() => removerPergunta(idx)}
                        className="p-1.5 rounded-lg text-ph-sidebar-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Remover pergunta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pl-8 text-[11px]">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-ph-text-secondary font-medium">
                        <input
                          type="checkbox"
                          checked={p.obrigatoria}
                          onChange={(e) =>
                            atualizarPergunta(idx, {
                              obrigatoria: e.target.checked,
                            })
                          }
                          className="rounded border-ph-border text-ph-primary focus:ring-ph-primary"
                        />
                        Obrigatória
                      </label>

                      {p.tipoResposta !== "TEXTO" && (
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-ph-text-secondary font-medium">
                          <input
                            type="checkbox"
                            checked={p.exigeFotoSeAvaria}
                            onChange={(e) =>
                              atualizarPergunta(idx, {
                                exigeFotoSeAvaria: e.target.checked,
                              })
                            }
                            className="rounded border-ph-border text-ph-primary focus:ring-ph-primary"
                          />
                          <Camera className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          Exigir foto se avaria (
                          {p.tipoResposta === "BOOLEANO"
                            ? "resposta NÃO"
                            : "nota ≤ 2"}
                          )
                        </label>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  id="adicionar-pergunta"
                  type="button"
                  onClick={adicionarPergunta}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-ph-border text-xs font-semibold text-ph-text-secondary hover:border-ph-primary hover:text-ph-primary hover:bg-ph-grid-hover transition-colors"
                >
                  <Plus className="w-4 h-4" /> Adicionar pergunta
                </button>
              </div>
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-t border-ph-border bg-ph-sidebar-bg">
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                {possuiAlteracoes ? "• Alterações não salvas" : ""}
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="modal-template-cancelar"
                  type="button"
                  onClick={fecharModal}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-ph-border text-ph-text-secondary hover:bg-ph-surface hover:text-ph-text-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="modal-template-salvar"
                  type="submit"
                  disabled={saving || (!!editingId && !possuiAlteracoes)}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-ph-primary hover:bg-ph-primary-pressed text-white shadow-sm disabled:opacity-50 transition-colors"
                >
                  {saving
                    ? "Salvando..."
                    : editingId
                    ? "Salvar alterações"
                    : "Criar formulário"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
