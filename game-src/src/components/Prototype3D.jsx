import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// 真 3D 单场景原型。
// 关键：如果 public/models/ 里放了对应 .glb，就用你的模型；否则用内置几何体兜底。
// 无论模型原始尺寸多大，都会自动缩放到 targetD 并落到地面上。

const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// 物体类别：文件名 / 数量 / 吞噬半径 / 门槛 / 目标直径 / 移动速度 / 兜底几何体
const SPECS = {
  building: { file: 'building.glb', count: 45, radius: 15, threshold: 24, targetD: 30, fallback: makeBuilding },
  house: { file: 'house.glb', count: 30, radius: 11, threshold: 16, targetD: 24, fallback: makeHouse },
  tree: { file: 'tree.glb', count: 60, radius: 6, threshold: 9, targetD: 16, fallback: makeTree },
  car: { file: 'car.glb', count: 35, radius: 5, threshold: 14, targetD: 12, mobile: 26, fallback: makeCar },
  person: { file: 'person.glb', count: 70, radius: 2.2, threshold: 8, targetD: 6, mobile: 12, fallback: makePerson },
}

// ---- 兜底几何体（没有模型时使用） ----
function makeBuilding() {
  const bColors = ['#5b6b8c', '#42506e', '#7b8794', '#8895b3', '#6a7fae']
  const w = rand(14, 30)
  const dep = rand(14, 30)
  const h = rand(24, 110)
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, dep), new THREE.MeshStandardMaterial({ color: pick(bColors) }))
  m.position.y = h / 2
  const g = new THREE.Group()
  g.add(m)
  return g
}
function makeHouse() {
  const w = rand(16, 26)
  const h = rand(14, 22)
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshStandardMaterial({ color: '#d98c5f' }))
  body.position.y = h / 2
  const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.8, h * 0.6, 4), new THREE.MeshStandardMaterial({ color: '#a2493a' }))
  roof.position.y = h + h * 0.3
  roof.rotation.y = Math.PI / 4
  g.add(body, roof)
  return g
}
function makeTree() {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 10), new THREE.MeshStandardMaterial({ color: '#6b4a2b' }))
  trunk.position.y = 5
  const leaves = new THREE.Mesh(new THREE.SphereGeometry(rand(5, 8), 12, 12), new THREE.MeshStandardMaterial({ color: pick(['#2e9e4f', '#3fae5a', '#348f45']) }))
  leaves.position.y = 14
  g.add(trunk, leaves)
  return g
}
function makeCar() {
  const carColors = ['#4c9be8', '#f4b400', '#e5484d', '#9b7ede', '#ffffff']
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(9, 4, 5), new THREE.MeshStandardMaterial({ color: pick(carColors) }))
  body.position.y = 3
  const cab = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 4.4), new THREE.MeshStandardMaterial({ color: '#cfe8ff' }))
  cab.position.set(-0.5, 6, 0)
  g.add(body, cab)
  return g
}
function makePerson() {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.6, 5), new THREE.MeshStandardMaterial({ color: pick(['#ffd166', '#e56b6f', '#4c9be8', '#9b7ede']) }))
  body.position.y = 2.5
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.6, 10, 10), new THREE.MeshStandardMaterial({ color: '#f0c8a0' }))
  head.position.y = 6
  g.add(body, head)
  return g
}

// 把任意尺寸的模型缩放到 targetD、并让底部落在 y=0、水平居中
function fitModel(scene, targetD) {
  const obj = scene.clone(true)
  const box = new THREE.Box3().setFromObject(obj)
  const size = new THREE.Vector3()
  box.getSize(size)
  const maxXZ = Math.max(size.x, size.z) || 1
  const s = targetD / maxXZ
  const g = new THREE.Group()
  obj.scale.setScalar(s)
  // 重新计算缩放后包围盒以对齐地面/中心
  const box2 = new THREE.Box3().setFromObject(obj)
  const center = new THREE.Vector3()
  box2.getCenter(center)
  obj.position.x -= center.x
  obj.position.z -= center.z
  obj.position.y -= box2.min.y
  g.add(obj)
  return g
}

