import { motion } from 'framer-motion'
import { User } from 'lucide-react'

export function BaseAvatarsGrid({ avatars, selectedIndex, onSelect }) {
  return (
    <motion.section
      className="studio-base-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <div className="studio-base-header">
        <div>
          <h2>Base Avatars</h2>
          <p>Select a foundation for your tutor</p>
        </div>
        <motion.button type="button" className="view-templates-link" whileHover={{ x: 3 }}>
          View All Templates
        </motion.button>
      </div>

      <div className="base-avatars-row">
        {avatars.map((avatar, index) => {
          const isSelected = selectedIndex === index

          return (
            <motion.button
              key={avatar.id}
              type="button"
              className={`base-avatar-card ${isSelected ? 'is-selected' : ''} ${avatar.isPlaceholder ? 'is-placeholder' : ''}`}
              onClick={() => onSelect(index)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.06 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && <span className="base-selected-tag">Selected</span>}

              <div className={`base-avatar-portrait ${avatar.portrait}`}>
                {avatar.isPlaceholder ? (
                  <User className="icon-md portrait-placeholder-icon" />
                ) : (
                  <span>{avatar.initials}</span>
                )}
              </div>

              <p className="base-avatar-name">{avatar.name}</p>
              <p className="base-avatar-specialty">{avatar.specialty}</p>
            </motion.button>
          )
        })}
      </div>
    </motion.section>
  )
}
