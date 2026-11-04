import { randomUUID, timingSafeEqual } from "node:crypto"
import nodemailer from "nodemailer"
import { Prisma } from "@prisma/client"
import prisma from "@/lib/prisma"
import imported from "./imported-queue.json"
import suppressed from "./imported-suppressions.json"
import legacy from "./legacy-sent.json"
import { brasiliaDay, DAILY_GOAL, LOCK_ID, normalize, qualified, STATE_ID, type Prospect } from "./policy"
import { discover, hasMx } from "./discovery"
import { renderEmail } from "./template"

interface State { leads: Prospect[]; cursor: number; lease?: { token: string; until: number }; lastRun?: string; lastError?: string }
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
const key = (email: string) => email.trim().toLowerCase()
const academyKey = (a: Pick<Prospect, "nome"> & { cidade?: string | null }) => `academy:${normalize(a.nome)}|${normalize(a.cidade || "")}`
export function cronAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET
  const actual = Buffer.from(request.headers.get("authorization") || "")
  const expected = Buffer.from(`Bearer ${secret}`)
  return !!secret && actual.length === expected.length && timingSafeEqual(actual, expected)
}
export function transport() {
  const user = process.env.OUTREACH_SMTP_USER || process.env.SMTP_USER
  const pass = process.env.OUTREACH_SMTP_PASS || process.env.SMTP_PASS
  if (user !== "passador@osstrack.com" || !pass) throw new Error("outreach_sender_not_configured")
  const port = Number(process.env.OUTREACH_SMTP_PORT || process.env.SMTP_PORT || 465)
  return nodemailer.createTransport({ host: process.env.OUTREACH_SMTP_HOST || process.env.SMTP_HOST || "smtpout.secureserver.net", port, secure: port === 465, auth: { user, pass }, connectionTimeout: 10000, socketTimeout: 20000 })
}
async function blockedEmails() {
  const [sent, users, optouts] = await Promise.all([
    prisma.outreachSent.findMany({ select: { email: true, nome: true, cidade: true } }),
    prisma.usuario.findMany({ select: { email: true } }),
    prisma.autoReplyLog.findMany({ where: { matchedRule: { in: ["unsubscribe", "declined"] } }, select: { fromEmail: true } }),
  ])
  return new Set([...legacy, ...suppressed, ...sent.map(s => s.email), ...users.map(u => u.email), ...optouts.map(o => o.fromEmail)].map(key).concat(sent.map(academyKey)))
}
async function acquire() {
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(${LOCK_ID})::text`
    const row = await tx.relatorioEnvio.findUnique({ where: { id: STATE_ID } })
    const state: State = row ? row.dados as unknown as State : { leads: imported, cursor: 0 }
    if (state.lease && state.lease.until > Date.now()) return null
    const known = new Set(state.leads.map(a => key(a.email)))
    for (const a of imported) if (!known.has(key(a.email))) { state.leads.push(a); known.add(key(a.email)) }
    state.lease = { token: randomUUID(), until: Date.now() + 300000 }
    await tx.relatorioEnvio.upsert({ where: { id: STATE_ID }, create: { id: STATE_ID, tipo: "outreach-state", dados: json(state) }, update: { dados: json(state) } })
    return state
  }, { timeout: 15000 })
}
async function save(state: State, release = false) {
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(${LOCK_ID})::text`
    const row = await tx.relatorioEnvio.findUniqueOrThrow({ where: { id: STATE_ID } })
    const current = row.dados as unknown as State
    if (current.lease?.token !== state.lease?.token) throw new Error("outreach_lease_lost")
    const copy = { ...state, lease: release ? undefined : state.lease }
    await tx.relatorioEnvio.update({ where: { id: STATE_ID }, data: { dados: json(copy) } })
  }, { timeout: 15000 })
}
export async function outreachStatus() {
  const { day, start } = brasiliaDay()
  const [row, records, blocked, lastRun, report] = await Promise.all([
    prisma.relatorioEnvio.findUnique({ where: { id: STATE_ID } }),
    prisma.outreachSent.findMany({ where: { sentAt: { gte: start } }, select: { bounceReason: true } }),
    blockedEmails(),
    prisma.relatorioEnvio.findFirst({ where: { tipo: "outreach-run" }, orderBy: { enviadoEm: "desc" } }),
    prisma.relatorioEnvio.findFirst({ where: { tipo: "outreach-monitor" }, orderBy: { enviadoEm: "desc" } }),
  ])
  const state = row?.dados as unknown as State | undefined
  const accepted = records.filter(r => !r.bounceReason?.startsWith("LOCAL_RESERVED") && !r.bounceReason?.startsWith("SMTP_UNCONFIRMED")).length
  return { day, goal: DAILY_GOAL, accepted, reservedOrAmbiguous: records.length - accepted, pending: (state?.leads || imported).filter(a => qualified(a) && !blocked.has(key(a.email))).length, lastRun: lastRun?.enviadoEm || null, lastResult: lastRun?.dados || null, lastMonitor: report?.enviadoEm || null, lastError: state?.lastError || null, running: !!state?.lease && state.lease.until > Date.now(), enabled: process.env.OUTREACH_ENABLED === "true", senderConfigured: (process.env.OUTREACH_SMTP_USER || process.env.SMTP_USER) === "passador@osstrack.com" && !!(process.env.OUTREACH_SMTP_PASS || process.env.SMTP_PASS) }
}
export async function runOutreach(mode: "send" | "discover") {
  if (process.env.OUTREACH_ENABLED !== "true" || process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return { disabled: true }
  const state = await acquire()
  if (!state) return { busy: true }
  const begin = Date.now(); const receipts: { email: string; status: string; messageId?: string }[] = []
  const result = { mode, day: brasiliaDay().day, searched: 0, discovered: 0, accepted: 0, errors: [] as string[], receipts }
  let smtp: ReturnType<typeof transport> | undefined
  let stage = "qualification"
  try {
    const blocked = await blockedEmails()
    const pending = () => state.leads.filter(a => qualified(a) && !blocked.has(key(a.email)) && !blocked.has(academyKey(a)))
    const alreadyAccepted = (await outreachStatus()).accepted
    if (mode === "discover" || pending().length < Math.max(0, DAILY_GOAL - alreadyAccepted)) {
      stage = "discovery"
      const merge = async (found: Prospect[], cursor: number) => {
        state.cursor = cursor
        for (const candidate of found) {
          const existing = state.leads.findIndex(a => key(a.email) === key(candidate.email))
          if (existing < 0) state.leads.push(candidate)
          else if (!state.leads[existing].disabledReason) state.leads[existing] = candidate
        }
        await save(state)
      }
      const research = await discover(state.cursor, blocked, mode === "discover" ? 210000 : 100000, merge)
      result.searched = research.searched; result.discovered = research.found.length; result.errors.push(...research.errors)
      await merge(research.found, research.cursor)
    }
    if (mode === "send") {
      stage = "smtp"
      smtp = transport(); await smtp.verify()
      for (const academy of pending()) {
        if (Date.now() - begin > 245000) { result.errors.push("time_budget_recovery_scheduled"); break }
        const email = key(academy.email)
        try {
          if (!await hasMx(email.split("@")[1])) { academy.disabledReason = "no_mx"; await save(state); continue }
        } catch { result.errors.push("mx_unavailable"); continue }
        const reservation = await prisma.$transaction(async tx => {
          await tx.$queryRaw`SELECT pg_advisory_xact_lock(${LOCK_ID})::text`
          const count = await tx.outreachSent.count({ where: { sentAt: { gte: brasiliaDay().start }, OR: [{ bounceReason: null }, { NOT: { bounceReason: { startsWith: "LOCAL_RESERVED" } } }] } })
          if (count >= DAILY_GOAL) return { full: true } as const
          if (await tx.outreachSent.findUnique({ where: { email } }) || await tx.usuario.findFirst({ where: { email: { equals: email, mode: "insensitive" } } }) || await tx.autoReplyLog.findFirst({ where: { fromEmail: { equals: email, mode: "insensitive" }, matchedRule: { in: ["unsubscribe", "declined"] } } })) return null
          return tx.outreachSent.create({ data: { email, nome: academy.nome, cidade: academy.cidade, estado: academy.estado, bounceReason: "LOCAL_RESERVED: SMTP acceptance not yet confirmed" } })
        }, { timeout: 15000 })
        if (reservation && "full" in reservation) break
        if (!reservation) { blocked.add(email); continue }
        const receipt = { email, status: "reserved", messageId: undefined as string | undefined }; receipts.push(receipt)
        // Reservation is durable before SMTP; a crash cannot resend the same recipient.
        try {
          const info = await smtp.sendMail({ from: '"OssTrack" <passador@osstrack.com>', to: email, subject: "OssTrack — Plataforma gratuita para sua academia de Jiu-Jitsu", html: renderEmail(academy.nome, academy.cidade, reservation.id, academy.personalization!, academy.personalizedQuestion!) })
          if (!info.accepted?.some((a: string) => key(String(a)) === email)) throw new Error("smtp_not_accepted")
          receipt.status = "smtp_accepted"; receipt.messageId = info.messageId; result.accepted++
          await prisma.relatorioEnvio.create({ data: { tipo: "outreach-receipt", dados: json({ ...receipt, recordId: reservation.id, at: new Date().toISOString() }) } })
          await prisma.outreachSent.update({ where: { id: reservation.id }, data: { sentAt: new Date(), bounceReason: null } })
        } catch {
          if (receipt.status !== "smtp_accepted") receipt.status = "smtp_unconfirmed_no_retry"
          result.errors.push("smtp_or_receipt_failure")
          await prisma.relatorioEnvio.create({ data: { tipo: "outreach-receipt", dados: json({ ...receipt, recordId: reservation.id, at: new Date().toISOString() }) } })
        }
        blocked.add(email)
        blocked.add(academyKey(academy))
        await new Promise(r => setTimeout(r, 2000))
      }
    }
    state.lastRun = new Date().toISOString(); state.lastError = result.errors.join(",") || undefined
    state.leads = state.leads.filter(a => !blocked.has(key(a.email))).slice(-1500)
    await prisma.relatorioEnvio.create({ data: { tipo: "outreach-run", dados: json(result) } })
    await prisma.cronLog.create({ data: { tipo: `outreach-${mode}` } })
    await save(state, true)
    return { ...result, receipts: undefined, status: await outreachStatus() }
  } catch (error) {
    const err = error as Error & { code?: string; cause?: { code?: string } }
    const diagnostic = { stage, name: err?.name, code: err?.code, causeCode: err?.cause?.code, reason: /^[a-z][a-z0-9_:-]{0,100}$/i.test(err?.message || "") ? err.message : undefined }
    const code = diagnostic.reason || diagnostic.code || diagnostic.causeCode || "outreach_run_failed"
    state.lastError = code
    console.error("outreach_failure", diagnostic)
    await prisma.relatorioEnvio.create({ data: { tipo: "outreach-run", dados: json({ ...result, error: code, diagnostic }) } })
    await save(state, true)
    throw new Error(code)
  } finally { smtp?.close() }
}
export async function monitorOutreach() {
  const status = await outreachStatus()
  const prior = await prisma.relatorioEnvio.findFirst({ where: { tipo: "outreach-monitor", enviadoEm: { gte: brasiliaDay().start } } })
  if (prior) return { alreadyReported: true, status }
  const since30 = new Date(Date.now() - 30 * 86400000)
  const [total30, bounced30, opened30, clicked30, sentEmails, inbound] = await Promise.all([
    prisma.outreachSent.count({ where: { sentAt: { gte: since30 } } }),
    prisma.outreachSent.count({ where: { sentAt: { gte: since30 }, bouncedAt: { not: null } } }),
    prisma.outreachSent.count({ where: { sentAt: { gte: since30 }, openedAt: { not: null } } }),
    prisma.outreachSent.count({ where: { sentAt: { gte: since30 }, clickedAt: { not: null } } }),
    prisma.outreachSent.findMany({ where: { sentAt: { gte: since30 } }, select: { email: true, bounceReason: true } }),
    prisma.autoReplyLog.findMany({ where: { processedAt: { gte: since30 } }, select: { fromEmail: true, matchedRule: true } }),
  ])
  const prospectEmails = new Set(sentEmails.map(x => key(x.email)))
  const prospectReplies = inbound.filter(x => prospectEmails.has(key(x.fromEmail)))
  const positiveReplies30 = prospectReplies.filter(x => x.matchedRule === "positive_interest").length
  const declined30 = prospectReplies.filter(x => x.matchedRule === "declined").length
  const unsubscribed30 = prospectReplies.filter(x => x.matchedRule === "unsubscribe").length
  const bounceReasons = sentEmails.map(x => x.bounceReason).filter((x): x is string => !!x)
  const hardBounces30 = bounceReasons.filter(x => /\b5\.\d\.\d\b|user unknown|mailbox (?:not found|disabled)|no such (?:user|mailbox)/i.test(x)).length
  const softBounces30 = bounceReasons.filter(x => /\b4\.\d\.\d\b|temporar|try again|mailbox full/i.test(x)).length
  const policyBlocks30 = bounceReasons.filter(x => /policy|spam|blocked|prohibited|blacklist|reputation/i.test(x)).length
  const authFailures30 = bounceReasons.filter(x => /authentication|credentials|\b535\b|\b5\.7\.8\b/i.test(x)).length
  const rateLimits30 = bounceReasons.filter(x => /rate.?limit|too many|\b4\.7\.|\b421\b/i.test(x)).length
  const smtp = transport()
  try {
    const warning = status.accepted < DAILY_GOAL || status.reservedOrAmbiguous > 0
    const text = `Prospecção OssTrack — ${status.day}\nMeta: ${DAILY_GOAL}\nAceitos SMTP hoje: ${status.accepted}\nPendentes qualificados: ${status.pending}\nReservas/ambíguos: ${status.reservedOrAmbiguous}\nÚltima execução: ${status.lastRun}\nProblema registrado: ${status.lastError || "nenhum"}\n\nÚltimos 30 dias\nRegistros de envio: ${total30}\nBounces registrados: ${bounced30}\nHard bounce: ${hardBounces30}; soft bounce: ${softBounces30}\nBloqueio por política: ${policyBlocks30}; falha de autenticação: ${authFailures30}; limitação de volume: ${rateLimits30}\nRespostas de prospectos registradas: ${prospectReplies.length}\nInteresse positivo encaminhado: ${positiveReplies30}\nRecusas: ${declined30}\nDescadastros: ${unsubscribed30}\nAberturas rastreadas: ${opened30}\nCliques rastreados: ${clicked30}\nAberturas/cliques não confirmam leitura nem entrega.\n\n${warning ? "ATENÇÃO: meta incompleta ou resultado ambíguo. Verificar a campanha." : "Meta diária concluída."}\nAceitação SMTP não comprova entrega na caixa de entrada.`
    await smtp.sendMail({ from: '"OssTrack" <passador@osstrack.com>', to: process.env.REPORT_TO || "gustavorotatori@gmail.com", subject: `OssTrack: ${status.accepted}/${DAILY_GOAL} prospecções${warning ? " — atenção" : " — concluído"}`, text })
    await prisma.relatorioEnvio.create({ data: { tipo: "outreach-monitor", dados: json({ ...status, notified: true }) } })
    return { reported: true, status }
  } finally { smtp.close() }
}
