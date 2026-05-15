import { motion } from 'framer-motion'
import { Maximize2, Pause, Play, Settings, Volume2 } from 'lucide-react'

export function VideoPlayer({ isPlaying, onTogglePlay }) {
  return (
    <motion.section
      className="dash-card video-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
    >
      <motion.div
        className={`video-stage ${isPlaying ? 'is-playing' : ''}`}
        layout
      >
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
      </motion.div>

      <div className="video-controls">
        <motion.button
          type="button"
          className="play-btn"
          onClick={onTogglePlay}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          {isPlaying ? <Pause className="icon-sm" /> : <Play className="icon-sm" />}
        </motion.button>

        <div className="progress-wrap">
          <motion.div
            className="progress-fill"
            initial={{ width: '32%' }}
            animate={{ width: isPlaying ? '38%' : '32%' }}
            transition={{ duration: 0.6 }}
          />
        </div>

        <span className="time-label">02:14 / 06:45</span>

        <motion.button type="button" className="ctrl-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
          <Volume2 className="icon-sm" />
        </motion.button>
        <motion.button type="button" className="ctrl-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
          <Settings className="icon-sm" />
        </motion.button>
        <motion.button type="button" className="ctrl-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
          <Maximize2 className="icon-sm" />
        </motion.button>
      </div>
    </motion.section>
  )
}
