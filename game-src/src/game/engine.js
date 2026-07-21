import { OBJECTS, POWERUP_KINDS, POWERUP_INFO } from './scenes.js'
import { sfx, unlock as unlockAudio } from './sfx.js'

// ---------- 小工具 ----------
const rand = (a, b) => a + Math.random() * (b - a)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const lerp = (a, b, t) => a + (b - a) * t

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255
  const f = amt < 0 ? 1 + amt : 1
  const add = amt > 0 ? amt * 255 : 0
  r = clamp(Math.round(r * f + add), 0, 255)
  g = clamp(Math.round(g * f + add), 0, 255)
  b = clamp(Math.round(b * f + add), 0, 255)
  return `rgb(${r},${g},${b})`
}

// ---------- 引擎 ----------
export class Game {
  constructor(canvas, scene, callbacks = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.scene = scene
    this.cb = callbacks
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)

    this.running = false
    this.paused = false
    this.finished = false

    this.hole = { x: 0, y: 0, r: scene.startRadius }
    this.objects = []
    this.powerups = []
    this.effects = { speed: 0, magnet: 0, freeze: 0 }
    this._lastEffectsKey = ''
    this.time = scene.duration
    this.score = 0
    this.combo = 0
    this.comboTimer = 0
    this.eatenCount = 0
    this.floaters = []
    this.burst = [] // 吞噬迸溅粒子
    this.orbits = [] // 环绕漩涡粒子
    this.shake = 0

    this.cam = { x: 0, y: 0, scale: 1 }
    this.pointer = { active: false, x: 0, y: 0 }
    this.keys = new Set()

