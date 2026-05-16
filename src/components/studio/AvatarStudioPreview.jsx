import { motion } from 'framer-motion'
import { Bot, Mic, Play, Sparkles } from 'lucide-react'

export function AvatarStudioPreview({ avatar, isPreviewing, onTogglePreview }) {
  return (
    <motion.section
      className="studio-preview-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`studio-preview-stage ${isPreviewing ? 'is-live' : ''}`}>
        <motion.div
          className="studio-orbit-ring"
          animate={isPreviewing ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 24, repeat: isPreviewing ? Infinity : 0, ease: 'linear' }}
        />
        <motion.div
          className={`studio-avatar-core ${avatar.accent}`}
          animate={isPreviewing ? { y: [0, -8, 0] } : { y: 0 }}
          transition={{ duration: 2.8, repeat: isPreviewing ? Infinity : 0, ease: 'easeInOut' }}
        >
          <span className="studio-avatar-initials">{avatar.initials}</span>
          <Bot className="icon-lg studio-bot-icon" />
        </motion.div>

        {isPreviewing && (
          <motion.div
            className="studio-wave-ring"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      <div className="studio-preview-info">
        <motion.div
          className="studio-live-badge"
          animate={isPreviewing ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
          transition={{ duration: 1.5, repeat: isPreviewing ? Infinity : 0 }}
        >
          <span className={`live-dot ${isPreviewing ? 'is-pulsing' : ''}`} />
          {isPreviewing ? 'Live Preview' : 'Preview Ready'}
        </motion.div>

        <h2>{avatar.name}</h2>
        <p className="studio-style-tag">{avatar.style}</p>
        <p className="studio-desc">{avatar.desc}</p>

        <motion.button
          type="button"
          className="studio-preview-btn"
          onClick={onTogglePreview}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {isPreviewing ? (
            <>
              <Mic className="icon-sm" /> Stop Preview
            </>
          ) : (
            <>
              <Play className="icon-sm" /> Test Voice & Motion
            </>
          )}
        </motion.button>
      </div>

      <motion.div
        className="studio-sparkle"
        animate={{ rotate: [0, 15, -15, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Sparkles className="icon-sm" />
      </motion.div>
    </motion.section>
  )
}
