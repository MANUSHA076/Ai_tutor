import { motion } from 'framer-motion'
import { Save, Wand2 } from 'lucide-react'

export function AvatarStudioActions({ onSave, onApply }) {
  return (
    <motion.div
      className="studio-actions"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <motion.button
        type="button"
        className="studio-action-secondary"
        onClick={onSave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <Save className="icon-sm" /> Save Preset
      </motion.button>
      <motion.button
        type="button"
        className="studio-action-primary"
        onClick={onApply}
        whileHover={{ scale: 1.03, boxShadow: '0 10px 32px rgba(34, 211, 238, 0.3)' }}
        whileTap={{ scale: 0.97 }}
      >
        <Wand2 className="icon-sm" /> Apply to Next Lecture
      </motion.button>
    </motion.div>
  )
}
