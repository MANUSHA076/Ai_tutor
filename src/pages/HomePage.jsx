import { motion } from 'framer-motion'
import { SourceDocument } from '../components/dashboard/SourceDocument'
import { VideoPlayer } from '../components/dashboard/VideoPlayer'
import { AvatarGrid } from '../components/dashboard/AvatarGrid'
import { ScriptPanel } from '../components/dashboard/ScriptPanel'
import { MediaTestPanel } from '../components/dashboard/MediaTestPanel'
import { useGenerationTimer } from '../hooks/useGenerationTimer'

export function HomePage({
  sourceFile,
  onFileSelect,
  uploading,
  uploadError,
  uploadWarning = '',
  onRemoveFile,
  isPlaying,
  onTogglePlay,
  avatars,
  selectedAvatar,
  onSelectAvatar,
  voice,
  onVoiceChange,
  activeTab,
  onTabChange,
  ragSource = '',
  processing = false,
  processError = '',
  backendOffline = false,
  sessionError = '',
  canRagTts = false,
  ragTtsLoading = false,
  ragTtsError = '',
  audioPrompt = '',
  onGenerateRagTts,
  videoUrl = '',
  audioUrl = '',
  audioLoading = false,
  audioError = '',
  onGenerateAudioOnly,
  testText = '',
  onTestTextChange,
  onTestGenerate,
  testLoading = false,
  testError = '',
  genMessage = '',
  onRetryBackend,
}) {
  const mediaLoading = audioLoading || ragTtsLoading || testLoading
  const loadingSeconds = useGenerationTimer(mediaLoading)
  const loadingHint =
    genMessage ||
    (loadingSeconds >= 300
      ? 'Still processing on Fal servers — do not refresh (up to 12 min)'
      : loadingSeconds >= 60
        ? 'Step 1: speech · Step 2: avatar video (3–8 min typical)'
        : '')

  return (
    <>
      {backendOffline && (
        <div className="pipeline-error-msg dashboard-offline-banner">
          <p>
            Backend not responding. In a new terminal run: <code>cd backend</code> then{' '}
            <code>.\start-stable.ps1</code> (recommended) or <code>.\start.ps1</code>
          </p>
          <p>Wait for <strong>Application startup complete</strong>, then click Retry or press Ctrl+Shift+R.</p>
          {onRetryBackend && (
            <button type="button" className="rag-tts-btn" onClick={onRetryBackend}>
              Retry connection
            </button>
          )}
        </div>
      )}
      {!backendOffline && sessionError && (
        <p className="pipeline-status-msg dashboard-offline-banner">{sessionError}</p>
      )}
      <MediaTestPanel
        value={testText}
        onChange={onTestTextChange}
        onGenerate={onTestGenerate}
        loading={testLoading}
        loadingSeconds={loadingSeconds}
        genMessage={genMessage}
        error={testError}
        disabled={backendOffline}
        videoUrl={videoUrl}
        audioUrl={audioUrl}
      />

      <motion.div
        className="dashboard-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <motion.div className="grid-left">
          <SourceDocument
            file={sourceFile}
            onFileSelect={onFileSelect}
            uploading={uploading}
            processing={processing}
          uploadError={uploadError}
          uploadWarning={uploadWarning}
          onRemove={onRemoveFile}
          />
          <AvatarGrid
            avatars={avatars}
            selectedIndex={selectedAvatar}
            onSelect={onSelectAvatar}
            voice={voice}
            onVoiceChange={onVoiceChange}
          />
        </motion.div>

        <motion.div className="grid-right">
          <VideoPlayer
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            videoUrl={videoUrl}
            audioUrl={audioUrl}
            loading={mediaLoading}
            loadingSeconds={loadingSeconds}
            loadingHint={loadingHint}
            error={audioError || testError}
          />
          {processError && <p className="pipeline-error-msg">{processError}</p>}
          <ScriptPanel
            activeTab={activeTab}
            onTabChange={onTabChange}
            ragSource={ragSource}
            processing={processing}
            canRagTts={canRagTts}
            ragTtsLoading={ragTtsLoading}
            ragTtsError={ragTtsError}
            audioPrompt={audioPrompt}
            onGenerateRagTts={onGenerateRagTts}
            onGenerateAudioOnly={onGenerateAudioOnly}
            hasAudio={Boolean(videoUrl || audioUrl)}
          />
        </motion.div>
      </motion.div>
    </>
  )
}
