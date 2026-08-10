import { z } from "zod"

export const ROLES = ["aluno", "professor", "dono"] as const

export const emailSchema = z.string().email("E-mail inválido").max(255)

export const senhaSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(128)
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")

function idadeEmAnos(dataNascimento: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataNascimento)
  if (!m) return null
  const nasc = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (isNaN(nasc.getTime())) return null
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const passouAniversario =
    hoje.getMonth() > nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate())
  if (!passouAniversario) idade--
  return idade
}

export function eMenorDeIdade(dataNascimento?: string | null): boolean {
  if (!dataNascimento) return false
  const idade = idadeEmAnos(dataNascimento)
  return idade !== null && idade < 18
}

export const registerSchema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório").max(120),
    email: emailSchema,
    telefone: z.string().max(20).optional().default(""),
    senha: senhaSchema,
    role: z.enum(ROLES, { message: "Tipo de conta inválido" }),
    dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data de nascimento"),
    faixa: z.string().max(30).optional(),
    grau: z.coerce.number().int().min(0).max(10).optional(),
    aceitouTermos: z.boolean({ message: "Aceite os Termos de Uso" }).refine((v) => v === true, { message: "Aceite os Termos de Uso" }),
    aceitouLGPD: z.boolean({ message: "Aceite a Política de Privacidade" }).refine((v) => v === true, { message: "Aceite a Política de Privacidade" }),
    aceitouMarketing: z.boolean().optional().default(false),
    responsavelNome: z.string().max(120).optional().default(""),
    responsavelCpf: z.string().max(20).optional().default(""),
    consentimentoResponsavel: z.boolean().optional().default(false),
    academiaId: z.string().optional(),
    professorId: z.string().optional(),
    codigoConvite: z.string().optional(),
    recaptchaToken: z.string().optional(),
    endereco: z.string().max(200).optional().default(""),
    cidade: z.string().max(100).optional().default(""),
    estado: z.string().max(50).optional().default(""),
    lat: z.coerce.number().optional().default(0),
    lng: z.coerce.number().optional().default(0),
    raio: z.coerce.number().int().optional().default(200),
    academia: z.object({
      nome: z.string().min(1, "Nome da academia é obrigatório").max(120),
      endereco: z.string().max(200).optional().default(""),
      cidade: z.string().max(100).optional().default(""),
      estado: z.string().max(50).optional().default(""),
      lat: z.coerce.number().optional().default(0),
      lng: z.coerce.number().optional().default(0),
      raio: z.coerce.number().int().optional().default(200),
    }).optional(),
  })
  .superRefine((val, ctx) => {
    if (!eMenorDeIdade(val.dataNascimento)) return
    if (!val.responsavelNome?.trim()) {
      ctx.addIssue({ code: "custom", path: ["responsavelNome"], message: "Menores de 18 anos: informe o nome do responsável legal" })
    }
    if (!val.responsavelCpf?.trim()) {
      ctx.addIssue({ code: "custom", path: ["responsavelCpf"], message: "Menores de 18 anos: informe o CPF do responsável legal" })
    }
    if (!val.consentimentoResponsavel) {
      ctx.addIssue({ code: "custom", path: ["consentimentoResponsavel"], message: "Menores de 18 anos: é necessário o consentimento do responsável legal" })
    }
  })

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, "Senha é obrigatória"),
  recaptchaToken: z.string().optional(),
})

export const presencaSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  turma: z.string().max(100).optional(),
})

export const confirmPresencaSchema = z.object({
  presencaId: z.string().min(1),
  status: z.enum(["confirmed", "rejected"]),
})

export const perfilUpdateSchema = z.object({
  nome: z.string().min(1).max(120).optional(),
  telefone: z.string().max(20).nullable().optional(),
  avatar: z.string().max(500).nullable().optional(),
  dataNascimento: z.string().max(10).nullable().optional(),
  faixa: z.string().max(30).optional(),
  grau: z.coerce.number().int().min(0).max(10).optional(),
})

