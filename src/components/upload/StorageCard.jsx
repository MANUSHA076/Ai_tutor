import { motion } from 'framer-motion'

const USED_GB = 42.8
const TOTAL_GB = 100
const PERCENT = (USED_GB / TOTAL_GB) * 100

export function StorageCard() {
  return (
    <motion.section
      className="storage-card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.12 }}
      whileHover={{ y: -2 }}
    >
      <p className="storage-label">Storage Usage</p>
      <p className="storage-value">
        {USED_GB} / {TOTAL_GB} GB
      </p>
      <motion.div
        className="storage-track"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="storage-fill"
          initial={{ width: 0 }}
          animate={{ width: `${PERCENT}%` }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
        />
      </motion.div>
    </motion.section>
  )
}
