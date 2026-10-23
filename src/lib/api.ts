export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://checklist-backend-w9vf.onrender.com/api/v1";
//http://localhost:8080/api/v1
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export type PerfilUsuario = "GESTOR" | "MOTORISTA";
export type TipoVeiculo =
  | "CARRO"
  | "CAMINHONETE"
  | "TOCO"
  | "TRUCK"
  | "CAVALO_MECANICO"
  | "REBOQUE";

export const LABELS_TIPO_VEICULO: Record<TipoVeiculo, string> = {
  CARRO: "CARRO",
  CAMINHONETE: "CAMINHONETE",
  TOCO: "TOCO",
  TRUCK: "TRUCK",
  CAVALO_MECANICO: "CAVALO-MECANICO",
  REBOQUE: "REBOQUE",
};

export type TipoResposta = "TEXTO" | "BOOLEANO" | "ESCALA_1_5";
export type StatusSincronizacao = "AGUARDANDO_FOTOS" | "CONCLUIDO";
export type StatusUploadFoto = "PENDENTE" | "CONCLUIDO";

export interface UsuarioDto {
  id: string;
  nome: string;
  username: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  criadoEm: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioDto;
}

export interface VeiculoDto {
  id: string;
  placa: string;
  modelo: string;
  tipo: TipoVeiculo;
  kmAtual: number;
  ativo: boolean;
  criadoEm: string;
}

export interface PerguntaDto {
  id?: string;
  enunciado: string;
  tipoResposta: TipoResposta;
  ordem: number;
  obrigatoria: boolean;
  exigeFotoSeAvaria: boolean;
  valorGatilhoAvaria?: string | null;
  ativo?: boolean;
}

export interface TemplateDto {
  id: string;
  titulo: string;
  descricao?: string | null;
  tipoVeiculo: TipoVeiculo;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  perguntas: PerguntaDto[];
}

export interface DashboardResumoDto {
  totalChecklists: number;
  checklistsComAvaria: number;
  checklistsAguardandoFotos: number;
  totalVeiculosAtivos: number;
  totalTemplatesAtivos: number;
}

export interface ChecklistResumoDto {
  id: string;
  templateId: string;
  templateTitulo: string;
  veiculoId: string;
  veiculoPlaca: string;
  veiculoModelo: string;
  motoristaId: string;
  motoristaNome: string;
  kmVistoria: number;
  statusSincronizacao: StatusSincronizacao;
  possuiAvaria: boolean;
  alertaInconsistencia: boolean;
  motivoInconsistencia?: string | null;
  realizadoEm: string;
  sincronizadoEm: string;
}

export interface FotoDetalheDto {
  id: string;
  statusUpload: StatusUploadFoto;
  urlArquivo?: string | null;
  tamanhoBytes?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  capturadaEm: string;
  enviadaEm?: string | null;
}

export interface RespostaDetalheDto {
  id: string;
  perguntaId: string;
  enunciadoPergunta: string;
  tipoResposta: TipoResposta;
  ordemPergunta: number;
  valorResposta: string;
  observacaoAvaria?: string | null;
  avariaDetectada: boolean;
  fotos: FotoDetalheDto[];
}

export interface ChecklistDetalheDto {
  id: string;
  templateId: string;
  templateTitulo: string;
  veiculoId: string;
  veiculoPlaca: string;
  veiculoModelo: string;
  motoristaId: string;
  motoristaNome: string;
  kmVistoria: number;
  observacoesGerais?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  statusSincronizacao: StatusSincronizacao;
  possuiAvaria: boolean;
  alertaInconsistencia: boolean;
  motivoInconsistencia?: string | null;
  realizadoEm: string;
  sincronizadoEm: string;
  respostas: RespostaDetalheDto[];
}

const TOKEN_KEY = "checklist_access_token";
const USER_KEY = "checklist_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): UsuarioDto | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UsuarioDto;
  } catch {
    return null;
  }
}

