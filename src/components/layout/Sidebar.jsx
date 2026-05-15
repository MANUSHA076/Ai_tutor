import { motion } from 'framer-motion'
import { Bot, Plus, Sparkles } from 'lucide-react'
import { navItems } from '../../data/navigation'

export function Sidebar({ activeNav, onNavChange, onNewSession }) {
  return (
    <aside className="sidebar">
      <motion.div
        className="sidebar-brand"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="brand-icon"
          whileHover={{ scale: 1.06, rotate: 4 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Bot className="icon-md" />
        </motion.div>
        <div>
          <p className="brand-title">
            <Sparkles className="icon-xs brand-spark" /> AI Tutor Pro
          </p>
          <p className="brand-version">Personal AI Learning</p>
        </div>
      </motion.div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = activeNav === item.id

          return (
            <motion.button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'is-active' : ''}`}
              onClick={() => onNavChange(item.id)}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.35 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.span
                  className="nav-indicator"
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="icon-sm" />
              <span>{item.label}</span>
            </motion.button>
          )
        })}
      </nav>

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

      <motion.div
        className="sidebar-glow"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </aside>
  )
}
