import { findBestReply, getDefaultReply } from "../src/lib/auto-reply"

const tests: [string, string][] = [
  ["Quanto custa usar o sistema?", "Preço"],
  ["Como faço check-in?", "checkin duvida"],
  ["Tem app para celular?", "Aplicativo"],
  ["Como cadastro meus alunos?", "alunos convite"],
  ["Vocês são seguros?", "segurança dados"],
  ["Olá, tudo bem?", "apresentação"],
  ["Quantos idiomas tem?", "idiomas"],
  ["Preciso de ajuda com um erro", "suporte problema"],
]

for (const [body, subj] of tests) {
  const r = findBestReply(body, subj)
  console.log(`${subj} => ${r ? `${r.rule.id} (conf: ${r.confidence.toFixed(2)})` : "DEFAULT"}`)
}
