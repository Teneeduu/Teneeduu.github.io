// 场景 / 关卡配置
// 物体字段: size=黑洞半径门槛(世界单位), h=伪3D高度, value=分数, shape=造型
//   mobile: 'walk'|'drive' 会移动并在黑洞靠近时逃跑; boss: true 超大目标(有特殊高亮)

export const OBJECTS = {
  // --- 小物体 ---
  person:      { size: 10, h: 14, value: 5,   color: '#ffd166', shape: 'person', mobile: 'walk' },
  bush:        { size: 12, h: 10, value: 4,   color: '#4caf50', shape: 'blob' },
  tree:        { size: 16, h: 34, value: 12,  color: '#2e9e4f', shape: 'tree' },
  streetlight: { size: 8,  h: 40, value: 8,   color: '#9aa4b2', shape: 'pole' },
  bench:       { size: 14, h: 8,  value: 7,   color: '#a97142', shape: 'box' },
  hydrant:     { size: 7,  h: 12, value: 6,   color: '#e5484d', shape: 'box' },
  // --- 中物体 ---
  car:         { size: 24, h: 16, value: 30,  color: '#4c9be8', shape: 'car', mobile: 'drive' },
  taxi:        { size: 24, h: 16, value: 34,  color: '#f4b400', shape: 'car', mobile: 'drive' },
  boat:        { size: 30, h: 18, value: 45,  color: '#e0e0e0', shape: 'car' },
  van:         { size: 30, h: 22, value: 50,  color: '#9b7ede', shape: 'car', mobile: 'drive' },
  // --- 大物体 ---
  bus:         { size: 42, h: 26, value: 90,  color: '#e5484d', shape: 'box' },
  truck:       { size: 46, h: 28, value: 110, color: '#7b8794', shape: 'box' },
  house:       { size: 52, h: 48, value: 140, color: '#d98c5f', shape: 'building' },
  // --- 巨物 ---
  building:    { size: 78, h: 90, value: 320, color: '#5b6b8c', shape: 'building' },
  tower:       { size: 96, h: 140, value: 520, color: '#42506e', shape: 'building' },
  // --- Boss ---
  stadium:     { size: 130, h: 70, value: 900, color: '#6a8f4f', shape: 'building', boss: true },
  // --- 太空 ---
  astronaut:   { size: 11, h: 16, value: 8,   color: '#f5f5f5', shape: 'person', mobile: 'walk' },
  crate:       { size: 18, h: 16, value: 20,  color: '#c9a227', shape: 'box' },
  rover:       { size: 28, h: 18, value: 55,  color: '#c94f4f', shape: 'car', mobile: 'drive' },
  satellite:   { size: 40, h: 30, value: 130, color: '#8ecae6', shape: 'box' },
  module:      { size: 70, h: 60, value: 300, color: '#adb5bd', shape: 'building' },
  spacebase:   { size: 140, h: 80, value: 1100, color: '#8895b3', shape: 'building', boss: true },
  // --- 沙滩 ---
  umbrella:    { size: 20, h: 26, value: 18,  color: '#ff6b6b', shape: 'umbrella' },
  ball:        { size: 10, h: 12, value: 6,   color: '#ff924c', shape: 'blob' },
  palm:        { size: 18, h: 44, value: 16,  color: '#2e9e4f', shape: 'tree' },
  sandcastle:  { size: 26, h: 24, value: 40,  color: '#e9c46a', shape: 'building' },
  yacht:       { size: 120, h: 40, value: 800, color: '#f1faee', shape: 'car', boss: true },
  // --- 雪原 ---
  snowman:     { size: 12, h: 22, value: 8,   color: '#f4f9ff', shape: 'person' },
  penguin:     { size: 10, h: 14, value: 7,   color: '#2b2b3a', shape: 'person', mobile: 'walk' },
  pine:        { size: 16, h: 40, value: 14,  color: '#5a8f6b', shape: 'tree' },
  sled:        { size: 24, h: 12, value: 32,  color: '#e56b6f', shape: 'car', mobile: 'drive' },
  igloo:       { size: 40, h: 30, value: 120, color: '#dbe9f4', shape: 'building' },
  cabin:       { size: 56, h: 44, value: 160, color: '#8d6748', shape: 'building' },
  icecastle:   { size: 120, h: 110, value: 900, color: '#bfe3f0', shape: 'building', boss: true },
  // --- 火山 ---
  boulder:     { size: 14, h: 16, value: 8,   color: '#6b6560', shape: 'blob' },
  cactus:      { size: 12, h: 34, value: 12,  color: '#3f7d4f', shape: 'pole' },
  lavarock:    { size: 20, h: 18, value: 22,  color: '#c1440e', shape: 'blob' },
  jeep:        { size: 26, h: 18, value: 48,  color: '#7a6f4e', shape: 'car', mobile: 'drive' },
  hut:         { size: 48, h: 40, value: 130, color: '#7a4a34', shape: 'building' },
  volcano:     { size: 150, h: 120, value: 1300, color: '#5c3327', shape: 'building', boss: true },
  // --- 赛博都市 ---
  drone:       { size: 9,  h: 18, value: 9,   color: '#39d0d8', shape: 'pole', mobile: 'walk' },
  robot:       { size: 16, h: 22, value: 20,  color: '#c0c6d4', shape: 'person', mobile: 'walk' },
  hovercar:    { size: 26, h: 16, value: 44,  color: '#ff4fd8', shape: 'car', mobile: 'drive' },
  neon:        { size: 30, h: 50, value: 70,  color: '#7b5bff', shape: 'box' },
  skyscraper:  { size: 84, h: 130, value: 400, color: '#2a3350', shape: 'building' },
  megatower:   { size: 150, h: 180, value: 1500, color: '#1f2740', shape: 'building', boss: true },
}