    this._buildWorld()
    this._buildDecor()
    this._buildOrbits()
    this._buildStars()
    this._bindInput()
    this._resize()
    this._onResize = () => this._resize()
    window.addEventListener('resize', this._onResize)
  }

  _buildWorld() {
    const spawn = this.scene.spawn
    let footprint = 0
    for (const s of spawn) {
      const t = OBJECTS[s.type]
      footprint += s.count * t.size * t.size * 4
    }
    const world = clamp(Math.sqrt(footprint) * 3.2, 1600, 4600)
    this.world = { w: world, h: world * 0.72 }
    this.hole.x = this.world.w / 2
    this.hole.y = this.world.h / 2

    const objs = []
    for (const s of spawn) {
      const t = OBJECTS[s.type]
      for (let i = 0; i < s.count; i++) {
        const o = {
          type: s.type,
          ...t,
          x: rand(t.size, this.world.w - t.size),
          y: rand(t.size, this.world.h - t.size),
          rot: rand(0, Math.PI * 2),
          fall: 0,
          gone: false,
        }
        if (t.mobile) {
          const a = rand(0, Math.PI * 2)
          const sp = t.mobile === 'drive' ? rand(60, 100) : rand(20, 45)
          o.vx = Math.cos(a) * sp
          o.vy = Math.sin(a) * sp
          o.baseSpeed = sp
          o.wanderT = rand(0, 3)
        }
        if (t.boss) {
          // Boss 放到远离出生点的角落，避免一开始就撞见
          o.x = rand(0.15, 0.85) < 0.5 ? rand(t.size, this.world.w * 0.25) : rand(this.world.w * 0.75, this.world.w - t.size)
          o.y = rand(0.15, 0.85) < 0.5 ? rand(t.size, this.world.h * 0.25) : rand(this.world.h * 0.75, this.world.h - t.size)
        }
        objs.push(o)
      }
    }
    for (const o of objs) {
      const d = Math.hypot(o.x - this.hole.x, o.y - this.hole.y)
      if (d < 130 && o.size > 20) o.x = (o.x + 300) % this.world.w
    }
    this.objects = objs
    this.totalObjects = objs.length

    // 道具
    const n = this.scene.powerups || 0
    for (let i = 0; i < n; i++) {
      this.powerups.push({
        x: rand(this.world.w * 0.12, this.world.w * 0.88),
        y: rand(this.world.h * 0.12, this.world.h * 0.88),
        kind: POWERUP_KINDS[i % POWERUP_KINDS.length],
        taken: false,
        bob: rand(0, Math.PI * 2),
      })
    }
  }

  _buildDecor() {
    const kind = this.scene.decor
    const W = this.world.w
    const H = this.world.h
    const d = { kind, roads: [], blobs: [], cracks: [] }
    if (kind === 'roads') {
      for (let y = H * 0.2; y < H; y += H * 0.24) d.roads.push({ x: 0, y: y - 34, w: W, h: 68, dir: 'h' })
      for (let x = W * 0.2; x < W; x += W * 0.24) d.roads.push({ x: x - 34, y: 0, w: 68, h: H, dir: 'v' })
    } else if (kind === 'water' || kind === 'ice' || kind === 'craters') {
      const count = kind === 'craters' ? 10 : 5
      for (let i = 0; i < count; i++) {
        d.blobs.push({ x: rand(W * 0.1, W * 0.9), y: rand(H * 0.1, H * 0.9), rx: rand(80, 220), ry: rand(60, 150) })
      }
    } else if (kind === 'lava') {
      for (let i = 0; i < 7; i++) {
        const pts = []
        let x = rand(0, W)
        let y = rand(0, H)
        for (let k = 0; k < 6; k++) {
          x = clamp(x + rand(-120, 120), 0, W)
          y = clamp(y + rand(-120, 120), 0, H)
          pts.push({ x, y })
        }
        d.cracks.push(pts)
      }
    }
    this.decorData = d
  }

  _buildStars() {
    // 太空/赛博场景的周围星空（世界坐标，覆盖比地图更大的区域）
    this.stars = []
    const sur = this.scene.surround
    if (!sur || sur.type !== 'void') return
    const W = this.world.w
    const H = this.world.h
    for (let i = 0; i < 160; i++) {
      this.stars.push({
        x: rand(-W * 0.6, W * 1.6),
        y: rand(-H * 0.6, H * 1.6),
        r: rand(0.6, 2.4),
        a: rand(0.2, 0.9),
        ph: rand(0, Math.PI * 2),
        sp: rand(1, 3),
      })
    }
  }

  _buildOrbits() {
    for (let i = 0; i < 30; i++) {
      this.orbits.push({
        a: rand(0, Math.PI * 2),
        distF: rand(1.05, 1.55),
        spd: rand(1.2, 2.6) * (Math.random() < 0.5 ? 1 : -1),
        size: rand(1.5, 3.5),
        alpha: rand(0.15, 0.5),
      })
    }
  }

  _bindInput() {
    const c = this.canvas
    const getPos = (e) => {
      const r = c.getBoundingClientRect()
      const p = e.touches ? e.touches[0] : e
      return { x: p.clientX - r.left, y: p.clientY - r.top }
    }
    this._down = (e) => {
      e.preventDefault()
      unlockAudio()
      const p = getPos(e)
      this.pointer.active = true
      this.pointer.x = p.x
      this.pointer.y = p.y
    }
    this._move = (e) => {
      if (!this.pointer.active) return
      const p = getPos(e)
      this.pointer.x = p.x
      this.pointer.y = p.y
    }
    this._up = () => {
      this.pointer.active = false
    }
    c.addEventListener('mousedown', this._down)
    window.addEventListener('mousemove', this._move)
    window.addEventListener('mouseup', this._up)
    c.addEventListener('touchstart', this._down, { passive: false })
    c.addEventListener('touchmove', this._move, { passive: false })
    window.addEventListener('touchend', this._up)

    this._key = (e) => {
      const k = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        unlockAudio()
        if (e.type === 'keydown') this.keys.add(k)
        else this.keys.delete(k)
      }
    }
    window.addEventListener('keydown', this._key)
    window.addEventListener('keyup', this._key)
  }

  _resize() {
    const c = this.canvas
    const w = c.clientWidth
    const h = c.clientHeight
    c.width = Math.round(w * this.dpr)
    c.height = Math.round(h * this.dpr)
    this.cssW = w
    this.cssH = h
  }

  start() {
    this.running = true
    this.last = performance.now()
    this._loop = this._frame.bind(this)
    requestAnimationFrame(this._loop)
  }

  setPaused(p) {
    this.paused = p
    if (!p && this.running) {
      this.last = performance.now()
      requestAnimationFrame(this._loop)
    }
  }

  destroy() {
    this.running = false
    window.removeEventListener('resize', this._onResize)
    window.removeEventListener('mousemove', this._move)
    window.removeEventListener('mouseup', this._up)
    window.removeEventListener('touchend', this._up)
    window.removeEventListener('keydown', this._key)
    window.removeEventListener('keyup', this._key)
    this.canvas.removeEventListener('mousedown', this._down)
    this.canvas.removeEventListener('touchstart', this._down)
    this.canvas.removeEventListener('touchmove', this._move)
  }

  _frame(now) {
    if (!this.running || this.paused) return
    let dt = (now - this.last) / 1000
    this.last = now
    dt = Math.min(dt, 0.05)
    this._update(dt)
    this._render()
    if (this.running && !this.paused) requestAnimationFrame(this._loop)
  }

  screenToWorld(sx, sy) {
    return {
      x: this.cam.x + (sx - this.cssW / 2) / this.cam.scale,
      y: this.cam.y + (sy - this.cssH / 2) / this.cam.scale,
    }
  }

  _update(dt) {
    if (this.finished) return

    // 道具计时
    let effectsChanged = false
    for (const kind of POWERUP_KINDS) {
      if (this.effects[kind] > 0) {
        this.effects[kind] -= dt
        if (this.effects[kind] <= 0) {
          this.effects[kind] = 0
          effectsChanged = true
        }
      }
    }

    // 计时（冻结时不减）
    if (this.effects.freeze <= 0) {
      this.time -= dt
      if (this.time <= 0) {
        this.time = 0
        this._finish()
      }
    }
    this.cb.onTime?.(this.time, this.effects.freeze > 0)

    if (this.comboTimer > 0) {
      this.comboTimer -= dt
      if (this.comboTimer <= 0) this.combo = 0
    }

    // ---- 移动黑洞 ----
    const speedMul = this.effects.speed > 0 ? 1.7 : 1
    const speed = 300 * (1 + this.hole.r / 260) * speedMul
    let vx = 0,
      vy = 0
    const k = this.keys
    if (k.has('w') || k.has('arrowup')) vy -= 1
    if (k.has('s') || k.has('arrowdown')) vy += 1
    if (k.has('a') || k.has('arrowleft')) vx -= 1
    if (k.has('d') || k.has('arrowright')) vx += 1
    if (vx || vy) {
      const m = Math.hypot(vx, vy)
      vx /= m
      vy /= m
    } else if (this.pointer.active) {
      const target = this.screenToWorld(this.pointer.x, this.pointer.y)
      const dx = target.x - this.hole.x
      const dy = target.y - this.hole.y
      const d = Math.hypot(dx, dy)
      if (d > 4) {
        const g = clamp(d / 90, 0, 1)
        vx = (dx / d) * g
        vy = (dy / d) * g
      }
    }
    this.hole.x = clamp(this.hole.x + vx * speed * dt, this.hole.r, this.world.w - this.hole.r)
    this.hole.y = clamp(this.hole.y + vy * speed * dt, this.hole.r, this.world.h - this.hole.r)

    // ---- 相机 ----（数值越小画面越近、物体越大）
    const viewH = 300 + this.hole.r * 16
    const targetScale = this.cssH / viewH
    this.cam.scale = lerp(this.cam.scale, targetScale, 1 - Math.pow(0.001, dt))
    this.cam.x = lerp(this.cam.x, this.hole.x, 1 - Math.pow(0.0001, dt))
    this.cam.y = lerp(this.cam.y, this.hole.y, 1 - Math.pow(0.0001, dt))

    // ---- 移动物体 AI（游走 + 逃跑） ----
    const hole = this.hole
    for (const o of this.objects) {
      if (o.gone || o.fall > 0 || !o.mobile) continue
      const dx = o.x - hole.x
      const dy = o.y - hole.y
      const d = Math.hypot(dx, dy) || 1
      const fear = o.mobile === 'drive' ? 340 : 240
      if (d < fear) {
        // 逃离黑洞
        const flee = o.baseSpeed * 2.4
        o.vx = lerp(o.vx, (dx / d) * flee, 0.15)
        o.vy = lerp(o.vy, (dy / d) * flee, 0.15)
      } else {
        // 随机游走
        o.wanderT -= dt
        if (o.wanderT <= 0) {
          const a = rand(0, Math.PI * 2)
          o.vx = Math.cos(a) * o.baseSpeed
          o.vy = Math.sin(a) * o.baseSpeed
          o.wanderT = rand(1.5, 4)
        }
      }
      o.x += o.vx * dt
      o.y += o.vy * dt
      if (o.x < o.size || o.x > this.world.w - o.size) o.vx *= -1
      if (o.y < o.size || o.y > this.world.h - o.size) o.vy *= -1
      o.x = clamp(o.x, o.size, this.world.w - o.size)
      o.y = clamp(o.y, o.size, this.world.h - o.size)
    }

    // ---- 吞噬 ----
    const magnet = this.effects.magnet > 0
    const pullOuter = hole.r * (magnet ? 4.6 : 2.4)
    for (const o of this.objects) {
      if (o.gone) continue
      if (o.fall > 0) {
        o.fall += dt / 0.32
        o.x = lerp(o.x, hole.x, 0.25)
        o.y = lerp(o.y, hole.y, 0.25)
        o.rot += dt * 6
        if (o.fall >= 1) o.gone = true
        continue
      }
      const dx = o.x - hole.x
      const dy = o.y - hole.y
      const d = Math.hypot(dx, dy) || 1
      const eatable = hole.r >= o.size * 0.82
      if (!eatable) continue
      if (d < hole.r + o.size * 0.25) {
        this._eat(o)
      } else if (d < pullOuter) {
        const pull = (1 - d / pullOuter) * (magnet ? 520 : 260) * dt
        o.x -= (dx / d) * pull
        o.y -= (dy / d) * pull
      }
    }

    // ---- 道具拾取 ----
    for (const p of this.powerups) {
      if (p.taken) continue
      p.bob += dt * 3
      const d = Math.hypot(p.x - hole.x, p.y - hole.y)
      if (d < hole.r + 26) {
        p.taken = true
        this.effects[p.kind] = POWERUP_INFO[p.kind].dur
        effectsChanged = true
        sfx.power()
        this._spawnBurst(p.x, p.y, POWERUP_INFO[p.kind].color, 12)
      }
    }
    if (effectsChanged) this._emitEffects()

    // ---- 粒子 ----
    for (const o of this.orbits) o.a += o.spd * dt
    for (const b of this.burst) {
      b.life -= dt
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.vx *= 0.92
      b.vy *= 0.92
    }
    this.burst = this.burst.filter((b) => b.life > 0)

    for (const f of this.floaters) {
      f.life -= dt
      f.y -= 26 * dt
    }
    this.floaters = this.floaters.filter((f) => f.life > 0)

    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 26)
  }

  _emitEffects() {
    const list = POWERUP_KINDS.filter((kdd) => this.effects[kdd] > 0).map((kind) => ({
      kind,
      remain: this.effects[kind],
      dur: POWERUP_INFO[kind].dur,
    }))
    const key = list.map((e) => e.kind).join(',')
    this._lastEffectsKey = key
    this.cb.onEffects?.(list)
  }

  _spawnBurst(x, y, color, n = 6) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2)
      const sp = rand(40, 160)
      this.burst.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.3, 0.6), color, size: rand(1.5, 3.5) })
    }
  }

  _eat(o) {
    o.fall = 0.0001
    this.eatenCount++
    this.combo = this.comboTimer > 0 ? this.combo + 1 : 1
    this.comboTimer = 1.3
    const mult = 1 + Math.min(this.combo - 1, 9) * 0.1
    const gained = Math.round(o.value * mult)
    this.score += gained
    this.cb.onScore?.(this.score, this.combo)

    const holeArea = Math.PI * this.hole.r * this.hole.r
    const objArea = Math.PI * o.size * o.size
    this.hole.r = Math.sqrt((holeArea + objArea * 0.16) / Math.PI)

    this.floaters.push({ x: o.x, y: o.y - o.h, text: '+' + gained, life: 0.8, big: o.value > 80 })
    this._spawnBurst(o.x, o.y, o.color, o.value > 80 ? 10 : 5)

    if (o.value >= 90) {
      sfx.big()
      this.shake = Math.min(14, 5 + o.size * 0.05)
    } else {
      sfx.eat(this.combo)
    }
  }

  _finish() {
    if (this.finished) return
    this.finished = true
    this.running = false
    const stars = this._stars()
    if (stars > 0) sfx.win()
    else sfx.lose()
    this.cb.onEnd?.({ score: this.score, stars, eaten: this.eatenCount, total: this.totalObjects })
  }

  _stars() {
    const t = this.scene.stars
    if (this.score >= t[2]) return 3
    if (this.score >= t[1]) return 2
    if (this.score >= t[0]) return 1
    return 0
  }

  // ---------- 渲染 ----------
  _render() {
    const ctx = this.ctx
    const P = this.scene.palette
    const sur = this.scene.surround
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.cssW, this.cssH)
    // 屏幕底色 = 周围环境（海水/虚空/熔岩），不再是纯黑
    ctx.fillStyle = (sur && sur.outer) || P.fog
    ctx.fillRect(0, 0, this.cssW, this.cssH)

    ctx.save()
    const sh = this.shake
    const ox = sh ? rand(-sh, sh) : 0
    const oy = sh ? rand(-sh, sh) : 0
    ctx.translate(this.cssW / 2 + ox, this.cssH / 2 + oy)
    ctx.scale(this.cam.scale, this.cam.scale)
    ctx.translate(-this.cam.x, -this.cam.y)

    this._drawSurroundWorld(ctx, sur)
    this._drawGround(ctx, P)
    this._drawDecor(ctx, P)
    this._drawPowerups(ctx)
    this._drawHoleBase(ctx)
    this._drawOrbits(ctx)

    const normal = []
    const falling = []
    for (const o of this.objects) {
      if (o.gone) continue
      if (o.fall > 0) falling.push(o)
      else normal.push(o)
    }
    normal.sort((a, b) => a.y - b.y)
    for (const o of normal) this._drawObject(ctx, o, 1)

    ctx.save()
    ctx.beginPath()
    ctx.ellipse(this.hole.x, this.hole.y, this.hole.r, this.hole.r * 0.9, 0, 0, Math.PI * 2)
    ctx.clip()
    for (const o of falling) this._drawObject(ctx, o, 1 - o.fall)
    ctx.restore()

    this._drawHoleRim(ctx)

    // 迸溅粒子
    for (const b of this.burst) {
      ctx.globalAlpha = clamp(b.life / 0.6, 0, 1)
      ctx.fillStyle = b.color
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // 飘字
    ctx.textAlign = 'center'
    for (const f of this.floaters) {
      ctx.globalAlpha = clamp(f.life / 0.8, 0, 1)
      ctx.fillStyle = f.big ? '#ffd166' : '#ffffff'
      ctx.font = `bold ${f.big ? 34 : 22}px system-ui, sans-serif`
      ctx.fillText(f.text, f.x, f.y)
    }
    ctx.globalAlpha = 1

    ctx.restore()

    const g = ctx.createRadialGradient(
      this.cssW / 2, this.cssH / 2, this.cssH * 0.35,
      this.cssW / 2, this.cssH / 2, this.cssH * 0.85
    )
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.35)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, this.cssW, this.cssH)
  }

  _drawSurroundWorld(ctx, sur) {
    if (!sur) return
    const W = this.world.w
    const H = this.world.h
    const t = performance.now() / 1000
    if (sur.type === 'void') {
      for (const s of this.stars) {
        ctx.globalAlpha = s.a * (0.45 + 0.55 * Math.abs(Math.sin(t * s.sp + s.ph)))
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    } else if (sur.type === 'sea') {
      // 缓慢起伏的波纹带（世界坐标，环绕岛屿）
      ctx.strokeStyle = 'rgba(255,255,255,0.10)'
      ctx.lineWidth = 6
      const off = (t * 20) % 90
      for (let i = -3; i < 8; i++) {
        const m = 40 + i * 90 + off
        ctx.strokeRect(-m, -m, W + 2 * m, H + 2 * m)
      }
    } else if (sur.type === 'lava') {
      // 岩浆辉光环绕
      ctx.strokeStyle = 'rgba(255,90,30,0.18)'
      ctx.lineWidth = 10
      ctx.shadowColor = '#ff5a1e'
      ctx.shadowBlur = 30
      for (let i = 0; i < 4; i++) {
        const m = 30 + i * 70 + (Math.sin(t + i) * 8)
        ctx.strokeRect(-m, -m, W + 2 * m, H + 2 * m)
      }
      ctx.shadowBlur = 0
    }
  }

  _drawGround(ctx, P) {
    const sur = this.scene.surround
    // 海岸/边缘过渡环：让地图像一座岛屿，而不是硬边黑幕
    if (sur && sur.shore) {
      const m = 70
      ctx.fillStyle = sur.shore
      roundRect(ctx, -m, -m, this.world.w + 2 * m, this.world.h + 2 * m, m * 0.8)
      ctx.fill()
    }
    ctx.fillStyle = P.ground
    ctx.fillRect(0, 0, this.world.w, this.world.h)
    ctx.strokeStyle = P.grid
    ctx.lineWidth = 1
    const step = 120
    ctx.beginPath()
    for (let x = 0; x <= this.world.w; x += step) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.world.h)
    }
    for (let y = 0; y <= this.world.h; y += step) {
      ctx.moveTo(0, y)
      ctx.lineTo(this.world.w, y)
    }
    ctx.stroke()
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'
    ctx.lineWidth = 8
    ctx.strokeRect(0, 0, this.world.w, this.world.h)
  }

  _drawDecor(ctx, P) {
    const d = this.decorData
    if (!d) return
    if (d.kind === 'roads') {
      for (const r of d.roads) {
        ctx.fillStyle = P.road
        ctx.fillRect(r.x, r.y, r.w, r.h)
        ctx.strokeStyle = P.roadLine
        ctx.lineWidth = 3
        ctx.setLineDash([18, 16])
        ctx.beginPath()
        if (r.dir === 'h') {
          ctx.moveTo(r.x, r.y + r.h / 2)
          ctx.lineTo(r.x + r.w, r.y + r.h / 2)
        } else {
          ctx.moveTo(r.x + r.w / 2, r.y)
          ctx.lineTo(r.x + r.w / 2, r.y + r.h)
        }
        ctx.stroke()
        ctx.setLineDash([])
      }
    } else if (d.kind === 'water') {
      for (const b of d.blobs) {
        ctx.fillStyle = P.water || '#3a8fd0'
        ctx.beginPath()
        ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (d.kind === 'ice') {
      for (const b of d.blobs) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.beginPath()
        ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (d.kind === 'craters') {
      for (const b of d.blobs) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)'
        ctx.beginPath()
        ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (d.kind === 'lava') {
      ctx.strokeStyle = P.lava || '#ff5a1e'
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.shadowColor = P.lava || '#ff5a1e'
      ctx.shadowBlur = 20
      for (const pts of d.cracks) {
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
        ctx.stroke()
      }
      ctx.shadowBlur = 0
    }
  }

  _drawPowerups(ctx) {
    for (const p of this.powerups) {
      if (p.taken) continue
      const info = POWERUP_INFO[p.kind]
      const yy = p.y + Math.sin(p.bob) * 6
      ctx.save()
      ctx.shadowColor = info.color
      ctx.shadowBlur = 18
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath()
      ctx.arc(p.x, yy, 20, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = info.color
      ctx.beginPath()
      ctx.arc(p.x, yy, 20, 0, Math.PI * 2)
      ctx.globalAlpha = 0.3
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.font = '22px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(info.icon, p.x, yy + 1)
      ctx.textBaseline = 'alphabetic'
      ctx.restore()
    }
  }

  _drawHoleBase(ctx) {
    const { x, y, r } = this.hole
    const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r)
    g.addColorStop(0, '#000000')
    g.addColorStop(0.7, '#05060a')
    g.addColorStop(1, '#12131c')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 0.9, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  _drawOrbits(ctx) {
    const { x, y, r } = this.hole
    const magnet = this.effects.magnet > 0
    for (const o of this.orbits) {
      const dist = r * o.distF
      const px = x + Math.cos(o.a) * dist
      const py = y + Math.sin(o.a) * dist * 0.9
      ctx.globalAlpha = o.alpha
      ctx.fillStyle = magnet ? '#8ee3f0' : '#9db4ff'
      ctx.beginPath()
      ctx.arc(px, py, o.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  _drawHoleRim(ctx) {
    const { x, y, r } = this.hole
    ctx.lineWidth = clamp(r * 0.08, 2, 10)
    ctx.strokeStyle = this.effects.magnet > 0 ? 'rgba(142,227,240,0.6)' : 'rgba(120,160,255,0.35)'
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 0.9, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  _drawObject(ctx, o, alpha) {
    const lift = o.h * 0.55 * alpha
    const s = o.size * (o.fall > 0 ? 0.6 + 0.4 * alpha : 1)
    const x = o.x
    const y = o.y

    // Boss 未达门槛时的脉冲提示环
    if (o.boss && o.fall === 0 && this.hole.r < o.size * 0.82) {
      const pulse = 1 + Math.sin(performance.now() / 300) * 0.06
      ctx.strokeStyle = 'rgba(255,90,90,0.7)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.ellipse(x, y, s * 1.4 * pulse, s * 1.1 * pulse, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    ctx.beginPath()
    ctx.ellipse(x + lift * 0.25, y + s * 0.25, s * 0.95, s * 0.55, 0, 0, Math.PI * 2)
    ctx.fill()

    const topY = y - lift
    const side = shade(o.color, -0.4)
    const top = o.color
    const roof = shade(o.color, 0.18)

    switch (o.shape) {
      case 'building': {
        const w = s * 1.5
        const hgt = s * 1.5
        ctx.fillStyle = side
        ctx.fillRect(x - w / 2, topY - hgt / 2, w, hgt / 2 + lift)
        ctx.fillStyle = roof
        roundRect(ctx, x - w / 2, topY - hgt / 2, w, hgt / 2, 4)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        const rows = Math.max(2, Math.floor(hgt / 22))
        for (let i = 0; i < rows; i++) {
          ctx.fillRect(x - w / 2 + 5, topY - hgt / 2 + 5 + i * 20, w - 10, 6)
        }
        break
      }
      case 'box': {
        const w = s * 1.6
        ctx.fillStyle = side
        ctx.fillRect(x - w / 2, topY, w, lift + 2)
        ctx.fillStyle = top
        roundRect(ctx, x - w / 2, topY - w * 0.4, w, w * 0.8, 4)
        ctx.fill()
        break
      }
      case 'car': {
        const w = s * 1.9
        const hh = s * 1.0
        ctx.fillStyle = side
        ctx.fillRect(x - w / 2, topY, w, lift + 2)
        ctx.fillStyle = top
        roundRect(ctx, x - w / 2, topY - hh / 2, w, hh, hh * 0.35)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        roundRect(ctx, x - w * 0.22, topY - hh * 0.32, w * 0.44, hh * 0.5, 3)
        ctx.fill()
        break
      }
      case 'tree': {
        ctx.strokeStyle = '#6b4a2b'
        ctx.lineWidth = s * 0.35
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, topY)
        ctx.stroke()
        const grad = ctx.createRadialGradient(x - s * 0.3, topY - s * 0.3, s * 0.2, x, topY, s)
        grad.addColorStop(0, roof)
        grad.addColorStop(1, side)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, topY, s, 0, Math.PI * 2)
        ctx.fill()
        break
      }
      case 'pole': {
        ctx.strokeStyle = side
        ctx.lineWidth = Math.max(2, s * 0.4)
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, topY)
        ctx.stroke()
        ctx.fillStyle = '#ffe08a'
        ctx.beginPath()
        ctx.arc(x, topY, s * 0.6, 0, Math.PI * 2)
        ctx.fill()
        break
      }
      case 'umbrella': {
        ctx.strokeStyle = '#8a8a8a'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, topY)
        ctx.stroke()
        ctx.fillStyle = top
        ctx.beginPath()
        ctx.arc(x, topY, s, Math.PI, 0)
        ctx.fill()
        ctx.fillStyle = shade(o.color, 0.25)
        ctx.beginPath()
        ctx.arc(x, topY, s * 0.5, Math.PI, 0)
        ctx.fill()
        break
      }
      case 'person': {
        ctx.fillStyle = side
        ctx.beginPath()
        ctx.ellipse(x, y, s * 0.7, s * 0.5, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = top
        ctx.beginPath()
        ctx.arc(x, topY - s * 0.2, s * 0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#3a2a1a'
        ctx.beginPath()
        ctx.arc(x, topY - s * 0.5, s * 0.35, 0, Math.PI * 2)
        ctx.fill()
        break
      }
      case 'blob':
      default: {
        const grad = ctx.createRadialGradient(x - s * 0.3, topY - s * 0.3, s * 0.2, x, topY, s)
        grad.addColorStop(0, roof)
        grad.addColorStop(1, side)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, topY, s, 0, Math.PI * 2)
        ctx.fill()
        break
      }
    }
  }
}
