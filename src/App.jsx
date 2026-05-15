import { useState } from 'react'
import { avatars } from './data/avatars'
import { useMaterials } from './hooks/useMaterials'
import { HeroPanel } from './components/HeroPanel'
import { MaterialsList } from './components/MaterialsList'
import { LecturePreview } from './components/LecturePreview'
import './App.css'

function App() {
  const { materials, totals, addMockFile } = useMaterials()
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [videoActive, setVideoActive] = useState(false)

  return (
    <main className="app-shell">
      <HeroPanel
        materials={materials}
        totals={totals}
        addMockFile={addMockFile}
        videoActive={videoActive}
        onToggleVideo={() => setVideoActive((previous) => !previous)}
        avatars={avatars}
        selectedAvatar={selectedAvatar}
        onSelectAvatar={setSelectedAvatar}
      />

      <section className="content-grid">
        <MaterialsList materials={materials} />
        <LecturePreview
          materials={materials}
          avatars={avatars}
          selectedAvatar={selectedAvatar}
          videoActive={videoActive}
        />
      </section>
    </main>
  )
}

export default App
