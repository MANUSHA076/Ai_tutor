import { motion } from 'framer-motion'

export function SidebarNavItem({ item, isActive, index, onSelect }) {
  const Icon = item.icon

  return (
    <motion.button
      type="button"
      className={`nav-item ${isActive ? 'is-active' : ''}`}
      onClick={() => onSelect(item.id)}
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
}
