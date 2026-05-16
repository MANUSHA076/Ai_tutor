import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'

export function AvatarStudioCard({ avatar, isSelected, index, onSelect }) {
  return (
    <motion.button
      type="button"
      className={`studio-avatar-card ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelect(index)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {isSelected && (
        <motion.span
          className="studio-card-check"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        >
          <Check className="icon-xs" />
        </motion.span>
      )}

      <div className={`studio-card-portrait ${avatar.accent}`}>{avatar.initials}</div>

      <div className="studio-card-body">
        <p className="studio-card-name">{avatar.name}</p>
        <p className="studio-card-tag">{avatar.tag}</p>
        <p className="studio-card-specialty">{avatar.specialty}</p>

        <div className="studio-card-stats">
          <span>
            <Star className="icon-xs" /> {avatar.rating}
          </span>
          <span>{avatar.lectures} lectures</span>
        </div>
      </div>
    </motion.button>
  )
}