export const SCENES = [
  {
    id: 'city',
    name: '繁华都市',
    subtitle: '从行人吃到摩天大楼',
    palette: { ground: '#3a7d44', road: '#5a6472', roadLine: '#e8c33c', grid: 'rgba(255,255,255,0.04)', fog: '#0b1020' },
    startRadius: 16, duration: 90, decor: 'roads', powerups: 3,
    surround: { type: 'sea', outer: '#17638f', shore: '#e6d29a' },
    stars: [1600, 3400, 5600],
    spawn: [
      { type: 'person', count: 70 }, { type: 'tree', count: 40 }, { type: 'streetlight', count: 30 },
      { type: 'hydrant', count: 20 }, { type: 'bench', count: 18 }, { type: 'car', count: 34 },
      { type: 'taxi', count: 18 }, { type: 'bus', count: 12 }, { type: 'truck', count: 8 },
      { type: 'house', count: 12 }, { type: 'building', count: 9 }, { type: 'tower', count: 4 },
      { type: 'stadium', count: 1 },
    ],
  },
  {
    id: 'park',
    name: '阳光公园',
    subtitle: '悠闲绿地，湖畔野餐',
    palette: { ground: '#4c9a4c', road: '#c2a878', roadLine: '#e8d9b5', grid: 'rgba(255,255,255,0.05)', fog: '#0a1a10', water: '#3a8fd0' },
    startRadius: 15, duration: 80, decor: 'water', powerups: 3,
    surround: { type: 'sea', outer: '#2b7fb0', shore: '#5fae5a' },
    stars: [1300, 2600, 4100],
    spawn: [
      { type: 'person', count: 90 }, { type: 'bush', count: 60 }, { type: 'tree', count: 55 },
      { type: 'bench', count: 30 }, { type: 'streetlight', count: 20 }, { type: 'car', count: 18 },
      { type: 'van', count: 10 }, { type: 'house', count: 8 }, { type: 'building', count: 4 },
    ],
  },
  {
    id: 'beach',
    name: '度假沙滩',
    subtitle: '阳伞、沙堡与游艇',
    palette: { ground: '#e9d8a6', road: '#69b3d6', roadLine: '#bfe3f0', grid: 'rgba(255,255,255,0.06)', fog: '#0a1622', water: '#2a9dd0' },
    startRadius: 15, duration: 85, decor: 'water', powerups: 3,
    surround: { type: 'sea', outer: '#1a8fc0', shore: '#f0dca0' },
    stars: [1100, 2400, 3900],
    spawn: [
      { type: 'person', count: 60 }, { type: 'ball', count: 45 }, { type: 'palm', count: 40 },
      { type: 'umbrella', count: 40 }, { type: 'bench', count: 15 }, { type: 'sandcastle', count: 22 },
      { type: 'boat', count: 14 }, { type: 'house', count: 6 }, { type: 'yacht', count: 1 },
    ],
  },
  {
    id: 'space',
    name: '太空基地',
    subtitle: '在月面吞噬一切',
    palette: { ground: '#2b2f45', road: '#3a3f5c', roadLine: '#6c7bb5', grid: 'rgba(120,150,255,0.06)', fog: '#05060f' },
    startRadius: 14, duration: 95, decor: 'craters', powerups: 4,
    surround: { type: 'void', outer: '#05060f', shore: '#20243a' },
    stars: [1500, 3100, 5000],
    spawn: [
      { type: 'astronaut', count: 70 }, { type: 'crate', count: 50 }, { type: 'streetlight', count: 20 },
      { type: 'rover', count: 24 }, { type: 'satellite', count: 16 }, { type: 'module', count: 10 },
      { type: 'tower', count: 3 }, { type: 'spacebase', count: 1 },
    ],
  },
  {
    id: 'snow',
    name: '冰雪世界',
    subtitle: '雪人、企鹅与冰堡',
    palette: { ground: '#e8f0f7', road: '#cfe0ec', roadLine: '#ffffff', grid: 'rgba(120,150,200,0.08)', fog: '#0a1622', water: '#8fd0e8' },
    startRadius: 15, duration: 85, decor: 'ice', powerups: 4,
    surround: { type: 'sea', outer: '#6fa8cc', shore: '#dcecf7' },
    stars: [1300, 2700, 4300],
    spawn: [
      { type: 'penguin', count: 70 }, { type: 'snowman', count: 55 }, { type: 'pine', count: 55 },
      { type: 'sled', count: 22 }, { type: 'igloo', count: 18 }, { type: 'cabin', count: 12 },
      { type: 'tower', count: 3 }, { type: 'icecastle', count: 1 },
    ],
  },
  {
    id: 'volcano',
    name: '熔岩火山',
    subtitle: '在岩浆间吞噬，直面火山',
    palette: { ground: '#5a4038', road: '#3a2a24', roadLine: '#ff7a1a', grid: 'rgba(255,120,40,0.06)', fog: '#180806', lava: '#ff5a1e' },
    startRadius: 15, duration: 95, decor: 'lava', powerups: 4,
    surround: { type: 'lava', outer: '#1a0806', shore: '#3a1c12' },
    stars: [1500, 3000, 4900],
    spawn: [
      { type: 'boulder', count: 70 }, { type: 'cactus', count: 40 }, { type: 'lavarock', count: 45 },
      { type: 'jeep', count: 22 }, { type: 'hut', count: 18 }, { type: 'tower', count: 4 },
      { type: 'building', count: 6 }, { type: 'volcano', count: 1 },
    ],
  },
  {
    id: 'cyber',
    name: '赛博都市',
    subtitle: '霓虹与飞车，吞下未来之城',
    palette: { ground: '#141726', road: '#20243a', roadLine: '#ff2bd6', grid: 'rgba(80,220,255,0.10)', fog: '#05060f' },
    startRadius: 16, duration: 100, decor: 'roads', powerups: 5,
    surround: { type: 'void', outer: '#060812', shore: '#20243a' },
    stars: [1800, 3800, 6200],
    spawn: [
      { type: 'drone', count: 60 }, { type: 'robot', count: 55 }, { type: 'hovercar', count: 40 },
      { type: 'neon', count: 40 }, { type: 'streetlight', count: 25 }, { type: 'building', count: 14 },
      { type: 'skyscraper', count: 12 }, { type: 'tower', count: 6 }, { type: 'megatower', count: 1 },
    ],
  },
]

// 道具类型
export const POWERUP_KINDS = ['speed', 'magnet', 'freeze']
export const POWERUP_INFO = {
  speed: { icon: '⚡', label: '加速', dur: 6, color: '#ffd166' },
  magnet: { icon: '🧲', label: '磁力', dur: 7, color: '#4c9be8' },
  freeze: { icon: '❄️', label: '冻结时间', dur: 5, color: '#8ee3f0' },
}

export function getScene(id) {
  return SCENES.find((s) => s.id === id) || SCENES[0]
}
