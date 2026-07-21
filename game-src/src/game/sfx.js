// 零素材音效：用 WebAudio 实时合成，无需任何音频文件
let ctx = null
let muted = false

function ac() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch {
      ctx = null
    }
  }
  return ctx
}

// 需要在用户手势里调用一次以解锁音频
export function unlock() {
  const c = ac()
  if (c && c.state === 'suspended') c.resume()
}

export function setMuted(m) {
  muted = m
}
export function isMuted() {
  return muted
}

function blip(freq, dur, type = 'sine', vol = 0.2, slideTo = null) {
  const c = ac()
  if (!c || muted) return
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export const sfx = {
  // 吞噬：音高随连击升高
  eat(combo = 1) {
    const base = 220 + Math.min(combo, 12) * 22
    blip(base, 0.12, 'triangle', 0.14, base * 1.6)
  },
  // 吞掉大物体：低沉有力
  big() {
    blip(90, 0.28, 'sawtooth', 0.22, 50)
    blip(150, 0.3, 'sine', 0.15, 70)
  },
  power() {
    blip(500, 0.12, 'square', 0.14, 900)
    setTimeout(() => blip(760, 0.14, 'square', 0.12, 1200), 90)
  },
  win() {
    const notes = [523, 659, 784, 1046]
    notes.forEach((n, i) => setTimeout(() => blip(n, 0.22, 'triangle', 0.2), i * 130))
  },
  lose() {
    blip(300, 0.4, 'sine', 0.18, 120)
  },
}

// ---------- 背景音乐：程序化环境琶音循环 ----------
let musicTimer = null
let musicOn = false
// 小调五声音阶，慵懒的太空氛围
const SCALE = [196.0, 233.08, 261.63, 293.66, 349.23, 392.0, 466.16]

function musicStep() {
  if (!musicOn) return
  const c = ac()
  if (c && !muted) {
    // 每拍随机挑 1-2 个音，音量很轻，做背景铺垫
    const n = SCALE[Math.floor(Math.random() * SCALE.length)]
    blip(n, 0.5, 'sine', 0.05, n)
    if (Math.random() < 0.4) {
      blip(n * 2, 0.4, 'triangle', 0.03)
    }
    // 低音根音
    if (Math.random() < 0.5) blip(98, 0.6, 'sine', 0.05)
  }
  musicTimer = setTimeout(musicStep, 420)
}

export function startMusic() {
  if (musicOn) return
  musicOn = true
  musicStep()
}
export function stopMusic() {
  musicOn = false
  if (musicTimer) clearTimeout(musicTimer)
  musicTimer = null
}
