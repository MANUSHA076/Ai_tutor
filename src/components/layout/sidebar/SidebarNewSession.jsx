import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export function SidebarNewSession({ onNewSession }) {
  return (
    <motion.button
      type="button"
      className="new-session-btn"
      onClick={onNewSession}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(52, 211, 153, 0.22)' }}
      whileTap={{ scale: 0.98 }}
    >
      <Plus className="icon-sm" /> New Session
    </motion.button>
  )
}