export default function Prototype3D({ onExit }) {
  const mountRef = useRef(null)
  const [size, setSize] = useState(8)
  const [loading, setLoading] = useState(true)
  const [usingModels, setUsingModels] = useState([])

  useEffect(() => {
    const mount = mountRef.current
    const W = () => mount.clientWidth
    const H = () => mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W(), H())
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#8fd0e8')
    scene.fog = new THREE.Fog('#8fd0e8', 350, 800)

    const camera = new THREE.PerspectiveCamera(50, W() / H(), 1, 1400)

    scene.add(new THREE.HemisphereLight('#ffffff', '#6b7a5a', 0.9))
    const sun = new THREE.DirectionalLight('#fff4e0', 1.1)
    sun.position.set(120, 200, 80)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    const d = 400
    sun.shadow.camera.left = -d
    sun.shadow.camera.right = d
    sun.shadow.camera.top = d
    sun.shadow.camera.bottom = -d
    sun.shadow.camera.far = 700
    scene.add(sun)

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshStandardMaterial({ color: '#5aa15a' }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const roadMat = new THREE.MeshStandardMaterial({ color: '#6a7280', polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
    for (let i = -3; i <= 3; i++) {
      const hz = new THREE.Mesh(new THREE.PlaneGeometry(700, 22), roadMat)
      hz.rotation.x = -Math.PI / 2
      hz.position.set(0, 0.3, i * 100)
      hz.receiveShadow = true
      scene.add(hz)
      const vt = new THREE.Mesh(new THREE.PlaneGeometry(22, 700), roadMat)
      vt.rotation.x = -Math.PI / 2
      vt.position.set(i * 100, 0.32, 0)
      vt.receiveShadow = true
      scene.add(vt)
    }

    const objects = []
    function addInstance(node, spec) {
      node.traverse((c) => {
        if (c.isMesh) c.castShadow = true
      })
      node.position.set(rand(-330, 330), 0, rand(-330, 330))
      node.rotation.y = rand(0, Math.PI * 2)
      scene.add(node)
      const o = { mesh: node, radius: spec.radius, threshold: spec.threshold, falling: 0, mobile: spec.mobile || 0, vx: 0, vz: 0, wander: 0 }
      if (o.mobile) {
        const a = rand(0, Math.PI * 2)
        o.vx = Math.cos(a) * o.mobile
        o.vz = Math.sin(a) * o.mobile
        o.wander = rand(0, 3)
      }
      objects.push(o)
    }

    // ---- 黑洞 ----
    const hole = { x: 0, z: 0, r: 8, tx: 0, tz: 0 }
    const holeMesh = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: '#050608' }))
    holeMesh.rotation.x = -Math.PI / 2
    holeMesh.position.y = 0.4
    scene.add(holeMesh)
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 48), new THREE.MeshBasicMaterial({ color: '#7aa0ff', transparent: true, opacity: 0.5 }))
    ringMesh.rotation.x = -Math.PI / 2
    ringMesh.position.y = 0.42
    scene.add(ringMesh)

    // ---- 输入 ----
    const keys = new Set()
    const raycaster = new THREE.Raycaster()
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const ndc = new THREE.Vector2()
    let pointerDown = false
    const el = renderer.domElement
    const setTargetFromEvent = (e) => {
      const rect = el.getBoundingClientRect()
      const p = e.touches ? e.touches[0] : e
      ndc.x = ((p.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((p.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      const hit = new THREE.Vector3()
      if (raycaster.ray.intersectPlane(groundPlane, hit)) {
        hole.tx = hit.x
        hole.tz = hit.z
      }
    }
    const onDown = (e) => {
      e.preventDefault()
      pointerDown = true
      setTargetFromEvent(e)
    }
    const onMove = (e) => {
      if (pointerDown) setTargetFromEvent(e)
    }
    const onUp = () => (pointerDown = false)
    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    el.addEventListener('touchstart', onDown, { passive: false })
    el.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    const onKey = (e) => {
      const k = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        if (e.type === 'keydown') keys.add(k)
        else keys.delete(k)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    const onResize = () => {
      camera.aspect = W() / H()
      camera.updateProjectionMatrix()
      renderer.setSize(W(), H())
    }
    window.addEventListener('resize', onResize)

    // ---- 预加载模型（缺失则兜底），加载完再生成物体 ----
    let cancelled = false
    const loader = new GLTFLoader()
    const base = (import.meta.env.BASE_URL || './') + 'models/'
    const loaded = {}
    const usable = []
    Promise.all(
      Object.entries(SPECS).map(([key, spec]) =>
        loader
          .loadAsync(base + spec.file)
          .then((gltf) => {
            loaded[key] = gltf.scene
            usable.push(key)
          })
          .catch(() => {
            loaded[key] = null
          })
      )
    ).then(() => {
      if (cancelled) return
      for (const [key, spec] of Object.entries(SPECS)) {
        for (let i = 0; i < spec.count; i++) {
          const node = loaded[key] ? fitModel(loaded[key], spec.targetD) : spec.fallback()
          addInstance(node, spec)
        }
      }
      setUsingModels(usable)
      setLoading(false)
    })

    // ---- 主循环 ----
    let raf
    let last = performance.now()
    let alive = true

    function loop(now) {
      if (!alive) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const speed = 60 * (1 + hole.r / 40)
      let vx = 0,
        vz = 0
      if (keys.has('w') || keys.has('arrowup')) vz -= 1
      if (keys.has('s') || keys.has('arrowdown')) vz += 1
      if (keys.has('a') || keys.has('arrowleft')) vx -= 1
      if (keys.has('d') || keys.has('arrowright')) vx += 1
      if (vx || vz) {
        const m = Math.hypot(vx, vz)
        hole.x += (vx / m) * speed * dt
        hole.z += (vz / m) * speed * dt
      } else if (pointerDown) {
        const dx = hole.tx - hole.x
        const dz = hole.tz - hole.z
        const dd = Math.hypot(dx, dz)
        if (dd > 1) {
          const g = Math.min(dd / 20, 1)
          hole.x += (dx / dd) * speed * g * dt
          hole.z += (dz / dd) * speed * g * dt
        }
      }
      hole.x = Math.max(-360, Math.min(360, hole.x))
      hole.z = Math.max(-360, Math.min(360, hole.z))

      holeMesh.position.set(hole.x, 0.4, hole.z)
      holeMesh.scale.setScalar(hole.r)
      ringMesh.position.set(hole.x, 0.42, hole.z)
      ringMesh.scale.setScalar(hole.r)

      // 行人/车：游走 + 逃跑
      for (const o of objects) {
        if (o.eaten || o.falling > 0 || !o.mobile) continue
        const dx = o.mesh.position.x - hole.x
        const dz = o.mesh.position.z - hole.z
        const dist = Math.hypot(dx, dz) || 1
        const fear = o.mobile * 3 + hole.r
        if (dist < fear) {
          const flee = o.mobile * 2.4
          o.vx += ((dx / dist) * flee - o.vx) * 0.15
          o.vz += ((dz / dist) * flee - o.vz) * 0.15
        } else {
          o.wander -= dt
          if (o.wander <= 0) {
            const a = rand(0, Math.PI * 2)
            o.vx = Math.cos(a) * o.mobile
            o.vz = Math.sin(a) * o.mobile
            o.wander = rand(1.5, 4)
          }
        }
        o.mesh.position.x += o.vx * dt
        o.mesh.position.z += o.vz * dt
        if (o.mesh.position.x < -355 || o.mesh.position.x > 355) o.vx *= -1
        if (o.mesh.position.z < -355 || o.mesh.position.z > 355) o.vz *= -1
        o.mesh.position.x = Math.max(-355, Math.min(355, o.mesh.position.x))
        o.mesh.position.z = Math.max(-355, Math.min(355, o.mesh.position.z))
        o.mesh.rotation.y = Math.atan2(o.vx, o.vz)
      }

      // 吞噬
      for (const o of objects) {
        if (o.eaten) continue
        if (o.falling > 0) {
          o.falling += dt / 0.4
          o.mesh.position.x += (hole.x - o.mesh.position.x) * 0.2
          o.mesh.position.z += (hole.z - o.mesh.position.z) * 0.2
          o.mesh.position.y -= dt * 60
          o.mesh.rotation.y += dt * 8
          o.mesh.scale.multiplyScalar(1 - dt * 3)
          if (o.falling >= 1) {
            o.eaten = true
            scene.remove(o.mesh)
          }
          continue
        }
        const dx = o.mesh.position.x - hole.x
        const dz = o.mesh.position.z - hole.z
        const dist = Math.hypot(dx, dz)
        if (hole.r < o.threshold * 0.8) continue
        if (dist < hole.r) {
          o.falling = 0.0001
          const ha = Math.PI * hole.r * hole.r
          const oa = Math.PI * o.radius * o.radius
          hole.r = Math.sqrt((ha + oa * 0.5) / Math.PI)
          setSize(Math.round(hole.r))
        } else if (dist < hole.r * 2) {
          const pull = (1 - dist / (hole.r * 2)) * 40 * dt
          o.mesh.position.x -= (dx / dist) * pull
          o.mesh.position.z -= (dz / dist) * pull
        }
      }

      const camH = 46 + hole.r * 6
      const camD = 40 + hole.r * 5
      camera.position.set(hole.x, camH, hole.z + camD)
      camera.lookAt(hole.x, 0, hole.z)

      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      alive = false
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (renderer.domElement.parentNode) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="game screen">
      <div ref={mountRef} className="game-canvas" />
      <div className="hud">
        <button className="hud-btn" onClick={onExit}>
          ←
        </button>
        <div className="proto-label">
          3D 原型 · {usingModels.length ? `已用模型: ${usingModels.join(', ')}` : '拖动/WASD 吞噬'}
        </div>
        <div className="score-box">
          <div className="score">◯ {size}</div>
        </div>
      </div>
      {loading && <div className="proto-loading">加载模型中…</div>}
    </div>
  )
}