export const academiaUpdateSchema = z.object({
  nome: z.string().min(1).max(120).optional(),
  whatsapp: z.string().max(20).nullable().optional(),
  pixKey: z.string().max(100).nullable().optional(),
  raio: z.coerce.number().int().min(50).max(5000).optional(),
  horarioInicio: z.string().max(5).nullable().optional(),
  horarioFim: z.string().max(5).nullable().optional(),
  endereco: z.string().max(200).optional(),
  cidade: z.string().max(100).optional(),
  estado: z.string().max(50).optional(),
  telefone: z.string().max(20).optional(),
  logo: z.string().max(500).nullable().optional(),
  wellhubAtivo: z.boolean().optional(),
  wellhubToken: z.string().max(500).nullable().optional(),
  wellhubGymId: z.string().max(50).nullable().optional(),
})

export const turmaSchema = z.object({
  nome: z.string().min(1, "Nome da turma é obrigatório").max(100),
  descricao: z.string().max(300).optional(),
  cor: z.string().max(9).optional().default("#C9A84C"),
  icone: z.string().max(10).optional().default("🥋"),
  categoria: z.string().max(20).optional().default("adulto"),
  modalidade: z.enum(["kimono", "nogi"]).optional().default("kimono"),
  horario: z.string().min(1, "Horário é obrigatório").max(5),
  dias: z.string().min(1, "Dias é obrigatório").max(100),
  maxAlunos: z.coerce.number().int().min(1).max(500).optional().default(30),
})

export const recuperarSenhaSchema = z.object({
  email: emailSchema,
  recaptchaToken: z.string().optional(),
})

export const redefinirSenhaSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  senha: senhaSchema,
  recaptchaToken: z.string().optional(),
})

export const conviteSchema = z.object({
  tipo: z.enum(["professor", "aluno", "amigo", "academia"]),
  email: emailSchema.optional(),
})

export const muralPostSchema = z.object({
  tipo: z.enum(["geral", "treino", "conquista", "evento"]),
  conteudo: z.string().min(1, "Conteúdo obrigatório").max(2000),
})

export const despesaSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória").max(200),
  valor: z.coerce.number().min(1, "Valor obrigatório").max(10000000),
  categoria: z.string().max(50).optional(),
  dataVencimento: z.string().min(1, "Data de vencimento obrigatória"),
  observacao: z.string().max(500).optional(),
})

export const whatsappSchema = z.object({
  alunoId: z.string().min(1),
  mensagem: z.string().max(500).optional(),
})

export const comentarioSchema = z.object({
  postagemId: z.string().min(1),
  conteudo: z.string().min(1).max(1000),
})

export const promocaoSchema = z.object({
  alunoId: z.string().min(1),
  novaFaixa: z.string().max(30),
  novoGrau: z.coerce.number().int().min(0).max(10),
})

export const vinculoConviteSchema = z.object({
  conviteId: z.string().min(1),
})

export const vinculoProfessorSchema = z.object({
  professorId: z.string().min(1),
})

export const vinculoAcademiaSchema = z.object({
  academiaId: z.string().min(1),
})

export const wellhubBindSchema = z.object({
  wellhubId: z.string().min(1).max(100),
  alunoId: z.string().min(1),
})

export const presencaManualSchema = z.object({
  alunoId: z.string().min(1),
  data: z.string().min(1).optional(),
  turma: z.string().max(100).optional(),
  observacao: z.string().max(500).optional(),
  origem: z.string().max(30).optional().default("app"),
})

export const presencaWellhubSchema = z.object({
  wellhubId: z.string().min(1).max(100),
  turma: z.string().max(100).optional(),
  skipValidation: z.boolean().optional().default(false),
})

export const horarioAulaSchema = z.object({
  turmaId: z.string().min(1),
  diaSemana: z.coerce.number().int().min(0).max(6),
  horaInicio: z.string().max(5),
  horaFim: z.string().max(5),
  maxAlunos: z.coerce.number().int().min(1).max(500).optional(),
  local: z.string().max(200).optional(),
})

export const horarioAulaUpdateSchema = horarioAulaSchema.partial()

export const agendamentoSchema = z.object({
  horarioId: z.string().min(1),
  data: z.string().min(1),
})

export const cobrancaCreateSchema = z.object({
  contratoId: z.string().min(1),
  valor: z.coerce.number().min(1).max(10000000),
  vencimento: z.string().min(1),
  observacao: z.string().max(500).optional(),
})

export const cobrancaUpdateSchema = z.object({
  status: z.enum(["pendente", "pago", "atrasado", "cancelado"]).optional(),
  metodo: z.string().max(30).optional(),
  dataPagamento: z.string().optional(),
})

