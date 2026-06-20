import type { ApiResponse } from "./types"

const BASE_URL = "https://osstrack-app.vercel.app"

export class OssTrackAPI {
  private token: string | null = null

  constructor(private baseUrl: string = BASE_URL) {}

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      const json = await res.json()
      if (!res.ok) {
        return { ok: false, error: json.error || json.message || "Erro desconhecido" }
      }
      return { ok: true, data: json as T }
    } catch (err: any) {
      return { ok: false, error: err.message || "Erro de rede" }
    }
  }

  // ---- Auth ----
  async login(email: string, senha: string) {
    return this.request<{ user: any; token: string }>("POST", "/api/auth/mobile", {
      email,
      senha,
    })
  }

  async register(data: {
    nome: string
    email: string
    senha: string
    role: string
    academiaNome?: string
  }) {
    return this.request<{ user: any }>("POST", "/api/auth/register", data)
  }

  // ---- Dashboard ----
  async getDashboardAluno() {
    return this.request<any>("GET", "/api/dashboard/aluno")
  }

  async getDashboardDono() {
    return this.request<any>("GET", "/api/dashboard/dono")
  }

  async getAniversariantes() {
    return this.request<{ aniversariantes: any[] }>("GET", "/api/dashboard/aniversariantes")
  }

  async getInativos(dias = 7) {
    return this.request<{ inativos: any[] }>("GET", `/api/dashboard/inativos?dias=${dias}`)
  }

  // ---- Presença ----
  async confirmarPresenca(alunoId: string, turmaId?: string) {
    return this.request<any>("POST", "/api/presenca/confirm", { alunoId, turmaId })
  }

  async getPresencas() {
    return this.request<any[]>("GET", "/api/presenca")
  }

  // ---- Check-in QR ----
  async getQRCheckin(turmaId?: string) {
    return this.request<any>("GET", `/api/checkin/qr${turmaId ? `?turmaId=${turmaId}` : ""}`)
  }

  async confirmarQRCheckin(token: string) {
    return this.request<any>("POST", "/api/checkin/qr", { token })
  }

  // ---- Turmas ----
  async getTurmas() {
    return this.request<any[]>("GET", "/api/turmas")
  }

  // ---- Alunos ----
  async getAlunos() {
    return this.request<any[]>("GET", "/api/academia/alunos")
  }

  // ---- Graduação ----
  async getGraduacoes() {
    return this.request<any[]>("GET", "/api/graduacoes")
  }

  // ---- Financeiro ----
  async getFinanceiroDashboard() {
    return this.request<any>("GET", "/api/financeiro/dashboard")
  }

  async getCobrancas() {
    return this.request<any[]>("GET", "/api/financeiro/cobrancas")
  }

  async getContratos() {
    return this.request<any[]>("GET", "/api/financeiro/contratos")
  }

  async getPlanos() {
    return this.request<any[]>("GET", "/api/financeiro/planos")
  }

  // ---- Mural ----
  async getMural() {
    return this.request<any[]>("GET", "/api/mural")
  }

  async curtirPostagem(postId: string) {
    return this.request<any>("POST", `/api/mural/${postId}/curtir`)
  }

  // ---- Notificações ----
  async getNotificacoes() {
    return this.request<any[]>("GET", "/api/notificacoes")
  }

  // ---- Perfil ----
  async getPerfil() {
    return this.request<any>("GET", "/api/perfil")
  }

  async atualizarPerfil(data: Partial<{ nome: string; avatar: string; faixa: string }>) {
    return this.request<any>("PATCH", "/api/perfil", data)
  }

  // ---- Ranking ----
  async getRanking() {
    return this.request<any[]>("GET", "/api/ranking")
  }
}

export const api = new OssTrackAPI()