export function saveAuthSession(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, auth.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.usuario));
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };

  if (!(init?.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined" && !path.startsWith("/auth/")) {
      clearAuthSession();
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    let errorMessage = `Erro HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errorMessage = errJson.erro || errJson.message || errorMessage;
    } catch {
      // ignora erro de parse
    }
    throw new Error(errorMessage);
  }

  return (await res.json()) as T;
}

export const api = {
  login: (username: string, senha: string) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, senha }),
    }),

  obterDashboard: () => apiFetch<DashboardResumoDto>("/dashboard"),

  listarChecklists: (params?: {
    possuiAvaria?: boolean;
    status?: StatusSincronizacao;
    veiculoId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.possuiAvaria !== undefined) {
      query.set("possuiAvaria", String(params.possuiAvaria));
    }
    if (params?.status) {
      query.set("status", params.status);
    }
    if (params?.veiculoId) {
      query.set("veiculoId", params.veiculoId);
    }
    const qs = query.toString();
    return apiFetch<ChecklistResumoDto[]>(`/checklists${qs ? `?${qs}` : ""}`);
  },

  buscarChecklistPorId: (id: string) =>
    apiFetch<ChecklistDetalheDto>(`/checklists/${id}`),

  listarVeiculos: (apenasAtivos = false) =>
    apiFetch<VeiculoDto[]>(`/veiculos?apenasAtivos=${apenasAtivos}`),

  criarVeiculo: (payload: {
    placa: string;
    modelo: string;
    tipo: TipoVeiculo;
    kmAtual: number;
  }) =>
    apiFetch<VeiculoDto>("/veiculos", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  atualizarVeiculo: (
    id: string,
    payload: {
      placa: string;
      modelo: string;
      tipo: TipoVeiculo;
      kmAtual: number;
    }
  ) =>
    apiFetch<VeiculoDto>(`/veiculos/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  alterarStatusVeiculo: (id: string, ativo: boolean) =>
    apiFetch<VeiculoDto>(`/veiculos/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ ativo }),
    }),

  listarTemplates: (incluirPerguntasInativas = false) =>
    apiFetch<TemplateDto[]>(
      `/templates?incluirPerguntasInativas=${incluirPerguntasInativas}`
    ),

  buscarTemplatePorId: (id: string, incluirPerguntasInativas = false) =>
    apiFetch<TemplateDto>(
      `/templates/${id}?incluirPerguntasInativas=${incluirPerguntasInativas}`
    ),

  criarTemplate: (payload: {
    titulo: string;
    descricao?: string;
    tipoVeiculo: TipoVeiculo;
    perguntas: PerguntaDto[];
  }) =>
    apiFetch<TemplateDto>("/templates", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  atualizarTemplate: (
    id: string,
    payload: {
      titulo: string;
      descricao?: string;
      tipoVeiculo: TipoVeiculo;
      perguntas: PerguntaDto[];
    }
  ) =>
    apiFetch<TemplateDto>(`/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  alterarStatusTemplate: (id: string, ativo: boolean) =>
    apiFetch<TemplateDto>(`/templates/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ ativo }),
    }),

  listarUsuarios: () => apiFetch<UsuarioDto[]>("/usuarios"),

  criarUsuario: (payload: {
    nome: string;
    username: string;
    email: string;
    senha: string;
    perfil: PerfilUsuario;
  }) =>
    apiFetch<UsuarioDto>("/usuarios", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  alterarStatusUsuario: (id: string, ativo: boolean) =>
    apiFetch<UsuarioDto>(`/usuarios/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ ativo }),
    }),

  /**
   * Simula a sincronização em 2 etapas vinda da fila Offline-First do aplicativo Flutter
   * para homologação rápida diretamente pelo Painel do Gestor.
   */
  simularSyncOfflineEmDuasEtapas: async (incluirUploadFotoImediato: boolean) => {
    const checklistId = crypto.randomUUID();
    const fotoId = crypto.randomUUID();
    const agoraMenosDuasHoras = new Date(Date.now() - 2 * 3600 * 1000).toISOString();

    const etapa1Payload = {
      id: checklistId,
      templateId: "770e8400-e29b-41d4-a716-446655440001",
      veiculoId: "550e8400-e29b-41d4-a716-446655440001",
      kmVistoria: 146850,
      observacoesGerais:
        "Vistoria realizada sem sinal de internet no posto km 210 da Rodovia Presidente Dutra.",
      latitude: -23.1896,
      longitude: -45.8841,
      realizadoEm: agoraMenosDuasHoras,
      respostas: [
        {
          id: crypto.randomUUID(),
          perguntaId: "990e8400-e29b-41d4-a716-446655440001",
          valorResposta: "FALSE",
          observacaoAvaria:
            "Bolha lateral identificada no pneu dianteiro direito durante inspeção visual.",
          avariaDetectada: true,
          fotosEsperadas: [
            {
              id: fotoId,
              capturadaEm: agoraMenosDuasHoras,
              latitude: -23.1896,
              longitude: -45.8841,
            },
          ],
        },
        {
          id: crypto.randomUUID(),
          perguntaId: "990e8400-e29b-41d4-a716-446655440002",
          valorResposta: "TRUE",
          observacaoAvaria: null,
          avariaDetectada: false,
          fotosEsperadas: [],
        },
        {
          id: crypto.randomUUID(),
          perguntaId: "990e8400-e29b-41d4-a716-446655440003",
          valorResposta: "TRUE",
          observacaoAvaria: null,
          avariaDetectada: false,
          fotosEsperadas: [],
        },
        {
          id: crypto.randomUUID(),
          perguntaId: "990e8400-e29b-41d4-a716-446655440004",
          valorResposta: "4",
          observacaoAvaria: null,
          avariaDetectada: false,
          fotosEsperadas: [],
        },
        {
          id: crypto.randomUUID(),
          perguntaId: "990e8400-e29b-41d4-a716-446655440005",
          valorResposta: "Rota São Paulo -> Curitiba com carga completa",
          observacaoAvaria: null,
          avariaDetectada: false,
          fotosEsperadas: [],
        },
      ],
    };

    await apiFetch("/sync/checklists", {
      method: "POST",
      body: JSON.stringify(etapa1Payload),
    });

    if (incluirUploadFotoImediato) {
      await api.enviarFotoSimulada(fotoId);
    }

    return checklistId;
  },

  enviarFotoSimulada: async (fotoId: string) => {
    // Gera uma imagem SVG convertida em Blob para demonstrar a evidência da avaria no painel
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#1e293b"/>
      <circle cx="400" cy="230" r="130" fill="#0f172a" stroke="#64748b" stroke-width="24"/>
      <circle cx="400" cy="230" r="65" fill="#334155"/>
      <path d="M 480 150 Q 540 190 495 255" stroke="#ef4444" stroke-width="8" fill="none"/>
      <circle cx="508" cy="202" r="24" fill="#ef4444" fill-opacity="0.35" stroke="#ef4444" stroke-width="3"/>
      <text x="400" y="420" font-family="sans-serif" font-size="22" font-weight="bold" fill="#f8fafc" text-anchor="middle">
        EVIDÊNCIA DE AVARIA — PNEU DIANTEIRO DIREITO
      </text>
      <text x="400" y="455" font-family="monospace" font-size="15" fill="#94a3b8" text-anchor="middle">
        Foto ID: ${fotoId} | Captura Câmera Offline (Comprimida)
      </text>
    </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const formData = new FormData();
    formData.append("arquivo", blob, "avaria-pneu.svg");

    return apiFetch(`/sync/fotos/${fotoId}`, {
      method: "POST",
      body: formData,
    });
  },
};
