import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Maximize2, Pause, Play, Volume2 } from 'lucide-react'

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
  const progressRef = useRef(null)
  const mediaUrl = videoUrl || audioUrl
  const isVideo = Boolean(videoUrl)
  const [, setTick] = useState(0)

  useEffect(() => {
    const el = mediaRef.current
    if (!el || !mediaUrl) return undefined
    el.load()
    const onTimeUpdate = () => setTick((n) => n + 1)
    const onLoaded = () => setTick((n) => n + 1)
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('durationchange', onLoaded)
    return () => {
      el.pause()
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('durationchange', onLoaded)
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

  const handleSeek = useCallback((event) => {
    const el = mediaRef.current
    const bar = progressRef.current
    if (!el || !bar || !Number.isFinite(el.duration) || el.duration <= 0) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    el.currentTime = ratio * el.duration
    setTick((n) => n + 1)
  }, [])

  const handleFullscreen = useCallback(() => {
    const el = mediaRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
      return
    }
    const target = isVideo ? el : el.parentElement
    target?.requestFullscreen?.().catch(() => {})
  }, [isVideo])

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

  const showPlaceholder = !mediaUrl && !loading

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
        {showPlaceholder && (
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

        {!mediaUrl && loading && (
          <motion.div className="video-loading">
            <Loader2 className="icon-md spin-icon" />
            <p>
              Generating lecture video…
              {loadingSeconds > 0 ? ` ${loadingSeconds}s` : ''}
            </p>
            {loadingHint && <p className="video-loading-hint">{loadingHint}</p>}
          </motion.div>
        )}

        {mediaUrl && isVideo && (
          <video
            ref={mediaRef}
            key={videoUrl}
            src={videoUrl}
            preload="auto"
            controls
            playsInline
            className="video-stage-player"
          />
        )}

        {mediaUrl && !isVideo && (
          <>
            <audio
              ref={mediaRef}
              key={audioUrl}
              src={audioUrl}
              preload="auto"
              className="video-audio-el"
            />
            <motion.div
              className="wave-visual wave-visual-overlay"
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
          </>
        )}

        {mediaUrl && loading && (
          <div className="video-loading video-loading-overlay">
            <Loader2 className="icon-md spin-icon" />
            <p>
              {isVideo ? 'Finalizing…' : 'Encoding video…'}
              {loadingSeconds > 0 ? ` ${loadingSeconds}s` : ''}
            </p>
            {loadingHint && <p className="video-loading-hint">{loadingHint}</p>}
          </div>
        )}
      </motion.div>

      {!loading && videoUrl && audioUrl && audioUrl !== videoUrl && (
        <p className="media-test-audio-note">
          Audio finished first — video includes speech. You can listen while video encodes.
        </p>
      )}

      {error && <p className="pipeline-error-msg video-error">{error}</p>}

      <motion.div className="video-controls">
        <motion.button
          type="button"
          className="play-btn"
          onClick={onTogglePlay}
          disabled={!mediaUrl}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          {isPlaying ? <Pause className="icon-sm" /> : <Play className="icon-sm" />}
        </motion.button>

        <motion.div
          ref={progressRef}
          className="progress-wrap progress-wrap-seek"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={mediaUrl ? 0 : -1}
          onClick={handleSeek}
          onKeyDown={(event) => {
            if (!mediaUrl || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
            event.preventDefault()
            const node = mediaRef.current
            if (!node || !Number.isFinite(node.duration)) return
            const step = event.key === 'ArrowRight' ? 5 : -5
            node.currentTime = Math.min(node.duration, Math.max(0, (node.currentTime || 0) + step))
            setTick((n) => n + 1)
          }}
        >
          <motion.div
            className="progress-fill"
            initial={{ width: '32%' }}
            animate={{ width: progress }}
            transition={{ duration: 0.15 }}
          />
        </motion.div>

        <span className="time-label">{timeLabel}</span>

        <motion.button type="button" className="ctrl-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
          <Volume2 className="icon-sm" />
        </motion.button>
        <motion.button
          type="button"
          className="ctrl-btn"
          disabled={!mediaUrl}
          onClick={handleFullscreen}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
        >
          <Maximize2 className="icon-sm" />
        </motion.button>
      </motion.div>
    </motion.section>
  )
}
