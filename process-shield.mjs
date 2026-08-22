import sharp from "sharp"
import fs from "node:fs"

const C = "C:/Users/rotat/Downloads/ChatGPT Image 9 de ago. de 2026, 21_25_59.png"
const D = "C:/Users/rotat/Downloads/ChatGPT Image 9 de ago. de 2026, 21_26_49.png"
const PUBLIC = "C:/Users/rotat/OneDrive/Área de Trabalho/opencode/public"
const SRC_ICON = "C:/Users/rotat/OneDrive/Área de Trabalho/opencode/src/app/icon.png"

function floodBGFill(buf, w, h, c, bg, threshold) {
  const visited = new Uint8Array(w * h)
  const stack = []
  const isBG = (i) =>
    Math.abs(buf[i] - bg[0]) + Math.abs(buf[i + 1] - bg[1]) + Math.abs(buf[i + 2] - bg[2]) < threshold
  const push = (idx) => {
    if (!visited[idx] && isBG(idx)) { visited[idx] = 1; stack.push(idx) }
  }
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x) }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1) }
  while (stack.length) {
    const i = stack.pop()
    const x = i % w, y = (i - x) / w
    if (x > 0) push(i - 1)
    if (x < w - 1) push(i + 1)
    if (y > 0) push(i - w)
    if (y < h - 1) push(i + w)
  }
  return visited
}

async function extractShield(src, bg, threshold) {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: c } = info
  const visited = floodBGFill(data, w, h, c, bg, threshold)
  const out = Buffer.alloc(w * h * 4)
  for (let i = 0, o = 0; i < data.length; i += c, o += 4) {
    if (visited[i / c]) { out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0 }
    else { out[o] = data[i]; out[o + 1] = data[i + 1]; out[o + 2] = data[i + 2]; out[o + 3] = 255 }
  }
  const png = await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .trim({ background: [0, 0, 0], threshold: 10 })
    .png()
    .toBuffer()
  return png
}

async function tileIcon(shieldPng, size, shieldPct, bg) {
  const bw = Math.round(size * shieldPct)
  const bh = Math.round(bw / 1.1)
  const overlay = await sharp(shieldPng).resize(bw, bh).png().toBuffer()
  return sharp({ create: { width: size, height: size, channels: 4, background: [bg[0], bg[1], bg[2], 255] } })
    .composite([{ input: overlay, left: Math.round((size - bw) / 2), top: Math.round((size - bh) / 2) }])
    .png()
    .toBuffer()
}

const shieldLight = await extractShield(D, [0, 0, 0], 60)
const shieldDark = await extractShield(C, [255, 255, 255], 60)

await sharp(shieldLight).resize({ width: 512 }).png().toBuffer().then((b) => fs.writeFileSync(`${PUBLIC}/logo.png`, b))
await sharp(shieldDark).resize({ width: 512 }).png().toBuffer().then((b) => fs.writeFileSync(`${PUBLIC}/logo-dark.png`, b))

const bg = [16, 16, 16]
const icon192 = await tileIcon(shieldLight, 192, 0.78, bg)
const icon512 = await tileIcon(shieldLight, 512, 0.78, bg)
const maskable = await tileIcon(shieldLight, 192, 0.6, bg)
const apple = await tileIcon(shieldLight, 180, 0.74, bg)

fs.writeFileSync(`${PUBLIC}/icon-192.png`, icon192)
fs.writeFileSync(`${PUBLIC}/icon-512.png`, icon512)
fs.writeFileSync(`${PUBLIC}/icon-192-maskable.png`, maskable)
fs.writeFileSync(`${PUBLIC}/apple-touch-icon.png`, apple)
fs.writeFileSync(SRC_ICON, icon192)

for (const f of ["logo.png", "logo-dark.png", "icon-192.png", "icon-512.png", "icon-192-maskable.png", "apple-touch-icon.png"]) {
  console.log(f, fs.statSync(`${PUBLIC}/${f}`).size)
}
console.log("src/app/icon.png", fs.statSync(SRC_ICON).size)
