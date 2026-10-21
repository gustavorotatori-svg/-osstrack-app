import { NextResponse } from "next/server"
import { ImapFlow } from "imapflow"
import { simpleParser } from "mailparser"
import nodemailer from "nodemailer"
import prisma from "@/lib/prisma"
import { verifyCronAuth } from "@/lib/cron-auth"
import { findBestReply, getDefaultReply } from "@/lib/auto-reply"

const IMAP_HOST = process.env.IMAP_HOST || "imap.secureserver.net"
const IMAP_PORT = parseInt(process.env.IMAP_PORT || "993", 10)
const IMAP_USER = process.env.IMAP_USER || "passador@osstrack.com"
const IMAP_PASS = process.env.IMAP_PASS

const SMTP_HOST = process.env.SMTP_HOST || "smtpout.secureserver.net"
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10)
const SMTP_USER = process.env.SMTP_USER || "passador@osstrack.com"
const SMTP_PASS = process.env.SMTP_PASS
const FROM_EMAIL = process.env.FROM_EMAIL || "passador@osstrack.com"
const FROM_NAME = process.env.FROM_NAME || "OssTrack"

const MAX_EMAILS_PER_RUN = 10

export async function GET(request: Request) {
  const authError = await verifyCronAuth(request)
  if (authError) return authError

  if (!IMAP_PASS || !SMTP_PASS) {
    return NextResponse.json({ error: "IMAP_PASS or SMTP_PASS not configured" }, { status: 500 })
  }

  const client = new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: { user: IMAP_USER, pass: IMAP_PASS },
    logger: false,
  })

  let processed = 0
  let replied = 0
  let skipped = 0
  let errors = 0

  try {
    await client.connect()
    const lock = await client.getMailboxLock("INBOX")

    try {
      const seenIds = new Set(
        (await prisma.autoReplyLog.findMany({ select: { fromEmail: true } })).map((l) => l.fromEmail)
      )

      const uids = await client.search({ seen: false }, { uid: true })

      if (uids && uids.length > 0) {
        const toProcess = uids.slice(0, MAX_EMAILS_PER_RUN)

        for (const uid of toProcess) {
          try {
            const msg = await client.fetchOne(uid, { source: true, envelope: true }, { uid: true })
            if (!msg || !msg.source) continue

            const parsed = await simpleParser(msg.source)
            const fromEmail = parsed.from?.value?.[0]?.address || ""
            const fromName = parsed.from?.value?.[0]?.name || ""
            const subject = parsed.subject || "(sem assunto)"
            const body = parsed.text || parsed.html || ""

            if (!fromEmail || fromEmail.includes("osstrack.com") || seenIds.has(fromEmail)) {
              skipped++
              continue
            }

            if (
              fromEmail.includes("mailer-daemon") ||
              fromEmail.includes("postmaster") ||
              fromEmail.includes("bounce") ||
              fromEmail.includes("noreply") ||
              fromEmail.includes("no-reply") ||
              subject.includes("Delivery Status Notification") ||
              subject.includes("Undelivered") ||
              subject.includes("Returned mail") ||
              subject.includes("Delivery failure") ||
              subject.includes("Mail delivery failed") ||
              subject.includes("Message Delivery Failure") ||
              subject.includes("Out of Office") ||
              subject.includes("Auto-Reply") ||
              subject.includes("Automatic reply") ||
              body.includes("automatically generated Delivery Status Notification") ||
              body.includes("Delivery to the following recipients failed")
            ) {
              const bounceMatch = body.match(/[\w.+-]+@[\w-]+\.[\w.]+/g)
              if (bounceMatch) {
                for (const bouncedEmail of bounceMatch) {
                  if (!bouncedEmail.includes("osstrack.com") && !bouncedEmail.includes("mailer-daemon")) {
                    try {
                      await prisma.outreachSent.update({
                        where: { email: bouncedEmail.toLowerCase() },
                        data: {
                          bouncedAt: new Date(),
                          bounceReason: body.slice(0, 500),
                        },
                      })
                    } catch {}
                  }
                }
              }
              seenIds.add(fromEmail)
              skipped++
              continue
            }

            const match = findBestReply(body, subject)
            const replyBody = match ? match.rule.response : getDefaultReply()
            const matchedRule = match ? match.rule.id : null

            const transporter = nodemailer.createTransport({
              host: SMTP_HOST,
              port: SMTP_PORT,
              secure: SMTP_PORT === 465,
              auth: { user: SMTP_USER, pass: SMTP_PASS },
            })

            await transporter.sendMail({
              from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
              to: fromEmail,
              subject: `Re: ${subject}`,
              html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">${replyBody.replace(/\n/g, "<br>")}</div>`,
              inReplyTo: parsed.messageId,
              references: parsed.messageId,
            })

            await prisma.autoReplyLog.create({
              data: {
                fromEmail,
                fromName,
                subject,
                bodyPreview: body.slice(0, 500),
                matchedRule,
                responseSent: true,
                repliedAt: new Date(),
              },
            })

            seenIds.add(fromEmail)
            replied++
            processed++
          } catch {
            errors++
            processed++
          }
        }
      }
    } finally {
      lock.release()
    }

    await client.logout()

    return NextResponse.json({ processed, replied, skipped, errors })
  } catch {
    try { await client.logout() } catch {}
    return NextResponse.json({ error: "Failed to process emails" }, { status: 500 })
  }
}
