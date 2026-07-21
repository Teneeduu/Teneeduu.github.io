// 关卡进度：localStorage 存每关最高分与星级
const KEY = 'blackhole.progress.v1'

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export function saveResult(sceneId, score, stars) {
  const p = loadProgress()
  const prev = p[sceneId] || { best: 0, stars: 0 }
  p[sceneId] = {
    best: Math.max(prev.best, score),
    stars: Math.max(prev.stars, stars),
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {}
  return p
}

// 第一关默认解锁；某关拿到 >=1 星则解锁下一关
export function isUnlocked(scenes, index, progress) {
  if (index === 0) return true
  const prev = scenes[index - 1]
  return (progress[prev.id]?.stars || 0) >= 1
}
