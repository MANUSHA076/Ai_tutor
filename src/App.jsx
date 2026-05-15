import { useState } from 'react'
import { avatars } from './data/avatars'
import { recentUploads as initialUploads } from './data/recentUploads'
import { voiceOptions } from './data/voiceOptions'
import { extractionDefaults } from './components/upload/ExtractionSettings'
import { AppShell } from './layouts/AppShell'
import { HomePage } from './pages/HomePage'
import { UploadPage } from './pages/UploadPage'
import './App.css'

const defaultFile = {
  name: 'Quantum_Physics_Intro.pdf',
  size: '1.5 MB',
}

const pageConfig = {
  home: { searchPlaceholder: 'Search lectures...', showNewLecture: true },
  upload: { searchPlaceholder: 'Search knowledge base...', showNewLecture: false },
  lectures: { searchPlaceholder: 'Search lectures...', showNewLecture: true },
  studio: { searchPlaceholder: 'Search avatars...', showNewLecture: true },
  settings: { searchPlaceholder: 'Search settings...', showNewLecture: false },
}

function App() {
  const [activeNav, setActiveNav] = useState('home')
  const [sourceFile, setSourceFile] = useState(defaultFile)
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [voice, setVoice] = useState(voiceOptions[0])
  const [activeTab, setActiveTab] = useState('script')
  const [isPlaying, setIsPlaying] = useState(true)
  const [extractionOptions, setExtractionOptions] = useState(extractionDefaults)
  const [pageStart, setPageStart] = useState('')
  const [pageEnd, setPageEnd] = useState('')
  const [uploads] = useState(initialUploads)

  const config = pageConfig[activeNav] ?? pageConfig.home

  const handleUpload = () => {
    setSourceFile({
      name: `Lecture_${Date.now().toString().slice(-4)}.pdf`,
      size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
    })
  }

  const handleToggleExtraction = (id) => {
    setExtractionOptions((prev) =>
      prev.map((option) => (option.id === id ? { ...option, checked: !option.checked } : option)),
    )
  }

  const handleNewSession = () => {
    setActiveNav('upload')
    setPageStart('')
    setPageEnd('')
  }

  const renderPage = () => {
    if (activeNav === 'upload') {
      return (
        <UploadPage
          extractionOptions={extractionOptions}
          onToggleExtraction={handleToggleExtraction}
          pageStart={pageStart}
          pageEnd={pageEnd}
          onPageStart={setPageStart}
          onPageEnd={setPageEnd}
          onBrowse={handleUpload}
          recentUploads={uploads}
        />
      )
    }

    return (
      <HomePage
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

  return (
    <AppShell
      activeNav={activeNav}
      onNavChange={setActiveNav}
      onNewSession={handleNewSession}
      searchPlaceholder={config.searchPlaceholder}
      showNewLecture={config.showNewLecture}
      onNewLecture={handleUpload}
    >
      {renderPage()}
    </AppShell>
  )
}

export default App
