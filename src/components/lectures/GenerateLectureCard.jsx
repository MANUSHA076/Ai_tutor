import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export function GenerateLectureCard({ onGenerate, index }) {
  return (
    <motion.button
      type="button"
      className="lecture-card generate-card"
      onClick={onGenerate}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -6, scale: 1.01, borderColor: 'rgba(52, 211, 153, 0.5)' }}
      whileTap={{ scale: 0.99 }}
    >
      <motion.div
        className="generate-icon"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Plus className="icon-md" />
      </motion.div>
      <h3>Generate New Lecture</h3>
      <p>Upload a PDF or start a topic-based session.</p>
    </motion.button>
  )
}
