import { useEffect, useMemo, useState } from 'react'
import { lectures as mockLectures } from '../data/lectures'
// BACKEND [Python]: Connect My Lectures page
import { fetchLectures } from '../api/lecturesApi'

const PER_PAGE = 5

export function useLectures() {
  const [lectures, setLectures] = useState(mockLectures)
  const [subject, setSubject] = useState('All')
  const [dateSort, setDateSort] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)

  // BACKEND [Python]: GET /api/lectures — load on mount & when filters change
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await fetchLectures({
          subject,
          sort: dateSort,
          page: currentPage,
        })
        if (!cancelled && Array.isArray(data?.items)) {
          setLectures(data.items)
        }
      } catch {
        // Fallback to mock data when backend is offline
        if (!cancelled) setLectures(mockLectures)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [subject, dateSort, currentPage])

  const filtered = useMemo(() => {
    let list = [...lectures]
    if (subject !== 'All') {
      list = list.filter((item) => item.subject === subject)
    }
    list.sort((a, b) => {
      const diff = new Date(b.date) - new Date(a.date)
      return dateSort === 'newest' ? diff : -diff
    })
    return list
  }, [lectures, subject, dateSort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE
    return filtered.slice(start, start + PER_PAGE)
  }, [filtered, currentPage])

  return {
    lectures,
    paginated,
    filteredCount: filtered.length,
    totalPages,
    subject,
    dateSort,
    currentPage,
    loading,
    setSubject: (value) => {
      setSubject(value)
      setCurrentPage(1)
    },
    setDateSort: (value) => {
      setDateSort(value)
      setCurrentPage(1)
    },
    setCurrentPage,
  }
}
