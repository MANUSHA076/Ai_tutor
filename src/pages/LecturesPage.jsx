import { motion } from 'framer-motion'
import { LectureCard } from '../components/lectures/LectureCard'
import { GenerateLectureCard } from '../components/lectures/GenerateLectureCard'
import { LecturesFilters } from '../components/lectures/LecturesFilters'
import { LecturesPagination } from '../components/lectures/LecturesPagination'
import { useLectures } from '../hooks/useLectures'
// BACKEND [Python]: generateLecture() from src/api/lecturesApi.js — Generate New Lecture card
import { generateLecture } from '../api/lecturesApi'

export function LecturesPage({ onGenerate, onViewLecture }) {
  const {
    paginated,
    filteredCount,
    totalPages,
    subject,
    dateSort,
    currentPage,
    setSubject,
    setDateSort,
    setCurrentPage,
  } = useLectures()

  const handleGenerate = async () => {
  // BACKEND [Python]: POST /api/lectures/generate
    try {
      await generateLecture({ subject })
    } catch {
      /* fallback */
    }
    onGenerate()
  }

  return (
    <motion.div className="lectures-page">
      <header className="lectures-page-header">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1>My Lectures</h1>
          <p>Manage and review your AI-generated learning sessions.</p>
        </motion.div>

        <LecturesFilters
          subject={subject}
          onSubjectChange={setSubject}
          dateSort={dateSort}
          onDateSortChange={setDateSort}
          resultCount={filteredCount}
        />
      </header>

      <motion.div className="lectures-grid">
        {paginated.map((lecture, index) => (
          <LectureCard
            key={lecture.id}
            lecture={lecture}
            index={index}
            onView={onViewLecture}
          />
        ))}
        <GenerateLectureCard onGenerate={handleGenerate} index={paginated.length} />
      </motion.div>

      {totalPages > 1 && (
        <LecturesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </motion.div>
  )
}
