export default function MainMenu({ onPlay, onProto }) {
  return (
    <div className="menu screen">
      <div className="hole-deco" aria-hidden />
      <h1 className="title">黑洞吞噬</h1>
      <p className="tagline">吞掉一切，直到整个世界都进你肚里</p>
      <button className="btn primary" onClick={onPlay}>
        开始游戏
      </button>
      <button className="btn ghost" onClick={onProto}>
        🧪 3D 原型（试验）
      </button>
      <div className="hint">
        <p>🖱️ 电脑：鼠标拖动 / WASD 移动</p>
        <p>📱 手机：手指按住拖动</p>
      </div>
    </div>
  )
}
