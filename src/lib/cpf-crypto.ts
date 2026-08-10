import crypto from "crypto"

const KEY_HEX = process.env.CPF_ENCRYPTION_KEY || ""

function getKey(): Buffer | null {
  if (!KEY_HEX) return null
  const key = Buffer.from(KEY_HEX, "hex")
  return key.length === 32 ? key : null
}

export function encryptCpf(cpf: string | null | undefined): string | null {
  if (!cpf) return null
  const key = getKey()
  if (!key) return cpf
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const enc = Buffer.concat([cipher.update(cpf, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `enc:v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`
}

export function decryptCpf(value: string | null | undefined): string | null {
  if (!value) return null
  if (!value.startsWith("enc:v1:")) return value
  const parts = value.split(":")
  if (parts.length !== 5) return null
  const [, , ivB64, tagB64, dataB64] = parts
  try {
    const key = getKey()
    if (!key) return value
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"))
    decipher.setAuthTag(Buffer.from(tagB64, "base64"))
    const dec = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()])
    return dec.toString("utf8")
  } catch {
    return null
  }
}
