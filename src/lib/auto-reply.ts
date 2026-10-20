interface ReplyRule {
  id: string
  keywords: string[]
  response: string
  priority: number
}

const RULES: ReplyRule[] = [
  {
    id: "gratis",
    keywords: ["grátis", "gratuito", "gratis", "preço", "preco", "custo", "quanto custa", "paga", "mensalidade", "valor"],
    response: `Olá! O OssTrack é 100% gratuito. Sem custos, sem contratos, sem pegadinhas.

Você pode criar sua conta agora mesmo em: https://osstrack.com.br/cadastro

Qualquer dúvida, estou à disposição! 🥋`,
    priority: 1,
  },
  {
    id: "como-funciona",
    keywords: ["como funciona", "como usar", "demonstração", "demonstracao", "tour", "ver na prática", "teste", "experimentar"],
    response: `Olá! O OssTrack é simples de usar:

1. Crie sua conta gratuita
2. Cadastre sua academia (endereço, geolocalização)
3. Convide seus alunos e professores
4. Comece a usar!

Funcionalidades principais:
• Check-in com geolocalização (aluno marca presença pelo celular)
• Controle de frequência e presenças
• Sistema de graduação e faixas
• Dashboard para dono e professores
• Mural de avisos e agenda de turmas
• PWA (funciona como app no celular)

Para começar: https://osstrack.com.br/cadastro

Fico à disposição! 🥋`,
    priority: 2,
  },
  {
    id: "funcionalidades",
    keywords: ["funcionalidades", "recursos", "o que tem", "o que faz", "ferramentas", "sistema tem", "tem check-in", "tem graduação"],
    response: `Olá! O OssTrack oferece:

✓ Check-in com geolocalização e QR code
✓ Controle de frequência e presenças
✓ Sistema de graduação e faixas
✓ Dashboard para dono e professores
✓ Mural de avisos e agenda de turmas
✓ Ranking de alunos
✓ Gestão de turmas
✓ PWA — funciona como app no celular
✓ Suporte a 14 idiomas

Tudo isso é gratuito!

Para começar: https://osstrack.com.br/cadastro

Dúvidas? É só responder! 🥋`,
    priority: 3,
  },
  {
    id: "cadastrar",
    keywords: ["cadastrar", "cadastro", "como criar", "como começar", "criar conta", "inscrever", "matricular"],
    response: `Olá! Para cadastrar sua academia:

1. Acesse: https://osstrack.com.br/cadastro
2. Preencha seus dados (nome, email, senha)
3. Escolha o perfil "Dono de Academia"
4. Cadastre os dados da academia
5. Pronto! Você já pode usar

O cadastro leva menos de 2 minutos.

Precisa de ajuda? Responda este email! 🥋`,
    priority: 4,
  },
  {
    id: "app",
    keywords: ["app", "aplicativo", "celular", "android", "iphone", "play store", "app store", "instalar"],
    response: `Olá! O OssTrack é um PWA (Progressive Web App).

Funciona como um app no celular sem precisar instalar nada!

Para usar no celular:
1. Abra https://osstrack.com.br no navegador
2. No menu, selecione "Adicionar à tela inicial"
3. Pronto! O ícone vai aparecer como um app normal

Funciona em Android e iPhone.

Qualquer dúvida, estou à disposição! 🥋`,
    priority: 5,
  },
  {
    id: "checkin",
    keywords: ["check-in", "checkin", "presença", "presenca", "frequência", "frequencia", "geolocalização", "gps", "localização"],
    response: `Olá! O check-in do OssTrack funciona assim:

O aluno abre o app e clica em "Check-in". O sistema:
1. Verifica a localização GPS do aluno
2. Compara com o endereço da academia
3. Só permite se estiver dentro do raio configurado (padrão: 200m)

Também tem:
• Código de check-in de 4 dígitos (alternativa)
• Confirmação do professor
• Histórico de frequência

Para testar: https://osstrack.com.br/cadastro

Fico à disposição! 🥋`,
    priority: 6,
  },
  {
    id: "graduacao",
    keywords: ["graduação", "graduacao", "faixa", "faixas", "grau", "graduar", "promover"],
    response: `Olá! O sistema de graduação do OssTrack:

✓ Cadastra todas as faixas (branca, azul, roxa, marrom, preta)
✓ Controla graus (0-10) de cada faixa
✓ Histórico completo de graduações
✓ Notifica alunos sobre promoções
✓ Dashboard com evolução

O professor pode graduar alunos direto pelo dashboard.

Para experimentar: https://osstrack.com.br/cadastro

Dúvidas? Responda! 🥋`,
    priority: 7,
  },
  {
    id: "seguranca",
    keywords: ["segurança", "seguranca", "dados", "privacidade", "lgpd", "proteção", "protecao", "confiável", "confiavel"],
    response: `Olá! A segurança é prioridade no OssTrack:

✓ Criptografia de dados sensíveis
✓ Conformidade com a LGPD
✓ Exportação de dados (direito do titular)
✓ Exclusão de dados
✓ Login seguro com NextAuth
✓ Rate limiting protegido
✓ Dados hospedados com SSL

Seus dados e os dos seus alunos estão seguros.

Qualquer dúvida, estou à disposição! 🥋`,
    priority: 8,
  },
  {
    id: "suporte",
    keywords: ["suporte", "ajuda", "contato", "telefone", "whatsapp", "falar com", "atendimento", "problema", "erro"],
    response: `Olá! Para suporte:

📧 Email: passador@osstrack.com
🌐 Site: https://osstrack.com.br

Pode responder este email diretamente — leio todas as mensagens.

Para dúvidas rápidas sobre o sistema, confira a página de ajuda:
https://osstrack.com.br/ajuda

Estou à disposição! 🥋`,
    priority: 9,
  },
  {
    id: "idiomas",
    keywords: ["idioma", "idiomas", "língua", "lingua", "português", "portugues", "inglês", "ingles", "espanhol"],
    response: `Olá! O OssTrack suporta 14 idiomas:

• Português
• English
• Español
• Français
• Deutsch
• Nederlands
• Svenska
• 日本語
• العربية
• 中文
• हिन्दी
• Italiano
• Русский
• 한국어

O aluno pode escolher o idioma nas configurações.

Fico à disposição! 🥋`,
    priority: 10,
  },
  {
    id: "alunos",
    keywords: ["alunos", "matricular", "convite", "convidar", "como adiciono", "como cadastro aluno"],
    response: `Olá! Para adicionar alunos:

1. Após cadastrar sua academia
2. Acesse o dashboard
3. Vá em "Alunos" → "Convidar"
4. Envie o link de convite por WhatsApp/email
5. O aluno se cadastra e entra na academia

Também é possível cadastrar alunos manualmente.

Para começar: https://osstrack.com.br/cadastro

Dúvidas? Responda! 🥋`,
    priority: 11,
  },
]

export function findBestReply(emailBody: string, subject: string): { rule: ReplyRule; confidence: number } | null {
  const text = `${subject} ${emailBody}`.toLowerCase()

  let bestMatch: { rule: ReplyRule; score: number } | null = null

  for (const rule of RULES) {
    let score = 0
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        score += 1
      }
    }
    if (score > 0) {
      const weightedScore = score * rule.priority
      if (!bestMatch || weightedScore > bestMatch.score) {
        bestMatch = { rule, score: weightedScore }
      }
    }
  }

  if (!bestMatch) return null

  const keywordCount = bestMatch.score / bestMatch.rule.priority
  const confidence = Math.min(keywordCount / 3, 1)

  return { rule: bestMatch.rule, confidence }
}

export function getDefaultReply(): string {
  return `Olá!

Obrigado pelo contato com o OssTrack!

Recebi sua mensagem e vou responder o mais breve possível.

Enquanto isso, você pode conhecer mais sobre o sistema em:
🌐 https://osstrack.com.br
❓ https://osstrack.com.br/ajuda

O OssTrack é 100% gratuito para academias de Jiu-Jitsu.

Fico à disposição! 🥋`
}

export { RULES }
