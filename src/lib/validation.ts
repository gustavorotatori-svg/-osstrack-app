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

export const registerSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(120),
  email: emailSchema,
  telefone: z.string().max(20).optional().default(""),
  senha: senhaSchema,
  role: z.enum(ROLES, { message: "Tipo de conta inválido" }),
  dataNascimento: z.string().max(10).nullable().optional(),
  faixa: z.string().max(30).optional(),
  grau: z.coerce.number().int().min(0).max(10).optional(),
  aceitouTermos: z.boolean({ message: "Aceite os Termos de Uso" }),
  aceitouLGPD: z.boolean({ message: "Aceite a Política de Privacidade" }),
  aceitouMarketing: z.boolean().optional().default(false),
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
