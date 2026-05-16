import { motion } from 'framer-motion'
import { ExternalLink, Loader2, Music, Sparkles, Video } from 'lucide-react'

export function MediaTestPanel({
  value = '',
  onChange,
  onGenerate,
  loading = false,
  loadingSeconds = 0,
  genMessage = '',
  error = '',
  disabled = false,
  videoUrl = '',
  audioUrl = '',
}) {
  const canRun = value.trim().length > 0 && !loading && !disabled
  const hasVideo = Boolean(videoUrl)
  const hasAudio = Boolean(audioUrl)
  const showAudioLink = hasAudio && audioUrl !== videoUrl

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && canRun) {
      e.preventDefault()
      onGenerate?.()
    }
  }

  return (
    <motion.section
      className="dash-card media-test-card home-text-studio"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div className="card-step">
        <span className="step-badge step-badge-test">Step 1</span>
        <h3>Type text → get audio &amp; video</h3>
      </motion.div>
      <p className="media-test-hint">
        Lecture script එක මෙතන type කරන්න (PDF අවශ්‍ය නැහැ). පහළින් <strong>AI Avatar</strong>{' '}
        එකක් select කරලා <strong>Generate audio &amp; video</strong> click කරන්න. Video player එකේ
        lecture video + audio play වෙයි. පළමු වරට **3–8 min** ඉන්න (Fal servers process කරනවා).
      </p>

      <label className="media-test-label" htmlFor="home-lecture-text">
        Lecture script
      </label>
      <textarea
        id="home-lecture-text"
        className="media-test-input"
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='e.g. "Today we study diode characteristics and forward bias."'
        disabled={loading || disabled}
      />
      <p className="media-test-meta">
        {value.trim().length} characters · Ctrl+Enter to generate
      </p>

      <motion.button
        type="button"
        className="rag-tts-btn media-test-btn"
        disabled={!canRun}
        onClick={onGenerate}
        whileHover={canRun ? { scale: 1.02 } : undefined}
        whileTap={canRun ? { scale: 0.98 } : undefined}
      >
        {loading ? (
          <>
            <Loader2 className="icon-sm spin-icon" /> Generating… {loadingSeconds > 0 ? `${loadingSeconds}s` : ''}
            {genMessage ? ` — ${genMessage}` : loadingSeconds >= 30 ? ' (speech → video)' : ''}
          </>
        ) : (
          <>
            <Sparkles className="icon-sm" /> Generate audio &amp; video
          </>
        )}
      </motion.button>

      {error && <p className="pipeline-error-msg">{error}</p>}

      {(hasVideo || hasAudio) && !loading && (
        <motion.div
          className="media-test-results"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="pipeline-status-msg pipeline-ready">Ready — press Play on the player below</p>
          <motion.div className="media-test-links">
            {hasVideo && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="media-test-link"
              >
                <Video className="icon-sm" />
                Open video
                <ExternalLink className="icon-xs" />
              </a>
            )}
            {showAudioLink && (
              <a
                href={audioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="media-test-link"
              >
                <Music className="icon-sm" />
                Open audio
                <ExternalLink className="icon-xs" />
              </a>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.section>
  )
}
