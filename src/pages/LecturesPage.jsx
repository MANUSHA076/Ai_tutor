import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { LectureCard } from '../components/lectures/LectureCard'
import { GenerateLectureCard } from '../components/lectures/GenerateLectureCard'
import { LecturesFilters } from '../components/lectures/LecturesFilters'
import { LecturesPagination } from '../components/lectures/LecturesPagination'
import { useLectures } from '../hooks/useLectures'
import { generateLecture } from '../api/lecturesApi'

export function LecturesPage({ onGenerate, onViewLecture }) {
  const {
    paginated,
    filteredCount,
    totalPages,
    subject,
    dateSort,
    currentPage,
    loading,
    error,
    reload,
    setSubject,
    setDateSort,
    setCurrentPage,
  } = useLectures()

  const handleGenerate = async () => {
    try {
      await generateLecture({ subject: subject === 'All' ? 'General' : subject })
      await reload()
    } catch {
      /* show error via empty state */
    }
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

      {error && <p className="data-empty-msg data-error-msg">{error}</p>}

      {loading ? (
        <p className="data-empty-msg">
          <Loader2 className="icon-sm spin-icon" /> Loading lectures…
        </p>
      ) : (
        <motion.div className="lectures-grid">
          {paginated.map((lecture, index) => (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              index={index}
              onView={onViewLecture}
            />
          ))}
          {paginated.length === 0 && (
            <p className="data-empty-msg lectures-empty-inline">
              No lectures yet. Add rows in Supabase or click Generate below.
            </p>
          )}
          <GenerateLectureCard onGenerate={handleGenerate} index={paginated.length} />
        </motion.div>
      )}

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
