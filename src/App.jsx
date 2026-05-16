import { useEffect, useState } from 'react'
import { extractionDefaults } from './components/upload/ExtractionSettings'
import { AppShell } from './layouts/AppShell'
import { HomePage } from './pages/HomePage'
import { UploadPage } from './pages/UploadPage'
import { LecturesPage } from './pages/LecturesPage'
import { StudioPage } from './pages/StudioPage'
import { SettingsPage } from './pages/SettingsPage'
import { useDocuments } from './hooks/useDocuments'
import { useHomeSession } from './hooks/useHomeSession'
import './App.css'

const pageConfig = {
  home: { searchPlaceholder: 'Search lectures...', showNewLecture: true },
  upload: { searchPlaceholder: 'Search knowledge base...', showNewLecture: false },
  lectures: { searchPlaceholder: 'Search lectures...', showNewLecture: true },
  studio: { searchPlaceholder: 'Search avatar templates...', showNewLecture: false },
  settings: { searchPlaceholder: 'Search settings...', showNewLecture: false },
}

function App() {
  const [activeNav, setActiveNav] = useState('home')
  const [sourceFile, setSourceFile] = useState(null)
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [voice, setVoice] = useState('')
  const [activeTab, setActiveTab] = useState('script')
  const [isPlaying, setIsPlaying] = useState(false)
  const [extractionOptions, setExtractionOptions] = useState(extractionDefaults)
  const [pageStart, setPageStart] = useState('')
  const [pageEnd, setPageEnd] = useState('')

  const { avatars, sourceFile: sessionFile, reload: reloadHome } = useHomeSession()
  const { uploads, uploading, uploadError, uploadFile, refreshUploads } = useDocuments()

  useEffect(() => {
    if (sessionFile && !sourceFile) setSourceFile(sessionFile)
  }, [sessionFile, sourceFile])

  useEffect(() => {
    if (avatars.length > 0 && !voice) {
      setVoice(avatars[0].tag || avatars[0].name)
    }
  }, [avatars, voice])

  const config = pageConfig[activeNav] ?? pageConfig.home

  const handleFileUpload = async (file) => {
    const result = await uploadFile(file, {
      pageStart,
      pageEnd,
      extraction: extractionOptions,
    })
    setSourceFile({ name: result.name, size: result.size })
    reloadHome()
    return result
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
          onFileSelect={handleFileUpload}
          uploading={uploading}
          uploadError={uploadError}
          onRefreshUploads={refreshUploads}
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

    if (activeNav === 'studio') {
      return <StudioPage onApplyToLecture={() => setActiveNav('home')} />
    }

    if (activeNav === 'settings') {
      return <SettingsPage />
    }

    return (
      <HomePage
        sourceFile={sourceFile}
        onFileSelect={handleFileUpload}
        uploading={uploading}
        uploadError={uploadError}
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
      onNewLecture={() => setActiveNav('upload')}
    >
      {renderPage()}
    </AppShell>
  )
}

export default App