export const contratoCreateSchema = z.object({
  alunoId: z.string().min(1),
  planoId: z.string().min(1),
  valor: z.coerce.number().min(1).max(10000000),
  dataInicio: z.string().min(1),
  dataFim: z.string().optional(),
  observacao: z.string().max(500).optional(),
})

export const contratoUpdateSchema = z.object({
  status: z.enum(["ativo", "cancelado", "encerrado"]).optional(),
  valor: z.coerce.number().min(1).max(10000000).optional(),
})

export const planoCreateSchema = z.object({
  nome: z.string().min(1).max(100),
  valor: z.coerce.number().min(1).max(10000000),
  taxaMatricula: z.coerce.number().min(0).max(10000000).optional().default(0),
  descricao: z.string().max(500).optional(),
  periodo: z.enum(["mensal", "trimestral", "semestral", "anual"]).optional().default("mensal"),
})

export const planoUpdateSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  valor: z.coerce.number().min(1).max(10000000).optional(),
  taxaMatricula: z.coerce.number().min(0).max(10000000).optional(),
  descricao: z.string().max(500).optional(),
  periodo: z.enum(["mensal", "trimestral", "semestral", "anual"]).optional(),
  ativo: z.boolean().optional(),
})

export const despesaUpdateSchema = z.object({
  status: z.enum(["pendente", "pago", "cancelado"]).optional(),
  descricao: z.string().max(200).optional(),
  valor: z.coerce.number().min(0).max(10000000).optional(),
  categoria: z.string().max(50).optional(),
  observacao: z.string().max(500).optional(),
  dataVencimento: z.string().optional(),
})

export const graduacaoCreateSchema = z.object({
  faixa: z.string().min(1).max(30),
  graus: z.coerce.number().int().min(0).max(10),
  aulasPorGrau: z.coerce.number().int().min(1).max(1000),
  aulasProxFx: z.coerce.number().int().min(0).max(10000),
  categoria: z.string().max(20).optional().default("adulto"),
})

export const graduacaoUpdateSchema = graduacaoCreateSchema.partial()

export const notificarSchema = z.object({
  usuarioId: z.string().min(1),
  titulo: z.string().min(1).max(200),
  descricao: z.string().max(500).optional(),
  tipo: z.enum(["boas_vindas", "lembrete", "promocao", "cobranca", "sistema"]).optional().default("sistema"),
  link: z.string().max(500).optional(),
})

export const pushSubscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().min(1),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
})

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().min(1),
})

export const pushBulkSchema = z.object({
  alunoIds: z.array(z.string()).min(1),
  titulo: z.string().min(1).max(200),
  descricao: z.string().max(500).optional().default(""),
  tipo: z.enum(["boas_vindas", "lembrete", "promocao", "cobranca", "sistema"]).optional().default("sistema"),
  link: z.string().max(500).optional(),
})

export const rankingConfigSchema = z.object({
  rankingVisivel: z.boolean(),
})

export const mestreSelecionarSchema = z.object({
  alunoId: z.string().min(1),
  categoria: z.string().max(20).optional().default("adulto"),
})

export const checkinCodigoSchema = z.object({
  codigo: z.string().min(1).max(20),
})

export const checkinCodigoGerarSchema = z.object({
  turma: z.string().max(100).optional(),
})

export const turmaUpdateSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  descricao: z.string().max(300).optional(),
  cor: z.string().max(9).optional(),
  icone: z.string().max(10).optional(),
  categoria: z.string().max(20).optional(),
  modalidade: z.enum(["kimono", "nogi"]).optional(),
  horario: z.string().max(5).optional(),
  dias: z.string().max(100).optional(),
  maxAlunos: z.coerce.number().int().min(1).max(500).optional(),
})

export const setupSchema = z.object({
  nome: z.string().min(1).max(120).optional(),
  email: emailSchema.optional(),
  senha: senhaSchema.optional(),
  academia: z.string().max(200).optional(),
})

export const checkVerificationSchema = z.object({
  userId: z.string().min(1),
})

export const missoesUpdateSchema = z.object({
  id: z.string().min(1),
})

export const familiaSchema = z.object({
  nome: z.string().min(1, "Nome da família é obrigatório").max(100),
  desconto: z.coerce.number().int().min(0).max(100).default(10),
})

export const familiaUpdateSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  desconto: z.coerce.number().int().min(0).max(100).optional(),
})

export const familiaMembroSchema = z.object({
  alunoId: z.string().min(1),
})
