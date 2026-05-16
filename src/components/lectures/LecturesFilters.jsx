import { motion } from 'framer-motion'
import { ArrowDownAZ, ArrowUpAZ, Atom, Code2, Dna, Filter, LayoutGrid, Sigma } from 'lucide-react'
import { dateSortOptions, subjectFilters } from '../../data/lectures'

const subjectIcons = {
  All: LayoutGrid,
  Physics: Atom,
  CS: Code2,
  Math: Sigma,
  Biology: Dna,
}

export function LecturesFilters({
  subject,
  onSubjectChange,
  dateSort,
  onDateSortChange,
  resultCount,
}) {
  return (
    <motion.div
      className="lectures-filters-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
    >
      <motion.div
        className="filters-result-badge"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        key={resultCount}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      >
        <Filter className="icon-xs" />
        <span>
          <strong>{resultCount}</strong> lecture{resultCount !== 1 ? 's' : ''}
        </span>
      </motion.div>

      <div className="filter-block">
        <p className="filter-block-label">Subject</p>
        <div className="subject-pills" role="group" aria-label="Filter by subject">
          {subjectFilters.map((item) => {
            const isActive = subject === item.id
            const Icon = subjectIcons[item.id] ?? LayoutGrid

            return (
              <motion.button
                key={item.id}
                type="button"
                className={`subject-pill ${item.tone} ${isActive ? 'is-active' : ''}`}
                onClick={() => onSubjectChange(item.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                aria-pressed={isActive}
              >
                {isActive && (
                  <motion.span
                    className="pill-glow"
                    layoutId="subject-pill-glow"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <Icon className="icon-xs pill-icon" />
                <span>{item.label}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <motion.div className="filter-block filter-block-date">
        <p className="filter-block-label">
          <span>Sort by date</span>
        </p>
        <div className="date-segment" role="group" aria-label="Sort by date">
          {dateSortOptions.map((option) => {
            const isActive = dateSort === option.id
            const Icon = option.id === 'newest' ? ArrowDownAZ : ArrowUpAZ

            return (
              <motion.button
                key={option.id}
                type="button"
                className={`date-segment-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => onDateSortChange(option.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                aria-pressed={isActive}
              >
                {isActive && (
                  <motion.span
                    className="segment-highlight"
                    layoutId="date-segment-highlight"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="icon-sm segment-icon" />
                <span className="segment-label-full">{option.label}</span>
                <span className="segment-label-short">{option.shortLabel}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
