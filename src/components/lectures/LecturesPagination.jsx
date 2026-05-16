import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function LecturesPagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <motion.nav
      className="lectures-pagination"
      aria-label="Lecture pages"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <motion.button
        type="button"
        className="page-btn page-arrow"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        whileHover={{ scale: currentPage > 1 ? 1.08 : 1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Previous page"
      >
        <ChevronLeft className="icon-sm" />
      </motion.button>

      {pages.map((page) => (
        <motion.button
          key={page}
          type="button"
          className={`page-btn ${currentPage === page ? 'is-active' : ''}`}
          onClick={() => onPageChange(page)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          {page}
        </motion.button>
      ))}

      <motion.button
        type="button"
        className="page-btn page-arrow"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        whileHover={{ scale: currentPage < totalPages ? 1.08 : 1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Next page"
      >
        <ChevronRight className="icon-sm" />
      </motion.button>
    </motion.nav>
  )
}
