// Efek suara sederhana dengan WebAudio (tanpa file audio).

let audioCtx = null

function getContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return null
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})
  return audioCtx
}

/** Panggil dari gesture pengguna (klik Mulai) supaya browser mengizinkan audio. */
export function unlockAudio() {
  getContext()
}

const PRESETS = {
  start: [[523, 0.07], [784, 0.1]],
  eat: [[660, 0.05], [990, 0.07]],
  bonus: [[784, 0.06], [988, 0.06], [1319, 0.1]],
  die: [[330, 0.12, 'sawtooth'], [220, 0.14, 'sawtooth'], [147, 0.25, 'sawtooth']],
}

export function playSound(name) {
  const notes = PRESETS[name]
  const ctx = notes && getContext()
  if (!ctx) return

  let t = ctx.currentTime
  for (const [frequency, duration, type = 'square'] of notes) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, t)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + duration + 0.02)
    t += duration * 0.9
  }
}

export function vibrate(pattern) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // tidak didukung
  }
}
