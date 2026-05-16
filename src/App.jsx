import { useState } from 'react'
import { avatars } from './data/avatars'
import { voiceOptions } from './data/voiceOptions'
import { extractionDefaults } from './components/upload/ExtractionSettings'
import { AppShell } from './layouts/AppShell'
import { HomePage } from './pages/HomePage'
import { UploadPage } from './pages/UploadPage'
import { LecturesPage } from './pages/LecturesPage'
import { StudioPage } from './pages/StudioPage'
import { SettingsPage } from './pages/SettingsPage'
import { useDocuments } from './hooks/useDocuments'
// BACKEND [Python]: Home dashboard — POST upload, GET session (see src/api/homeApi.js, documentsApi.js)
import './App.css'

const defaultFile = {
  name: 'Quantum_Physics_Intro.pdf',
  size: '1.5 MB',
}

const pageConfig = {
  home: { searchPlaceholder: 'Search lectures...', showNewLecture: true },
  upload: { searchPlaceholder: 'Search knowledge base...', showNewLecture: false },
  lectures: { searchPlaceholder: 'Search lectures...', showNewLecture: true },
  studio: { searchPlaceholder: 'Search avatar templates...', showNewLecture: false },
  settings: { searchPlaceholder: 'Search settings...', showNewLecture: false },
}

function App() {
  const [activeNav, setActiveNav] = useState('home')
  const [sourceFile, setSourceFile] = useState(defaultFile)
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [voice, setVoice] = useState(voiceOptions[0])
  const [activeTab, setActiveTab] = useState('script')
  const [isPlaying, setIsPlaying] = useState(false)
  const [extractionOptions, setExtractionOptions] = useState(extractionDefaults)
  const [pageStart, setPageStart] = useState('')
  const [pageEnd, setPageEnd] = useState('')
  const { uploads, uploadFile } = useDocuments()

  const config = pageConfig[activeNav] ?? pageConfig.home

  // BACKEND [Python]: POST /api/documents/upload — mock until real file input wired
  const handleUpload = async () => {
    try {
      const mockFile = new File([''], `Lecture_${Date.now()}.pdf`, { type: 'application/pdf' })
      const result = await uploadFile(mockFile, {
        pageStart,
        pageEnd,
        extraction: extractionOptions,
      })
      setSourceFile({ name: result.name, size: result.size })
    } catch {
      setSourceFile({
        name: `Lecture_${Date.now().toString().slice(-4)}.pdf`,
        size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
      })
    }
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

    if (activeNav === 'lectures') {
      return (
        <LecturesPage
          onGenerate={handleNewSession}
          onViewLecture={() => setActiveNav('home')}
        />
      )
    }

    // BACKEND [Python]: PUT /api/avatars/profile — Studio save
    if (activeNav === 'studio') {
      return <StudioPage onApplyToLecture={() => setActiveNav('home')} />
    }

    if (activeNav === 'settings') {
      return <SettingsPage />
    }

    // BACKEND [Python]: GET /api/home/session, GET /api/home/script
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
