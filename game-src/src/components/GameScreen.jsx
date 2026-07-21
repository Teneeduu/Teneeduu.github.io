import { useEffect, useRef, useState } from 'react'
import { Game } from '../game/engine.js'
import { getScene, SCENES, POWERUP_INFO } from '../game/scenes.js'
import { startMusic, stopMusic, setMuted, isMuted, sfx } from '../game/sfx.js'

export default function GameScreen({ sceneId, onExit, onFinish, onNext }) {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const scene = getScene(sceneId)

  const [time, setTime] = useState(scene.duration)
  const [frozen, setFrozen] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [effects, setEffects] = useState([])
  const [paused, setPaused] = useState(false)
  const [muted, setMutedState] = useState(isMuted())
  const [result, setResult] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const game = new Game(canvas, scene, {
      onTime: (t, isFrozen) => {
        setTime(t)
        setFrozen(isFrozen)
      },
      onScore: (s, c) => {
        setScore(s)
        setCombo(c)
      },
      onEffects: (list) => setEffects(list),
      onEnd: (r) => {
        setResult(r)
        onFinish(sceneId, r.score, r.stars)
        stopMusic()
      },
    })
    gameRef.current = game
    game.start()
    if (!isMuted()) startMusic()
    return () => {
      game.destroy()
      stopMusic()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId])

  const togglePause = () => {
    const next = !paused
    setPaused(next)
    gameRef.current?.setPaused(next)
    if (next) stopMusic()
    else if (!muted && !result) startMusic()
  }

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
    if (next) stopMusic()
    else if (!paused && !result) startMusic()
  }

  const idx = SCENES.findIndex((s) => s.id === sceneId)
  const nextScene = SCENES[idx + 1]

  const mm = Math.floor(time / 60)
  const ss = Math.floor(time % 60)
  const timeStr = `${mm}:${ss.toString().padStart(2, '0')}`
  const low = time <= 10 && !frozen

  return (
    <div className="game screen">
      <canvas ref={canvasRef} className="game-canvas" />

      <div className="hud">
        <div className="hud-left">
          <button className="hud-btn" onClick={togglePause}>
            {paused ? '▶' : '⏸'}
          </button>
          <button className="hud-btn" onClick={toggleMute}>
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
        <div className={'timer' + (low ? ' low' : '') + (frozen ? ' frozen' : '')}>
          {frozen && <span className="freeze-ic">❄️</span>}
          {timeStr}
        </div>
        <div className="score-box">
          <div className="score">{score}</div>
          {combo > 1 && <div className="combo">连击 x{combo}</div>}
        </div>
      </div>

      {/* 生效中的道具 */}
      {effects.length > 0 && (
        <div className="effects">
          {effects.map((e) => (
            <div key={e.kind} className="effect-chip" style={{ '--c': POWERUP_INFO[e.kind].color }}>
              <span className="effect-ic">{POWERUP_INFO[e.kind].icon}</span>
              <span>{POWERUP_INFO[e.kind].label}</span>
              <span className="effect-bar">
                <span
                  className="effect-fill"
                  style={{ animationDuration: POWERUP_INFO[e.kind].dur + 's' }}
                />
              </span>
            </div>
          ))}
        </div>
      )}

      {paused && !result && (
        <div className="overlay">
          <div className="panel">
            <h2>已暂停</h2>
            <button className="btn primary" onClick={togglePause}>继续</button>
            <button className="btn ghost" onClick={onExit}>退出关卡</button>
          </div>
        </div>
      )}

      {result && (
        <div className="overlay">
          <div className="panel result">
            <h2>{result.stars > 0 ? '过关！' : '时间到'}</h2>
            <div className="big-stars">
              {[0, 1, 2].map((i) => (
                <span key={i} className={i < result.stars ? 'bstar on' : 'bstar'}>★</span>
              ))}
            </div>
            <div className="result-score">{result.score} 分</div>
            <div className="result-detail">吞噬 {result.eaten} / {result.total} 个物体</div>
            <div className="result-thresholds">星级门槛：{scene.stars.join(' / ')}</div>
            <div className="result-actions">
              <button
                className="btn ghost"
                onClick={() => {
                  setResult(null)
                  onNext(sceneId)
                }}
              >
                重玩
              </button>
              {result.stars > 0 && nextScene ? (
                <button
                  className="btn primary"
                  onClick={() => {
                    setResult(null)
                    onNext(nextScene.id)
                  }}
                >
                  下一关 →
                </button>
              ) : (
                <button className="btn primary" onClick={onExit}>选关</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
