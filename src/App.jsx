import { useState } from 'react'
import { avatars } from './data/avatars'
import { voiceOptions } from './data/voiceOptions'
import { DashboardLayout } from './layouts/DashboardLayout'
import './App.css'

const defaultFile = {
  name: 'Quantum_Physics_Intro.pdf',
  size: '1.5 MB',
}

function App() {
  const [activeNav, setActiveNav] = useState('home')
  const [sourceFile, setSourceFile] = useState(defaultFile)
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [voice, setVoice] = useState(voiceOptions[0])
  const [activeTab, setActiveTab] = useState('script')
  const [isPlaying, setIsPlaying] = useState(true)

  const handleUpload = () => {
    setSourceFile({
      name: `Lecture_${Date.now().toString().slice(-4)}.pdf`,
      size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
    })
  }

  return (
    <DashboardLayout
      activeNav={activeNav}
      onNavChange={setActiveNav}
      onNewLecture={handleUpload}
      sourceFile={sourceFile}
      onUpload={handleUpload}
      onRemoveFile={() => setSourceFile(null)}
      isPlaying={isPlaying}
      onTogglePlay={() => setIsPlaying((prev) => !prev)}
      avatars={avatars}
      selectedAvatar={selectedAvatar}
      onSelectAvatar={setSelectedAvatar}
      voice={voice}
      onVoiceChange={setVoice}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  )
}

export default App
