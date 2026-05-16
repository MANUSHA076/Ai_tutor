import { motion } from 'framer-motion'
import { Bot, Sparkles } from 'lucide-react'

export function SidebarBrand() {
  return (
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
  )
}
