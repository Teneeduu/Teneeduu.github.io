import { useState, useCallback } from 'react'
import { SCENES } from './game/scenes.js'
import { loadProgress, saveResult } from './game/storage.js'
import MainMenu from './components/MainMenu.jsx'
import LevelSelect from './components/LevelSelect.jsx'
import GameScreen from './components/GameScreen.jsx'
import Prototype3D from './components/Prototype3D.jsx'

export default function App() {
  const [screen, setScreen] = useState('menu') // menu | levels | game
  const [sceneId, setSceneId] = useState(SCENES[0].id)
  const [progress, setProgress] = useState(() => loadProgress())

  const startScene = useCallback((id) => {
    setSceneId(id)
    setScreen('game')
  }, [])

  const handleFinish = useCallback((id, score, stars) => {
    setProgress(saveResult(id, score, stars))
  }, [])

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu onPlay={() => setScreen('levels')} onProto={() => setScreen('proto3d')} />
      )}
      {screen === 'proto3d' && <Prototype3D onExit={() => setScreen('menu')} />}
      {screen === 'levels' && (
        <LevelSelect
          progress={progress}
          onBack={() => setScreen('menu')}
          onSelect={startScene}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          sceneId={sceneId}
          onExit={() => setScreen('levels')}
          onFinish={handleFinish}
          onNext={(nextId) => startScene(nextId)}
        />
      )}
    </div>
  )
}
