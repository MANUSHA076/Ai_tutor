import { motion } from 'framer-motion'
import { Bot, Maximize2, Mic, Video } from 'lucide-react'

export function AvatarPreviewPanel({ avatar, background, isPreviewing, onTogglePreview }) {
  return (
    <motion.section
      className="studio-preview-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="studio-panel-label">Avatar Preview</p>

      <div className={`studio-preview-frame ${background.thumb} ${isPreviewing ? 'is-live' : ''}`}>
        <motion.div
          className={`studio-preview-avatar ${avatar.portrait}`}
          animate={isPreviewing ? { y: [0, -6, 0] } : { y: 0 }}
          transition={{ duration: 2.6, repeat: isPreviewing ? Infinity : 0, ease: 'easeInOut' }}
        >
          <span className="preview-initials">{avatar.initials}</span>
          <Bot className="icon-md preview-bot" />
        </motion.div>

        {isPreviewing && (
          <motion.div
            className="preview-pulse"
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      <motion.div
        className="studio-preview-controls"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button type="button" className="preview-ctrl" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
          <Video className="icon-sm" />
        </motion.button>
        <motion.button type="button" className="preview-ctrl" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
          <Mic className="icon-sm" />
        </motion.button>
        <motion.button
          type="button"
          className="preview-voice-btn"
          onClick={onTogglePreview}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {isPreviewing ? 'Stop Preview' : 'Preview Voice'}
        </motion.button>
        <motion.button type="button" className="preview-ctrl" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
          <Maximize2 className="icon-sm" />
        </motion.button>
      </motion.div>
    </motion.section>
  )
}
