import { useCallback, useEffect, useState } from 'react'
import { extractionDefaults } from './components/upload/ExtractionSettings'
import { AppShell } from './layouts/AppShell'
import { HomePage } from './pages/HomePage'
import { UploadPage } from './pages/UploadPage'
import { LecturesPage } from './pages/LecturesPage'
import { StudioPage } from './pages/StudioPage'
import { SettingsPage } from './pages/SettingsPage'
import { useDocuments } from './hooks/useDocuments'
import { useHomeSession } from './hooks/useHomeSession'
import { usePipeline } from './hooks/usePipeline'
import { formatFileSize } from './utils/formatFileSize'
import { generateLectureAudio } from './api/lectureApi'
import { fetchLectureScript } from './api/homeApi'
import './App.css'

const DEFAULT_RAG_TTS_MESSAGE =
  'Summarize this document and write a clear lecture script suitable for text-to-speech.'

const SUMMARY_TO_VIDEO_MESSAGE =
  'Using the lecture notes summary, write a fluent spoken lecture script for an educational video (about 2–4 minutes). Plain language, no markdown.'

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
  const [audioPrompt, setAudioPrompt] = useState('')
  const [ragTtsLoading, setRagTtsLoading] = useState(false)
  const [ragTtsError, setRagTtsError] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioError, setAudioError] = useState('')
  const [testText, setTestText] = useState(
    'Today we will learn about diode characteristics, forward bias, and reverse breakdown.',
  )
  const [testLoading, setTestLoading] = useState(false)
  const [testError, setTestError] = useState('')
  const [genMessage, setGenMessage] = useState('')

  const {
    avatars,
    sourceFile: sessionFile,
    pipelineSource,
    offline,
    sessionError,
    reload: reloadHome,
  } = useHomeSession()
  const { uploads, uploading, uploadError, uploadWarning, uploadFile, refreshUploads } =
    useDocuments()
  const {
    processing,
    indexing,
    processError,
    ragSource,
    setRagSource,
    runProcess,
    searchRag,
  } = usePipeline()

  useEffect(() => {
    if (!sessionFile?.name) return
    setSourceFile((prev) => {
      if (prev?.pending || uploading || processing || indexing) return prev
      return sessionFile
    })
  }, [sessionFile, uploading, processing, indexing])

  useEffect(() => {
    if (sourceFile?.name || !uploads.length) return
    const latest = uploads[0]
    if (latest?.name) {
      setSourceFile({
        name: latest.name,
        size: latest.size,
        storage_path: latest.storage_path,
      })
    }
  }, [uploads, sourceFile?.name])

  useEffect(() => {
    if (pipelineSource && !ragSource) setRagSource(pipelineSource)
  }, [pipelineSource, ragSource, setRagSource])

  useEffect(() => {
    if (avatars.length > 0 && !voice) {
      setVoice(avatars[0].tag || avatars[0].name)
    }
  }, [avatars, voice])

  const config = pageConfig[activeNav] ?? pageConfig.home

  const processUploadedFile = useCallback(
    async (uploadResult) => {
      if (!uploadResult?.storage_path) return null
      try {
        const data = await runProcess(uploadResult.storage_path)
        setActiveNav('home')
        return data
      } catch {
        return null
      }
    },
    [runProcess],
  )

  const handleFileUpload = useCallback(
    async (file) => {
      setSourceFile({
        name: file.name,
        size: formatFileSize(file.size),
        pending: true,
      })

      const result = await uploadFile(file, {
        pageStart,
        pageEnd,
        extraction: extractionOptions,
      })

      setSourceFile({
        name: result.name || file.name,
        size: result.size || formatFileSize(file.size),
        storage_path: result.storage_path,
      })

      reloadHome()
      refreshUploads()

      if (result.storage_path) {
        processUploadedFile(result).catch(() => {})
      }

      return result
    },
    [
      uploadFile,
      pageStart,
      pageEnd,
      extractionOptions,
      reloadHome,
      refreshUploads,
      processUploadedFile,
    ],
  )

  const handleProcessUpload = async (item) => {
    if (!item?.storage_path) return
    setSourceFile({ name: item.name, size: item.size, storage_path: item.storage_path })
    await processUploadedFile(item)
    setActiveNav('home')
  }

  const handleRagSearch = useCallback(
    (query) => searchRag(query),
    [searchRag],
  )

  const selectedAvatarMeta = avatars[selectedAvatar] || null

  const falLectureOptions = useCallback(
    () => ({
      avatarId: selectedAvatarMeta?.id,
      voice: selectedAvatarMeta?.fal_voice || selectedAvatarMeta?.name?.replace(/^Dr\.\s*/, '') || 'Sarah',
      avatarUrl: selectedAvatarMeta?.avatar_url || null,
      videoPrompt: 'professional lecture speech',
      stability: 0.6,
    }),
    [selectedAvatarMeta],
  )

  const applyJobProgress = useCallback((job) => {
    if (job?.message || job?.step) {
      setGenMessage(job.message || job.step)
    }
    if (job?.script) {
      setAudioPrompt(job.script)
    }
    if (job?.video_url) {
      setVideoUrl(job.video_url)
      if (job.audio_url) setAudioUrl(job.audio_url)
    } else if (job?.audio_url) {
      setAudioUrl(job.audio_url)
    }
  }, [])

  const applyMediaResult = useCallback((data, fallbackScript = '') => {
    const script = data?.script || fallbackScript
    if (script) setAudioPrompt(script)
    if (data?.video_url) {
      setVideoUrl(data.video_url)
      setAudioUrl(data.audio_url || '')
      setIsPlaying(true)
      return true
    }
    if (data?.audio_url) {
      setVideoUrl('')
      setAudioUrl(data.audio_url)
      setIsPlaying(true)
      return true
    }
    return false
  }, [])

  const handleGenerateFromSummary = useCallback(
    async (summaryLines) => {
      let summaryText = Array.isArray(summaryLines)
        ? summaryLines.filter(Boolean).join('\n\n').trim()
        : ''
      const indexed = Boolean(ragSource)
      const storagePath = sourceFile?.storage_path || null

      if (!summaryText && indexed) {
        try {
          const data = await fetchLectureScript('notes', { source: ragSource })
          summaryText = (data?.summary || []).filter(Boolean).join('\n\n').trim()
        } catch {
          /* use backend from_summary + source */
        }
      }

      if (!summaryText && !storagePath && !indexed) {
        setRagTtsError('Upload a PDF and wait for “Indexed” before Summary → Video.')
        return
      }

      setRagTtsLoading(true)
      setRagTtsError('')
      setAudioError('')
      setVideoUrl('')
      setAudioUrl('')
      setGenMessage('Summary → script → video…')
      setActiveTab('notes')

      try {
        const data = await generateLectureAudio(
          {
            storagePath,
            summaryText: summaryText || null,
            fromSummary: true,
            source: ragSource || null,
            textMessage: SUMMARY_TO_VIDEO_MESSAGE,
            ...falLectureOptions(),
          },
          applyJobProgress,
        )
        if (!applyMediaResult(data)) {
          setRagTtsError('No video/audio URL returned. Check FAL_KEY in backend/.env')
        }
      } catch (err) {
        setRagTtsError(err?.message || 'Summary video generation failed')
      } finally {
        setRagTtsLoading(false)
        setGenMessage('')
      }
    },
    [
      sourceFile?.storage_path,
      ragSource,
      falLectureOptions,
      applyJobProgress,
      applyMediaResult,
    ],
  )

  const handleGenerateRagTts = useCallback(async () => {
    if (!sourceFile?.storage_path) {
      setRagTtsError('Upload a PDF first.')
      return
    }
    setRagTtsLoading(true)
    setRagTtsError('')
    setAudioError('')
    setVideoUrl('')
    setAudioUrl('')
    setGenMessage('Starting…')
    try {
      const data = await generateLectureAudio(
        {
          storagePath: audioPrompt ? null : sourceFile.storage_path,
          textMessage: DEFAULT_RAG_TTS_MESSAGE,
          scriptText: audioPrompt || null,
          source: ragSource || null,
          ...falLectureOptions(),
        },
        applyJobProgress,
      )
      if (!applyMediaResult(data)) {
        setRagTtsError('No video/audio URL returned. Check FAL_KEY and FAL_DEFAULT_AVATAR_URL in backend/.env')
      }
    } catch (err) {
      setRagTtsError(err?.message || 'Video generation failed')
    } finally {
      setRagTtsLoading(false)
      setGenMessage('')
    }
  }, [sourceFile?.storage_path, audioPrompt, ragSource, falLectureOptions, applyJobProgress, applyMediaResult])

  const handleTestGenerate = useCallback(async () => {
    const text = testText.trim()
    if (!text) {
      setTestError('Type some text in the test field first.')
      return
    }
    setTestLoading(true)
    setTestError('')
    setAudioError('')
    setRagTtsError('')
    setVideoUrl('')
    setAudioUrl('')
    setIsPlaying(false)
    try {
      const data = await generateLectureAudio({
        scriptText: text,
        ...falLectureOptions(),
      })
      if (!applyMediaResult(data, text)) {
        setTestError('No video/audio URL returned. Check FAL_KEY and FAL_DEFAULT_AVATAR_URL in backend/.env')
      }
    } catch (err) {
      setTestError(err?.message || 'Generation failed — is backend running?')
    } finally {
      setTestLoading(false)
      setGenMessage('')
    }
  }, [testText, falLectureOptions, applyJobProgress, applyMediaResult])

  const handleGenerateAudioOnly = useCallback(async () => {
    const script = audioPrompt?.trim()
    if (!script && !ragSource) {
      setAudioError('Upload and index a PDF first, or generate a script.')
      return
    }
    setAudioLoading(true)
    setAudioError('')
    setGenMessage('Starting…')
    setVideoUrl('')
    try {
      const data = await generateLectureAudio(
        {
          scriptText: script || null,
          source: ragSource || null,
          ...falLectureOptions(),
        },
        applyJobProgress,
      )
      if (!applyMediaResult(data)) {
        setAudioError('No video/audio URL returned. Check FAL_KEY in backend/.env')
      }
    } catch (err) {
      setAudioError(err?.message || 'Video generation failed')
    } finally {
      setAudioLoading(false)
      setGenMessage('')
    }
  }, [audioPrompt, ragSource, falLectureOptions, applyJobProgress, applyMediaResult])

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
          processing={processing}
          processError={processError}
          onRefreshUploads={refreshUploads}
          recentUploads={uploads}
          onProcessUpload={handleProcessUpload}
          ragSource={ragSource}
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
        uploadWarning={uploadWarning}
        processError={processError}
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
        ragSource={ragSource}
        processing={processing || indexing}
        backendOffline={offline}
        sessionError={sessionError}
        canRagTts={Boolean(sourceFile?.storage_path || ragSource)}
        ragTtsLoading={ragTtsLoading}
        ragTtsError={ragTtsError}
        audioPrompt={audioPrompt}
        onGenerateRagTts={handleGenerateRagTts}
        onGenerateFromSummary={handleGenerateFromSummary}
        onGenerateAudioOnly={handleGenerateAudioOnly}
        videoUrl={videoUrl}
        audioUrl={audioUrl}
        audioLoading={audioLoading || testLoading}
        audioError={audioError}
        testText={testText}
        onTestTextChange={setTestText}
        onTestGenerate={handleTestGenerate}
        testLoading={testLoading}
        testError={testError}
        genMessage={genMessage}
        onRetryBackend={reloadHome}
      />
    )
  }

  const ragSearchEnabled = activeNav === 'home' || activeNav === 'upload'

  return (
    <AppShell
      activeNav={activeNav}
      onNavChange={setActiveNav}
      onNewSession={handleNewSession}
      searchPlaceholder={config.searchPlaceholder}
      showNewLecture={config.showNewLecture}
      onNewLecture={() => setActiveNav('upload')}
      ragSource={ragSearchEnabled ? ragSource : ''}
      onRagSearch={ragSearchEnabled ? handleRagSearch : undefined}
    >
      {renderPage()}
    </AppShell>
  )
}

export default App
