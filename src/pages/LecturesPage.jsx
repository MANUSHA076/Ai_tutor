import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { lectures as allLectures } from '../data/lectures'
import { LectureCard } from '../components/lectures/LectureCard'
import { GenerateLectureCard } from '../components/lectures/GenerateLectureCard'
import { LecturesFilters } from '../components/lectures/LecturesFilters'
import { LecturesPagination } from '../components/lectures/LecturesPagination'

const PER_PAGE = 5

export function LecturesPage({ onGenerate, onViewLecture }) {
  const [subject, setSubject] = useState('All')
  const [dateSort, setDateSort] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    let list = [...allLectures]

    if (subject !== 'All') {
      list = list.filter((item) => item.subject === subject)
    }

    list.sort((a, b) => {
      const diff = new Date(b.date) - new Date(a.date)
      return dateSort === 'newest' ? diff : -diff
    })

    return list
  }, [subject, dateSort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE
    return filtered.slice(start, start + PER_PAGE)
  }, [filtered, currentPage])

  const handleSubjectChange = (value) => {
    setSubject(value)
    setCurrentPage(1)
  }

  const handleDateSortChange = (value) => {
    setDateSort(value)
    setCurrentPage(1)
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
          onSubjectChange={handleSubjectChange}
          dateSort={dateSort}
          onDateSortChange={handleDateSortChange}
          resultCount={filtered.length}
        />
      </header>

      <div className="lectures-grid">
        {paginated.map((lecture, index) => (
          <LectureCard
            key={lecture.id}
            lecture={lecture}
            index={index}
            onView={onViewLecture}
          />
        ))}
        <GenerateLectureCard onGenerate={onGenerate} index={paginated.length} />
      </div>

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
