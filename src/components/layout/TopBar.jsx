import { motion } from 'framer-motion'
import { Bell, Plus, Search } from 'lucide-react'

export function TopBar({
  searchPlaceholder = 'Search lectures...',
  showNewLecture = true,
  onNewLecture,
}) {
  return (
    <motion.header
      className="topbar"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="search-wrap">
        <Search className="icon-sm search-icon" />
        <input type="search" placeholder={searchPlaceholder} className="search-input" />
      </div>

      <motion.div
        className="topbar-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          type="button"
          className="icon-btn"
          aria-label="Notifications"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="icon-sm" />
          <span className="notif-dot" />
        </motion.button>

        {showNewLecture && (
          <motion.button
            type="button"
            className="new-lecture-btn"
            onClick={onNewLecture}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(34, 211, 238, 0.25)' }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="icon-sm" /> New Lecture
          </motion.button>
        )}

        <motion.div
          className="user-avatar"
          whileHover={{ scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          U
        </motion.div>
      </motion.div>
    </motion.header>
  )
}
