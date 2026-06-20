/* ------------------------------------------------------------------ */
/*  Shared types for OssTrack (web + mobile)                          */
/*  Mirrors Prisma models but without Prisma dependency               */
/* ------------------------------------------------------------------ */

// ---- Academia ----
export interface Academia {
  id: string
  nome: string
  responsavel: string
  telefone: string | null
  rankingVisivel: boolean
}

// ---- User roles ----
export type Role = "dono" | "professor" | "aluno"

// ---- Usuario (includes Aluno/Professor fields) ----
export interface Usuario {
  id: string
  nome: string
  email: string
  role: Role
  academiaId: string | null
  academia: Academia | null
  faixa: string
  grau: number
  avatar: string | null
}

// ---- Presenca ----
export interface Presenca {
  id: string
  alunoId: string
  alunoNome: string
  data: string
  horario: string
  status: "confirmed" | "pending"
}

// ---- Graduacao ----
export interface Graduacao {
  faixa: string
  graus: number
  aulasPorGrau: number
  aulasProxFx: number | null
}

// ---- Turma ----
export interface Turma {
  id: string
  nome: string
  descricao: string | null
  horarios: string[]
}

// ---- Stats ----
export interface DashboardStats {
  totalAlunos: number
  totalProfessores: number
  totalPresencas: number
}

// ---- Mensalidades / Financeiro ----
export interface PlanoMensalidade {
  id: string
  nome: string
  valor: number
  taxaMatricula: number
  ativo: boolean
}

export interface Cobranca {
  id: string
  alunoId: string
  alunoNome: string
  valor: number
  vencimento: string
  status: "pendente" | "paga" | "atrasada" | "cancelada"
  mesReferencia: string
}

export interface Contrato {
  id: string
  alunoId: string
  alunoNome: string
  planoId: string
  planoNome: string
  dataInicio: string
  ativo: boolean
}

export interface Despesa {
  id: string
  descricao: string
  valor: number
  categoria: string
  data: string
}

// ---- Notificacao ----
export interface Notificacao {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  lida: boolean
  createdAt: string
}

// ---- Aniversariante ----
export interface Aniversariante {
  id: string
  nome: string
  faixa: string
  avatar: string | null
  dia: number
}

// ---- Aluno Inativo ----
export interface AlunoInativo {
  id: string
  nome: string
  faixa: string
  grau: number
  avatar: string | null
  ultimaPresenca: string | null
  diasSemTreinar: number
}

// ---- Mural ----
export interface PostagemMural {
  id: string
  autorId: string
  autorNome: string
  autorFaixa: string
  autorAvatar: string | null
  tipo: "checkin" | "conquista" | "graduacao" | "aniversario" | "mestre"
  conteudo: string
  likes: number
  curtido: boolean
  comentarios: number
  createdAt: string
}

// ---- Check-in QR ----
export interface QRCheckinData {
  academiaId: string
  turmaId?: string
  token: string
  expiresAt: string
}

// ---- API response wrapper ----
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

// ---- Auth ----
export interface LoginPayload {
  email: string
  senha: string
}

export interface RegisterPayload {
  nome: string
  email: string
  senha: string
  role: Role
  academiaNome?: string
}

export interface AuthResponse {
  user: Usuario
  token: string
}
