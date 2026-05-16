import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Maximize2, Pause, Play, Settings, Volume2 } from 'lucide-react'

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function VideoPlayer({
  isPlaying,
  onTogglePlay,
  videoUrl = '',
  audioUrl = '',
  loading = false,
  loadingSeconds = 0,
  loadingHint = '',
  error = '',
}) {
  const mediaRef = useRef(null)
  const mediaUrl = videoUrl || audioUrl
  const isVideo = Boolean(videoUrl)
  const [, setTick] = useState(0)

  useEffect(() => {
    const el = mediaRef.current
    if (!el || !mediaUrl) return undefined
    el.load()
    const onTimeUpdate = () => setTick((n) => n + 1)
    el.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      el.pause()
      el.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [mediaUrl, isVideo])

  useEffect(() => {
    const el = mediaRef.current
    if (!el || !mediaUrl) return
    if (isPlaying) {
      el.play().catch(() => {})
    } else {
      el.pause()
    }
  }, [isPlaying, mediaUrl])

  const el = mediaRef.current
  const duration = el?.duration
  const current = el?.currentTime
  const timeLabel =
    mediaUrl && Number.isFinite(duration)
      ? `${formatTime(current || 0)} / ${formatTime(duration)}`
      : mediaUrl
        ? '00:00 / —'
        : '— / —'

  const progress =
    mediaUrl && Number.isFinite(duration) && duration > 0
      ? `${((current || 0) / duration) * 100}%`
      : mediaUrl
        ? '0%'
        : '32%'

  return (
    <motion.section
      className="dash-card video-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
    >
      <motion.div
        className={`video-stage ${isPlaying ? 'is-playing' : ''} ${mediaUrl ? 'has-media' : ''} ${isVideo ? 'has-video' : ''}`}
        layout
      >
        {loading ? (
          <motion.div className="video-loading">
            <Loader2 className="icon-md spin-icon" />
            <p>
              Generating lecture video…
              {loadingSeconds > 0 ? ` ${loadingSeconds}s` : ''}
            </p>
            {loadingHint && <p className="video-loading-hint">{loadingHint}</p>}
          </motion.div>
        ) : isVideo ? (
          <video
            ref={mediaRef}
            src={videoUrl}
            preload="metadata"
            className="video-stage-player"
            playsInline
          />
        ) : mediaUrl ? (
          <>
            <audio ref={mediaRef} src={audioUrl} preload="metadata" className="video-audio-el" />
            <motion.div
              className="wave-visual"
              animate={
                isPlaying
                  ? { scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }
                  : { scale: 1, opacity: 0.7 }
              }
              transition={{ duration: 2.5, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  className="wave-bar"
                  animate={
                    isPlaying
                      ? { scaleY: [0.4, 1, 0.5, 0.9, 0.4] }
                      : { scaleY: 0.35 }
                  }
                  transition={{
                    duration: 1.2,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.12,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
            <motion.div
              className="video-orb"
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 20, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
            />
          </>
        ) : (
          <>
            <motion.div
              className="wave-visual"
              animate={
                isPlaying
                  ? { scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }
                  : { scale: 1, opacity: 0.7 }
              }
              transition={{ duration: 2.5, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  className="wave-bar"
                  animate={
                    isPlaying
                      ? { scaleY: [0.4, 1, 0.5, 0.9, 0.4] }
                      : { scaleY: 0.35 }
                  }
                  transition={{
                    duration: 1.2,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.12,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
            <motion.div
              className="video-orb"
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 20, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
            />
          </>
        )}

      </motion.div>

      {!loading && videoUrl && audioUrl && audioUrl !== videoUrl && (
        <p className="media-test-audio-note">
          Separate audio track available — use Open audio above or play video (includes speech).
        </p>
      )}

      {error && <p className="pipeline-error-msg video-error">{error}</p>}

      <motion.div className="video-controls">
        <motion.button
          type="button"
          className="play-btn"
          onClick={onTogglePlay}
          disabled={!mediaUrl || loading}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          {isPlaying ? <Pause className="icon-sm" /> : <Play className="icon-sm" />}
        </motion.button>

        <motion.div className="progress-wrap">
          <motion.div
            className="progress-fill"
            initial={{ width: '32%' }}
            animate={{ width: progress }}
            transition={{ duration: 0.6 }}
          />
        </motion.div>

        <span className="time-label">{timeLabel}</span>

        <motion.button type="button" className="ctrl-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
          <Volume2 className="icon-sm" />
        </motion.button>
        <motion.button type="button" className="ctrl-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
          <Settings className="icon-sm" />
        </motion.button>
        <motion.button type="button" className="ctrl-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
          <Maximize2 className="icon-sm" />
        </motion.button>
      </motion.div>
    </motion.section>
  )
}
