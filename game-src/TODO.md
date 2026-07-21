# 黑洞吞噬 · 开发清单 (TODO)

> Hole.io 风格网页小游戏。React + Vite + Canvas(2.5D 主游戏) + Three.js(3D 原型)。
> 线上：https://teneeduu.github.io/game/ ｜ 开发目录：`C:\Users\Joker\Desktop\work_space`

## ✅ 已完成
- **2.5D 主游戏（Canvas）**：7 个场景（都市/公园/沙滩/太空/雪原/火山/赛博）、限时得分、3 星评级、
  道具（加速/磁力/冻结）、Boss 巨物、连击、粒子、震屏、程序化音效+背景音乐、周围环境（海水/星空/熔岩）、
  选关+结算+localStorage 进度存档 —— 完整可玩。
- **3D 原型（Three.js，主菜单「🧪 3D 原型」入口）**：
  - 已接 Kenney 模型：汽车 6 款（沿马路行驶）、人物 8 个、高楼（商业楼+摩天楼）、房子（工业厂房）
  - 自动缩放落地、蒙皮角色转静态网格、贴图按包分子目录（内含各自 Textures）
  - 街道防闪烁、相机斜俯视跟随、行人游走/逃跑
- **部署**：GitHub Pages（用户主页站的 `game/` 子目录，主页未受影响）。

## ⬜ 待办（下次继续）

### A. 3D 素材（用 AI 或 Kenney 补齐）
- [ ] 树模型 `tree.glb`（目前是代码几何体兜底）
- [ ] 按主题补物体模型：公园/沙滩/太空/雪原/火山/赛博 各自的特色物体
- [ ] 校准：人物朝向、车头前后方向、各类大小比例（改 `SPECS` 里的 `targetH`）
- [ ] AI 建模：优先 **Tripo3D / Sloyd / 腾讯混元3D**，导出**内嵌贴图 .glb**

### B. 把玩法从 2.5D 迁移到真 3D
- [ ] 7 个场景/关卡搬进 3D 引擎
- [ ] 道具、Boss、连击、星级、计时器接入 3D
- [ ] 选关 / 结算 / 进度存档 接入 3D
- [ ] 每个场景的地面配色 / 周围环境 / 装饰的 3D 版

### C. 打磨
- [ ] 手机性能分级（物体数量/阴影/像素比按机型降级）
- [ ] 3D 版接入音效与背景音乐
- [ ] 代码分包（three 体积较大，做 dynamic import 分包）

## 🚀 部署流程备忘
```bash
npm run build                       # 产出 dist/
# 把 dist/* 覆盖到仓库 game/；源码同步到 game-src/
cd G:\FightingMan\Teneeduu.github.io
git add game game-src && git commit -m "..." && git push
# 线上：https://teneeduu.github.io/game/
```

## 📁 关键文件
- 2.5D 引擎：`src/game/engine.js`；场景/关卡配置：`src/game/scenes.js`
- 3D 原型：`src/components/Prototype3D.jsx`（`SPECS` 里配置各类模型文件）
- 模型目录：`public/models/<包名>/`（`.glb` + `Textures/colormap.png`）
- 音效：`src/game/sfx.js`

## 🤖 AI 建模备忘
- 工具：**Tripo3D**（综合/国内友好）· **Sloyd**（最像 Kenney 的干净低模，建筑/道具强）· **混元3D**（国产免费）
- 统一风格提示词后缀：`low poly, flat shaded, kenney style, simple game asset, pastel colors, clean topology`
- 优先「图生3D」+ 固定风格；导出**内嵌贴图**的 `.glb`（避免外链贴图丢失）
