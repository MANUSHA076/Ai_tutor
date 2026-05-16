import { motion } from 'framer-motion'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { subjectTagClass } from '../../data/lectures'

export function LectureCard({ lecture, index, onView }) {
  const tagClass = subjectTagClass[lecture.subject] ?? 'tag-cs'

  return (
    <motion.article
      className="lecture-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(3, 10, 20, 0.45)' }}
    >
      <div className={`lecture-thumb ${lecture.thumbClass}`}>
        <span className={`lecture-tag ${tagClass}`}>{lecture.subject}</span>
        <span className="lecture-duration">{lecture.duration}</span>
      </div>

      <div className="lecture-body">
        <h3 className="lecture-title">{lecture.title}</h3>

        <div className="lecture-meta">
          <span>
            <Calendar className="icon-xs" /> {lecture.dateLabel}
          </span>
          <span>
            <User className="icon-xs" /> {lecture.instructor}
          </span>
        </div>

        <div className="lecture-footer">
          <div className="lecture-avatar">{lecture.instructorInitials}</div>
          <motion.button
            type="button"
            className="view-lecture-btn"
            onClick={() => onView(lecture.id)}
            whileHover={{ x: 4 }}
          >
            View Lecture <ArrowRight className="icon-xs" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
