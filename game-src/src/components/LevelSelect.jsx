import { SCENES } from '../game/scenes.js'
import { isUnlocked } from '../game/storage.js'

function Stars({ n }) {
  return (
    <div className="stars">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < n ? 'star on' : 'star'}>
          ★
        </span>
      ))}
    </div>
  )
}

export default function LevelSelect({ progress, onBack, onSelect }) {
  return (
    <div className="levels screen">
      <div className="topbar">
        <button className="btn ghost" onClick={onBack}>
          ← 返回
        </button>
        <h2>选择关卡</h2>
        <div style={{ width: 64 }} />
      </div>
      <div className="level-grid">
        {SCENES.map((s, i) => {
          const unlocked = isUnlocked(SCENES, i, progress)
          const p = progress[s.id]
          return (
            <button
              key={s.id}
              className={'level-card' + (unlocked ? '' : ' locked')}
              disabled={!unlocked}
              onClick={() => unlocked && onSelect(s.id)}
              style={{ '--card': s.palette.ground }}
            >
              <div className="level-num">{i + 1}</div>
              <div className="level-name">{s.name}</div>
              <div className="level-sub">{s.subtitle}</div>
              {unlocked ? (
                <>
                  <Stars n={p?.stars || 0} />
                  {p?.best ? <div className="best">最高 {p.best}</div> : <div className="best">未挑战</div>}
                </>
              ) : (
                <div className="lock">🔒 上一关拿 ★ 解锁</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
