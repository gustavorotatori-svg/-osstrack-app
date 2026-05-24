let ctx: AudioContext | null = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return ctx
}

export function playBeep(freq = 660, duration = 0.15, volume = 0.3) {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(freq, c.currentTime)
    gain.gain.setValueAtTime(volume, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start()
    osc.stop(c.currentTime + duration)
  } catch {}
}

export function playCheckinSound() {
  playBeep(880, 0.1, 0.3)
  setTimeout(() => playBeep(1100, 0.15, 0.35), 100)
  setTimeout(() => playBeep(1320, 0.25, 0.4), 200)
}

export function playCelebrationSound() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => setTimeout(() => playBeep(f, 0.2, 0.35), i * 120))
  setTimeout(() => {
    ;[1047, 784, 1047, 1319].forEach((f, i) => setTimeout(() => playBeep(f, 0.25, 0.4), i * 150))
  }, 600)
}

export function playStreakSound(streak: number) {
  if (streak >= 30) playCelebrationSound()
  else if (streak >= 10) {
    playBeep(880, 0.15, 0.3)
    setTimeout(() => playBeep(1100, 0.2, 0.4), 150)
  } else playBeep(660, 0.15, 0.3)
}

export function playAmbience(volume = 0.05) {
  try {
    const c = getCtx()
    const bufferSize = c.sampleRate * 2
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(Math.random(), 3)
    }
    const source = c.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = c.createGain()
    gain.gain.setValueAtTime(volume, c.currentTime)
    const filter = c.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.setValueAtTime(200, c.currentTime)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(c.destination)
    source.start()
    return { stop: () => { try { source.stop() } catch {} } }
  } catch { return { stop: () => {} } }
}
