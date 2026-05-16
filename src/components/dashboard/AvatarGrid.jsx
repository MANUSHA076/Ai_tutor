import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { VoiceSettings } from './VoiceSettings'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.25 },
  },
}

const item = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
}

export function AvatarGrid({ avatars, selectedIndex, onSelect, voice, onVoiceChange }) {
  return (
    <motion.section
      className="dash-card avatar-card-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.28 }}
    >
      <div className="card-step">
        <span className="step-badge">Step 2</span>
        <h3>AI Avatar</h3>
      </div>

      <motion.div className="avatar-grid" variants={container} initial="hidden" animate="visible">
        {avatars.length === 0 && (
          <p className="data-empty-msg">Loading avatars from server…</p>
        )}
        {avatars.map((avatar, index) => {
          const isSelected = selectedIndex === index

          return (
            <motion.button
              key={avatar.id}
              type="button"
              className={`avatar-tile ${isSelected ? 'is-selected' : ''}`}
              variants={item}
              onClick={() => onSelect(index)}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              layout
            >
              <div className={`avatar-portrait ${avatar.accent}`}>{avatar.initials}</div>
              <div className="avatar-tile-text">
                <p className="avatar-tile-name">{avatar.name}</p>
                <p className="avatar-tile-tag">{avatar.tag}</p>
              </div>
              {isSelected && (
                <motion.span
                  className="avatar-check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                >
                  <Check className="icon-xs" />
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </motion.div>

      <VoiceSettings
        voice={voice}
        onVoiceChange={onVoiceChange}
        options={avatars.map((a) => a.tag || a.name)}
      />
    </motion.section>
  )
}
