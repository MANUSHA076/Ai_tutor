import { motion } from 'framer-motion'

export function SidebarGlow() {
  return (
    <motion.div
      className="sidebar-glow"
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
