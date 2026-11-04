// Run from the project root: node --env-file=.env scripts/resume-outreach.cjs [--send]
// Default is a read-only preview. Uses the existing production email template.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const dns = require('node:dns').promises;
const ts = require('typescript');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

const root = path.resolve(__dirname, '..');
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, ''));
const emailKey = value => value.trim().toLowerCase();
const send = process.argv.includes('--send');
// Default daily goal is 15; explicit target allows an authorized extra batch.
const dailyTarget = Number(process.argv.find(arg => arg.startsWith('--daily-target='))?.split('=')[1] || 15);
if (!Number.isSafeInteger(dailyTarget) || dailyTarget < 15) throw new Error('Invalid daily target');
const prisma = new PrismaClient({ log: [] });
const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const dayStart = new Date(`${day}T00:00:00-03:00`);
const receiptDir = path.join(root, '.migration-private', 'outreach');
const results = [];
let receiptPath;

function template() {
  const file = path.join(root, 'src/lib/outreach/template.ts');
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const declaration = source.statements.find(s => ts.isFunctionDeclaration(s) && s.name?.text === 'renderEmail');
  if (!declaration) throw new Error('Existing renderEmail template not found; stopping.');
  const js = ts.transpileModule(declaration.getText(source).replace(/^export\s+/, ''), { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
  return vm.runInNewContext(`${js}\nrenderEmail`, Object.create(null), { timeout: 1000 });
}

function saveReceipt() {
  fs.mkdirSync(receiptDir, { recursive: true });
  receiptPath ||= path.join(receiptDir, `run-${Date.now()}.json`);
  fs.writeFileSync(receiptPath, JSON.stringify({ day, from: 'passador@osstrack.com', results }, null, 2));
}

async function mailServers(domain) {
  try { return await dns.resolveMx(domain); }
  catch (error) {
    if (!['ECONNREFUSED', 'ETIMEOUT', 'ESERVFAIL', 'EAI_AGAIN'].includes(error.code)) throw error;
    // Some Windows networks block direct DNS while allowing DNS over HTTPS.
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('MX lookup unavailable');
    const answer = await response.json();
    if (answer.Status !== 0) throw new Error('MX lookup did not succeed');
    return (answer.Answer || []).filter(row => row.type === 15).map(row => ({ exchange: row.data.replace(/^\d+\s+/, '').replace(/\.$/, '') }));
  }
}

async function main() {
  const queue = readJson('scripts/outreach/queue.json');
  const suppressed = new Set(readJson('scripts/outreach/suppressions.json').map(emailKey));
  const legacy = readJson('scripts/sent.json');
  const blocked = new Set([...legacy.sent.map(emailKey), ...suppressed]);
  const [records, existingUsers, today] = await Promise.all([
    prisma.outreachSent.findMany({ select: { email: true } }),
    prisma.usuario.findMany({ select: { email: true } }),
    prisma.outreachSent.count({ where: { sentAt: { gte: dayStart } } }),
  ]);
  for (const row of [...records, ...existingUsers]) blocked.add(emailKey(row.email));
  const excludedBrands = /gracie|alliance|checkmat|guigo|de\s?la\s?riva|nova uni[aã]o|gf\s?team|atos\b|zr\s?team|team nogueira/i;
  const seen = new Set();
  const pending = queue.filter(a => {
    const key = emailKey(a.email);
    if (seen.has(key) || blocked.has(key)) return false;
    seen.add(key);
    const fresh = Date.now() - Date.parse(`${a.checkedAt}T12:00:00Z`) < 30 * 86400000;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key) && a.independent === true && a.populacao > 0 && a.populacao < 500000 &&
      a.source?.startsWith('https://') && a.populationSource?.startsWith('https://www.ibge.gov.br/') && fresh && !excludedBrands.test(a.nome) &&
      typeof a.personalization === 'string' && a.personalization.trim().length >= 20 && a.personalizationSource === a.source &&
      typeof a.personalizedQuestion === 'string' && a.personalizedQuestion.trim().length >= 20 && a.personalizedQuestion.trim().endsWith('?');
  });
  const selected = pending.slice(0, Math.max(0, dailyTarget - today));
  console.log(JSON.stringify({ mode: send ? 'send' : 'preview', day, registeredToday: today, pending: pending.length, selected: selected.map(a => ({ nome: a.nome, email: a.email, cidade: a.cidade, estado: a.estado })) }));
  if (!send || !selected.length) return;
  const sender = emailKey(process.env.SMTP_USER || 'passador@osstrack.com');
  if (sender !== 'passador@osstrack.com' || !process.env.SMTP_PASS) throw new Error('Expected sender credentials unavailable.');
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'smtpout.secureserver.net', port, secure: port === 465,
    auth: { user: sender, pass: process.env.SMTP_PASS }, connectionTimeout: 15000, socketTimeout: 30000 });
  try {
    await transport.verify();
    const renderEmail = template();
    for (const academy of selected) {
      const email = emailKey(academy.email);
      try {
        const mx = await mailServers(email.split('@')[1]);
        if (!mx.some(r => r.exchange && r.exchange !== '.')) throw new Error('No MX');
      } catch {
        results.push({ email, status: 'skipped_no_mx', at: new Date().toISOString() }); saveReceipt(); continue;
      }
      // Reserve before SMTP to avoid duplicate sends after concurrent runs or crashes.
      // The unique email also protects against the existing Vercel cron.
      const reservation = await prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(269101028)::text`;
        const count = await tx.outreachSent.count({ where: { sentAt: { gte: dayStart } } });
        if (count >= dailyTarget || await tx.outreachSent.findUnique({ where: { email } })) return null;
        return tx.outreachSent.create({ data: { email, nome: academy.nome, cidade: academy.cidade, estado: academy.estado, bounceReason: 'LOCAL_RESERVED: SMTP acceptance not yet confirmed' } });
      });
      if (!reservation) continue;
      results.push({ email, nome: academy.nome, recordId: reservation.id, status: 'reserved', at: new Date().toISOString() });
      saveReceipt();
      const result = results[results.length - 1];
      try {
        const info = await transport.sendMail({ from: '"OssTrack" <passador@osstrack.com>', to: email,
          subject: 'OssTrack — Plataforma gratuita para sua academia de Jiu-Jitsu',
          html: renderEmail(academy.nome, academy.cidade, reservation.id, academy.personalization, academy.personalizedQuestion) });
        if (!info.accepted?.some(a => emailKey(String(a)) === email)) throw new Error('SMTP did not confirm acceptance');
        result.status = 'smtp_accepted'; result.messageId = info.messageId;
        saveReceipt();
        await prisma.outreachSent.update({ where: { id: reservation.id }, data: { sentAt: new Date(), bounceReason: null } });
        if (!legacy.sent.map(emailKey).includes(email)) legacy.sent.push(email);
        legacy.lastSent = day; legacy.totalSent = legacy.sent.length;
        fs.writeFileSync(path.join(root, 'scripts/sent.json'), JSON.stringify(legacy, null, 2) + '\n');
      } catch (error) {
        // Never automatically retry an ambiguous result: SMTP may have accepted it.
        if (result.status !== 'smtp_accepted') result.status = 'send_unconfirmed_no_auto_retry';
        result.errorCode = error.code || error.constructor.name;
        saveReceipt();
      }
      console.log(JSON.stringify(result));
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log(JSON.stringify({ accepted: results.filter(r => r.status === 'smtp_accepted').length,
      unconfirmed: results.filter(r => r.status === 'send_unconfirmed_no_auto_retry').length,
      skipped: results.filter(r => r.status === 'skipped_no_mx').length, receipt: receiptPath }));
  } finally { transport.close(); }
}

main().catch(error => { console.error(JSON.stringify({ errorType: error.constructor.name, code: error.code || null, message: 'Outreach stopped; inspect private local records. No automatic retry.' })); process.exitCode = 1; }).finally(() => prisma.$disconnect());
